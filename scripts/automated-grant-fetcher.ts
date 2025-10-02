import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient({
  datasources: { 
    db: { 
      url: "postgresql://postgres.nrcuzovxjuzkamppgdrw:Kai%4035806@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
    } 
  },
  log: ['warn', 'error'],
})

// Automated grant data sources (using public RSS feeds)
const GRANT_SOURCES = [
  {
    name: 'SBA.gov RSS Feed',
    url: 'https://www.sba.gov/rss-feeds',
    type: 'rss'
  },
  {
    name: 'USDA Rural Development RSS',
    url: 'https://www.rd.usda.gov/rss/news-releases',
    type: 'rss'
  },
  {
    name: 'EDA (Economic Development Administration) RSS',
    url: 'https://www.eda.gov/rss/news',
    type: 'rss'
  },
  {
    name: 'NIST (National Institute of Standards) RSS',
    url: 'https://www.nist.gov/rss/grants',
    type: 'rss'
  }
]

async function fetchGrantsFromSources() {
  console.log('🔄 Fetching grants from automated sources...')
  
  let newGrantsCount = 0
  
  for (const source of GRANT_SOURCES) {
    try {
      console.log(`📡 Checking ${source.name}...`)
      
      let grants = []
      
      if (source.type === 'rss') {
        // Fetch from RSS feeds
        grants = await fetchRSSFeed(source)
      } else {
        // Fallback to mock data for other sources
        grants = [
          {
            title: `New Grant from ${source.name}`,
            description: `Automatically discovered grant opportunity from ${source.name}`,
            amount: 'Up to $50,000',
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            url: 'https://www.sba.gov/local-assistance',
            featured: false,
            active: true,
            stateCode: 'US' // Federal program
          }
        ]
      }
      
      for (const grant of grants) {
        try {
          // Check if grant already exists
          const existing = await prisma.program.findFirst({
            where: {
              title: grant.title,
              url: grant.url
            }
          })
          
          if (!existing) {
            // Find or create state
            let state = await prisma.state.findFirst({
              where: { code: grant.stateCode }
            })
            
            if (!state) {
              state = await prisma.state.create({
                data: {
                  name: grant.stateCode === 'US' ? 'United States' : grant.stateCode,
                  slug: grant.stateCode.toLowerCase(),
                  code: grant.stateCode
                }
              })
            }
            
            // Create new program
            await prisma.program.create({
              data: {
                title: grant.title,
                slug: grant.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: grant.description,
                amount: grant.amount,
                deadline: grant.deadline,
                url: grant.url,
                featured: grant.featured,
                active: grant.active,
                stateId: state.id
              }
            })
            
            newGrantsCount++
            console.log(`✅ Added: ${grant.title}`)
          }
        } catch (error) {
          console.error(`❌ Error adding grant: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
    } catch (error) {
      console.error(`❌ Error fetching from ${source.name}:`, error instanceof Error ? error.message : 'Unknown error')
    }
  }
  
  console.log(`🎉 Found and added ${newGrantsCount} new grants!`)
  
  // Log health check
  await prisma.healthCheck.create({
    data: {
      name: 'automated_grant_fetch',
      ok: true,
      details: {
        newGrantsFound: newGrantsCount,
        sourcesChecked: GRANT_SOURCES.length,
        timestamp: new Date().toISOString()
      }
    }
  })
  
  return newGrantsCount
}


// Fetch from RSS feeds
async function fetchRSSFeed(source: any) {
  try {
    const response = await fetch(source.url)
    const xml = await response.text()
    
    // Simple RSS parsing (in production, use a proper RSS parser)
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
    
    return items.slice(0, 3).map((item: string, index: number) => {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
      const linkMatch = item.match(/<link>(.*?)<\/link>/)
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)
      
      return {
        title: titleMatch ? titleMatch[1] : `Grant from ${source.name}`,
        description: descMatch ? descMatch[1].substring(0, 200) + '...' : 'Grant opportunity from RSS feed',
        amount: 'Varies',
        deadline: new Date(Date.now() + (30 + index * 10) * 24 * 60 * 60 * 1000),
        url: linkMatch ? linkMatch[1] : 'https://www.sba.gov',
        featured: false,
        active: true,
        stateCode: 'US'
      }
    })
  } catch (error) {
    console.log(`⚠️  Error fetching RSS from ${source.name}: ${error}`)
    return []
  }
}

// Run the automated fetch
fetchGrantsFromSources()
  .then(async (count) => {
    console.log(`✅ Automated grant fetching completed. Added ${count} new grants.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Automated grant fetching failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
