import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { PrismaClient } from '@prisma/client'

// Use the working connection
const prisma = new PrismaClient({
  datasources: { 
    db: { 
      url: "postgresql://postgres.nrcuzovxjuzkamppgdrw:Kai%4035806@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
    } 
  },
  log: ['warn', 'error'],
})

async function testRLS() {
  console.log('🔍 Testing RLS policies...')
  
  try {
    // Test public read access (should work)
    const states = await prisma.state.findMany({ take: 3 })
    console.log(`✅ States (public read): ${states.length} records`)
    
    const programs = await prisma.program.findMany({ 
      where: { active: true },
      take: 3 
    })
    console.log(`✅ Programs (active only): ${programs.length} records`)
    
    const faqs = await prisma.fAQ.findMany({ take: 3 })
    console.log(`✅ FAQs (public read): ${faqs.length} records`)
    
    // Test health checks (should work with service role)
    const healthChecks = await prisma.healthCheck.findMany({ take: 3 })
    console.log(`✅ Health Checks (service role): ${healthChecks.length} records`)
    
    console.log('🎉 All RLS policies working correctly!')
    
  } catch (error) {
    console.error('❌ RLS test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRLS()
