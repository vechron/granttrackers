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

async function checkCurrentData() {
  console.log('🔍 Checking current database state...')
  
  // Check total programs
  const totalPrograms = await prisma.program.count()
  console.log(`📊 Total programs: ${totalPrograms}`)
  
  // Check featured programs
  const featuredPrograms = await prisma.program.findMany({
    where: { featured: true, active: true },
    select: { title: true, url: true }
  })
  console.log(`⭐ Featured programs: ${featuredPrograms.length}`)
  featuredPrograms.forEach(program => {
    console.log(`  - ${program.title}: ${program.url}`)
  })
  
  // Check programs with bad URLs
  const badUrls = await prisma.program.findMany({
    where: {
      OR: [
        { url: { contains: 'example.com' } },
        { url: { contains: 'localhost' } },
        { title: { startsWith: '/' } },
        { title: { startsWith: 'http' } }
      ]
    },
    select: { title: true, url: true }
  })
  
  console.log(`❌ Programs with bad data: ${badUrls.length}`)
  badUrls.forEach(program => {
    console.log(`  - ${program.title}: ${program.url}`)
  })
  
  // Check states
  const states = await prisma.state.count()
  console.log(`🗺️ Total states: ${states}`)
  
  // Check US state programs
  const usPrograms = await prisma.program.count({
    where: { state: { code: 'US' } }
  })
  console.log(`🇺🇸 US federal programs: ${usPrograms}`)
  
  // Check state-specific programs
  const statePrograms = await prisma.program.count({
    where: { state: { code: { not: 'US' } } }
  })
  console.log(`🏛️ State-specific programs: ${statePrograms}`)
}

checkCurrentData()
  .then(async () => {
    console.log('✅ Database check completed')
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Database check failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
