import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupGoogleSEO() {
  console.log('🔍 Setting up Google SEO for granttrackers.com...')
  
  // 1. Check current SEO setup
  console.log('\n📊 Current SEO Status:')
  
  // Check sitemap
  const sitemapResponse = await fetch('http://localhost:3000/sitemap.xml')
  const sitemapContent = await sitemapResponse.text()
  const sitemapUrls = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || []
  console.log(`✅ Sitemap: ${sitemapUrls.length} URLs found`)
  
  // Check robots.txt
  const robotsResponse = await fetch('http://localhost:3000/robots.txt')
  const robotsContent = await robotsResponse.text()
  console.log(`✅ Robots.txt: ${robotsContent.includes('Sitemap') ? 'Configured' : 'Missing sitemap'}`)
  
  // 2. Get all pages for SEO analysis
  const programs = await prisma.program.findMany({
    where: { active: true },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      state: {
        select: { name: true, slug: true }
      }
    }
  })
  
  const states = await prisma.state.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    }
  })
  
  console.log(`\n📈 Content Analysis:`)
  console.log(`- Active Programs: ${programs.length}`)
  console.log(`- States: ${states.length}`)
  console.log(`- Total Pages: ${1 + states.length + programs.length}`) // Home + states + programs
  
  // 3. SEO Recommendations
  console.log('\n🎯 Google SEO Action Plan:')
  console.log('1. Submit sitemap to Google Search Console')
  console.log('2. Create Google Search Console account')
  console.log('3. Submit URL for indexing')
  console.log('4. Optimize meta descriptions')
  console.log('5. Add structured data (JSON-LD)')
  console.log('6. Create Google My Business listing')
  
  // 4. Generate Google Search Console URLs
  console.log('\n🔗 Google Search Console URLs:')
  console.log('https://search.google.com/search-console')
  console.log('https://search.google.com/search-console/sitemaps')
  
  // 5. Generate submission URLs
  console.log('\n📤 Direct URL Submission:')
  console.log('https://search.google.com/search-console/url-inspection')
  
  await prisma.$disconnect()
}

setupGoogleSEO().catch(console.error)
