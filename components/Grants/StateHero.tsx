interface StateHeroProps {
  stateName: string
  programCount: number
  description?: string
}

export function StateHero({ stateName, programCount, description }: StateHeroProps) {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {stateName} Small Business Grants
          </h1>
          <p className="text-xl mb-6 text-primary-100">
            {description || `Find ${programCount} small business grant opportunities in ${stateName}`}
          </p>
          <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2">
            <span className="text-sm font-medium">
              {programCount} Active Programs
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


