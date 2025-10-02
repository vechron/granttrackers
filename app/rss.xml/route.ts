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
    return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Build Phase</title></channel></rss>', {
      headers: { 'Content-Type': 'application/xml' }
    })
  }

  // Don't run without DB URL
  if (!process.env.DATABASE_URL) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>No Database</title></channel></rss>', {
      headers: { 'Content-Type': 'application/xml' }
    })
  }

  // Lazy-load Prisma
  const { prisma } = await import('@/lib/prisma')
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Small Business Grant Tracker'
  
  const programs = await prisma.program.findMany({
    where: { active: true },
    include: { state: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <description>Latest small business grant opportunities and funding news</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${programs.map(program => `
    <item>
      <title>${program.title}</title>
      <description><![CDATA[${program.description}]]></description>
      <link>${baseUrl}/program/${program.slug}</link>
      <guid>${baseUrl}/program/${program.slug}</guid>
      <pubDate>${program.createdAt.toUTCString()}</pubDate>
      <category>${program.state.name}</category>
    </item>`).join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}


