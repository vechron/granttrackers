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

  // Don't run without a DB URL
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ skipped: true, reason: 'no DATABASE_URL' })
  }

  // Lazy-load Prisma
  const { prisma } = await import('@/lib/prisma')

  try {
    // Deactivate expired programs
    const expired = await prisma.program.updateMany({
      where: { active: true, deadline: { lt: new Date() } },
      data: { active: false, featured: false },
    })

    if (expired.count > 0) {
      await revalidatePrograms()
    }

    // Log health check (ignore if table missing)
    try {
      await prisma.healthCheck.create({
        data: {
          name: 'expire_programs',
          ok: true,
          details: {
            expiredCount: expired.count,
            timestamp: new Date().toISOString(),
          },
        },
      })
    } catch {
      // swallow if health_checks not provisioned
    }

    return NextResponse.json({
      ok: true,
      expiredCount: expired.count,
    })
  } catch (err) {
    // try to record failure, but don't crash build
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.healthCheck.create({
        data: {
          name: 'expire_programs',
          ok: false,
          details: {
            error: err instanceof Error ? err.message : 'Unknown error',
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
