import { generateSitemapUrls, generateSitemapXml } from '@/lib/sitemaps'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const urls = await generateSitemapUrls(baseUrl)
  const sitemap = generateSitemapXml(urls, baseUrl)

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}


