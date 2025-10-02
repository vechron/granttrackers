import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const states = [
  { name: 'Alabama', code: 'AL', slug: 'alabama', population: 5024279 },
  { name: 'Alaska', code: 'AK', slug: 'alaska', population: 733391 },
  { name: 'Arizona', code: 'AZ', slug: 'arizona', population: 7151502 },
  { name: 'Arkansas', code: 'AR', slug: 'arkansas', population: 3011524 },
  { name: 'California', code: 'CA', slug: 'california', population: 39538223 },
  { name: 'Colorado', code: 'CO', slug: 'colorado', population: 5773714 },
  { name: 'Connecticut', code: 'CT', slug: 'connecticut', population: 3605944 },
  { name: 'Delaware', code: 'DE', slug: 'delaware', population: 989948 },
  { name: 'Florida', code: 'FL', slug: 'florida', population: 21538187 },
  { name: 'Georgia', code: 'GA', slug: 'georgia', population: 10711908 },
  { name: 'Hawaii', code: 'HI', slug: 'hawaii', population: 1455271 },
  { name: 'Idaho', code: 'ID', slug: 'idaho', population: 1839106 },
  { name: 'Illinois', code: 'IL', slug: 'illinois', population: 12812508 },
  { name: 'Indiana', code: 'IN', slug: 'indiana', population: 6785528 },
  { name: 'Iowa', code: 'IA', slug: 'iowa', population: 3190369 },
  { name: 'Kansas', code: 'KS', slug: 'kansas', population: 2937880 },
  { name: 'Kentucky', code: 'KY', slug: 'kentucky', population: 4505836 },
  { name: 'Louisiana', code: 'LA', slug: 'louisiana', population: 4657757 },
  { name: 'Maine', code: 'ME', slug: 'maine', population: 1344212 },
  { name: 'Maryland', code: 'MD', slug: 'maryland', population: 6177224 },
  { name: 'Massachusetts', code: 'MA', slug: 'massachusetts', population: 6892503 },
  { name: 'Michigan', code: 'MI', slug: 'michigan', population: 10037261 },
  { name: 'Minnesota', code: 'MN', slug: 'minnesota', population: 5706494 },
  { name: 'Mississippi', code: 'MS', slug: 'mississippi', population: 2961279 },
  { name: 'Missouri', code: 'MO', slug: 'missouri', population: 6154913 },
  { name: 'Montana', code: 'MT', slug: 'montana', population: 1084225 },
  { name: 'Nebraska', code: 'NE', slug: 'nebraska', population: 1961504 },
  { name: 'Nevada', code: 'NV', slug: 'nevada', population: 3104614 },
  { name: 'New Hampshire', code: 'NH', slug: 'new-hampshire', population: 1377529 },
  { name: 'New Jersey', code: 'NJ', slug: 'new-jersey', population: 9288994 },
  { name: 'New Mexico', code: 'NM', slug: 'new-mexico', population: 2117522 },
  { name: 'New York', code: 'NY', slug: 'new-york', population: 20201249 },
  { name: 'North Carolina', code: 'NC', slug: 'north-carolina', population: 10439388 },
  { name: 'North Dakota', code: 'ND', slug: 'north-dakota', population: 779094 },
  { name: 'Ohio', code: 'OH', slug: 'ohio', population: 11799448 },
  { name: 'Oklahoma', code: 'OK', slug: 'oklahoma', population: 3959353 },
  { name: 'Oregon', code: 'OR', slug: 'oregon', population: 4237256 },
  { name: 'Pennsylvania', code: 'PA', slug: 'pennsylvania', population: 13002700 },
  { name: 'Rhode Island', code: 'RI', slug: 'rhode-island', population: 1097379 },
  { name: 'South Carolina', code: 'SC', slug: 'south-carolina', population: 5118425 },
  { name: 'South Dakota', code: 'SD', slug: 'south-dakota', population: 886667 },
  { name: 'Tennessee', code: 'TN', slug: 'tennessee', population: 6910840 },
  { name: 'Texas', code: 'TX', slug: 'texas', population: 29145505 },
  { name: 'Utah', code: 'UT', slug: 'utah', population: 3271616 },
  { name: 'Vermont', code: 'VT', slug: 'vermont', population: 643077 },
  { name: 'Virginia', code: 'VA', slug: 'virginia', population: 8631393 },
  { name: 'Washington', code: 'WA', slug: 'washington', population: 7705281 },
  { name: 'West Virginia', code: 'WV', slug: 'west-virginia', population: 1793716 },
  { name: 'Wisconsin', code: 'WI', slug: 'wisconsin', population: 5893718 },
  { name: 'Wyoming', code: 'WY', slug: 'wyoming', population: 576851 },
]

