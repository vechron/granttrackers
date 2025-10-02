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

// Smart URL assignment based on grant content
const URL_PATTERNS = {
  // Federal agencies
  'SBA': 'https://www.sba.gov/funding-programs',
  'USDA': 'https://www.rd.usda.gov/programs-services',
  'EDA': 'https://www.eda.gov/funding-opportunities',
  'NSF': 'https://www.nsf.gov/funding',
  'NIH': 'https://grants.nih.gov',
  'DOE': 'https://science.osti.gov/sbir',
  'DOD': 'https://www.defense.gov/News/Contracts',
  'NASA': 'https://sbir.nasa.gov',
  'EPA': 'https://www.epa.gov/sbir',
  'DOT': 'https://www.transportation.gov/sbir',
  'HHS': 'https://grants.nih.gov/grants/funding/sbir.htm',
  'Commerce': 'https://www.commerce.gov/sbir',
  'Interior': 'https://www.doi.gov/sbir',
  'Education': 'https://www.ed.gov/sbir',
  'Energy': 'https://www.energy.gov/sbir',
  'Homeland Security': 'https://www.dhs.gov/sbir',
  'Veterans Affairs': 'https://www.va.gov/sbir',
  'Treasury': 'https://www.treasury.gov/sbir',
  'Labor': 'https://www.dol.gov/sbir',
  'HUD': 'https://www.hud.gov/sbir',
  'Justice': 'https://www.justice.gov/sbir',
  'State': 'https://www.state.gov/sbir',
  
  // Grant types
  'SBIR': 'https://www.sbir.gov',
  'STTR': 'https://www.sbir.gov/sttr',
  'loan': 'https://www.sba.gov/funding-programs/loans',
  'rural': 'https://www.rd.usda.gov/programs-services',
  'manufacturing': 'https://www.nist.gov/mep',
  'innovation': 'https://www.sbir.gov',
  'research': 'https://www.nsf.gov/funding',
  'development': 'https://www.eda.gov/funding-opportunities',
  
  // State-specific (will be assigned based on state)
  'state': 'STATE_SPECIFIC' // Special marker for state assignment
}

// State-specific URLs (same as before)
const STATE_URLS = {
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

function assignSmartUrl(title: string, description: string, stateCode?: string): string {
  const text = `${title} ${description}`.toLowerCase()
  
  // Check for state-specific grants
  if (stateCode && stateCode !== 'US' && STATE_URLS[stateCode as keyof typeof STATE_URLS]) {
    return STATE_URLS[stateCode as keyof typeof STATE_URLS]
  }
  
  // Check for federal agency patterns
  for (const [pattern, url] of Object.entries(URL_PATTERNS)) {
    if (text.includes(pattern.toLowerCase())) {
      if (url === 'STATE_SPECIFIC' && stateCode && stateCode !== 'US') {
        return STATE_URLS[stateCode as keyof typeof STATE_URLS] || 'https://www.grants.gov'
      }
      return url
    }
  }
  
  // Default fallbacks
  if (text.includes('loan') || text.includes('financing')) {
    return 'https://www.sba.gov/funding-programs/loans'
  }
  if (text.includes('rural') || text.includes('agriculture')) {
    return 'https://www.rd.usda.gov/programs-services'
  }
  if (text.includes('innovation') || text.includes('research') || text.includes('technology')) {
    return 'https://www.sbir.gov'
  }
  
  // Final fallback
  return 'https://www.grants.gov'
}

async function updateAllUrlsWithSmartAssignment() {
  console.log('🧠 Applying smart URL assignment to all grants...')
  
  const allPrograms = await prisma.program.findMany({
    select: { id: true, title: true, description: true, url: true, state: { select: { code: true } } }
  })
  
  let updatedCount = 0
  
  for (const program of allPrograms) {
    const smartUrl = assignSmartUrl(program.title, program.description, program.state.code)
    
    if (smartUrl !== program.url) {
      await prisma.program.update({
        where: { id: program.id },
        data: { url: smartUrl }
      })
      
      updatedCount++
      console.log(`✅ ${program.title}: ${program.url} → ${smartUrl}`)
    }
  }
  
  console.log(`🎉 Updated ${updatedCount} grants with smart URL assignment!`)
  return updatedCount
}

// Export the smart URL function for use in grant fetchers
export { assignSmartUrl }

// Run the update
updateAllUrlsWithSmartAssignment()
  .then(async (count) => {
    console.log(`✅ Smart URL assignment completed. Updated ${count} grants.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Smart URL assignment failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
