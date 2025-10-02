import { notFound } from 'next/navigation'
import { generateTitle, generateDescription } from '@/lib/seo'
import { StateHero } from '@/components/Grants/StateHero'
import { ProgramList } from '@/components/Grants/ProgramList'
import { StickySidebarAd } from '@/components/Ads/StickySidebarAd'
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs'

// Use ISR with fallback to avoid build-time database access
export const revalidate = 3600 // Revalidate every hour
export const dynamicParams = true

interface StatePageProps {
  params: { state: string }
}

async function getState(slug: string) {
  // Skip during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null
  }
  
  // Lazy-load Prisma to avoid build-time database connections
  const { prisma } = await import('@/lib/prisma')
  
  return await prisma.state.findUnique({
    where: { slug },
    include: {
      programs: {
        where: { 
          active: true,
          OR: [
            { deadline: null },
            { deadline: { gte: new Date() } }
          ]
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ]
      }
    }
  })
}

export async function generateStaticParams() {
  // Skip during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return []
  }
  
  // Lazy-load Prisma to avoid build-time database connections
  const { prisma } = await import('@/lib/prisma')
  
  const states = await prisma.state.findMany({
    select: { slug: true }
  })
  
  return states.map((state) => ({
    state: state.slug,
  }))
}

export async function generateMetadata({ params }: StatePageProps) {
  const state = await getState(params.state)
  
  if (!state) {
    return {
      title: 'State Not Found',
    }
  }

  return {
    title: generateTitle(`${state.name} Small Business Grants (2025)`),
    description: generateDescription(
      `Find ${state.programs.length} small business grant opportunities in ${state.name}. Apply for funding to grow your business.`
    ),
  }
}

export default async function StatePage({ params }: StatePageProps) {
  const state = await getState(params.state)
  
  if (!state) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs 
        items={[
          { name: 'States', href: '/state' },
          { name: state.name, href: `/state/${state.slug}` }
        ]} 
      />
      
      <StateHero 
        stateName={state.name}
        programCount={state.programs.length}
        description={state.description || undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-12">
        <div className="lg:col-span-3">
          <ProgramList programs={state.programs} />
        </div>
        
        <div className="lg:col-span-1">
          <StickySidebarAd />
        </div>
      </div>
    </div>
  )
}


