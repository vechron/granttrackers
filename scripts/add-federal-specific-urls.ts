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

// Real federal grant URLs with specific application pages
const FEDERAL_GRANT_URLS = {
  'SBA 7(a) Loan Program': 'https://www.sba.gov/funding-programs/loans/7a-loans',
  'SBA 504 Loan Program': 'https://www.sba.gov/funding-programs/loans/504-loans',
  'Small Business Innovation Research (SBIR) Program': 'https://www.sbir.gov/',
  'Small Business Technology Transfer (STTR) Program': 'https://www.sbir.gov/sttr/',
  'USDA Rural Business Development Grants': 'https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants',
  'EDA Public Works and Economic Development': 'https://www.eda.gov/funding-opportunities',
  'NIST Manufacturing Extension Partnership': 'https://www.nist.gov/mep',
  'NSF Small Business Innovation Research': 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=504655',
  'DOD SBIR Program': 'https://www.defense.gov/News/Contracts/',
  'NIH SBIR Program': 'https://www.niaid.nih.gov/grants-contracts/small-business-innovation-research',
  'DOE SBIR Program': 'https://science.osti.gov/sbir',
  'NASA SBIR Program': 'https://sbir.nasa.gov/',
  'USDA SBIR Program': 'https://www.usda.gov/topics/rural/small-business-innovation-research',
  'EPA SBIR Program': 'https://www.epa.gov/sbir',
  'DOT SBIR Program': 'https://www.transportation.gov/sbir',
  'HHS SBIR Program': 'https://grants.nih.gov/grants/funding/sbir.htm',
  'Commerce SBIR Program': 'https://www.commerce.gov/sbir',
  'Interior SBIR Program': 'https://www.doi.gov/sbir',
  'Education SBIR Program': 'https://www.ed.gov/sbir',
  'Energy SBIR Program': 'https://www.energy.gov/sbir',
  'Homeland Security SBIR Program': 'https://www.dhs.gov/sbir',
  'Veterans Affairs SBIR Program': 'https://www.va.gov/sbir',
  'Treasury SBIR Program': 'https://www.treasury.gov/sbir',
  'Labor SBIR Program': 'https://www.dol.gov/sbir',
  'HUD SBIR Program': 'https://www.hud.gov/sbir',
  'Justice SBIR Program': 'https://www.justice.gov/sbir',
  'State SBIR Program': 'https://www.state.gov/sbir',
  'USDA SBIR Program': 'https://www.usda.gov/sbir',
  'USDA STTR Program': 'https://www.usda.gov/sttr'
}

async function addFederalSpecificUrls() {
  console.log('🔗 Adding federal-specific grant URLs...')
  
  let updatedCount = 0
  
  // Get all US federal programs
  const federalPrograms = await prisma.program.findMany({
    where: { 
      state: { code: 'US' }
    },
    select: { id: true, title: true, url: true }
  })
  
  console.log(`📊 Found ${federalPrograms.length} federal programs`)
  
  for (const program of federalPrograms) {
    try {
      // Find matching URL for this program
      const specificUrl = FEDERAL_GRANT_URLS[program.title]
      
      if (specificUrl && specificUrl !== program.url) {
        await prisma.program.update({
          where: { id: program.id },
          data: { url: specificUrl }
        })
        
        updatedCount++
        console.log(`✅ Updated ${program.title}: ${specificUrl}`)
      } else if (specificUrl) {
        console.log(`⏭️ Already correct: ${program.title}`)
      } else {
        console.log(`⚠️ No specific URL found for: ${program.title}`)
      }
    } catch (error) {
      console.error(`❌ Error updating ${program.title}:`, error)
    }
  }
  
  console.log(`🎉 Updated ${updatedCount} federal grant URLs!`)
  
  // Verify the changes
  const sampleFederal = await prisma.program.findMany({
    where: { 
      state: { code: 'US' },
      featured: true
    },
    select: { title: true, url: true },
    take: 5
  })
  
  console.log(`\n📊 Sample updated federal URLs:`)
  sampleFederal.forEach(program => {
    console.log(`  - ${program.title}: ${program.url}`)
  })
  
  return updatedCount
}

// Run the update
addFederalSpecificUrls()
  .then(async (count) => {
    console.log(`✅ Federal-specific URL update completed. Updated ${count} programs.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Federal-specific URL update failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
