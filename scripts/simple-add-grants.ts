// Simple script to add real grant data
// This uses the same Prisma client as the web app

import { prisma } from '../lib/prisma'

const realGrants = [
  {
    title: "Small Business Innovation Research (SBIR) Program",
    description: "Federal program providing funding for small businesses to engage in research and development with commercial potential. Offers Phase I ($150K) and Phase II ($1M) awards.",
    amount: "Up to $1,000,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.sbir.gov/",
    featured: true,
    stateCode: "CA" // Use California as default
  },
  {
    title: "California Small Business COVID-19 Relief Grant",
    description: "California's grant program for small businesses affected by COVID-19. Provides direct cash grants to eligible businesses.",
    amount: "Up to $25,000",
    deadline: new Date("2024-06-30"),
    url: "https://careliefgrant.com/",
    featured: true,
    stateCode: "CA"
  },
  {
    title: "New York State Small Business Grant Program",
    description: "New York's comprehensive grant program supporting small businesses with direct funding and technical assistance.",
    amount: "Up to $50,000",
    deadline: new Date("2024-08-31"),
    url: "https://esd.ny.gov/",
    featured: true,
    stateCode: "NY"
  },
  {
    title: "USDA Rural Business Development Grants",
    description: "USDA grants supporting business development in rural areas. Focus on agriculture, food processing, and rural economic development.",
    amount: "Up to $500,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.rd.usda.gov/",
    featured: true,
    stateCode: "TX"
  }
]

async function addRealGrants() {
  try {
    console.log('Adding real grant data...')
    
    // Get all states
    const states = await prisma.state.findMany()
    console.log(`Found ${states.length} states`)
    
    if (states.length === 0) {
      console.log('No states found. Please run the seed script first.')
      return
    }
    
    const stateMap = new Map(states.map(s => [s.code, s.id]))
    let addedCount = 0
    
    for (const grant of realGrants) {
      try {
        const stateId = stateMap.get(grant.stateCode)
        
        if (!stateId) {
          console.log(`Skipping grant "${grant.title}" - state ${grant.stateCode} not found`)
          continue
        }
        
        // Create slug from title
        const slug = grant.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
        
        // Check if grant already exists
        const existing = await prisma.program.findUnique({
          where: { slug }
        })
        
        if (existing) {
          console.log(`Grant "${grant.title}" already exists, skipping...`)
          continue
        }
        
        // Create the grant
        await prisma.program.create({
          data: {
            title: grant.title,
            slug: slug,
            description: grant.description,
            amount: grant.amount,
            deadline: grant.deadline,
            url: grant.url,
            featured: grant.featured,
            active: true,
            stateId: stateId,
            metaTitle: `${grant.title} - Small Business Grant`,
            metaDescription: grant.description.substring(0, 160)
          }
        })
        
        addedCount++
        console.log(`✅ Added: ${grant.title}`)
        
      } catch (error) {
        console.error(`Error adding grant "${grant.title}":`, error)
      }
    }
    
    console.log(`\n🎉 Successfully added ${addedCount} real grants!`)
    
    // Show summary
    const totalPrograms = await prisma.program.count()
    const featuredPrograms = await prisma.program.count({
      where: { featured: true }
    })
    
    console.log(`\n📊 Database Summary:`)
    console.log(`- Total Programs: ${totalPrograms}`)
    console.log(`- Featured Programs: ${featuredPrograms}`)
    console.log(`- States: ${states.length}`)
    
  } catch (error) {
    console.error('Error adding real grants:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addRealGrants()
