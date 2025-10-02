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

// Real grant URLs by category
const realGrantUrls = {
  // Federal Programs
  'Small Business Innovation Research (SBIR) Program': 'https://www.sbir.gov/',
  'Small Business Technology Transfer (STTR) Program': 'https://www.sbir.gov/',
  'Economic Development Administration (EDA) Grants': 'https://www.eda.gov/',
  'USDA Rural Business Development Grants': 'https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants',
  'SBA Community Navigator Pilot Program': 'https://www.sba.gov/funding-programs/loans/community-navigator-pilot-program',
  'Department of Energy Small Business Innovation Research': 'https://www.energy.gov/science/initiatives/sbir-sttr',
  
  // State Programs
  'California Small Business COVID-19 Relief Grant': 'https://careliefgrant.com/',
  'New York State Small Business Grant Program': 'https://esd.ny.gov/',
  'Texas Small Business Emergency Assistance Program': 'https://gov.texas.gov/business/page/small-business-emergency-assistance',
  'Florida Small Business Emergency Bridge Loan Program': 'https://floridajobs.org/business-growth-and-partnerships/community-planning-and-development/community-development-block-grant-cdbg',
  'Illinois Small Business Emergency Loan Program': 'https://www2.illinois.gov/dceo/SmallBizAssistance/Pages/EmergencyLoanProgram.aspx',
  'Pennsylvania Small Business First Program': 'https://dced.pa.gov/programs/small-business-first/',
  
  // City Programs
  'Chicago Small Business Improvement Fund': 'https://www.chicago.gov/city/en/depts/dcd/supp_info/small_business_improvement_fund.html',
  'Los Angeles Small Business Emergency Microloan Program': 'https://bca.lacity.org/',
  'Miami-Dade Small Business Development Program': 'https://www.miamidade.gov/business/',
  
  // Generic state grants (will be updated with state-specific URLs)
  'Rural Business Development Grant': 'https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants',
  'Technology Innovation Grant': 'https://www.commerce.wa.gov/building-infrastructure/innovation-technology/',
  'Minority Business Grant': 'https://www.sba.gov/funding-programs/loans/community-navigator-pilot-program',
  'Small Business Development Grant': 'https://www.sba.gov/local-assistance',
  'Small Business Emergency Loan Program': 'https://www.sba.gov/funding-programs/loans',
  'Small Business First Program': 'https://www.sba.gov/local-assistance',
  'Small Business Emergency Bridge Loan Program': 'https://www.sba.gov/funding-programs/loans',
  'Small Business Emergency Assistance Program': 'https://www.sba.gov/funding-programs/loans',
  'Small Business COVID-19 Relief Grant': 'https://www.sba.gov/funding-programs/loans',
  'Small Business Grant Program': 'https://www.sba.gov/local-assistance'
}

// State-specific URLs for generic grants
const stateSpecificUrls = {
  'Alabama': 'https://www.alabama.gov/',
  'Alaska': 'https://www.commerce.alaska.gov/web/',
  'Arizona': 'https://www.azcommerce.com/',
  'Arkansas': 'https://www.arkansasedc.com/',
  'California': 'https://business.ca.gov/',
  'Colorado': 'https://www.choosecolorado.com/',
  'Connecticut': 'https://portal.ct.gov/DECD',
  'Delaware': 'https://business.delaware.gov/',
  'Florida': 'https://www.enterpriseflorida.com/',
  'Georgia': 'https://www.georgia.org/',
  'Hawaii': 'https://dbedt.hawaii.gov/',
  'Idaho': 'https://commerce.idaho.gov/',
  'Illinois': 'https://www2.illinois.gov/dceo/',
  'Indiana': 'https://www.in.gov/iedc/',
  'Iowa': 'https://www.iowaeconomicdevelopment.com/',
  'Kansas': 'https://www.kansascommerce.gov/',
  'Kentucky': 'https://www.thinkkentucky.com/',
  'Louisiana': 'https://www.opportunitylouisiana.com/',
  'Maine': 'https://www.maine.gov/decd/',
  'Maryland': 'https://commerce.maryland.gov/',
  'Massachusetts': 'https://www.mass.gov/orgs/massachusetts-office-of-business-development',
  'Michigan': 'https://www.michiganbusiness.org/',
  'Minnesota': 'https://mn.gov/deed/',
  'Mississippi': 'https://www.mississippi.org/',
  'Missouri': 'https://www.missouripartnership.com/',
  'Montana': 'https://business.mt.gov/',
  'Nebraska': 'https://www.opportunity.nebraska.gov/',
  'Nevada': 'https://www.nevadabusiness.org/',
  'New Hampshire': 'https://www.nheconomy.com/',
  'New Jersey': 'https://www.njeda.com/',
  'New Mexico': 'https://www.edd.state.nm.us/',
  'New York': 'https://esd.ny.gov/',
  'North Carolina': 'https://www.nccommerce.com/',
  'North Dakota': 'https://www.commerce.nd.gov/',
  'Ohio': 'https://development.ohio.gov/',
  'Oklahoma': 'https://www.okcommerce.gov/',
  'Oregon': 'https://www.oregon.gov/biz/',
  'Pennsylvania': 'https://dced.pa.gov/',
  'Rhode Island': 'https://commerceri.com/',
  'South Carolina': 'https://www.sccommerce.com/',
  'South Dakota': 'https://sd.gov/business/',
  'Tennessee': 'https://www.tn.gov/ecd.html',
  'Texas': 'https://gov.texas.gov/business/',
  'Utah': 'https://business.utah.gov/',
  'Vermont': 'https://www.vermont.gov/portal/business/',
  'Virginia': 'https://www.virginia.gov/services/start-a-business/',
  'Washington': 'https://www.commerce.wa.gov/',
  'West Virginia': 'https://www.wvcommerce.org/',
  'Wisconsin': 'https://www.wisconsin.gov/Pages/Government.aspx',
  'Wyoming': 'https://www.wyomingbusiness.org/'
}

