import Link from 'next/link'
import { AdSlot } from '@/components/Ads/AdSlot'
import { StickySidebarAd } from '@/components/Ads/StickySidebarAd'

// Ensure Node.js runtime (not Edge) for Prisma
export const runtime = 'nodejs'

// Use ISR with fallback to avoid build-time database access
export const revalidate = 3600 // Revalidate every hour
export const dynamicParams = true

async function getFeaturedPrograms() {
  console.log('🔍 getFeaturedPrograms called')
  
  // Skip during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('⏭️ Skipping during build phase')
    return []
  }
  
  // Lazy-load Prisma to avoid build-time database connections
  const { prisma } = await import('@/lib/prisma')
  console.log('📡 Prisma loaded, querying database...')
  
  const programs = await prisma.program.findMany({
    where: { 
      featured: true, 
      active: true,
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } }
      ]
    },
    select: { 
      id: true, 
      title: true, 
      slug: true, 
      description: true,
      amount: true, 
      deadline: true,
      url: true,
      state: { select: { name: true, slug: true } } 
    },
    take: 6,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`✅ Found ${programs.length} featured programs`)
  return programs
}

async function getStates() {
  // Skip during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return []
  }
  
  // Lazy-load Prisma to avoid build-time database connections
  const { prisma } = await import('@/lib/prisma')
  
  return await prisma.state.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' }
  })
}

export default async function HomePage() {
  const [featuredPrograms, states] = await Promise.all([
    getFeaturedPrograms(),
    getStates()
  ])
  
  // Debug: Show what we got
  console.log('🏠 HomePage - Featured Programs:', featuredPrograms.length)
  console.log('🏠 HomePage - States:', states.length)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Find Small Business Grants
          <span className="block text-primary-600">in Your State</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Discover and apply for small business grants across all 50 states. 
          Updated daily with new funding opportunities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/state" className="btn-primary text-lg px-8 py-3">
            Browse All States
          </Link>
          <Link href="/faq" className="btn-secondary text-lg px-8 py-3">
            Learn More
          </Link>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-gray-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-semibold text-center mb-6">Search by State</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {states.map((state) => (
            <Link
              key={state.id}
              href={`/state/${state.slug}`}
              className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow border min-h-[60px] flex items-center justify-center"
            >
              <div className="text-sm font-medium text-gray-900 leading-tight">{state.name}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Featured Programs */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Programs</h2>
          {/* Debug info */}
          <div className="bg-yellow-100 p-4 rounded mb-4">
            <p className="text-sm">Debug: Found {featuredPrograms.length} featured programs</p>
          </div>
          <div className="space-y-6">
              {featuredPrograms.map((program, index) => (
                <div key={program.id}>
                  {/* Show ad after 2nd program */}
                  {index === 2 && (
                    <div className="my-8">
                      <AdSlot slot="1234567890" />
                    </div>
                  )}
                  
                  <div className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500">{program.state.name}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Featured
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          <Link 
                            href={`/program/${program.slug}`}
                            className="hover:text-primary-600 transition-colors"
                          >
                            {program.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 mb-3">{program.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      {program.amount && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium text-green-600">{program.amount}</span>
                        </div>
                      )}
                      {program.deadline && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">
                            Deadline: {new Date(program.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Link 
                        href={`/program/${program.slug}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Details →
                      </Link>
                      <a
                        href={program.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mid-content ad */}
          <div className="my-12">
            <AdSlot slot="1234567890" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <StickySidebarAd />
        </div>
      </div>
    </div>
  )
}


