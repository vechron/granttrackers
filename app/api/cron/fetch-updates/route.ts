import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePrograms } from '@/lib/cache'

// Ensure Node.js runtime for Prisma
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
    return NextResponse.json({ message: 'Build time - skipping execution' })
  }
  
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
    
    // 2. Check for programs with missing state relationships (defensive check)
    const [{ count: orphanedPrograms }] = await prisma.$queryRaw<
      { count: number }[]
    >`SELECT COUNT(*)::int AS count
      FROM public.programs p
      LEFT JOIN public.states s ON s.id = p."stateId"
      WHERE s.id IS NULL;`
    
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
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({ 
      error: 'Automated updates failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
