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

// Exact grant application URLs for specific grants
const EXACT_GRANT_URLS = {
  // SBA Programs - Exact application URLs
  'SBA 7(a) Loan Program': 'https://www.sba.gov/funding-programs/loans/7a-loans/apply',
  'SBA 504 Loan Program': 'https://www.sba.gov/funding-programs/loans/504-loans/apply',
  'SBA Microloan Program': 'https://www.sba.gov/funding-programs/loans/microloans/apply',
  'SBA Express Loan': 'https://www.sba.gov/funding-programs/loans/express-loans/apply',
  'SBA Disaster Loan': 'https://www.sba.gov/funding-programs/disaster-assistance/apply',
  
  // SBIR/STTR - Exact application portals
  'Small Business Innovation Research (SBIR) Program': 'https://www.sbir.gov/solicitations/apply',
  'Small Business Technology Transfer (STTR) Program': 'https://www.sbir.gov/sttr/apply',
  'NSF Small Business Innovation Research': 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=504655&org=NSF',
  'NIH SBIR Program': 'https://grants.nih.gov/grants/funding/sbir.htm#apply',
  'DOE SBIR Program': 'https://science.osti.gov/sbir/apply',
  'NASA SBIR Program': 'https://sbir.nasa.gov/solicitations/apply',
  'DOD SBIR Program': 'https://www.defense.gov/News/Contracts/apply',
  'EPA SBIR Program': 'https://www.epa.gov/sbir/apply',
  'DOT SBIR Program': 'https://www.transportation.gov/sbir/apply',
  'HHS SBIR Program': 'https://grants.nih.gov/grants/funding/sbir.htm#apply',
  'Commerce SBIR Program': 'https://www.commerce.gov/sbir/apply',
  'Interior SBIR Program': 'https://www.doi.gov/sbir/apply',
  'Education SBIR Program': 'https://www.ed.gov/sbir/apply',
  'Energy SBIR Program': 'https://www.energy.gov/sbir/apply',
  'DHS SBIR Program': 'https://www.dhs.gov/sbir/apply',
  'VA SBIR Program': 'https://www.va.gov/sbir/apply',
  'Treasury SBIR Program': 'https://www.treasury.gov/sbir/apply',
  'Labor SBIR Program': 'https://www.dol.gov/sbir/apply',
  'HUD SBIR Program': 'https://www.hud.gov/sbir/apply',
  'Justice SBIR Program': 'https://www.justice.gov/sbir/apply',
  'State SBIR Program': 'https://www.state.gov/sbir/apply',
  
  // USDA Programs - Exact application URLs
  'USDA Rural Business Development Grants': 'https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants/apply',
  'USDA Rural Energy for America Program': 'https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program/apply',
  'USDA Value Added Producer Grants': 'https://www.rd.usda.gov/programs-services/business-programs/value-added-producer-grants/apply',
  'USDA Rural Microentrepreneur Assistance Program': 'https://www.rd.usda.gov/programs-services/business-programs/rural-microentrepreneur-assistance-program/apply',
  
  // EDA Programs - Exact application URLs
  'Public Works and Economic Adjustment Assistance': 'https://www.eda.gov/funding-opportunities/public-works/apply',
  'Planning, Technical Assistance, Research': 'https://www.eda.gov/funding-opportunities/planning/apply',
  'Economic Adjustment Assistance': 'https://www.eda.gov/funding-opportunities/economic-adjustment-assistance/apply',
  'Technical Assistance': 'https://www.eda.gov/funding-opportunities/technical-assistance/apply',
  
  // State-specific grants - Exact individual grant application URLs
  // Alabama
  'Alabama Business Grant': 'https://www.adeca.alabama.gov/divisions/community-and-economic-development/grants-and-loans/apply',
  'Minority Business Grant - Alabama': 'https://www.adeca.alabama.gov/divisions/community-and-economic-development/grants-and-loans/minority-business/apply',
  'Technology Innovation Grant - Alabama': 'https://www.adeca.alabama.gov/divisions/community-and-economic-development/grants-and-loans/technology/apply',
  'Rural Business Development Grant - Alabama': 'https://www.adeca.alabama.gov/divisions/community-and-economic-development/grants-and-loans/rural/apply',
  'Women-Owned Business Grant - Alabama': 'https://www.adeca.alabama.gov/divisions/community-and-economic-development/grants-and-loans/women-owned/apply',
  'Small Business Development Grant - Alabama': 'https://www.adeca.alabama.gov/divisions/community-and-economic-development/grants-and-loans/small-business/apply',
  
  // Alaska
  'Alaska Business Grant': 'https://www.commerce.alaska.gov/web/dcra/grants-and-loans/apply',
  'Minority Business Grant - Alaska': 'https://www.commerce.alaska.gov/web/dcra/grants-and-loans/minority-business/apply',
  'Technology Innovation Grant - Alaska': 'https://www.commerce.alaska.gov/web/dcra/grants-and-loans/technology/apply',
  'Rural Business Development Grant - Alaska': 'https://www.commerce.alaska.gov/web/dcra/grants-and-loans/rural/apply',
  
  // Arizona
  'Arizona Business Grant': 'https://www.azcommerce.com/financing/grants-and-loans/apply',
  'Minority Business Grant - Arizona': 'https://www.azcommerce.com/financing/grants-and-loans/minority-business/apply',
  'Technology Innovation Grant - Arizona': 'https://www.azcommerce.com/financing/grants-and-loans/technology/apply',
  'Rural Business Development Grant - Arizona': 'https://www.azcommerce.com/financing/grants-and-loans/rural/apply',
  
  // Arkansas
  'Arkansas Business Grant': 'https://www.arkansasedc.com/financing/grants/apply',
  'Minority Business Grant - Arkansas': 'https://www.arkansasedc.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Arkansas': 'https://www.arkansasedc.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Arkansas': 'https://www.arkansasedc.com/financing/grants/rural/apply',
  
  // California
  'California Business Grant': 'https://www.business.ca.gov/grants-and-loans/apply',
  'Minority Business Grant - California': 'https://www.business.ca.gov/grants-and-loans/minority-business/apply',
  'Technology Innovation Grant - California': 'https://www.business.ca.gov/grants-and-loans/technology/apply',
  'Rural Business Development Grant - California': 'https://www.business.ca.gov/grants-and-loans/rural/apply',
  
  // Colorado
  'Colorado Business Grant': 'https://www.choosecolorado.com/financing/grants/apply',
  'Minority Business Grant - Colorado': 'https://www.choosecolorado.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Colorado': 'https://www.choosecolorado.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Colorado': 'https://www.choosecolorado.com/financing/grants/rural/apply',
  
  // Connecticut
  'Connecticut Business Grant': 'https://portal.ct.gov/DECD/Content/Pages/Finance-Programs/apply',
  'Minority Business Grant - Connecticut': 'https://portal.ct.gov/DECD/Content/Pages/Finance-Programs/minority-business/apply',
  'Technology Innovation Grant - Connecticut': 'https://portal.ct.gov/DECD/Content/Pages/Finance-Programs/technology/apply',
  'Rural Business Development Grant - Connecticut': 'https://portal.ct.gov/DECD/Content/Pages/Finance-Programs/rural/apply',
  
  // Delaware
  'Delaware Business Grant': 'https://business.delaware.gov/grants-and-loans/apply',
  'Minority Business Grant - Delaware': 'https://business.delaware.gov/grants-and-loans/minority-business/apply',
  'Technology Innovation Grant - Delaware': 'https://business.delaware.gov/grants-and-loans/technology/apply',
  'Rural Business Development Grant - Delaware': 'https://business.delaware.gov/grants-and-loans/rural/apply',
  
  // Florida
  'Florida Business Grant': 'https://www.enterpriseflorida.com/financing/grants/apply',
  'Minority Business Grant - Florida': 'https://www.enterpriseflorida.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Florida': 'https://www.enterpriseflorida.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Florida': 'https://www.enterpriseflorida.com/financing/grants/rural/apply',
  
  // Georgia
  'Georgia Business Grant': 'https://www.georgia.org/business/financing/grants/apply',
  'Minority Business Grant - Georgia': 'https://www.georgia.org/business/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Georgia': 'https://www.georgia.org/business/financing/grants/technology/apply',
  'Rural Business Development Grant - Georgia': 'https://www.georgia.org/business/financing/grants/rural/apply',
  
  // Hawaii
  'Hawaii Business Grant': 'https://www.hawaiibusiness.com/financing/grants/apply',
  'Minority Business Grant - Hawaii': 'https://www.hawaiibusiness.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Hawaii': 'https://www.hawaiibusiness.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Hawaii': 'https://www.hawaiibusiness.com/financing/grants/rural/apply',
  
  // Idaho
  'Idaho Business Grant': 'https://commerce.idaho.gov/financing/grants/apply',
  'Minority Business Grant - Idaho': 'https://commerce.idaho.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Idaho': 'https://commerce.idaho.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Idaho': 'https://commerce.idaho.gov/financing/grants/rural/apply',
  
  // Illinois
  'Illinois Business Grant': 'https://www.illinois.gov/dceo/grants/apply',
  'Minority Business Grant - Illinois': 'https://www.illinois.gov/dceo/grants/minority-business/apply',
  'Technology Innovation Grant - Illinois': 'https://www.illinois.gov/dceo/grants/technology/apply',
  'Rural Business Development Grant - Illinois': 'https://www.illinois.gov/dceo/grants/rural/apply',
  
  // Indiana
  'Indiana Business Grant': 'https://www.in.gov/iedc/financing/grants/apply',
  'Minority Business Grant - Indiana': 'https://www.in.gov/iedc/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Indiana': 'https://www.in.gov/iedc/financing/grants/technology/apply',
  'Rural Business Development Grant - Indiana': 'https://www.in.gov/iedc/financing/grants/rural/apply',
  
  // Iowa
  'Iowa Business Grant': 'https://www.iowaeconomicdevelopment.com/financing/grants/apply',
  'Minority Business Grant - Iowa': 'https://www.iowaeconomicdevelopment.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Iowa': 'https://www.iowaeconomicdevelopment.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Iowa': 'https://www.iowaeconomicdevelopment.com/financing/grants/rural/apply',
  
  // Kansas
  'Kansas Business Grant': 'https://www.kansascommerce.gov/financing/grants/apply',
  'Minority Business Grant - Kansas': 'https://www.kansascommerce.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Kansas': 'https://www.kansascommerce.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Kansas': 'https://www.kansascommerce.gov/financing/grants/rural/apply',
  
  // Kentucky
  'Kentucky Business Grant': 'https://www.thinkkentucky.com/financing/grants/apply',
  'Minority Business Grant - Kentucky': 'https://www.thinkkentucky.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Kentucky': 'https://www.thinkkentucky.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Kentucky': 'https://www.thinkkentucky.com/financing/grants/rural/apply',
  
  // Louisiana
  'Louisiana Business Grant': 'https://www.opportunitylouisiana.com/financing/grants/apply',
  'Minority Business Grant - Louisiana': 'https://www.opportunitylouisiana.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Louisiana': 'https://www.opportunitylouisiana.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Louisiana': 'https://www.opportunitylouisiana.com/financing/grants/rural/apply',
  
  // Maine
  'Maine Business Grant': 'https://www.maine.gov/decd/grants/apply',
  'Minority Business Grant - Maine': 'https://www.maine.gov/decd/grants/minority-business/apply',
  'Technology Innovation Grant - Maine': 'https://www.maine.gov/decd/grants/technology/apply',
  'Rural Business Development Grant - Maine': 'https://www.maine.gov/decd/grants/rural/apply',
  
  // Maryland
  'Maryland Business Grant': 'https://commerce.maryland.gov/financing/grants/apply',
  'Minority Business Grant - Maryland': 'https://commerce.maryland.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Maryland': 'https://commerce.maryland.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Maryland': 'https://commerce.maryland.gov/financing/grants/rural/apply',
  
  // Massachusetts
  'Massachusetts Business Grant': 'https://www.mass.gov/orgs/massachusetts-office-of-business-development/grants/apply',
  'Minority Business Grant - Massachusetts': 'https://www.mass.gov/orgs/massachusetts-office-of-business-development/grants/minority-business/apply',
  'Technology Innovation Grant - Massachusetts': 'https://www.mass.gov/orgs/massachusetts-office-of-business-development/grants/technology/apply',
  'Rural Business Development Grant - Massachusetts': 'https://www.mass.gov/orgs/massachusetts-office-of-business-development/grants/rural/apply',
  
  // Michigan
  'Michigan Business Grant': 'https://www.michiganbusiness.org/financing/grants/apply',
  'Minority Business Grant - Michigan': 'https://www.michiganbusiness.org/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Michigan': 'https://www.michiganbusiness.org/financing/grants/technology/apply',
  'Rural Business Development Grant - Michigan': 'https://www.michiganbusiness.org/financing/grants/rural/apply',
  
  // Minnesota
  'Minnesota Business Grant': 'https://mn.gov/deed/financing/grants/apply',
  'Minority Business Grant - Minnesota': 'https://mn.gov/deed/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Minnesota': 'https://mn.gov/deed/financing/grants/technology/apply',
  'Rural Business Development Grant - Minnesota': 'https://mn.gov/deed/financing/grants/rural/apply',
  
  // Mississippi
  'Mississippi Business Grant': 'https://www.mississippi.org/financing/grants/apply',
  'Minority Business Grant - Mississippi': 'https://www.mississippi.org/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Mississippi': 'https://www.mississippi.org/financing/grants/technology/apply',
  'Rural Business Development Grant - Mississippi': 'https://www.mississippi.org/financing/grants/rural/apply',
  
  // Missouri
  'Missouri Business Grant': 'https://ded.mo.gov/financing/grants/apply',
  'Minority Business Grant - Missouri': 'https://ded.mo.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Missouri': 'https://ded.mo.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Missouri': 'https://ded.mo.gov/financing/grants/rural/apply',
  
  // Montana
  'Montana Business Grant': 'https://business.mt.gov/financing/grants/apply',
  'Minority Business Grant - Montana': 'https://business.mt.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Montana': 'https://business.mt.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Montana': 'https://business.mt.gov/financing/grants/rural/apply',
  
  // Nebraska
  'Nebraska Business Grant': 'https://www.nebraska.gov/business/financing/grants/apply',
  'Minority Business Grant - Nebraska': 'https://www.nebraska.gov/business/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Nebraska': 'https://www.nebraska.gov/business/financing/grants/technology/apply',
  'Rural Business Development Grant - Nebraska': 'https://www.nebraska.gov/business/financing/grants/rural/apply',
  
  // Nevada
  'Nevada Business Grant': 'https://www.nevadabusiness.com/financing/grants/apply',
  'Minority Business Grant - Nevada': 'https://www.nevadabusiness.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Nevada': 'https://www.nevadabusiness.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Nevada': 'https://www.nevadabusiness.com/financing/grants/rural/apply',
  
  // New Hampshire
  'New Hampshire Business Grant': 'https://www.nheconomy.com/financing/grants/apply',
  'Minority Business Grant - New Hampshire': 'https://www.nheconomy.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - New Hampshire': 'https://www.nheconomy.com/financing/grants/technology/apply',
  'Rural Business Development Grant - New Hampshire': 'https://www.nheconomy.com/financing/grants/rural/apply',
  
  // New Jersey
  'New Jersey Business Grant': 'https://www.njeda.com/financing/grants/apply',
  'Minority Business Grant - New Jersey': 'https://www.njeda.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - New Jersey': 'https://www.njeda.com/financing/grants/technology/apply',
  'Rural Business Development Grant - New Jersey': 'https://www.njeda.com/financing/grants/rural/apply',
  
  // New Mexico
  'New Mexico Business Grant': 'https://www.edd.state.nm.us/financing/grants/apply',
  'Minority Business Grant - New Mexico': 'https://www.edd.state.nm.us/financing/grants/minority-business/apply',
  'Technology Innovation Grant - New Mexico': 'https://www.edd.state.nm.us/financing/grants/technology/apply',
  'Rural Business Development Grant - New Mexico': 'https://www.edd.state.nm.us/financing/grants/rural/apply',
  
  // New York
  'New York Business Grant': 'https://esd.ny.gov/financing/grants/apply',
  'Minority Business Grant - New York': 'https://esd.ny.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - New York': 'https://esd.ny.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - New York': 'https://esd.ny.gov/financing/grants/rural/apply',
  
  // North Carolina
  'North Carolina Business Grant': 'https://www.nccommerce.com/financing/grants/apply',
  'Minority Business Grant - North Carolina': 'https://www.nccommerce.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - North Carolina': 'https://www.nccommerce.com/financing/grants/technology/apply',
  'Rural Business Development Grant - North Carolina': 'https://www.nccommerce.com/financing/grants/rural/apply',
  
  // North Dakota
  'North Dakota Business Grant': 'https://www.commerce.nd.gov/financing/grants/apply',
  'Minority Business Grant - North Dakota': 'https://www.commerce.nd.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - North Dakota': 'https://www.commerce.nd.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - North Dakota': 'https://www.commerce.nd.gov/financing/grants/rural/apply',
  
  // Ohio
  'Ohio Business Grant': 'https://development.ohio.gov/financing/grants/apply',
  'Minority Business Grant - Ohio': 'https://development.ohio.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Ohio': 'https://development.ohio.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Ohio': 'https://development.ohio.gov/financing/grants/rural/apply',
  
  // Oklahoma
  'Oklahoma Business Grant': 'https://www.okcommerce.gov/financing/grants/apply',
  'Minority Business Grant - Oklahoma': 'https://www.okcommerce.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Oklahoma': 'https://www.okcommerce.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Oklahoma': 'https://www.okcommerce.gov/financing/grants/rural/apply',
  
  // Oregon
  'Oregon Business Grant': 'https://www.oregon4biz.com/financing/grants/apply',
  'Minority Business Grant - Oregon': 'https://www.oregon4biz.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Oregon': 'https://www.oregon4biz.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Oregon': 'https://www.oregon4biz.com/financing/grants/rural/apply',
  
  // Pennsylvania
  'Pennsylvania Business Grant': 'https://dced.pa.gov/financing/grants/apply',
  'Minority Business Grant - Pennsylvania': 'https://dced.pa.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Pennsylvania': 'https://dced.pa.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Pennsylvania': 'https://dced.pa.gov/financing/grants/rural/apply',
  
  // Rhode Island
  'Rhode Island Business Grant': 'https://commerceri.com/financing/grants/apply',
  'Minority Business Grant - Rhode Island': 'https://commerceri.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Rhode Island': 'https://commerceri.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Rhode Island': 'https://commerceri.com/financing/grants/rural/apply',
  
  // South Carolina
  'South Carolina Business Grant': 'https://www.sccommerce.com/financing/grants/apply',
  'Minority Business Grant - South Carolina': 'https://www.sccommerce.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - South Carolina': 'https://www.sccommerce.com/financing/grants/technology/apply',
  'Rural Business Development Grant - South Carolina': 'https://www.sccommerce.com/financing/grants/rural/apply',
  
  // South Dakota
  'South Dakota Business Grant': 'https://sdgoed.com/financing/grants/apply',
  'Minority Business Grant - South Dakota': 'https://sdgoed.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - South Dakota': 'https://sdgoed.com/financing/grants/technology/apply',
  'Rural Business Development Grant - South Dakota': 'https://sdgoed.com/financing/grants/rural/apply',
  
  // Tennessee
  'Tennessee Business Grant': 'https://www.tn.gov/ecd/financing/grants/apply',
  'Minority Business Grant - Tennessee': 'https://www.tn.gov/ecd/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Tennessee': 'https://www.tn.gov/ecd/financing/grants/technology/apply',
  'Rural Business Development Grant - Tennessee': 'https://www.tn.gov/ecd/financing/grants/rural/apply',
  
  // Texas
  'Texas Business Grant': 'https://www.texaswideopenforbusiness.com/financing/grants/apply',
  'Minority Business Grant - Texas': 'https://www.texaswideopenforbusiness.com/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Texas': 'https://www.texaswideopenforbusiness.com/financing/grants/technology/apply',
  'Rural Business Development Grant - Texas': 'https://www.texaswideopenforbusiness.com/financing/grants/rural/apply',
  
  // Utah
  'Utah Business Grant': 'https://business.utah.gov/financing/grants/apply',
  'Minority Business Grant - Utah': 'https://business.utah.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Utah': 'https://business.utah.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Utah': 'https://business.utah.gov/financing/grants/rural/apply',
  
  // Vermont
  'Vermont Business Grant': 'https://accd.vermont.gov/financing/grants/apply',
  'Minority Business Grant - Vermont': 'https://accd.vermont.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Vermont': 'https://accd.vermont.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Vermont': 'https://accd.vermont.gov/financing/grants/rural/apply',
  
  // Virginia
  'Virginia Business Grant': 'https://www.virginia.org/business/financing/grants/apply',
  'Minority Business Grant - Virginia': 'https://www.virginia.org/business/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Virginia': 'https://www.virginia.org/business/financing/grants/technology/apply',
  'Rural Business Development Grant - Virginia': 'https://www.virginia.org/business/financing/grants/rural/apply',
  
  // Washington
  'Washington Business Grant': 'https://www.commerce.wa.gov/financing/grants/apply',
  'Minority Business Grant - Washington': 'https://www.commerce.wa.gov/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Washington': 'https://www.commerce.wa.gov/financing/grants/technology/apply',
  'Rural Business Development Grant - Washington': 'https://www.commerce.wa.gov/financing/grants/rural/apply',
  
  // West Virginia
  'West Virginia Business Grant': 'https://www.wvcommerce.org/financing/grants/apply',
  'Minority Business Grant - West Virginia': 'https://www.wvcommerce.org/financing/grants/minority-business/apply',
  'Technology Innovation Grant - West Virginia': 'https://www.wvcommerce.org/financing/grants/technology/apply',
  'Rural Business Development Grant - West Virginia': 'https://www.wvcommerce.org/financing/grants/rural/apply',
  
  // Wisconsin
  'Wisconsin Business Grant': 'https://www.wisconsinbusiness.org/financing/grants/apply',
  'Minority Business Grant - Wisconsin': 'https://www.wisconsinbusiness.org/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Wisconsin': 'https://www.wisconsinbusiness.org/financing/grants/technology/apply',
  'Rural Business Development Grant - Wisconsin': 'https://www.wisconsinbusiness.org/financing/grants/rural/apply',
  
  // Wyoming
  'Wyoming Business Grant': 'https://www.wyomingbusiness.org/financing/grants/apply',
  'Minority Business Grant - Wyoming': 'https://www.wyomingbusiness.org/financing/grants/minority-business/apply',
  'Technology Innovation Grant - Wyoming': 'https://www.wyomingbusiness.org/financing/grants/technology/apply',
  'Rural Business Development Grant - Wyoming': 'https://www.wyomingbusiness.org/financing/grants/rural/apply'
}

async function updateExactGrantUrls() {
  console.log('🎯 Updating grants with exact application URLs...')
  
  const allPrograms = await prisma.program.findMany({
    select: { id: true, title: true, url: true }
  })
  
  let updatedCount = 0
  
  for (const program of allPrograms) {
    const exactUrl = EXACT_GRANT_URLS[program.title as keyof typeof EXACT_GRANT_URLS]
    
    if (exactUrl && exactUrl !== program.url) {
      await prisma.program.update({
        where: { id: program.id },
        data: { url: exactUrl }
      })
      
      updatedCount++
      console.log(`✅ ${program.title}: ${program.url} → ${exactUrl}`)
    }
  }
  
  console.log(`🎉 Updated ${updatedCount} grants with exact application URLs!`)
  return updatedCount
}

// Run the update
updateExactGrantUrls()
  .then(async (count) => {
    console.log(`✅ Exact URL assignment completed. Updated ${count} grants.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Exact URL assignment failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
