import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Lazy-load Prisma to avoid build-time database connections
    const { prisma } = await import('@/lib/prisma')
    
    // Test the exact same query that the home page uses
    const featuredPrograms = await prisma.program.findMany({
      where: {
        featured: true,
        active: true,
        OR: [
          { deadline: null },
          { deadline: { gte: new Date() } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        amount: true,
        deadline: true,
        url: true,
        state: { select: { name: true, slug: true } }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    })
    
    // Also test states query
    const states = await prisma.state.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json({
      success: true,
      featuredProgramsCount: featuredPrograms.length,
      statesCount: states.length,
      featuredPrograms: featuredPrograms,
      states: states.slice(0, 5), // First 5 states
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set'
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set'
    }, { status: 500 })
  }
}
