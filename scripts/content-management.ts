import { PrismaClient } from '@prisma/client'

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Content Management System for Grant Updates
export class GrantContentManager {
  
  // Add a new grant
  static async addGrant(grantData: {
    title: string
    description: string
    amount?: string
    deadline?: Date
    url: string
    featured?: boolean
    stateCode: string
    category?: string
  }) {
    try {
      // Find state
      const state = await prisma.state.findUnique({
        where: { code: grantData.stateCode }
      })
      
      if (!state) {
        throw new Error(`State ${grantData.stateCode} not found`)
      }
      
      // Create slug
      const slug = grantData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      // Check for duplicates
      const existing = await prisma.program.findUnique({
        where: { slug }
      })
      
      if (existing) {
        throw new Error(`Grant with title "${grantData.title}" already exists`)
      }
      
      // Create grant
      const grant = await prisma.program.create({
        data: {
          title: grantData.title,
          slug: slug,
          description: grantData.description,
          amount: grantData.amount,
          deadline: grantData.deadline,
          url: grantData.url,
          featured: grantData.featured || false,
          active: true,
          stateId: state.id,
          metaTitle: `${grantData.title} - Small Business Grant`,
          metaDescription: grantData.description.substring(0, 160)
        }
      })
      
      console.log(`✅ Added grant: ${grantData.title}`)
      return grant
      
    } catch (error) {
      console.error('Error adding grant:', error)
      throw error
    }
  }
  
  // Update an existing grant
  static async updateGrant(slug: string, updates: {
    title?: string
    description?: string
    amount?: string
    deadline?: Date
    url?: string
    featured?: boolean
    active?: boolean
  }) {
    try {
      const grant = await prisma.program.findUnique({
        where: { slug }
      })
      
      if (!grant) {
        throw new Error(`Grant with slug "${slug}" not found`)
      }
      
      const updatedGrant = await prisma.program.update({
        where: { slug },
        data: updates
      })
      
      console.log(`✅ Updated grant: ${updatedGrant.title}`)
      return updatedGrant
      
    } catch (error) {
      console.error('Error updating grant:', error)
      throw error
    }
  }
  
  // Deactivate a grant
  static async deactivateGrant(slug: string) {
    return this.updateGrant(slug, { active: false })
  }
  
  // Get grants by state
  static async getGrantsByState(stateCode: string) {
    const state = await prisma.state.findUnique({
      where: { code: stateCode },
      include: {
        programs: {
          where: { active: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    return state?.programs || []
  }
  
  // Get featured grants
  static async getFeaturedGrants() {
    return prisma.program.findMany({
      where: { 
        featured: true, 
        active: true 
      },
      include: { state: true },
      orderBy: { createdAt: 'desc' }
    })
  }
  
  // Get grants expiring soon
  static async getExpiringGrants(daysAhead: number = 30) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)
    
    return prisma.program.findMany({
      where: {
        active: true,
        deadline: {
          lte: futureDate,
          gte: new Date()
        }
      },
      include: { state: true },
      orderBy: { deadline: 'asc' }
    })
  }
  
  // Search grants
  static async searchGrants(query: string) {
    return prisma.program.findMany({
      where: {
        active: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: { state: true },
      orderBy: { createdAt: 'desc' }
    })
  }
  
  // Get grant statistics
  static async getGrantStats() {
    const total = await prisma.program.count()
    const active = await prisma.program.count({ where: { active: true } })
    const featured = await prisma.program.count({ where: { featured: true, active: true } })
    const expiring = await this.getExpiringGrants(30)
    
    return {
      total,
      active,
      featured,
      expiring: expiring.length
    }
  }
}

// CLI interface for content management
async function main() {
  const command = process.argv[2]
  
  switch (command) {
    case 'stats':
      const stats = await GrantContentManager.getGrantStats()
      console.log('📊 Grant Statistics:')
      console.log(`- Total Grants: ${stats.total}`)
      console.log(`- Active Grants: ${stats.active}`)
      console.log(`- Featured Grants: ${stats.featured}`)
      console.log(`- Expiring Soon: ${stats.expiring}`)
      break
      
    case 'featured':
      const featured = await GrantContentManager.getFeaturedGrants()
      console.log('⭐ Featured Grants:')
      featured.forEach(grant => {
        console.log(`- ${grant.title} (${grant.state.name})`)
      })
      break
      
    case 'expiring':
      const expiring = await GrantContentManager.getExpiringGrants(30)
      console.log('⏰ Grants Expiring in 30 Days:')
      expiring.forEach(grant => {
        console.log(`- ${grant.title} (${grant.state.name}) - ${grant.deadline?.toLocaleDateString()}`)
      })
      break
      
    case 'search':
      const query = process.argv[3]
      if (!query) {
        console.log('Usage: npm run content search "your search term"')
        break
      }
      const results = await GrantContentManager.searchGrants(query)
      console.log(`🔍 Search Results for "${query}":`)
      results.forEach(grant => {
        console.log(`- ${grant.title} (${grant.state.name})`)
      })
      break
      
    default:
      console.log('Available commands:')
      console.log('  stats     - Show grant statistics')
      console.log('  featured  - List featured grants')
      console.log('  expiring  - List grants expiring soon')
      console.log('  search    - Search grants by keyword')
      break
  }
  
  await prisma.$disconnect()
}

if (require.main === module) {
  main().catch(console.error)
}

export { GrantContentManager }
