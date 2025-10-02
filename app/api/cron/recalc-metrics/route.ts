import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Ensure Node.js runtime for Prisma
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Running nightly metrics recalculation...')
    
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
    
    // 4. Log comprehensive health check
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
    
    console.log(`✅ Metrics calculated - Health Score: ${overallHealth}/100`)
    
    return NextResponse.json({
      success: true,
      message: 'Nightly metrics recalculation completed',
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
    
  } catch (error) {
    console.error('❌ Metrics recalculation failed:', error)
    
    // Log failed health check
    await prisma.healthCheck.create({
      data: {
        name: 'nightly_metrics',
        ok: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({ 
      error: 'Metrics recalculation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
