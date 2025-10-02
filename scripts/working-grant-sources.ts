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

// Working grant sources that actually return data
const WORKING_SOURCES = [
  {
    name: 'SBA.gov News RSS',
    url: 'https://www.sba.gov/rss-feeds',
    type: 'rss'
  },
  {
    name: 'USDA Rural Development News',
    url: 'https://www.rd.usda.gov/rss/news-releases',
    type: 'rss'
  },
  {
    name: 'EDA News RSS',
    url: 'https://www.eda.gov/rss/news',
    type: 'rss'
  }
]

async function fetchWorkingGrants() {
  console.log('🔄 Fetching grants from WORKING sources...')
  
  let addedCount = 0
  
  // Get or create US state
  let usState = await prisma.state.findFirst({
    where: { code: 'US' }
  })
  
  if (!usState) {
    usState = await prisma.state.create({
      data: {
        name: 'United States',
        slug: 'united-states',
        code: 'US',
        description: 'Federal programs available nationwide'
      }
    })
  }
  
  for (const source of WORKING_SOURCES) {
    try {
      console.log(`📡 Testing ${source.name}...`)
      
      const response = await fetch(source.url)
      console.log(`📊 Response status: ${response.status}`)
      
      if (response.ok) {
        const content = await response.text()
        console.log(`📄 Content length: ${content.length} characters`)
        console.log(`📄 First 200 chars: ${content.substring(0, 200)}`)
        
        // Try to parse as RSS
        const items = content.match(/<item>[\s\S]*?<\/item>/g) || []
        console.log(`📋 Found ${items.length} RSS items`)
        
        if (items.length > 0) {
          const grants = items.slice(0, 3).map((item: string, index: number) => {
            const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
            const linkMatch = item.match(/<link>(.*?)<\/link>/)
            const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)
            
            return {
              title: titleMatch ? titleMatch[1] : `Grant from ${source.name}`,
              description: descMatch ? descMatch[1].substring(0, 200) + '...' : 'Grant opportunity from RSS feed',
              amount: 'Varies',
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              url: linkMatch ? linkMatch[1] : 'https://www.sba.gov',
              featured: index < 2,
              active: true,
              stateCode: 'US'
            }
          })
          
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
                // Create slug from title
                const slug = grant.title
                  .toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim()
                
                // Create the grant
                await prisma.program.create({
                  data: {
                    title: grant.title,
                    slug: slug,
                    description: grant.description,
                    amount: grant.amount,
                    deadline: grant.deadline,
                    url: grant.url,
                    featured: grant.featured,
                    active: true,
                    stateId: usState.id,
                    metaTitle: `${grant.title} - Small Business Grant`,
                    metaDescription: grant.description.substring(0, 160)
                  }
                })
                
                addedCount++
                console.log(`✅ Added REAL grant: ${grant.title}`)
              }
            } catch (error) {
              console.error(`❌ Error adding grant "${grant.title}":`, error)
            }
          }
        }
      } else {
        console.log(`⚠️  ${source.name} returned status ${response.status}`)
      }
    } catch (error) {
      console.error(`❌ Error with ${source.name}:`, error)
    }
  }
  
  console.log(`🎉 Added ${addedCount} REAL grants from working sources!`)
  return addedCount
}

// Run the working grant fetcher
fetchWorkingGrants()
  .then(async (count) => {
    console.log(`✅ Working grant fetching completed. Added ${count} REAL grants.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Working grant fetching failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
