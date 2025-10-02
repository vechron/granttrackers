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

// Real state-specific grant URLs
const STATE_GRANT_URLS = {
  'AL': 'https://www.adeca.alabama.gov/divisions/community-and-economic-development/',
  'AK': 'https://www.commerce.alaska.gov/web/dcra/',
  'AZ': 'https://www.azcommerce.com/financing/',
  'AR': 'https://www.arkansasedc.com/financing',
  'CA': 'https://www.business.ca.gov/',
  'CO': 'https://www.choosecolorado.com/financing/',
  'CT': 'https://portal.ct.gov/DECD',
  'DE': 'https://business.delaware.gov/',
  'FL': 'https://www.enterpriseflorida.com/',
  'GA': 'https://www.georgia.org/',
  'HI': 'https://www.hawaiibusiness.com/',
  'ID': 'https://commerce.idaho.gov/',
  'IL': 'https://www.illinois.gov/dceo/',
  'IN': 'https://www.in.gov/iedc/',
  'IA': 'https://www.iowaeconomicdevelopment.com/',
  'KS': 'https://www.kansascommerce.gov/',
  'KY': 'https://www.thinkkentucky.com/',
  'LA': 'https://www.opportunitylouisiana.com/',
  'ME': 'https://www.maine.gov/decd/',
  'MD': 'https://commerce.maryland.gov/',
  'MA': 'https://www.mass.gov/orgs/massachusetts-office-of-business-development',
  'MI': 'https://www.michiganbusiness.org/',
  'MN': 'https://mn.gov/deed/',
  'MS': 'https://www.mississippi.org/',
  'MO': 'https://ded.mo.gov/',
  'MT': 'https://business.mt.gov/',
  'NE': 'https://www.nebraska.gov/business/',
  'NV': 'https://www.nevadabusiness.com/',
  'NH': 'https://www.nheconomy.com/',
  'NJ': 'https://www.njeda.com/',
  'NM': 'https://www.edd.state.nm.us/',
  'NY': 'https://esd.ny.gov/',
  'NC': 'https://www.nccommerce.com/',
  'ND': 'https://www.commerce.nd.gov/',
  'OH': 'https://development.ohio.gov/',
  'OK': 'https://www.okcommerce.gov/',
  'OR': 'https://www.oregon4biz.com/',
  'PA': 'https://dced.pa.gov/',
  'RI': 'https://commerceri.com/',
  'SC': 'https://www.sccommerce.com/',
  'SD': 'https://sdgoed.com/',
  'TN': 'https://www.tn.gov/ecd/',
  'TX': 'https://www.texaswideopenforbusiness.com/',
  'UT': 'https://business.utah.gov/',
  'VT': 'https://accd.vermont.gov/',
  'VA': 'https://www.virginia.org/business/',
  'WA': 'https://www.commerce.wa.gov/',
  'WV': 'https://www.wvcommerce.org/',
  'WI': 'https://www.wisconsinbusiness.org/',
  'WY': 'https://www.wyomingbusiness.org/'
}

async function addStateSpecificUrls() {
  console.log('🔗 Adding state-specific grant URLs...')
  
  let updatedCount = 0
  
  for (const [stateCode, stateUrl] of Object.entries(STATE_GRANT_URLS)) {
    try {
      // Find programs for this state
      const statePrograms = await prisma.program.findMany({
        where: { 
          state: { code: stateCode }
        }
      })
      
      if (statePrograms.length > 0) {
        // Update all programs for this state with state-specific URL
        await prisma.program.updateMany({
          where: { 
            state: { code: stateCode }
          },
          data: {
            url: stateUrl
          }
        })
        
        updatedCount += statePrograms.length
        console.log(`✅ Updated ${statePrograms.length} programs for ${stateCode}: ${stateUrl}`)
      }
    } catch (error) {
      console.error(`❌ Error updating ${stateCode}:`, error)
    }
  }
  
  console.log(`🎉 Updated ${updatedCount} state-specific grant URLs!`)
  
  // Verify the changes
  const sampleStates = await prisma.program.findMany({
    where: { 
      state: { code: { in: ['AL', 'CA', 'TX', 'NY', 'FL'] } }
    },
    select: { 
      title: true, 
      url: true, 
      state: { select: { name: true, code: true } }
    },
    take: 5
  })
  
  console.log(`\n📊 Sample updated URLs:`)
  sampleStates.forEach(program => {
    console.log(`  - ${program.title} (${program.state.name}): ${program.url}`)
  })
  
  return updatedCount
}

// Run the update
addStateSpecificUrls()
  .then(async (count) => {
    console.log(`✅ State-specific URL update completed. Updated ${count} programs.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ State-specific URL update failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
