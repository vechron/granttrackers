import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient({
  datasources: { 
    db: { 
      url: process.env.DATABASE_URL
    } 
  },
  log: ['warn', 'error'],
})

async function fixAllGrants() {
  console.log('🔧 Fixing all grant data...')
  
  // Delete all bad grants with poor titles/URLs
  const deletedCount = await prisma.program.deleteMany({
    where: {
      OR: [
        { title: { startsWith: '/' } },
        { title: { startsWith: 'http' } },
        { title: { contains: 'Every day that Senate Democrats' } },
        { title: { contains: 'Find funding to start' } },
        { url: { contains: 'example.com' } },
        { url: { contains: 'localhost' } },
        { description: { contains: 'Grant opportunity from' } }
      ]
    }
  })
  
  console.log(`🗑️ Deleted ${deletedCount.count} bad grants`)
  
  // Add high-quality federal grants
  const federalGrants = [
    {
      title: "Small Business Innovation Research (SBIR) Program",
      description: "Federal program providing funding for small businesses to engage in research and development with commercial potential. Offers Phase I ($150K) and Phase II ($1M) awards.",
      amount: "Up to $1,000,000",
      deadline: new Date("2024-12-31"),
      url: "https://www.sbir.gov/",
      featured: true
    },
    {
      title: "Small Business Technology Transfer (STTR) Program", 
      description: "Similar to SBIR but requires partnership with a research institution. Provides funding for collaborative R&D projects.",
      amount: "Up to $1,000,000",
      deadline: new Date("2024-11-30"),
      url: "https://www.sbir.gov/sttr/",
      featured: true
    },
    {
      title: "SBA 7(a) Loan Program",
      description: "The SBA's primary program for helping start-ups and existing small businesses with financing. Can be used for working capital, equipment, and real estate.",
      amount: "Up to $5,000,000", 
      deadline: null,
      url: "https://www.sba.gov/funding-programs/loans/7a-loans",
      featured: true
    },
    {
      title: "SBA 504 Loan Program",
      description: "Long-term, fixed-rate financing for major fixed assets that promote business growth and job creation.",
      amount: "Up to $5,500,000",
      deadline: null,
      url: "https://www.sba.gov/funding-programs/loans/504-loans",
      featured: false
    },
    {
      title: "USDA Rural Business Development Grants",
      description: "USDA grants supporting business development in rural areas. Focus on agriculture, food processing, and rural economic development.",
      amount: "Up to $500,000",
      deadline: new Date("2024-12-31"),
      url: "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants",
      featured: true
    },
    {
      title: "EDA Public Works and Economic Development",
      description: "Economic Development Administration grants for infrastructure projects that support economic development in distressed communities.",
      amount: "Up to $2,000,000",
      deadline: new Date("2024-10-31"),
      url: "https://www.eda.gov/funding-opportunities",
      featured: false
    }
  ]
  
  // Get US state
  const usState = await prisma.state.findFirst({
    where: { code: 'US' }
  })
  
  if (!usState) {
    console.error('❌ US state not found')
    return
    return
  }
  
  let addedCount = 0
  for (const grant of federalGrants) {
    try {
      // Check if grant already exists
      const existing = await prisma.program.findFirst({
        where: { title: grant.title }
      })
      
      if (!existing) {
        const slug = grant.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
        
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
      }
    } catch (error) {
      console.error(`❌ Error adding ${grant.title}:`, error)
    }
  }
  
  console.log(`🎉 Added ${addedCount} high-quality federal grants!`)
  
  // Update state-specific grants with real URLs
  const stateGrants = await prisma.program.findMany({
    where: {
      state: { code: { not: 'US' } },
      url: { contains: 'example.com' }
    }
  })
  
  for (const grant of stateGrants) {
    await prisma.program.update({
      where: { id: grant.id },
      data: {
        url: 'https://www.sba.gov/funding-programs',
        description: `${grant.title} - State-specific grant opportunity for small businesses.`
      }
    })
  }
  
  console.log(`🔗 Updated ${stateGrants.length} state grants with real URLs`)
  
  return { deleted: deletedCount.count, added: addedCount }
}

// Run the fix
fixAllGrants()
  .then(async (result) => {
    console.log(`✅ Grant data fix completed. Deleted ${result?.deleted || 0}, added ${result?.added || 0} grants.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Grant data fix failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
