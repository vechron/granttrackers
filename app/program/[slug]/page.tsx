import { notFound } from 'next/navigation'
import { generateTitle, generateDescription } from '@/lib/seo'
import { formatDate } from '@/lib/format'
import { JsonLD, generateArticleSchema, generateBreadcrumbSchema } from '@/components/SEO/JsonLD'
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs'
import { AdSlot } from '@/components/Ads/AdSlot'
import { StickySidebarAd } from '@/components/Ads/StickySidebarAd'

// Use ISR with fallback to avoid build-time database access
export const revalidate = 3600 // Revalidate every hour
export const dynamicParams = true

interface ProgramPageProps {
  params: { slug: string }
}

async function getProgram(slug: string) {
  // Skip during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null
  }
  
  // Lazy-load Prisma to avoid build-time database connections
  const { prisma } = await import('@/lib/prisma')
  
  return await prisma.program.findUnique({
    where: { slug },
    include: { state: true }
  })
}

export async function generateStaticParams() {
  // Skip during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return []
  }
  
  // Lazy-load Prisma to avoid build-time database connections
  const { prisma } = await import('@/lib/prisma')
  
  const programs = await prisma.program.findMany({
    where: { 
      active: true,
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } }
      ]
    },
    select: { slug: true }
  })
  
  return programs.map((program) => ({
    slug: program.slug,
  }))
}

export async function generateMetadata({ params }: ProgramPageProps) {
  const program = await getProgram(params.slug)
  
  if (!program) {
    return {
      title: 'Program Not Found',
    }
  }

  return {
    title: generateTitle(program.metaTitle || program.title),
    description: generateDescription(program.metaDescription || program.description),
  }
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const program = await getProgram(params.slug)
  
  if (!program) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const programUrl = `${baseUrl}/program/${program.slug}`
  const now = new Date().toISOString()

  const articleSchema = generateArticleSchema({
    title: program.title,
    description: program.description,
    url: programUrl,
    datePublished: program.createdAt.toISOString(),
    dateModified: program.updatedAt.toISOString(),
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'States', url: `${baseUrl}/state` },
    { name: program.state.name, url: `${baseUrl}/state/${program.state.slug}` },
    { name: program.title, url: programUrl },
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLD data={articleSchema} />
      <JsonLD data={breadcrumbSchema} />
      
      <Breadcrumbs 
        items={[
          { name: 'States', href: '/state' },
          { name: program.state.name, href: `/state/${program.state.slug}` },
          { name: program.title, href: `/program/${program.slug}` }
        ]} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <article className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">{program.state.name}</span>
                {program.featured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Featured
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{program.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                {program.amount && (
                  <div className="flex items-center text-lg">
                    <span className="font-semibold text-green-600">{program.amount}</span>
                  </div>
                )}
                {program.deadline && (
                  <div className="flex items-center text-lg">
                    <span className="font-semibold text-gray-700">
                      Deadline: {formatDate(program.deadline)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Description</h2>
              <p className="text-gray-700 leading-relaxed">{program.description}</p>
            </div>

            {/* Mid-content ad */}
            <div className="my-8">
              <AdSlot slot="1234567890" />
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Apply</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Review the program requirements and eligibility criteria</li>
                <li>Gather all required documentation (business plan, financial statements, etc.)</li>
                <li>Complete the application form on the official website</li>
                <li>Submit your application before the deadline</li>
                <li>Follow up on your application status</li>
              </ol>
            </div>

            <div className="flex justify-center">
              <a
                href={program.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-lg px-8 py-3"
              >
                Apply Now
              </a>
            </div>
          </article>
        </div>
        
        <div className="lg:col-span-1">
          <StickySidebarAd />
        </div>
      </div>
    </div>
  )
}


