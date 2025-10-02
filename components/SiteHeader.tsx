import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              Grant Tracker
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/state" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              States
            </Link>
            <Link 
              href="/faq" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              FAQ
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="md:hidden">
            <button className="text-gray-600 hover:text-primary-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}


