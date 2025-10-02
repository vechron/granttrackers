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

async function checkGrantTitles() {
  console.log('📋 Checking state grant titles...')
  
  const statePrograms = await prisma.program.findMany({
    where: { state: { code: { not: 'US' } } },
    select: { 
      title: true, 
      state: { select: { name: true } }
    },
    orderBy: { state: { name: 'asc' } }
  })
  
  console.log('\n🗺️  State grant titles:')
  statePrograms.forEach(program => {
    console.log(`  ${program.state.name}: "${program.title}"`)
  })
  
  await prisma.$disconnect()
}

checkGrantTitles()
  .catch(async (error) => {
    console.error('❌ Check failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
