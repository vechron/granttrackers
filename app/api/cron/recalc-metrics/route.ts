import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Detect Next build phase reliably
const IS_BUILD =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.VERCEL === '1' && process.env.BUILD_ID ? true : false

export async function GET(_req: NextRequest) {
  // Never run during build
  if (IS_BUILD) {
    return NextResponse.json({ skipped: true, reason: 'build phase' })
  }

  // Don't run without a DB URL
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ skipped: true, reason: 'no DATABASE_URL' })
  }

  // Lazy-load Prisma
  const { prisma } = await import('@/lib/prisma')

  try {
    // 1. Calculate program statistics
    const totalPrograms = await prisma.program.count()
    const activePrograms = await prisma.program.count({ where: { active: true } })
    const featuredPrograms = await prisma.program.count({ where: { featured: true, active: true } })
    const expiredPrograms = await prisma.program.count({ 
      where: { 
        deadline: { lt: new Date() },
        active: true 
      } 
    })
    
    // 2. Check data integrity (defensive check for orphaned programs)
    const [{ count: orphanedPrograms }] = await prisma.$queryRaw<
      { count: number }[]
    >`SELECT COUNT(*)::int AS count
      FROM public.programs p
      LEFT JOIN public.states s ON s.id = p."stateId"
      WHERE s.id IS NULL;`
    
    const programsWithInvalidDeadlines = await prisma.program.count({
      where: {
        featured: true,
        active: true,
        deadline: { lt: new Date() }
      }
    })
    
    // 3. Calculate health metrics
    const dataIntegrityScore = orphanedPrograms === 0 && programsWithInvalidDeadlines === 0 ? 100 : 50
    const overallHealth = dataIntegrityScore
    
    // 4. Log comprehensive health check (ignore if table missing)
    try {
      await prisma.healthCheck.create({
        data: {
          name: 'nightly_metrics',
          ok: overallHealth >= 90,
          details: {
            totalPrograms,
            activePrograms,
            featuredPrograms,
            expiredPrograms,
            orphanedPrograms,
            programsWithInvalidDeadlines,
            dataIntegrityScore,
            overallHealth,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch {
      // swallow if health_checks not provisioned
    }
    
    return NextResponse.json({
      ok: true,
      metrics: {
        totalPrograms,
        activePrograms,
        featuredPrograms,
        expiredPrograms,
        orphanedPrograms,
        programsWithInvalidDeadlines,
        dataIntegrityScore,
        overallHealth
      }
    })
    
  } catch (err) {
    // try to record failure, but don't crash build
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.healthCheck.create({
        data: {
          name: 'nightly_metrics',
          ok: false,
          details: {
            error: err instanceof Error ? err.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch {} // ignore if not available

    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
