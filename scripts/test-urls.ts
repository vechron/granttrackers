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

async function testUrls() {
  console.log('🔍 Testing URLs to verify they work...')
  
  const statePrograms = await prisma.program.findMany({
    where: { state: { code: { not: 'US' } } },
    select: { 
      title: true, 
      url: true, 
      state: { select: { name: true } }
    },
    take: 10 // Test first 10 to start
  })
  
  console.log(`\n🧪 Testing ${statePrograms.length} URLs...`)
  
  for (const program of statePrograms) {
    try {
      console.log(`\n🔗 Testing: ${program.title}`)
      console.log(`   URL: ${program.url}`)
      
      const response = await fetch(program.url, {
        method: 'HEAD'
      })
      
      if (response.ok) {
        console.log(`   ✅ Status: ${response.status} - URL works!`)
      } else {
        console.log(`   ❌ Status: ${response.status} - URL might not work`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  await prisma.$disconnect()
}

testUrls()
  .catch(async (error) => {
    console.error('❌ URL testing failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
