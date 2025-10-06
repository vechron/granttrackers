import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function quickUrlCheck() {
  try {
    console.log('🔍 Quick URL check for sample grants...\n')
    
    // Get a few grants from different states to test
    const sampleGrants = await prisma.program.findMany({
      take: 10,
      select: {
        id: true,
        title: true,
        url: true,
        state: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    console.log(`Testing ${sampleGrants.length} sample grants:\n`)

    for (const grant of sampleGrants) {
      try {
        console.log(`Testing: ${grant.title} (${grant.state.name})`)
        console.log(`URL: ${grant.url}`)
        
        const response = await fetch(grant.url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        
        if (response.ok || response.status === 301 || response.status === 302) {
          console.log(`✅ Status: ${response.status} - WORKING`)
        } else {
          console.log(`❌ Status: ${response.status} - BROKEN`)
        }
        console.log('')
        
      } catch (error) {
        console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        console.log('')
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

quickUrlCheck()
