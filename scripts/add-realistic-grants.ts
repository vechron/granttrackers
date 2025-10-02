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

// Realistic grant data based on actual federal programs
const REALISTIC_GRANTS = [
  {
    title: "Small Business Innovation Research (SBIR) Program",
    description: "Federal program providing funding for small businesses to engage in research and development with commercial potential. Offers Phase I ($150K) and Phase II ($1M) awards.",
    amount: "Up to $1,000,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.sbir.gov/",
    featured: true,
    stateCode: "US"
  },
  {
    title: "Small Business Technology Transfer (STTR) Program",
    description: "Similar to SBIR but requires partnership with a research institution. Provides funding for collaborative R&D projects.",
    amount: "Up to $1,000,000",
    deadline: new Date("2024-11-30"),
    url: "https://www.sbir.gov/sttr/",
    featured: true,
    stateCode: "US"
  },
  {
    title: "SBA 7(a) Loan Program",
    description: "The SBA's primary program for helping start-ups and existing small businesses with financing. Can be used for working capital, equipment, and real estate.",
    amount: "Up to $5,000,000",
    deadline: null, // Ongoing
    url: "https://www.sba.gov/funding-programs/loans/7a-loans",
    featured: true,
    stateCode: "US"
  },
  {
    title: "SBA 504 Loan Program",
    description: "Long-term, fixed-rate financing for major fixed assets that promote business growth and job creation.",
    amount: "Up to $5,500,000",
    deadline: null, // Ongoing
    url: "https://www.sba.gov/funding-programs/loans/504-loans",
    featured: false,
    stateCode: "US"
  },
  {
    title: "USDA Rural Business Development Grants",
    description: "USDA grants supporting business development in rural areas. Focus on agriculture, food processing, and rural economic development.",
    amount: "Up to $500,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants",
    featured: true,
    stateCode: "US"
  },
  {
    title: "EDA Public Works and Economic Development",
    description: "Economic Development Administration grants for infrastructure projects that support economic development in distressed communities.",
    amount: "Up to $2,000,000",
    deadline: new Date("2024-10-31"),
    url: "https://www.eda.gov/funding-opportunities",
    featured: false,
    stateCode: "US"
  },
  {
    title: "NIST Manufacturing Extension Partnership",
    description: "Helps small and medium-sized manufacturers improve productivity, reduce costs, and increase profits through technology and business assistance.",
    amount: "Up to $150,000",
    deadline: new Date("2024-09-30"),
    url: "https://www.nist.gov/mep",
    featured: false,
    stateCode: "US"
  },
  {
    title: "NSF Small Business Innovation Research",
    description: "National Science Foundation SBIR program for technology-based small businesses to engage in R&D with commercial potential.",
    amount: "Up to $1,750,000",
    deadline: new Date("2024-12-15"),
    url: "https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=504655",
    featured: true,
    stateCode: "US"
  }
]

async function addRealisticGrants() {
  console.log('🔄 Adding realistic federal grants...')
  
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
    console.log('✅ Created US state')
  }
  
  for (const grant of REALISTIC_GRANTS) {
    try {
      // Check if grant already exists
      const existing = await prisma.program.findFirst({
        where: {
          title: grant.title
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
        console.log(`✅ Added: ${grant.title}`)
      } else {
        console.log(`⏭️  Skipped: ${grant.title} (already exists)`)
      }
    } catch (error) {
      console.error(`❌ Error adding grant "${grant.title}":`, error)
    }
  }
  
  console.log(`🎉 Added ${addedCount} realistic federal grants!`)
  
  // Log health check
  await prisma.healthCheck.create({
    data: {
      name: 'realistic_grants_added',
      ok: true,
      details: {
        grantsAdded: addedCount,
        timestamp: new Date().toISOString()
      }
    }
  })
  
  return addedCount
}

// Run the script
addRealisticGrants()
  .then(async (count) => {
    console.log(`✅ Realistic grants addition completed. Added ${count} grants.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Realistic grants addition failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
