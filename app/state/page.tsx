import Link from 'next/link'
import { generateTitle, generateDescription } from '@/lib/seo'

// Make this page dynamic to avoid build-time database access
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function generateMetadata() {
  return {
    title: generateTitle('All States'),
    description: generateDescription('Browse small business grants by state. Find funding opportunities in all 50 states.'),
  }
}

async function getStates() {
  // Lazy-load Prisma to avoid build-time database connections
  const { prisma } = await import('@/lib/prisma')
  
  return await prisma.state.findMany({
    include: {
      _count: {
        select: { programs: { where: { active: true } } }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export default async function StatesPage() {
  const states = await getStates()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Small Business Grants by State</h1>
        <p className="text-xl text-gray-600">
          Find grant opportunities in your state. Click on any state to see available programs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {states.map((state) => (
          <Link
            key={state.id}
            href={`/state/${state.slug}`}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{state.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{state.description}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {state._count.programs} Programs
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}