async function updateAllGrantUrls() {
  console.log('🔄 Updating ALL grant URLs with real application links...')
  
  let updatedCount = 0
  let stateCount = 0
  
  // Get all states
  const states = await prisma.state.findMany({
    select: { id: true, name: true, code: true }
  })
  
  console.log(`📊 Found ${states.length} states to process`)
  
  // Update grants by exact title match first
  for (const [title, url] of Object.entries(realGrantUrls)) {
    try {
      const result = await prisma.program.updateMany({
        where: {
          title: title,
          url: "https://example.com/apply"
        },
        data: {
          url: url
        }
      })
      
      if (result.count > 0) {
        console.log(`✅ Updated: ${title}`)
        updatedCount += result.count
      }
    } catch (error) {
      console.error(`❌ Error updating ${title}:`, error)
    }
  }
  
  // Update generic grants with state-specific URLs
  for (const state of states) {
    try {
      const stateUrl = stateSpecificUrls[state.name as keyof typeof stateSpecificUrls]
      if (!stateUrl) continue
      
      // Update generic grants for this state
      const genericGrants = [
        'Rural Business Development Grant',
        'Technology Innovation Grant', 
        'Minority Business Grant',
        'Small Business Development Grant',
        'Small Business Emergency Loan Program',
        'Small Business First Program',
        'Small Business Emergency Bridge Loan Program',
        'Small Business Emergency Assistance Program',
        'Small Business COVID-19 Relief Grant',
        'Small Business Grant Program'
      ]
      
      for (const grantType of genericGrants) {
        const result = await prisma.program.updateMany({
          where: {
            title: { contains: grantType },
            stateId: state.id,
            url: "https://example.com/apply"
          },
          data: {
            url: stateUrl
          }
        })
        
        if (result.count > 0) {
          console.log(`✅ Updated ${grantType} for ${state.name}`)
          updatedCount += result.count
        }
      }
      
      stateCount++
    } catch (error) {
      console.error(`❌ Error updating grants for ${state.name}:`, error)
    }
  }
  
  // Update any remaining example URLs with generic SBA URL
  const remainingResult = await prisma.program.updateMany({
    where: {
      url: "https://example.com/apply"
    },
    data: {
      url: "https://www.sba.gov/local-assistance"
    }
  })
  
  if (remainingResult.count > 0) {
    console.log(`✅ Updated ${remainingResult.count} remaining grants with SBA URL`)
    updatedCount += remainingResult.count
  }
  
  console.log(`\n✅ Successfully updated ${updatedCount} grant URLs across ${stateCount} states!`)
  
  // Show statistics
  const stats = await prisma.program.groupBy({
    by: ['url'],
    _count: { url: true },
    where: {
      url: { not: "https://example.com/apply" }
    }
  })
  
  console.log('\n📋 URL Distribution:')
  stats.forEach(stat => {
    const domain = new URL(stat.url).hostname
    console.log(`  • ${domain}: ${stat._count.url} grants`)
  })
  
  // Show sample updated grants
  const sampleGrants = await prisma.program.findMany({
    where: {
      url: { not: "https://example.com/apply" }
    },
    take: 10,
    select: {
      title: true,
      url: true,
      state: { select: { name: true } }
    }
  })
  
  console.log('\n📋 Sample updated grants:')
  sampleGrants.forEach(grant => {
    const domain = new URL(grant.url).hostname
    console.log(`  • ${grant.title} (${grant.state.name}) → ${domain}`)
  })
}

updateAllGrantUrls()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Update failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
