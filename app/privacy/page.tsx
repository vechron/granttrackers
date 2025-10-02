import { generateTitle, generateDescription } from '@/lib/seo'
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs'

export async function generateMetadata() {
  return {
    title: generateTitle('Privacy Policy'),
    description: generateDescription('Learn how Small Business Grant Tracker collects, uses, and protects your personal information.'),
  }
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs 
        items={[
          { name: 'Privacy Policy', href: '/privacy' }
        ]} 
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-xl text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
        <p className="text-gray-700 mb-6">
          We collect information you provide directly to us, such as when you create an account, 
          subscribe to our newsletter, or contact us for support.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
        <p className="text-gray-700 mb-6">
          We use the information we collect to provide, maintain, and improve our services, 
          process transactions, and communicate with you.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
        <p className="text-gray-700 mb-6">
          We do not sell, trade, or otherwise transfer your personal information to third parties 
          without your consent, except as described in this privacy policy.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
        <p className="text-gray-700 mb-6">
          We implement appropriate security measures to protect your personal information against 
          unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies</h2>
        <p className="text-gray-700 mb-6">
          We use cookies and similar technologies to enhance your experience on our website. 
          You can control cookie settings through your browser preferences.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions about this privacy policy, please contact us at{' '}
          <a href="mailto:business@vechron.com" className="text-primary-600 hover:text-primary-700">
            business@vechron.com
          </a>
        </p>
      </div>
    </div>
  )
}


