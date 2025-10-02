import { generateTitle, generateDescription } from '@/lib/seo'
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs'

export async function generateMetadata() {
  return {
    title: generateTitle('Contact Us'),
    description: generateDescription('Get in touch with Small Business Grant Tracker. We\'re here to help you find the right grant opportunities.'),
  }
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs 
        items={[
          { name: 'Contact', href: '/contact' }
        ]} 
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600">
          Have questions about grant opportunities? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-700 mb-6">
            We're here to help you navigate the world of small business grants. 
            Whether you have questions about specific programs or need guidance on the application process, 
            we're just an email away.
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">business@vechron.com</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-600">We typically respond within 24 hours</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">How often is the grant database updated?</h4>
              <p className="text-sm text-gray-600">We update our database daily with new grant opportunities.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Do you provide application assistance?</h4>
              <p className="text-sm text-gray-600">We provide general guidance, but recommend consulting with a grant specialist for specific applications.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Is there a cost to use this service?</h4>
              <p className="text-sm text-gray-600">Our basic grant listings are free. We may offer premium services in the future.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


