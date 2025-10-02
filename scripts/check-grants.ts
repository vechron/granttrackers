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

async function checkGrants() {
  console.log('📊 Checking current grants in database...')
  
  const totalPrograms = await prisma.program.count()
  const federalPrograms = await prisma.program.count({
    where: { state: { code: 'US' } }
  })
  const statePrograms = await prisma.program.count({
    where: { state: { code: { not: 'US' } } }
  })
  
  console.log(`📈 Total programs: ${totalPrograms}`)
  console.log(`🇺🇸 Federal programs: ${federalPrograms}`)
  console.log(`🗺️  State programs: ${statePrograms}`)
  
  // Get all state programs
  const stateProgramsList = await prisma.program.findMany({
    where: { state: { code: { not: 'US' } } },
    select: { 
      id: true, 
      title: true, 
      url: true, 
      state: { select: { name: true, code: true } }
    },
    orderBy: { state: { name: 'asc' } }
  })
  
  console.log('\n🗺️  State programs by state:')
  const stateCounts: Record<string, number> = {}
  stateProgramsList.forEach(program => {
    const stateName = program.state.name
    stateCounts[stateName] = (stateCounts[stateName] || 0) + 1
  })
  
  Object.entries(stateCounts).forEach(([state, count]) => {
    console.log(`  ${state}: ${count} grants`)
  })
  
  console.log(`\n📊 States with grants: ${Object.keys(stateCounts).length}/50`)
  
  await prisma.$disconnect()
}

checkGrants()
  .catch(async (error) => {
    console.error('❌ Check failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
