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

async function checkDatabase() {
  console.log('🔍 Checking database contents...')
  
  try {
    // Check states
    const states = await prisma.state.findMany({
      select: { id: true, name: true, code: true }
    })
    console.log(`📊 States in database: ${states.length}`)
    states.forEach(state => console.log(`  - ${state.name} (${state.code})`))
    
    // Check programs
    const programs = await prisma.program.findMany({
      select: { 
        id: true, 
        title: true, 
        featured: true, 
        active: true,
        state: { select: { name: true } }
      }
    })
    console.log(`📊 Programs in database: ${programs.length}`)
    programs.forEach(program => {
      console.log(`  - ${program.title} (Featured: ${program.featured}, Active: ${program.active}, State: ${program.state.name})`)
    })
    
    // Check featured programs specifically
    const featuredPrograms = await prisma.program.findMany({
      where: { featured: true, active: true },
      select: { title: true, url: true }
    })
    console.log(`⭐ Featured programs: ${featuredPrograms.length}`)
    featuredPrograms.forEach(program => {
      console.log(`  - ${program.title}: ${program.url}`)
    })
    
    // Check FAQs
    const faqs = await prisma.fAQ.findMany({
      select: { id: true, question: true }
    })
    console.log(`❓ FAQs in database: ${faqs.length}`)
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
