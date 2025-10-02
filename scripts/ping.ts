import { prisma } from '../lib/prisma'

async function main() {
  const states = await prisma.state.findMany({ take: 3, orderBy: { name: 'asc' } })
  console.log('OK states:', states.map(s => s.name))
}
main().catch((e) => { console.error(e); process.exit(1) })
