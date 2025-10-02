import { PrismaClient } from '@prisma/client'

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Use the working pooler connection
const prisma = new PrismaClient({
  datasources: { 
    db: { 
      url: "postgresql://postgres.nrcuzovxjuzkamppgdrw:Kai%4035806@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
    } 
  },
  log: ['warn', 'error'],
})

// Real URLs for existing grants
const grantUrlUpdates = [
  {
    title: "Rural Business Development Grant - Alabama",
    url: "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants"
  },
  {
    title: "Rural Business Development Grant - Arkansas", 
    url: "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants"
  },
  {
    title: "Rural Business Development Grant - Texas",
    url: "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants"
  },
  {
    title: "Rural Business Development Grant - Tennessee",
    url: "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants"
  },
  {
    title: "Technology Innovation Grant - Washington",
    url: "https://www.commerce.wa.gov/building-infrastructure/innovation-technology/"
  },
  {
    title: "Minority Business Grant - Virginia",
    url: "https://www.virginia.gov/services/start-a-business/"
  },
  {
    title: "Minority Business Grant - Vermont", 
    url: "https://www.vermont.gov/portal/business/"
  },
  {
    title: "Small Business Development Grant - Utah",
    url: "https://business.utah.gov/"
  },
  {
    title: "Small Business Emergency Loan Program - Illinois",
    url: "https://www2.illinois.gov/dceo/SmallBizAssistance/Pages/EmergencyLoanProgram.aspx"
  },
  {
    title: "Small Business First Program - Pennsylvania",
    url: "https://dced.pa.gov/programs/small-business-first/"
  }
]

async function updateGrantUrls() {
  console.log('🔄 Updating grant URLs with real application links...')
  
  let updatedCount = 0
  
  for (const update of grantUrlUpdates) {
    try {
      const result = await prisma.program.updateMany({
        where: {
          title: update.title,
          url: "https://example.com/apply" // Only update example URLs
        },
        data: {
          url: update.url
        }
      })
      
      if (result.count > 0) {
        console.log(`✅ Updated: ${update.title}`)
        updatedCount += result.count
      } else {
        console.log(`⚠️  Not found or already updated: ${update.title}`)
      }
    } catch (error) {
      console.error(`❌ Error updating ${update.title}:`, error)
    }
  }
  
  console.log(`\n✅ Successfully updated ${updatedCount} grant URLs!`)
  
  // Show some examples
  const sampleGrants = await prisma.program.findMany({
    where: {
      url: { not: "https://example.com/apply" }
    },
    take: 5,
    select: {
      title: true,
      url: true,
      state: { select: { name: true } }
    }
  })
  
  console.log('\n📋 Sample updated grants:')
  sampleGrants.forEach(grant => {
    console.log(`  • ${grant.title} (${grant.state.name})`)
    console.log(`    URL: ${grant.url}`)
  })
}

updateGrantUrls()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Update failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