const samplePrograms = [
  {
    title: 'Small Business Development Grant',
    description: 'Funding to support small business growth and development initiatives.',
    amount: 'Up to $25,000',
    url: 'https://example.com/apply',
  },
  {
    title: 'Women-Owned Business Grant',
    description: 'Specialized funding for women entrepreneurs to start or expand their businesses.',
    amount: 'Up to $50,000',
    url: 'https://example.com/apply',
  },
  {
    title: 'Rural Business Development Grant',
    description: 'Support for businesses in rural areas to promote economic development.',
    amount: 'Up to $75,000',
    url: 'https://example.com/apply',
  },
  {
    title: 'Technology Innovation Grant',
    description: 'Funding for tech startups and innovative business solutions.',
    amount: 'Up to $100,000',
    url: 'https://example.com/apply',
  },
  {
    title: 'Minority Business Grant',
    description: 'Support for minority-owned businesses to promote diversity and inclusion.',
    amount: 'Up to $40,000',
    url: 'https://example.com/apply',
  },
]

const faqs = [
  {
    question: 'What types of grants are available for small businesses?',
    answer: 'Small business grants come in various forms including federal grants, state grants, local government grants, and private foundation grants. These can cover areas like business development, technology innovation, women-owned businesses, minority-owned businesses, and rural business development.',
  },
  {
    question: 'How do I apply for a small business grant?',
    answer: 'Each grant has its own application process, but generally you\'ll need to complete an application form, provide business documentation, create a business plan, and demonstrate how the grant will be used. Always check the specific requirements for each grant program.',
  },
  {
    question: 'What are the eligibility requirements for small business grants?',
    answer: 'Eligibility varies by grant program but commonly includes factors like business size (usually under 500 employees), business type, location, ownership demographics, and the intended use of funds. Some grants are specifically for certain industries or business stages.',
  },
  {
    question: 'When are grant application deadlines?',
    answer: 'Grant deadlines vary significantly by program. Some grants have rolling deadlines, others have specific annual deadlines, and some are only available during certain periods. It\'s important to check each grant\'s specific deadline and application timeline.',
  },
  {
    question: 'Can I apply for multiple grants at the same time?',
    answer: 'Yes, you can typically apply for multiple grants simultaneously, as long as you meet each program\'s eligibility requirements. However, be aware that some grants may have restrictions on receiving multiple sources of funding for the same project.',
  },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.program.deleteMany()
  await prisma.state.deleteMany()
  await prisma.fAQ.deleteMany()

  // Create states
  console.log('📍 Creating states...')
  for (const stateData of states) {
    await prisma.state.create({
      data: {
        ...stateData,
        description: `Small business grants and funding opportunities in ${stateData.name}`,
      },
    })
  }

  // Create sample programs for each state
  console.log('💼 Creating sample programs...')
  const createdStates = await prisma.state.findMany()
  
  for (const state of createdStates) {
    const randomProgram = samplePrograms[Math.floor(Math.random() * samplePrograms.length)]
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 365))
    
    await prisma.program.create({
      data: {
        title: `${randomProgram.title} - ${state.name}`,
        slug: `${state.slug}-${randomProgram.title.toLowerCase().replace(/\s+/g, '-')}`,
        description: `${randomProgram.description} Available to businesses in ${state.name}.`,
        amount: randomProgram.amount,
        deadline,
        url: randomProgram.url,
        stateId: state.id,
        featured: Math.random() > 0.7, // 30% chance of being featured
        metaTitle: `${randomProgram.title} in ${state.name} (2025)`,
        metaDescription: `Apply for ${randomProgram.title} in ${state.name}. ${randomProgram.amount} available. Deadline: ${deadline.toLocaleDateString()}.`,
      },
    })
  }

  // Create FAQs
  console.log('❓ Creating FAQs...')
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i]
    await prisma.fAQ.create({
      data: {
        ...faq,
        order: i,
      },
    })
  }

  console.log('✅ Seed completed!')
  console.log(`📍 Created ${states.length} states`)
  console.log(`💼 Created ${states.length} sample programs`)
  console.log(`❓ Created ${faqs.length} FAQs`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


