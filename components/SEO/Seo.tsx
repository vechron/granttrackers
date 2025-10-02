import Head from 'next/head'

interface SeoProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  noindex?: boolean
}

export function Seo({ 
  title, 
  description, 
  canonical, 
  ogImage,
  noindex = false 
}: SeoProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const fullTitle = title.includes('|') ? title : `${title} | Small Business Grant Tracker`
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical || `${baseUrl}${typeof window !== 'undefined' ? window.location.pathname : ''}`} />
      
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical || `${baseUrl}${typeof window !== 'undefined' ? window.location.pathname : ''}`} />
      <meta property="og:image" content={ogImage || `${baseUrl}/og-default.png`} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || `${baseUrl}/og-default.png`} />
    </Head>
  )
}


