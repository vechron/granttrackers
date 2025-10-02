import { revalidateTag, revalidatePath } from 'next/cache'

// Cache tags for different data types
export const CACHE_TAGS = {
  PROGRAMS: 'programs',
  STATES: 'states',
  FAQS: 'faqs',
  HEALTH: 'health'
} as const

// Revalidation functions
export async function revalidatePrograms() {
  revalidateTag(CACHE_TAGS.PROGRAMS)
  revalidatePath('/')
  revalidatePath('/state')
  console.log('✅ Programs cache revalidated')
}

export async function revalidateStates() {
  revalidateTag(CACHE_TAGS.STATES)
  revalidatePath('/')
  revalidatePath('/state')
  console.log('✅ States cache revalidated')
}

export async function revalidateFAQs() {
  revalidateTag(CACHE_TAGS.FAQS)
  revalidatePath('/faq')
  console.log('✅ FAQs cache revalidated')
}

export async function revalidateAll() {
  revalidateTag(CACHE_TAGS.PROGRAMS)
  revalidateTag(CACHE_TAGS.STATES)
  revalidateTag(CACHE_TAGS.FAQS)
  revalidatePath('/')
  revalidatePath('/state')
  revalidatePath('/faq')
  console.log('✅ All caches revalidated')
}

// Cache-aware fetch wrapper
export async function fetchWithCache<T>(
  url: string, 
  options: RequestInit & { 
    next?: { 
      revalidate?: number | false
      tags?: string[]
    }
  } = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    next: {
      revalidate: 3600, // 1 hour default
      tags: [CACHE_TAGS.PROGRAMS],
      ...options.next
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

// Database operations with cache invalidation
export async function invalidateAfterWrite(operation: 'program' | 'state' | 'faq' | 'all') {
  switch (operation) {
    case 'program':
      await revalidatePrograms()
      break
    case 'state':
      await revalidateStates()
      break
    case 'faq':
      await revalidateFAQs()
      break
    case 'all':
      await revalidateAll()
      break
  }
}
