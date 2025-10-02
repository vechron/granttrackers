import { PrismaClient } from '@prisma/client'
import { GrantContentManager } from './content-management'

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Data Monitoring and Update System
export class DataMonitor {
  
  // Check for expired grants
  static async checkExpiredGrants() {
    const expiredGrants = await prisma.program.findMany({
      where: {
        active: true,
        deadline: {
          lt: new Date()
        }
      },
      include: { state: true }
    })
    
    if (expiredGrants.length > 0) {
      console.log(`⚠️  Found ${expiredGrants.length} expired grants:`)
      expiredGrants.forEach(grant => {
        console.log(`- ${grant.title} (${grant.state.name}) - Expired: ${grant.deadline?.toLocaleDateString()}`)
      })
      
      // Optionally deactivate expired grants
      // await prisma.program.updateMany({
      //   where: {
      //     active: true,
      //     deadline: { lt: new Date() }
      //   },
      //   data: { active: false }
      // })
    }
    
    return expiredGrants
  }
  
  // Check for grants expiring soon
  static async checkExpiringGrants(daysAhead: number = 7) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)
    
    const expiringGrants = await prisma.program.findMany({
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
    
    if (expiringGrants.length > 0) {
      console.log(`⏰ Grants expiring in ${daysAhead} days:`)
      expiringGrants.forEach(grant => {
        console.log(`- ${grant.title} (${grant.state.name}) - Expires: ${grant.deadline?.toLocaleDateString()}`)
      })
    }
    
    return expiringGrants
  }
  
  // Check for duplicate grants
  static async checkDuplicateGrants() {
    const grants = await prisma.program.findMany({
      where: { active: true },
      select: { title: true, slug: true, stateId: true }
    })
    
    const duplicates = []
    const seen = new Set()
    
    for (const grant of grants) {
      const key = `${grant.title.toLowerCase()}-${grant.stateId}`
      if (seen.has(key)) {
        duplicates.push(grant)
      } else {
        seen.add(key)
      }
    }
    
    if (duplicates.length > 0) {
      console.log(`🔄 Found ${duplicates.length} potential duplicate grants:`)
      duplicates.forEach(grant => {
        console.log(`- ${grant.title} (${grant.slug})`)
      })
    }
    
    return duplicates
  }
  
  // Check for grants with missing information
  static async checkIncompleteGrants() {
    const incompleteGrants = await prisma.program.findMany({
      where: {
        active: true,
        OR: [
          { description: { equals: '' } },
          { url: { equals: '' } },
          { amount: null },
          { deadline: null }
        ]
      },
      include: { state: true }
    })
    
    if (incompleteGrants.length > 0) {
      console.log(`❌ Found ${incompleteGrants.length} grants with missing information:`)
      incompleteGrants.forEach(grant => {
        const missing = []
        if (!grant.description || grant.description === '') missing.push('description')
        if (!grant.url || grant.url === '') missing.push('URL')
        if (!grant.amount) missing.push('amount')
        if (!grant.deadline) missing.push('deadline')
        
        console.log(`- ${grant.title} (${grant.state.name}) - Missing: ${missing.join(', ')}`)
      })
    }
    
    return incompleteGrants
  }
  
  // Generate data health report
  static async generateHealthReport() {
    console.log('📊 Data Health Report')
    console.log('==================')
    
    const stats = await GrantContentManager.getGrantStats()
    console.log(`\n📈 Statistics:`)
    console.log(`- Total Grants: ${stats.total}`)
    console.log(`- Active Grants: ${stats.active}`)
    console.log(`- Featured Grants: ${stats.featured}`)
    console.log(`- Expiring Soon: ${stats.expiring}`)
    
    console.log(`\n🔍 Health Checks:`)
    
    // Check expired grants
    const expired = await this.checkExpiredGrants()
    console.log(`- Expired Grants: ${expired.length}`)
    
    // Check expiring grants
    const expiring = await this.checkExpiringGrants(7)
    console.log(`- Expiring in 7 days: ${expiring.length}`)
    
    // Check duplicates
    const duplicates = await this.checkDuplicateGrants()
    console.log(`- Potential Duplicates: ${duplicates.length}`)
    
    // Check incomplete grants
    const incomplete = await this.checkIncompleteGrants()
    console.log(`- Incomplete Grants: ${incomplete.length}`)
    
    // Overall health score
    const totalIssues = expired.length + duplicates.length + incomplete.length
    const healthScore = Math.max(0, 100 - (totalIssues * 10))
    
    console.log(`\n🏥 Overall Health Score: ${healthScore}/100`)
    
    if (healthScore >= 90) {
      console.log('✅ Excellent data health!')
    } else if (healthScore >= 70) {
      console.log('⚠️  Good data health, some issues to address')
    } else {
      console.log('❌ Poor data health, needs attention')
    }
    
    return {
      stats,
      expired: expired.length,
      expiring: expiring.length,
      duplicates: duplicates.length,
      incomplete: incomplete.length,
      healthScore
    }
  }
  
  // Auto-update grants (placeholder for future API integrations)
  static async autoUpdateGrants() {
    console.log('🔄 Auto-updating grants...')
    
    // This would integrate with government APIs, grant databases, etc.
    // For now, we'll just check for updates needed
    
    const expiring = await this.checkExpiringGrants(30)
    const expired = await this.checkExpiredGrants()
    
    console.log(`Found ${expiring.length} grants expiring soon and ${expired.length} expired grants`)
    
    // In a real implementation, this would:
    // 1. Fetch new grants from APIs
    // 2. Update existing grants with new information
    // 3. Remove discontinued grants
    // 4. Send notifications for expiring grants
    
    return {
      expiring: expiring.length,
      expired: expired.length
    }
  }
}

// CLI interface for data monitoring
async function main() {
  const command = process.argv[2]
  
  switch (command) {
    case 'health':
      await DataMonitor.generateHealthReport()
      break
      
    case 'expired':
      await DataMonitor.checkExpiredGrants()
      break
      
    case 'expiring':
      const days = parseInt(process.argv[3]) || 7
      await DataMonitor.checkExpiringGrants(days)
      break
      
    case 'duplicates':
      await DataMonitor.checkDuplicateGrants()
      break
      
    case 'incomplete':
      await DataMonitor.checkIncompleteGrants()
      break
      
    case 'update':
      await DataMonitor.autoUpdateGrants()
      break
      
    default:
      console.log('Available commands:')
      console.log('  health     - Generate comprehensive health report')
      console.log('  expired    - Check for expired grants')
      console.log('  expiring   - Check for grants expiring soon (default: 7 days)')
      console.log('  duplicates - Check for duplicate grants')
      console.log('  incomplete - Check for grants with missing information')
      console.log('  update     - Auto-update grants from external sources')
      break
  }
  
  await prisma.$disconnect()
}

if (require.main === module) {
  main().catch(console.error)
}

