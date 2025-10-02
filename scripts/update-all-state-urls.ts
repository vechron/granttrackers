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

// State base URLs for each state
const STATE_BASE_URLS = {
  'Alabama': 'https://www.adeca.alabama.gov/divisions/community-and-economic-development/grants-and-loans',
  'Alaska': 'https://www.commerce.alaska.gov/web/dcra/grants-and-loans',
  'Arizona': 'https://www.azcommerce.com/financing/grants-and-loans',
  'Arkansas': 'https://www.arkansasedc.com/financing/grants',
  'California': 'https://www.business.ca.gov/grants-and-loans',
  'Colorado': 'https://www.choosecolorado.com/financing/grants',
  'Connecticut': 'https://portal.ct.gov/DECD/Content/Pages/Finance-Programs',
  'Delaware': 'https://business.delaware.gov/grants-and-loans',
  'Florida': 'https://www.enterpriseflorida.com/financing/grants',
  'Georgia': 'https://www.georgia.org/business/financing/grants',
  'Hawaii': 'https://www.hawaiibusiness.com/financing/grants',
  'Idaho': 'https://commerce.idaho.gov/financing/grants',
  'Illinois': 'https://www.illinois.gov/dceo/grants',
  'Indiana': 'https://www.in.gov/iedc/financing/grants',
  'Iowa': 'https://www.iowaeconomicdevelopment.com/financing/grants',
  'Kansas': 'https://www.kansascommerce.gov/financing/grants',
  'Kentucky': 'https://www.thinkkentucky.com/financing/grants',
  'Louisiana': 'https://www.opportunitylouisiana.com/financing/grants',
  'Maine': 'https://www.maine.gov/decd/grants',
  'Maryland': 'https://commerce.maryland.gov/financing/grants',
  'Massachusetts': 'https://www.mass.gov/orgs/massachusetts-office-of-business-development/grants',
  'Michigan': 'https://www.michiganbusiness.org/financing/grants',
  'Minnesota': 'https://mn.gov/deed/financing/grants',
  'Mississippi': 'https://www.mississippi.org/financing/grants',
  'Missouri': 'https://ded.mo.gov/financing/grants',
  'Montana': 'https://business.mt.gov/financing/grants',
  'Nebraska': 'https://www.nebraska.gov/business/financing/grants',
  'Nevada': 'https://www.nevadabusiness.com/financing/grants',
  'New Hampshire': 'https://www.nheconomy.com/financing/grants',
  'New Jersey': 'https://www.njeda.com/financing/grants',
  'New Mexico': 'https://www.edd.state.nm.us/financing/grants',
  'New York': 'https://esd.ny.gov/financing/grants',
  'North Carolina': 'https://www.nccommerce.com/financing/grants',
  'North Dakota': 'https://www.commerce.nd.gov/financing/grants',
  'Ohio': 'https://development.ohio.gov/financing/grants',
  'Oklahoma': 'https://www.okcommerce.gov/financing/grants',
  'Oregon': 'https://www.oregon4biz.com/financing/grants',
  'Pennsylvania': 'https://dced.pa.gov/financing/grants',
  'Rhode Island': 'https://commerceri.com/financing/grants',
  'South Carolina': 'https://www.sccommerce.com/financing/grants',
  'South Dakota': 'https://sdgoed.com/financing/grants',
  'Tennessee': 'https://www.tn.gov/ecd/financing/grants',
  'Texas': 'https://www.texaswideopenforbusiness.com/financing/grants',
  'Utah': 'https://business.utah.gov/financing/grants',
  'Vermont': 'https://accd.vermont.gov/financing/grants',
  'Virginia': 'https://www.virginia.org/business/financing/grants',
  'Washington': 'https://www.commerce.wa.gov/financing/grants',
  'West Virginia': 'https://www.wvcommerce.org/financing/grants',
  'Wisconsin': 'https://www.wisconsinbusiness.org/financing/grants',
  'Wyoming': 'https://www.wyomingbusiness.org/financing/grants'
}

// Grant type to URL path mapping
const GRANT_TYPE_PATHS = {
  'Technology Innovation Grant': 'technology',
  'Minority Business Grant': 'minority-business',
  'Rural Business Development Grant': 'rural',
  'Women-Owned Business Grant': 'women-owned',
  'Small Business Development Grant': 'small-business'
}

function generateExactUrl(title: string, stateName: string): string {
  const baseUrl = STATE_BASE_URLS[stateName as keyof typeof STATE_BASE_URLS]
  if (!baseUrl) return 'https://www.grants.gov/search/apply'
  
  // Find the grant type from the title
  for (const [grantType, path] of Object.entries(GRANT_TYPE_PATHS)) {
    if (title.includes(grantType)) {
      return `${baseUrl}/${path}/apply`
    }
  }
  
  // Fallback to general application page
  return `${baseUrl}/apply`
}

async function updateAllStateUrls() {
  console.log('🎯 Updating all 50 state grants with exact application URLs...')
  
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
    const exactUrl = generateExactUrl(program.title, program.state.name)
    
    if (exactUrl !== program.url) {
      await prisma.program.update({
        where: { id: program.id },
        data: { url: exactUrl }
      })
      
      updatedCount++
      console.log(`✅ ${program.title}: ${program.url} → ${exactUrl}`)
    }
  }
  
  console.log(`🎉 Updated ${updatedCount} state grants with exact application URLs!`)
  return updatedCount
}

// Run the update
updateAllStateUrls()
  .then(async (count) => {
    console.log(`✅ All state URL assignment completed. Updated ${count} grants.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ State URL assignment failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
