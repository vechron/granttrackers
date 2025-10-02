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

// Real grant sources with working APIs
const REAL_GRANT_SOURCES = [
  {
    name: 'Grants.gov XML Feed',
    url: 'https://www.grants.gov/xml/opportunities.xml',
    type: 'xml'
  },
  {
    name: 'SBA RSS Feed',
    url: 'https://www.sba.gov/rss-feeds',
    type: 'rss'
  },
  {
    name: 'USDA News RSS',
    url: 'https://www.rd.usda.gov/rss/news-releases',
    type: 'rss'
  }
]

async function fetchRealGrants() {
  console.log('🔄 Fetching REAL grants from live sources...')
  
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
  
  for (const source of REAL_GRANT_SOURCES) {
    try {
      console.log(`📡 Fetching from ${source.name}...`)
      
      let grants: Array<{
        title: string;
        description: string;
        amount: string;
        deadline: Date;
        url: string;
        featured: boolean;
        active: boolean;
        stateCode: string;
      }> = []
      
      if (source.type === 'xml') {
        grants = await fetchGrantsGovXML(source)
      } else if (source.type === 'rss') {
        grants = await fetchRSSFeed(source)
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
    } catch (error) {
      console.error(`❌ Error fetching from ${source.name}:`, error)
    }
  }
  
  console.log(`🎉 Added ${addedCount} REAL grants from live sources!`)
  return addedCount
}

// Fetch from Grants.gov XML feed
async function fetchGrantsGovXML(source: any) {
  try {
    const response = await fetch(source.url)
    const xml = await response.text()
    
    // Parse XML for grant opportunities
    const opportunities = xml.match(/<opportunity>[\s\S]*?<\/opportunity>/g) || []
    
    return opportunities.slice(0, 10).map((opp: string, index: number) => {
      const titleMatch = opp.match(/<opportunityTitle><!\[CDATA\[(.*?)\]\]><\/opportunityTitle>/)
      const descMatch = opp.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)
      const amountMatch = opp.match(/<estimatedTotalProgramFunding><!\[CDATA\[(.*?)\]\]><\/estimatedTotalProgramFunding>/)
      const deadlineMatch = opp.match(/<closeDate><!\[CDATA\[(.*?)\]\]><\/closeDate>/)
      const urlMatch = opp.match(/<opportunityUrl><!\[CDATA\[(.*?)\]\]><\/opportunityUrl>/)
      
      return {
        title: titleMatch ? titleMatch[1] : `Grant Opportunity ${index + 1}`,
        description: descMatch ? descMatch[1].substring(0, 300) + '...' : 'Federal grant opportunity',
        amount: amountMatch ? amountMatch[1] : 'Varies',
        deadline: deadlineMatch ? new Date(deadlineMatch[1]) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        url: urlMatch ? urlMatch[1] : 'https://www.grants.gov',
        featured: index < 3, // First 3 are featured
        active: true,
        stateCode: 'US'
      }
    })
  } catch (error) {
    console.log(`⚠️  Error fetching Grants.gov XML: ${error}`)
    return []
  }
}

// Fetch from RSS feeds
async function fetchRSSFeed(source: any) {
  try {
    const response = await fetch(source.url)
    const xml = await response.text()
    
    // Parse RSS items
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
    
    return items.slice(0, 5).map((item: string, index: number) => {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
      const linkMatch = item.match(/<link>(.*?)<\/link>/)
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)
      
      return {
        title: titleMatch ? titleMatch[1] : `Grant from ${source.name}`,
        description: descMatch ? descMatch[1].substring(0, 200) + '...' : 'Grant opportunity from RSS feed',
        amount: 'Varies',
        deadline: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        url: linkMatch ? linkMatch[1] : 'https://www.sba.gov',
        featured: index < 2, // First 2 are featured
        active: true,
        stateCode: 'US'
      }
    })
  } catch (error) {
    console.log(`⚠️  Error fetching RSS from ${source.name}: ${error}`)
    return []
  }
}

// Run the real grant fetcher
fetchRealGrants()
  .then(async (count) => {
    console.log(`✅ Real grant fetching completed. Added ${count} REAL grants.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Real grant fetching failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
