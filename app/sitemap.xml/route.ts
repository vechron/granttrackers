export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Detect Next's build phase so we never run at build
const IS_BUILD =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.VERCEL === '1' && !!process.env.BUILD_ID)

export async function GET() {
  // Never run during build collection
  if (IS_BUILD) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>Build Phase</loc></url></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    })
  }

  // Don't run without DB URL
  if (!process.env.DATABASE_URL) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>No Database</loc></url></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    })
  }

  // Lazy-load sitemap functions
  const { generateSitemapUrls, generateSitemapXml } = await import('@/lib/sitemaps')
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://granttrackers.com'
  const urls = await generateSitemapUrls(baseUrl)
  const sitemap = generateSitemapXml(urls, baseUrl)

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}


