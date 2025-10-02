import { Metadata } from 'next'

export interface SEOProps {
  title: string
  description: string
  path: string
  image?: string
  keywords?: string[]
  noIndex?: boolean
}

export function buildSEO({ 
  title, 
  description, 
  path, 
  image,
  keywords = [],
  noIndex = false 
}: SEOProps): Metadata {
  const url = new URL(path, process.env.NEXT_PUBLIC_SITE_URL!).toString()
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Small Business Grant Tracker'
  
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`
  
  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    alternates: {
      canonical: url
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      type: 'website',
      locale: 'en_US',
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : undefined
    }
  }
}

// Pre-built SEO for common pages
export const seoConfig = {
  home: {
    title: 'Find Small Business Grants',
    description: 'Discover and apply for small business grants in your state. Updated daily with new funding opportunities from federal, state, and local programs.',
    keywords: ['small business grants', 'business funding', 'grants by state', 'small business loans', 'business grants', 'startup funding']
  },
  
  states: {
    title: 'Grants by State',
    description: 'Browse small business grants organized by state. Find funding opportunities in your area.',
    keywords: ['grants by state', 'state business grants', 'local business funding']
  },
  
  faq: {
    title: 'Frequently Asked Questions',
    description: 'Get answers to common questions about small business grants and funding opportunities.',
    keywords: ['grant FAQ', 'business grant questions', 'funding help']
  },
  
  about: {
    title: 'About Grant Tracker',
    description: 'Learn about our mission to help small businesses find and apply for grants and funding opportunities.',
    keywords: ['about grant tracker', 'small business help', 'grant assistance']
  }
}

// JSON-LD structured data
export function generateProgramJSONLD(program: {
  title: string
  description: string
  amount?: string
  deadline?: Date
  url: string
  state: { name: string }
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Grant",
    "name": program.title,
    "description": program.description,
    "amount": program.amount,
    "applicationDeadline": program.deadline?.toISOString(),
    "url": program.url,
    "provider": {
      "@type": "Organization",
      "name": program.state.name
    },
    "eligibleRegion": {
      "@type": "State",
      "name": program.state.name
    }
  }
}

export function generateBreadcrumbJSONLD(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

// Simple utility functions for program pages
export function generateTitle(title: string): string {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Small Business Grant Tracker'
  return title.includes(siteName) ? title : `${title} | ${siteName}`
}

export function generateDescription(description: string): string {
  // Truncate to 160 characters for optimal SEO
  return description.length > 160 
    ? description.substring(0, 157) + '...'
    : description
}

export function generateFAQJSONLD(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}