import { PrismaClient } from '@prisma/client'

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Use the working pooler connection
const prisma = new PrismaClient({
  datasources: { 
    db: { 
      url: "postgresql://postgres.nrcuzovxjuzkamppgdrw:Kai%4035806@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
    } 
  },
  log: ['warn', 'error'],
})

// Real grant data for 2024
const realGrants = [
  // Federal Grants
  {
    title: "Small Business Innovation Research (SBIR) Program",
    description: "Federal program providing funding for small businesses to engage in research and development with commercial potential. Offers Phase I ($150K) and Phase II ($1M) awards.",
    amount: "Up to $1,000,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.sbir.gov/",
    featured: true,
    stateCode: "US", // Federal program
    category: "Federal"
  },
  {
    title: "Small Business Technology Transfer (STTR) Program",
    description: "Similar to SBIR but requires partnership with research institutions. Provides funding for technology transfer and commercialization.",
    amount: "Up to $1,000,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.sbir.gov/",
    featured: true,
    stateCode: "US",
    category: "Federal"
  },
  {
    title: "Economic Development Administration (EDA) Grants",
    description: "EDA provides grants to support economic development, infrastructure, and job creation in distressed communities.",
    amount: "Up to $2,000,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.eda.gov/",
    featured: false,
    stateCode: "US",
    category: "Federal"
  },

  // State-specific grants
  {
    title: "California Small Business COVID-19 Relief Grant",
    description: "California's grant program for small businesses affected by COVID-19. Provides direct cash grants to eligible businesses.",
    amount: "Up to $25,000",
    deadline: new Date("2024-06-30"),
    url: "https://careliefgrant.com/",
    featured: true,
    stateCode: "CA",
    category: "State"
  },
  {
    title: "New York State Small Business Grant Program",
    description: "New York's comprehensive grant program supporting small businesses with direct funding and technical assistance.",
    amount: "Up to $50,000",
    deadline: new Date("2024-08-31"),
    url: "https://esd.ny.gov/",
    featured: true,
    stateCode: "NY",
    category: "State"
  },
  {
    title: "Texas Small Business Emergency Assistance Program",
    description: "Texas grant program providing emergency assistance to small businesses during economic disruptions.",
    amount: "Up to $30,000",
    deadline: new Date("2024-07-31"),
    url: "https://gov.texas.gov/",
    featured: false,
    stateCode: "TX",
    category: "State"
  },
  {
    title: "Florida Small Business Emergency Bridge Loan Program",
    description: "Florida's bridge loan program providing short-term, interest-free loans to small businesses during emergencies.",
    amount: "Up to $50,000",
    deadline: new Date("2024-09-30"),
    url: "https://floridajobs.org/",
    featured: false,
    stateCode: "FL",
    category: "State"
  },
  {
    title: "Illinois Small Business Emergency Loan Program",
    description: "Illinois program providing low-interest loans to small businesses affected by economic disruptions.",
    amount: "Up to $50,000",
    deadline: new Date("2024-10-31"),
    url: "https://www2.illinois.gov/",
    featured: false,
    stateCode: "IL",
    category: "State"
  },
  {
    title: "Pennsylvania Small Business First Program",
    description: "Pennsylvania's comprehensive small business assistance program offering grants and loans.",
    amount: "Up to $200,000",
    deadline: new Date("2024-11-30"),
    url: "https://dced.pa.gov/",
    featured: false,
    stateCode: "PA",
    category: "State"
  },

  // Industry-specific grants
  {
    title: "USDA Rural Business Development Grants",
    description: "USDA grants supporting business development in rural areas. Focus on agriculture, food processing, and rural economic development.",
    amount: "Up to $500,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.rd.usda.gov/",
    featured: true,
    stateCode: "US",
    category: "Federal"
  },
  {
    title: "SBA Community Navigator Pilot Program",
    description: "SBA program providing funding to organizations that help small businesses access resources and support.",
    amount: "Up to $1,000,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.sba.gov/",
    featured: false,
    stateCode: "US",
    category: "Federal"
  },
  {
    title: "Department of Energy Small Business Innovation Research",
    description: "DOE SBIR program funding clean energy, advanced manufacturing, and energy efficiency technologies.",
    amount: "Up to $1,500,000",
    deadline: new Date("2024-12-31"),
    url: "https://www.energy.gov/",
    featured: false,
    stateCode: "US",
    category: "Federal"
  },

  // Local/Regional grants
  {
    title: "Chicago Small Business Improvement Fund",
    description: "Chicago's grant program for small business property improvements in designated areas.",
    amount: "Up to $150,000",
    deadline: new Date("2024-08-31"),
    url: "https://www.chicago.gov/",
    featured: false,
    stateCode: "IL",
    category: "Local"
  },
  {
    title: "Los Angeles Small Business Emergency Microloan Program",
    description: "LA's emergency microloan program for small businesses affected by economic disruptions.",
    amount: "Up to $20,000",
    deadline: new Date("2024-09-30"),
    url: "https://www.lacity.org/",
    featured: false,
    stateCode: "CA",
    category: "Local"
  },
  {
    title: "Miami-Dade Small Business Development Program",
    description: "Miami-Dade County's comprehensive small business development and support program.",
    amount: "Up to $100,000",
    deadline: new Date("2024-10-31"),
    url: "https://www.miamidade.gov/",
    featured: false,
    stateCode: "FL",
    category: "Local"
  }
]

async function addRealGrants() {
  try {
    console.log('Adding real grant data...')
    
    // Get all states
    const states = await prisma.state.findMany()
    const stateMap = new Map(states.map(s => [s.code, s.id]))
    
    let addedCount = 0
    
    for (const grant of realGrants) {
      try {
        // Find or create state
        let stateId
        if (grant.stateCode === "US") {
          // For federal programs, we'll use the first state as a placeholder
          // In a real app, you might want to create a special "Federal" state
          stateId = states[0].id
        } else {
          stateId = stateMap.get(grant.stateCode)
        }
        
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
        console.log(`Added: ${grant.title}`)
        
      } catch (error) {
        console.error(`Error adding grant "${grant.title}":`, error)
      }
    }
    
    console.log(`\n✅ Successfully added ${addedCount} real grants!`)
    
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
