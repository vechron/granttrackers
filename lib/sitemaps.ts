export async function generateSitemapUrls(baseUrl: string) {
  // Lazy-load Prisma to avoid build-time database connections
  const { prisma } = await import('./prisma')
  
  const states = await prisma.state.findMany({
    select: { slug: true, updatedAt: true }
  })
  
  const programs = await prisma.program.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true }
  })

  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: '/state', priority: 0.9, changefreq: 'weekly' },
    { url: '/about', priority: 0.8, changefreq: 'monthly' },
    { url: '/contact', priority: 0.7, changefreq: 'monthly' },
    { url: '/faq', priority: 0.8, changefreq: 'monthly' },
    { url: '/privacy', priority: 0.5, changefreq: 'yearly' },
    { url: '/terms', priority: 0.5, changefreq: 'yearly' },
  ]

  const statePages = states.map(state => ({
    url: `/state/${state.slug}`,
    priority: 0.8,
    changefreq: 'weekly',
    lastmod: state.updatedAt
  }))

  const programPages = programs.map(program => ({
    url: `/program/${program.slug}`,
    priority: 0.7,
    changefreq: 'monthly',
    lastmod: program.updatedAt
  }))

  return [...staticPages, ...statePages, ...programPages]
}

export function generateSitemapXml(urls: Array<{
  url: string
  priority: number
  changefreq: string
  lastmod?: Date
}>, baseUrl: string): string {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, priority, changefreq, lastmod }) => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${lastmod ? lastmod.toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('')}
</urlset>`

  return sitemap
}


