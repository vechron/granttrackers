import { prisma } from '@/lib/prisma'

export async function GET() {
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


