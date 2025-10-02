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

async function checkStateUrls() {
  console.log('🔍 Checking state-specific grant URLs...')
  
  // Get state-specific programs (not US federal)
  const statePrograms = await prisma.program.findMany({
    where: { 
      state: { code: { not: 'US' } } 
    },
    select: { 
      title: true, 
      url: true, 
      state: { select: { name: true, code: true } }
    },
    take: 10
  })
  
  console.log(`📊 Found ${statePrograms.length} state-specific programs (showing first 10):`)
  
  statePrograms.forEach(program => {
    console.log(`  - ${program.title} (${program.state.name}): ${program.url}`)
  })
  
  // Check if they're all generic URLs
  const genericUrls = statePrograms.filter(p => 
    p.url === 'https://www.grants.gov' || 
    p.url === 'https://www.sba.gov/funding-programs'
  )
  
  console.log(`\n📈 Analysis:`)
  console.log(`  - Total state programs: ${statePrograms.length}`)
  console.log(`  - Generic URLs: ${genericUrls.length}`)
  console.log(`  - State-specific URLs: ${statePrograms.length - genericUrls.length}`)
  
  if (genericUrls.length === statePrograms.length) {
    console.log(`\n❌ All state grants point to generic federal URLs, not state-specific ones`)
    console.log(`💡 This means "Apply Now" buttons don't go to state-specific grant applications`)
  } else {
    console.log(`\n✅ Some grants have state-specific URLs`)
  }
}

checkStateUrls()
  .then(async () => {
    console.log('✅ State URL check completed')
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ State URL check failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
