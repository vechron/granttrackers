import { generateTitle, generateDescription } from '@/lib/seo'
import { JsonLD, generateFAQSchema } from '@/components/SEO/JsonLD'
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs'

// Use ISR for SEO optimization with low cost
export const revalidate = 3600 // Revalidate every hour (low cost)
export const dynamicParams = true
export const runtime = 'nodejs'

export async function generateMetadata() {
  return {
    title: generateTitle('Frequently Asked Questions'),
    description: generateDescription('Get answers to common questions about small business grants, eligibility requirements, and application processes.'),
  }
}

async function getFAQs() {
  // Lazy-load Prisma to avoid build-time database connections
  const { prisma } = await import('@/lib/prisma')
  
  return await prisma.fAQ.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  })
}

export default async function FAQPage() {
  const faqs = await getFAQs()
  
  const faqSchema = generateFAQSchema(
    faqs.map(faq => ({
      question: faq.question,
      answer: faq.answer
    }))
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLD data={faqSchema} />
      
      <Breadcrumbs 
        items={[
          { name: 'FAQ', href: '/faq' }
        ]} 
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600">
          Get answers to common questions about small business grants and funding opportunities.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={faq.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {index + 1}. {faq.question}
            </h3>
            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-primary-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still Have Questions?</h2>
        <p className="text-gray-600 mb-6">
          Can't find the answer you're looking for? Contact us and we'll help you out.
        </p>
        <a href="/contact" className="btn-primary">
          Contact Us
        </a>
      </div>
    </div>
  )
}


