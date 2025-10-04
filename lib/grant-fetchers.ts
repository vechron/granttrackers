import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface GrantData {
  title: string
  description: string
  amount?: string
  deadline?: Date
  url: string
  stateCode: string
  featured?: boolean
}

// Fetch grants from SBA RSS feed
export async function fetchSBAgrants(): Promise<GrantData[]> {
  try {
    const response = await fetch('https://www.sba.gov/rss/opportunities.xml', {
      headers: {
        'User-Agent': 'Small Business Grant Tracker (https://granttrackers.com)'
      }
    })
    
    if (!response.ok) return []
    
    const xml = await response.text()
    const grants: GrantData[] = []
    
    // Parse RSS XML for SBA opportunities
    const titleMatches = xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || []
    const linkMatches = xml.match(/<link>(.*?)<\/link>/g) || []
    const descriptionMatches = xml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/g) || []
    
    for (let i = 0; i < titleMatches.length; i++) {
      const title = titleMatches[i].replace(/<title><!\[CDATA\[(.*?)\]\]><\/title>/, '$1').trim()
      const link = linkMatches[i]?.replace(/<link>(.*?)<\/link>/, '$1').trim() || ''
      const description = descriptionMatches[i]?.replace(/<description><!\[CDATA\[(.*?)\]\]><\/description>/, '$1').trim() || ''
      
      if (title && link && title !== 'SBA Opportunities') {
        grants.push({
          title,
          description: description.substring(0, 500),
          url: link,
          stateCode: 'US',
          featured: true
        })
      }
    }
    
    return grants.slice(0, 5) // Limit to 5 grants per fetch
  } catch (error) {
    console.error('Error fetching SBA grants:', error)
    return []
  }
}

// Fetch grants from Grants.gov RSS feed
export async function fetchGrantsGovRSS(): Promise<GrantData[]> {
  try {
    const response = await fetch('https://www.grants.gov/rss/opportunities.xml', {
      headers: {
        'User-Agent': 'Small Business Grant Tracker (https://granttrackers.com)'
      }
    })
    
    if (!response.ok) return []
    
    const xml = await response.text()
    const grants: GrantData[] = []
    
    // Parse RSS XML for Grants.gov opportunities
    const titleMatches = xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || []
    const linkMatches = xml.match(/<link>(.*?)<\/link>/g) || []
    const descriptionMatches = xml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/g) || []
    
    for (let i = 0; i < titleMatches.length; i++) {
      const title = titleMatches[i].replace(/<title><!\[CDATA\[(.*?)\]\]><\/title>/, '$1').trim()
      const link = linkMatches[i]?.replace(/<link>(.*?)<\/link>/, '$1').trim() || ''
      const description = descriptionMatches[i]?.replace(/<description><!\[CDATA\[(.*?)\]\]><\/description>/, '$1').trim() || ''
      
      if (title && link && title !== 'Grants.gov Opportunities') {
        grants.push({
          title,
          description: description.substring(0, 500),
          url: link,
          stateCode: 'US',
          featured: true
        })
      }
    }
    
    return grants.slice(0, 5) // Limit to 5 grants per fetch
  } catch (error) {
    console.error('Error fetching Grants.gov grants:', error)
    return []
  }
}

// Fetch grants from USDA RSS feed
export async function fetchUSDAGrants(): Promise<GrantData[]> {
  try {
    const response = await fetch('https://www.usda.gov/rss/opportunities.xml', {
      headers: {
        'User-Agent': 'Small Business Grant Tracker (https://granttrackers.com)'
      }
    })
    
    if (!response.ok) return []
    
    const xml = await response.text()
    const grants: GrantData[] = []
    
    // Parse RSS XML for USDA opportunities
    const titleMatches = xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || []
    const linkMatches = xml.match(/<link>(.*?)<\/link>/g) || []
    const descriptionMatches = xml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/g) || []
    
    for (let i = 0; i < titleMatches.length; i++) {
      const title = titleMatches[i].replace(/<title><!\[CDATA\[(.*?)\]\]><\/title>/, '$1').trim()
      const link = linkMatches[i]?.replace(/<link>(.*?)<\/link>/, '$1').trim() || ''
      const description = descriptionMatches[i]?.replace(/<description><!\[CDATA\[(.*?)\]\]><\/description>/, '$1').trim() || ''
      
      if (title && link && title !== 'USDA Opportunities') {
        grants.push({
          title,
          description: description.substring(0, 500),
          url: link,
          stateCode: 'US',
          featured: true
        })
      }
    }
    
    return grants.slice(0, 3) // Limit to 3 grants per fetch
  } catch (error) {
    console.error('Error fetching USDA grants:', error)
    return []
  }
}

// Fetch grants from EDA RSS feed
export async function fetchEDAGrants(): Promise<GrantData[]> {
  try {
    const response = await fetch('https://www.eda.gov/rss/opportunities.xml', {
      headers: {
        'User-Agent': 'Small Business Grant Tracker (https://granttrackers.com)'
      }
    })
    
    if (!response.ok) return []
    
    const xml = await response.text()
    const grants: GrantData[] = []
    
    // Parse RSS XML for EDA opportunities
    const titleMatches = xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || []
    const linkMatches = xml.match(/<link>(.*?)<\/link>/g) || []
    const descriptionMatches = xml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/g) || []
    
    for (let i = 0; i < titleMatches.length; i++) {
      const title = titleMatches[i].replace(/<title><!\[CDATA\[(.*?)\]\]><\/title>/, '$1').trim()
      const link = linkMatches[i]?.replace(/<link>(.*?)<\/link>/, '$1').trim() || ''
      const description = descriptionMatches[i]?.replace(/<description><!\[CDATA\[(.*?)\]\]><\/description>/, '$1').trim() || ''
      
      if (title && link && title !== 'EDA Opportunities') {
        grants.push({
          title,
          description: description.substring(0, 500),
          url: link,
          stateCode: 'US',
          featured: true
        })
      }
    }
    
    return grants.slice(0, 3) // Limit to 3 grants per fetch
  } catch (error) {
    console.error('Error fetching EDA grants:', error)
    return []
  }
}

// Add grants to database
export async function addGrantsToDatabase(grants: GrantData[]): Promise<void> {
  try {
    for (const grant of grants) {
      // Check if grant already exists
      const existing = await prisma.program.findFirst({
        where: {
          title: grant.title,
          url: grant.url
        }
      })
      
      if (!existing) {
        // Get the federal state
        const federalState = await prisma.state.findUnique({
          where: { code: grant.stateCode }
        })
        
        if (federalState) {
          await prisma.program.create({
            data: {
              title: grant.title,
              description: grant.description,
              amount: grant.amount || 'Varies',
              deadline: grant.deadline,
              url: grant.url,
              stateId: federalState.id,
              active: true,
              featured: grant.featured || false,
              slug: grant.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('Error adding grants to database:', error)
  }
}
