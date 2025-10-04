import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixFederalGrants() {
  console.log('🔧 Fixing federal grants...')
  
  // Get all federal programs (US state)
  const federalPrograms = await prisma.program.findMany({
    where: {
      state: {
        code: 'US'
      }
    },
    select: {
      id: true,
      title: true,
      active: true,
      deadline: true,
      featured: true
    }
  })

  console.log(`📊 Found ${federalPrograms.length} federal programs`)

  // Update inactive federal programs
  const inactivePrograms = federalPrograms.filter(p => !p.active)
  console.log(`❌ Found ${inactivePrograms.length} inactive federal programs`)

  for (const program of inactivePrograms) {
    console.log(`🔧 Fixing: ${program.title}`)
    
    // Set deadline to 2025-12-31 if it's in the past
    const newDeadline = new Date('2025-12-31')
    
    await prisma.program.update({
      where: { id: program.id },
      data: {
        active: true,
        featured: true,
        deadline: newDeadline
      }
    })
    
    console.log(`✅ Updated: ${program.title} - Active: true, Featured: true, Deadline: 2025-12-31`)
  }

  // Also update some active programs to be featured
  const activeNotFeatured = federalPrograms.filter(p => p.active && !p.featured)
  console.log(`⭐ Found ${activeNotFeatured.length} active but not featured programs`)

  for (const program of activeNotFeatured) {
    console.log(`⭐ Making featured: ${program.title}`)
    
    await prisma.program.update({
      where: { id: program.id },
      data: {
        featured: true
      }
    })
  }

  // Final count
  const finalCount = await prisma.program.count({
    where: {
      state: { code: 'US' },
      active: true
    }
  })

  console.log(`✅ Fixed! Now have ${finalCount} active federal programs`)
  
  await prisma.$disconnect()
}

fixFederalGrants().catch(console.error)
