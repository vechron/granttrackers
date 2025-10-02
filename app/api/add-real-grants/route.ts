import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Detect Next's build phase so we never run at build
const IS_BUILD =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.VERCEL === '1' && !!process.env.BUILD_ID)

const realGrants = [
  {
    title: "Small Business Innovation Research (SBIR) Program",
    description: "Federal program providing funding for small businesses to engage in research and development with commercial potential. Offers Phase I ($150K) and Phase II ($1M) awards.",
    amount: "Up to $1,000,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.sbir.gov/",
    featured: true,
    stateCode: "CA"
  },
  {
    title: "California Small Business COVID-19 Relief Grant",
    description: "California's grant program for small businesses affected by COVID-19. Provides direct cash grants to eligible businesses.",
    amount: "Up to $25,000",
    deadline: new Date("2024-06-30"),
    url: "https://careliefgrant.com/",
    featured: true,
    stateCode: "CA"
  },
  {
    title: "New York State Small Business Grant Program",
    description: "New York's comprehensive grant program supporting small businesses with direct funding and technical assistance.",
    amount: "Up to $50,000",
    deadline: new Date("2024-08-31"),
    url: "https://esd.ny.gov/",
    featured: true,
    stateCode: "NY"
  },
  {
    title: "USDA Rural Business Development Grants",
    description: "USDA grants supporting business development in rural areas. Focus on agriculture, food processing, and rural economic development.",
    amount: "Up to $500,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.rd.usda.gov/",
    featured: true,
    stateCode: "TX"
  },
  {
    title: "Texas Small Business Emergency Assistance Program",
    description: "Texas grant program providing emergency assistance to small businesses during economic disruptions.",
    amount: "Up to $30,000",
    deadline: new Date("2024-07-31"),
    url: "https://gov.texas.gov/",
    featured: false,
    stateCode: "TX"
  },
  {
    title: "Florida Small Business Emergency Bridge Loan Program",
    description: "Florida's bridge loan program providing short-term, interest-free loans to small businesses during emergencies.",
    amount: "Up to $50,000",
    deadline: new Date("2024-09-30"),
    url: "https://floridajobs.org/",
    featured: false,
    stateCode: "FL"
  }
]

export async function POST(request: NextRequest) {
  // Never run during build collection
  if (IS_BUILD) {
    return NextResponse.json({ skipped: true, reason: 'build phase' })
  }

  // Don't run without DB URL (e.g., preview build)
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ skipped: true, reason: 'no DATABASE_URL' })
  }

  // Lazy-load Prisma and other dependencies
  const { prisma } = await import('@/lib/prisma')
  const { rateLimit, getClientIP, createRateLimitHeaders } = await import('@/lib/rate-limit')
  const { revalidatePrograms } = await import('@/lib/cache')

  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`add-grants:${clientIP}`, 5, 300000) // 5 requests per 5 minutes
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: createRateLimitHeaders(
            rateLimitResult.allowed,
            rateLimitResult.remaining,
            rateLimitResult.resetTime
          )
        }
      )
    }
    
    console.log('Adding real grant data via API...')
    
    // Get all states
    const states = await prisma.state.findMany()
    console.log(`Found ${states.length} states`)
    
    if (states.length === 0) {
      return NextResponse.json({ 
        error: 'No states found. Please run the seed script first.' 
      }, { status: 400 })
    }
    
    const stateMap = new Map(states.map(s => [s.code, s.id]))
    let addedCount = 0
    const results = []
    
    for (const grant of realGrants) {
      try {
        const stateId = stateMap.get(grant.stateCode)
        
        if (!stateId) {
          console.log(`Skipping grant "${grant.title}" - state ${grant.stateCode} not found`)
          results.push({ title: grant.title, status: 'skipped', reason: 'State not found' })
          continue
        }
        
        // Create slug from title
        const slug = grant.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
        
        // Check if grant already exists
        const existing = await prisma.program.findUnique({
          where: { slug }
        })
        
        if (existing) {
          console.log(`Grant "${grant.title}" already exists, skipping...`)
          results.push({ title: grant.title, status: 'skipped', reason: 'Already exists' })
          continue
        }
        
        // Create the grant
        const newGrant = await prisma.program.create({
          data: {
            title: grant.title,
            slug: slug,
            description: grant.description,
            amount: grant.amount,
            deadline: grant.deadline,
            url: grant.url,
            featured: grant.featured,
            active: true,
            stateId: stateId,
            metaTitle: `${grant.title} - Small Business Grant`,
            metaDescription: grant.description.substring(0, 160)
          }
        })
        
        addedCount++
        console.log(`✅ Added: ${grant.title}`)
        results.push({ title: grant.title, status: 'added', id: newGrant.id })
        
      } catch (error) {
        console.error(`Error adding grant "${grant.title}":`, error)
        results.push({ title: grant.title, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }
    
    // Get final statistics
    const totalPrograms = await prisma.program.count()
    const featuredPrograms = await prisma.program.count({
      where: { featured: true }
    })
    
    // Revalidate cache after data changes
    if (addedCount > 0) {
      await revalidatePrograms()
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully added ${addedCount} real grants!`,
      addedCount,
      results,
      statistics: {
        totalPrograms,
        featuredPrograms,
        states: states.length
      }
    })
    
  } catch (error) {
    console.error('Error adding real grants:', error)
    return NextResponse.json({ 
      error: 'Failed to add real grants',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
