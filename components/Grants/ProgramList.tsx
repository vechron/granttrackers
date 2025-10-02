import Link from 'next/link'
import { formatDate } from '@/lib/format'
import { AdSlot } from '@/components/Ads/AdSlot'

interface Program {
  id: string
  title: string
  slug: string
  description: string
  amount: string | null
  deadline: Date | null
  url: string
  featured: boolean
}

interface ProgramListProps {
  programs: Program[]
  showAds?: boolean
}

export function ProgramList({ programs, showAds = true }: ProgramListProps) {
  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
        <p className="text-gray-600">Check back later for new grant opportunities.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {programs.map((program, index) => (
        <div key={program.id}>
          {/* Show ad after every 3rd program */}
          {showAds && index > 0 && index % 3 === 0 && (
            <div className="my-8">
              <AdSlot slot="1234567890" className="max-w-2xl mx-auto" />
            </div>
          )}
          
          <div className={`card ${program.featured ? 'ring-2 ring-primary-500' : ''}`}>
            {program.featured && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-3">
                Featured
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
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
                  <span className="font-medium">Deadline: {formatDate(program.deadline)}</span>
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
  )
}


