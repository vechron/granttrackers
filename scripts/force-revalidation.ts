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

async function forceRevalidation() {
  console.log('🔄 Forcing cache revalidation...')
  
  try {
    // Update a program to trigger revalidation
    const updated = await prisma.program.updateMany({
      where: { featured: true },
      data: { updatedAt: new Date() }
    })
    
    console.log(`✅ Updated ${updated.count} featured programs`)
    
    // Create a health check to verify the connection
    await prisma.healthCheck.create({
      data: {
        name: 'cache_revalidation',
        ok: true,
        details: {
          timestamp: new Date().toISOString(),
          message: 'Cache revalidation triggered'
        }
      }
    })
    
    console.log('✅ Health check created')
    
  } catch (error) {
    console.error('❌ Revalidation failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceRevalidation()
