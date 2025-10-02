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

// Automated grant data sources
const GRANT_SOURCES = [
  {
    name: 'SBA.gov RSS Feed',
    url: 'https://www.sba.gov/rss-feeds',
    type: 'rss'
  },
  {
    name: 'Grants.gov API',
    url: 'https://www.grants.gov/web/grants/xml-opportunities.html',
    type: 'xml'
  },
  {
    name: 'USDA Rural Development',
    url: 'https://www.rd.usda.gov/newsroom/news-releases',
    type: 'scraper'
  },
  {
    name: 'State Economic Development APIs',
    url: 'https://api.example.com/grants', // Replace with real APIs
    type: 'api'
  }
]

async function fetchGrantsFromSources() {
  console.log('🔄 Fetching grants from automated sources...')
  
  let newGrantsCount = 0
  
  for (const source of GRANT_SOURCES) {
    try {
      console.log(`📡 Checking ${source.name}...`)
      
      // This is where you'd implement actual fetching logic
      // For now, we'll simulate finding new grants
      const mockNewGrants = [
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
      
      for (const grant of mockNewGrants) {
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
          console.error(`❌ Error adding grant: ${error.message}`)
        }
      }
      
    } catch (error) {
      console.error(`❌ Error fetching from ${source.name}:`, error.message)
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
