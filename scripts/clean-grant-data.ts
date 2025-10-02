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

async function cleanGrantData() {
  console.log('🧹 Cleaning up grant data...')
  
  let updatedCount = 0
  
  // Get all programs with bad titles or URLs
  const badPrograms = await prisma.program.findMany({
    where: {
      OR: [
        { title: { startsWith: '/' } }, // Titles starting with /
        { title: { startsWith: 'http' } }, // Titles starting with http
        { url: { contains: 'example.com' } }, // Example URLs
        { url: { contains: 'localhost' } }, // Localhost URLs
        { description: { contains: 'Grant opportunity from' } } // Generic descriptions
      ]
    }
  })
  
  console.log(`📊 Found ${badPrograms.length} programs to clean`)
  
  for (const program of badPrograms) {
    try {
      let newTitle = program.title
      let newDescription = program.description
      let newUrl = program.url
      
      // Fix titles that start with /
      if (program.title.startsWith('/')) {
        newTitle = 'Federal Grant Program'
        newDescription = 'Federal grant opportunity for small businesses'
        newUrl = 'https://www.grants.gov'
      }
      
      // Fix titles that start with http
      if (program.title.startsWith('http')) {
        newTitle = 'Government Grant Program'
        newDescription = 'Government grant opportunity for small businesses'
        newUrl = 'https://www.grants.gov'
      }
      
      // Fix example URLs
      if (program.url.includes('example.com') || program.url.includes('localhost')) {
        newUrl = 'https://www.grants.gov'
      }
      
      // Fix generic descriptions
      if (program.description.includes('Grant opportunity from')) {
        newDescription = 'Government grant program for small businesses'
      }
      
      // Update the program
      await prisma.program.update({
        where: { id: program.id },
        data: {
          title: newTitle,
          description: newDescription,
          url: newUrl,
          slug: newTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
        }
      })
      
      updatedCount++
      console.log(`✅ Updated: ${program.title} → ${newTitle}`)
      
    } catch (error) {
      console.error(`❌ Error updating program ${program.title}:`, error)
    }
  }
  
  console.log(`🎉 Cleaned up ${updatedCount} programs!`)
  
  // Also ensure we have some good featured programs
  const featuredCount = await prisma.program.count({
    where: { featured: true, active: true }
  })
  
  if (featuredCount < 3) {
    console.log('📈 Adding more featured programs...')
    
    // Make sure we have some good federal programs as featured
    await prisma.program.updateMany({
      where: {
        title: {
          in: [
            'SBA 7(a) Loan Program',
            'USDA Rural Business Development Grants',
            'Small Business Innovation Research (SBIR) Program'
          ]
        }
      },
      data: { featured: true }
    })
  }
  
  return updatedCount
}

// Run the cleanup
cleanGrantData()
  .then(async (count) => {
    console.log(`✅ Grant data cleanup completed. Updated ${count} programs.`)
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Grant data cleanup failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
