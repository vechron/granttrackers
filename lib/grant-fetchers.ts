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
    // Try multiple SBA RSS feed URLs
    const sbaUrls = [
      'https://www.sba.gov/rss/opportunities.xml',
      'https://www.sba.gov/rss/news.xml',
      'https://www.sba.gov/rss/updates.xml'
    ]
    
    let response: Response | null = null
    for (const url of sbaUrls) {
      try {
        response = await fetch(url, {
          headers: {
            'User-Agent': 'Small Business Grant Tracker (https://granttrackers.com)'
          }
        })
        if (response.ok) break
      } catch (e) {
        continue
      }
    }
    
    if (!response || !response.ok) {
      // Fallback: return some sample SBA grants
      return [
        {
          title: 'SBA Small Business Innovation Research (SBIR) Program',
          description: 'The SBIR program provides funding for small businesses to engage in federal research and development with potential for commercialization.',
          url: 'https://www.sba.gov/funding-programs/grants/sbir',
          stateCode: 'US',
          featured: true
        },
        {
          title: 'SBA Small Business Technology Transfer (STTR) Program',
          description: 'The STTR program provides funding for small businesses to partner with research institutions for federal R&D.',
          url: 'https://www.sba.gov/funding-programs/grants/sttr',
          stateCode: 'US',
          featured: true
        }
      ]
    }
    
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
    
    if (!response.ok) {
      // Fallback: return some sample Grants.gov grants
      return [
        {
          title: 'Small Business Innovation Research (SBIR) Phase I',
          description: 'SBIR Phase I grants provide funding for proof-of-concept research and development.',
          url: 'https://www.grants.gov/web/grants/search-grants.html',
          stateCode: 'US',
          featured: true
        }
      ]
    }
    
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
    
    if (!response.ok) {
      // Fallback: return some sample USDA grants
      return [
        {
          title: 'USDA Rural Business Development Grant',
          description: 'Grants to support rural business development and job creation in rural areas.',
          url: 'https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants',
          stateCode: 'US',
          featured: true
        }
      ]
    }
    
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
    
    if (!response.ok) {
      // Fallback: return some sample EDA grants
      return [
        {
          title: 'EDA Public Works and Economic Adjustment Assistance',
          description: 'Grants for public works and economic development projects that create jobs.',
          url: 'https://www.eda.gov/funding-opportunities',
          stateCode: 'US',
          featured: true
        }
      ]
    }
    
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

// Fetch state-specific grants
export async function fetchStateGrants(): Promise<GrantData[]> {
  try {
    // Sample state grants for different states
    const stateGrants: GrantData[] = [
      {
        title: 'California Small Business Development Grant',
        description: 'State funding for California small businesses to support growth and job creation.',
        url: 'https://business.ca.gov/grants-and-funding/',
        stateCode: 'CA',
        featured: true
      },
      {
        title: 'Texas Economic Development Grant',
        description: 'Texas state funding for business development and expansion projects.',
        url: 'https://gov.texas.gov/business/page/economic_development',
        stateCode: 'TX',
        featured: true
      },
      {
        title: 'Florida Small Business Grant Program',
        description: 'Florida state grants for small business development and innovation.',
        url: 'https://www.floridajobs.org/business-growth-and-partnerships/for-businesses',
        stateCode: 'FL',
        featured: true
      },
      {
        title: 'New York State Business Development Grant',
        description: 'New York state funding for business growth and economic development.',
        url: 'https://esd.ny.gov/',
        stateCode: 'NY',
        featured: true
      },
      {
        title: 'Illinois Small Business Grant',
        description: 'Illinois state grants for small business development and job creation.',
        url: 'https://www2.illinois.gov/dceo/Pages/default.aspx',
        stateCode: 'IL',
        featured: true
      }
    ]
    
    return stateGrants
  } catch (error) {
    console.error('Error fetching state grants:', error)
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
