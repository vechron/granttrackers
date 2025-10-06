import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllGrantUrls() {
  try {
    console.log('🔍 Checking all grant URLs...\n')
    
    const allGrants = await prisma.program.findMany({
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

    const brokenUrls: any[] = []
    const workingUrls: any[] = []

    for (const grant of allGrants) {
      try {
        const response = await fetch(grant.url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })
        
        if (response.ok || response.status === 301 || response.status === 302) {
          workingUrls.push({
            title: grant.title,
            url: grant.url,
            state: grant.state.name,
            status: response.status
          })
        } else {
          brokenUrls.push({
            title: grant.title,
            url: grant.url,
            state: grant.state.name,
            status: response.status
          })
        }
      } catch (error) {
        brokenUrls.push({
          title: grant.title,
          url: grant.url,
          state: grant.state.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log(`✅ Working URLs: ${workingUrls.length}`)
    console.log(`❌ Broken URLs: ${brokenUrls.length}\n`)

    if (brokenUrls.length > 0) {
      console.log('🚨 BROKEN URLs:')
      brokenUrls.forEach((grant, index) => {
        console.log(`${index + 1}. ${grant.title} (${grant.state})`)
        console.log(`   URL: ${grant.url}`)
        console.log(`   Status: ${grant.status || grant.error}`)
        console.log('')
      })
    }

    if (workingUrls.length > 0) {
      console.log('✅ WORKING URLs:')
      workingUrls.slice(0, 5).forEach((grant, index) => {
        console.log(`${index + 1}. ${grant.title} (${grant.state}) - Status: ${grant.status}`)
      })
      if (workingUrls.length > 5) {
        console.log(`... and ${workingUrls.length - 5} more working URLs`)
      }
    }

  } catch (error) {
    console.error('❌ Error checking URLs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllGrantUrls()
