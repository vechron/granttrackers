import { generateTitle, generateDescription } from '@/lib/seo'
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs'

export async function generateMetadata() {
  return {
    title: generateTitle('About Us'),
    description: generateDescription('Learn about Small Business Grant Tracker and our mission to help small businesses find funding opportunities.'),
  }
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs 
        items={[
          { name: 'About', href: '/about' }
        ]} 
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Small Business Grant Tracker</h1>
        <p className="text-xl text-gray-600">
          We help small businesses find and apply for grant opportunities across all 50 states.
        </p>
      </div>

      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-6">
          Vechron LLC created Small Business Grant Tracker to simplify the process of finding and applying for small business grants. 
          We believe that every small business deserves access to funding opportunities that can help them grow and succeed.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>Aggregate grant opportunities from federal, state, and local sources</li>
          <li>Organize grants by state for easy navigation</li>
          <li>Provide detailed information about each grant program</li>
          <li>Update our database daily with new opportunities</li>
          <li>Offer guidance on the application process</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
        <p className="text-gray-700 mb-6">
          We are committed to providing accurate, up-to-date information about grant opportunities. 
          Our team works diligently to ensure that all information is current and relevant to small business owners.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
        <p className="text-gray-700">
          Have questions or suggestions? We'd love to hear from you. 
          <a href="/contact" className="text-primary-600 hover:text-primary-700">Contact us</a> and we'll get back to you as soon as possible.
        </p>
      </div>
    </div>
  )
}


