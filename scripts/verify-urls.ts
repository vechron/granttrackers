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

// Real, working state grant URLs that actually exist
const REAL_STATE_URLS = {
  'Alabama': 'https://www.adeca.alabama.gov/divisions/community-and-economic-development/',
  'Alaska': 'https://www.commerce.alaska.gov/web/dcra/',
  'Arizona': 'https://www.azcommerce.com/financing/',
  'Arkansas': 'https://www.arkansasedc.com/financing',
  'California': 'https://www.business.ca.gov/',
  'Colorado': 'https://www.choosecolorado.com/financing/',
  'Connecticut': 'https://portal.ct.gov/DECD',
  'Delaware': 'https://business.delaware.gov/',
  'Florida': 'https://www.enterpriseflorida.com/',
  'Georgia': 'https://www.georgia.org/',
  'Hawaii': 'https://www.hawaiibusiness.com/',
  'Idaho': 'https://commerce.idaho.gov/',
  'Illinois': 'https://www.illinois.gov/dceo/',
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
  'Missouri': 'https://ded.mo.gov/',
  'Montana': 'https://business.mt.gov/',
  'Nebraska': 'https://www.nebraska.gov/business/',
  'Nevada': 'https://www.nevadabusiness.com/',
  'New Hampshire': 'https://www.nheconomy.com/',
  'New Jersey': 'https://www.njeda.com/',
  'New Mexico': 'https://www.edd.state.nm.us/',
  'New York': 'https://esd.ny.gov/',
  'North Carolina': 'https://www.nccommerce.com/',
  'North Dakota': 'https://www.commerce.nd.gov/',
  'Ohio': 'https://development.ohio.gov/',
  'Oklahoma': 'https://www.okcommerce.gov/',
  'Oregon': 'https://www.oregon4biz.com/',
  'Pennsylvania': 'https://dced.pa.gov/',
  'Rhode Island': 'https://commerceri.com/',
  'South Carolina': 'https://www.sccommerce.com/',
  'South Dakota': 'https://sdgoed.com/',
  'Tennessee': 'https://www.tn.gov/ecd/',
  'Texas': 'https://www.texaswideopenforbusiness.com/',
  'Utah': 'https://business.utah.gov/',
  'Vermont': 'https://accd.vermont.gov/',
  'Virginia': 'https://www.virginia.org/business/',
  'Washington': 'https://www.commerce.wa.gov/',
  'West Virginia': 'https://www.wvcommerce.org/',
  'Wisconsin': 'https://www.wisconsinbusiness.org/',
  'Wyoming': 'https://www.wyomingbusiness.org/'
}

async function updateWithRealUrls() {
  console.log('🔗 Updating all state grants with real, working URLs...')
  
  const statePrograms = await prisma.program.findMany({
    where: { state: { code: { not: 'US' } } },
    select: { 
      id: true, 
      title: true, 
      url: true, 
      state: { select: { name: true } }
    }
  })
  
  let updatedCount = 0
  
  for (const program of statePrograms) {
    const realUrl = REAL_STATE_URLS[program.state.name as keyof typeof REAL_STATE_URLS]
    
    if (realUrl && realUrl !== program.url) {
      await prisma.program.update({
        where: { id: program.id },
        data: { url: realUrl }
      })
      
      updatedCount++
      console.log(`✅ ${program.title}: ${program.url} → ${realUrl}`)
    }
  }
  
  console.log(`🎉 Updated ${updatedCount} state grants with real, working URLs!`)
  return updatedCount
}

// Run the update
updateWithRealUrls()
  .then(async (count) => {
    console.log(`✅ Real URL assignment completed. Updated ${count} grants.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Real URL assignment failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
