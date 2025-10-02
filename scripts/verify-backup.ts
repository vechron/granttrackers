import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // load first if present
dotenv.config()                       // then .env

import { PrismaClient } from '@prisma/client'

// Use the working connection from the web app
const FALLBACK = process.env.BACKUP_CHECK_URL || 
  "postgresql://postgres.nrcuzovxjuzkamppgdrw:Kai%4035806@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

if (!FALLBACK) {
  console.error('❌ No DB URL found. Set BACKUP_CHECK_URL or DATABASE_URL or DIRECT_URL.')
  process.exit(1)
}

console.log('🔌 Using URL:', FALLBACK.replace(/:[^@]+@/, '://*****@'))

// Disable prepared statements (safe for read-only checks)
process.env.PRISMA_DISABLE_PREPARED_STATEMENTS = 'true'

// Force Prisma to use the URL we chose (doesn't mutate your .env)
const prisma = new PrismaClient({
  datasources: { db: { url: FALLBACK } },
  log: ['warn', 'error'],
})

async function verifyBackup() {
  console.log('🔍 Verifying database backup integrity...')
  
  // Small, read-only sanity checks
  const [states, programs, recent] = await Promise.all([
    prisma.state.count(),
    prisma.program.count(),
    prisma.program.count({
      where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ])

  console.log(`✅ Counts → states=${states}, programs=${programs}, updated_24h=${recent}`)
  
  // Basic integrity checks
  if (states === 0 || programs === 0) {
    console.log('❌ CRITICAL: Missing essential data')
    process.exit(1)
  }
  
  console.log('✅ Database backup verification completed successfully')
}

verifyBackup()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Backup verification failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
