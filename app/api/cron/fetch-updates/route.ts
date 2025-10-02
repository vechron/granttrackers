import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePrograms } from '@/lib/cache'

// Ensure Node.js runtime for Prisma
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Running automated grant updates...')
    
    // 1. Soft-close expired programs
    const expiredCount = await prisma.program.updateMany({
      where: { 
        deadline: { lt: new Date() }, 
        active: true 
      },
      data: { 
        active: false, 
        featured: false 
      }
    })
    
    console.log(`✅ Deactivated ${expiredCount.count} expired programs`)
    
    // Revalidate cache if programs were updated
    if (expiredCount.count > 0) {
      await revalidatePrograms()
    }
    
    // 2. Check for programs with missing state relationships
    const orphanedPrograms = await prisma.program.count({
      where: {
        stateId: null
      }
    })
    
    // 3. Log health check
    await prisma.healthCheck.create({
      data: {
        name: 'automated_updates',
        ok: orphanedPrograms === 0,
        details: {
          expiredProgramsDeactivated: expiredCount.count,
          orphanedPrograms: orphanedPrograms,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    // 4. TODO: Fetch external grant feeds/APIs here
    // This is where you'd integrate with:
    // - SBA APIs
    // - State economic development APIs
    // - Grant notification services
    // - RSS feeds
    
    return NextResponse.json({
      success: true,
      message: 'Automated updates completed',
      results: {
        expiredProgramsDeactivated: expiredCount.count,
        orphanedPrograms: orphanedPrograms,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Automated updates failed:', error)
    
    // Log failed health check
    await prisma.healthCheck.create({
      data: {
        name: 'automated_updates',
        ok: false,
        details: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({ 
      error: 'Automated updates failed',
      details: error.message 
    }, { status: 500 })
  }
}
