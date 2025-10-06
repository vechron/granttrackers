import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixCaliforniaGrantUrl() {
  try {
    // Find the California grant with the broken URL
    const brokenGrant = await prisma.program.findFirst({
      where: {
        title: 'California Small Business Development Grant',
        url: 'https://business.ca.gov/grants-and-funding/'
      }
    })

    if (brokenGrant) {
      // Update to a working California business grants URL
      const updated = await prisma.program.update({
        where: { id: brokenGrant.id },
        data: {
          url: 'https://www.business.ca.gov/'
        }
      })
      
      console.log('✅ Fixed California grant URL:', updated.title)
      console.log('New URL:', updated.url)
    } else {
      console.log('❌ California grant with broken URL not found')
    }

    // Also check if there are any other grants with broken URLs
    const allGrants = await prisma.program.findMany({
      where: {
        state: {
          code: 'CA'
        }
      },
      select: {
        id: true,
        title: true,
        url: true
      }
    })

    console.log('\n📋 All California grants:')
    allGrants.forEach(grant => {
      console.log(`- ${grant.title}: ${grant.url}`)
    })

  } catch (error) {
    console.error('❌ Error fixing California grant URL:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCaliforniaGrantUrl()
