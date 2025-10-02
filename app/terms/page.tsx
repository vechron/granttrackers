import { generateTitle, generateDescription } from '@/lib/seo'
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs'

export async function generateMetadata() {
  return {
    title: generateTitle('Terms of Service'),
    description: generateDescription('Read the terms and conditions for using Small Business Grant Tracker.'),
  }
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs 
        items={[
          { name: 'Terms of Service', href: '/terms' }
        ]} 
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-xl text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
        <p className="text-gray-700 mb-6">
          By accessing and using Small Business Grant Tracker, you accept and agree to be bound by 
          the terms and provision of this agreement.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
        <p className="text-gray-700 mb-6">
          Permission is granted to temporarily download one copy of the materials on Small Business Grant Tracker 
          for personal, non-commercial transitory viewing only.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
        <p className="text-gray-700 mb-6">
          The materials on Small Business Grant Tracker are provided on an 'as is' basis. 
          Small Business Grant Tracker makes no warranties, expressed or implied, and hereby disclaims 
          and negates all other warranties including without limitation, implied warranties or conditions 
          of merchantability, fitness for a particular purpose, or non-infringement of intellectual property 
          or other violation of rights.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitations</h2>
        <p className="text-gray-700 mb-6">
          In no event shall Small Business Grant Tracker or its suppliers be liable for any damages 
          (including, without limitation, damages for loss of data or profit, or due to business interruption) 
          arising out of the use or inability to use the materials on Small Business Grant Tracker.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accuracy of Materials</h2>
        <p className="text-gray-700 mb-6">
          The materials appearing on Small Business Grant Tracker could include technical, typographical, 
          or photographic errors. Small Business Grant Tracker does not warrant that any of the materials 
          on its website are accurate, complete, or current.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
        <p className="text-gray-700">
          If you have any questions about these Terms of Service, please contact us at{' '}
          <a href="mailto:business@vechron.com" className="text-primary-600 hover:text-primary-700">
            business@vechron.com
          </a>
        </p>
      </div>
    </div>
  )
}


