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
    // Get recent unhealthy checks (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const unhealthy = await prisma.healthCheck.findMany({
      where: { 
        ok: false,
        createdAt: { gte: yesterday }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    if (unhealthy.length > 0) {
      // Send Slack notification if webhook is configured
      if (process.env.SLACK_WEBHOOK_URL) {
        const message = {
          text: `🚨 Grant Tracker Health Alert`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${unhealthy.length} health check(s) failed in the last 24 hours:*`
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: unhealthy.map(h => 
                  `• *${h.name}* - ${new Date(h.createdAt).toLocaleString()}\n  ${JSON.stringify(h.details)}`
                ).join('\n')
              }
            }
          ]
        }
        
        try {
          await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
          })
        } catch (error) {
          console.error('❌ Failed to send Slack notification:', error)
        }
      }
      
      return NextResponse.json({
        ok: true,
        unhealthyCount: unhealthy.length,
        checks: unhealthy.map(h => ({
          name: h.name,
          createdAt: h.createdAt,
          details: h.details
        }))
      })
    } else {
      return NextResponse.json({
        ok: true,
        unhealthyCount: 0
      })
    }
    
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
