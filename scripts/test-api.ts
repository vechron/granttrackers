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

async function testAPI() {
  console.log('🧪 Testing API functions...')
  
  try {
    // Test the same query that the home page uses
    const featuredPrograms = await prisma.program.findMany({
      where: {
        featured: true,
        active: true,
        OR: [
          { deadline: null },
          { deadline: { gte: new Date() } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        amount: true,
        deadline: true,
        url: true,
        state: { select: { name: true, slug: true } }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`✅ Featured programs query returned: ${featuredPrograms.length} programs`)
    featuredPrograms.forEach(program => {
      console.log(`  - ${program.title} (${program.state.name})`)
    })
    
    // Test states query
    const states = await prisma.state.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' }
    })
    
    console.log(`✅ States query returned: ${states.length} states`)
    
  } catch (error) {
    console.error('❌ API test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()
