import { NextRequest, NextResponse } from 'next/server'
import { revalidatePrograms } from '@/lib/cache'

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

  // Don't run without a DB URL (e.g., preview build, local)
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ skipped: true, reason: 'no DATABASE_URL' })
  }

  // Lazy-load Prisma so import time is side-effect free
  const { prisma } = await import('@/lib/prisma')

  try {
    // 1) deactivate expired programs
    const expired = await prisma.program.updateMany({
      where: { active: true, deadline: { lt: new Date() } },
      data: { active: false, featured: false },
    })

    if (expired.count > 0) {
      await revalidatePrograms()
    }

    // 2) defensive orphan audit via LEFT JOIN
    const [{ count: orphanedPrograms }] = await prisma.$queryRaw<
      { count: number }[]
    >`SELECT COUNT(*)::int AS count
        FROM public.programs p
        LEFT JOIN public.states s ON s.id = p."stateId"
       WHERE s.id IS NULL;`

    // 3) log health (ignore if table missing in early envs)
    try {
      await prisma.healthCheck.create({
        data: {
          name: 'automated_updates',
          ok: orphanedPrograms === 0,
          details: {
            expiredProgramsDeactivated: expired.count,
            orphanedPrograms,
            timestamp: new Date().toISOString(),
          },
        },
      })
    } catch {
      // swallow if health_checks not provisioned in preview
    }

    // 4) TODO: fetch external sources (SBA/Grants.gov/state feeds)

    return NextResponse.json({
      ok: true,
      expiredProgramsDeactivated: expired.count,
      orphanedPrograms,
    })
  } catch (err) {
    // try to record failure, but don't crash build
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.healthCheck.create({
        data: {
          name: 'automated_updates',
          ok: false,
          details: {
            error:
              err instanceof Error ? err.message : 'Unknown error in cron route',
            timestamp: new Date().toISOString(),
          },
        },
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
