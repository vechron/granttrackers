import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Ensure Node.js runtime for Prisma
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking system health...')
    
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
      console.log(`🚨 Found ${unhealthy.length} unhealthy checks`)
      
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
          console.log('✅ Slack notification sent')
        } catch (error) {
          console.error('❌ Failed to send Slack notification:', error)
        }
      } else {
        console.log('⚠️  SLACK_WEBHOOK_URL not configured - skipping notification')
      }
      
      return NextResponse.json({
        success: true,
        message: 'Health check completed with issues',
        unhealthyCount: unhealthy.length,
        checks: unhealthy.map(h => ({
          name: h.name,
          createdAt: h.createdAt,
          details: h.details
        }))
      })
    } else {
      console.log('✅ All health checks passing')
      return NextResponse.json({
        success: true,
        message: 'All health checks passing',
        unhealthyCount: 0
      })
    }
    
  } catch (error) {
    console.error('❌ Health check notification failed:', error)
    
    return NextResponse.json({ 
      error: 'Health check notification failed',
      details: error.message 
    }, { status: 500 })
  }
}
