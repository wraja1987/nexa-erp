import { PrismaClient } from '@prisma/client'
import path from 'path'
import dotenv from 'dotenv'

// Load env from root and app .env.local if present
try { dotenv.config({ path: path.resolve(__dirname, '../../.env.local') }) } catch {}
try { dotenv.config({ path: path.resolve(__dirname, '../../../.env') }) } catch {}

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@nexa.local'
  // Upsert minimal fields supported by current schema
  const data = {
    tenant_id: 't1',
    email,
    role: 'ADMIN',
  } as const

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: data as any,
  })

  console.log(`Seeded/ensured admin user: ${user.email}`)
}

main().finally(async ()=>{
  await prisma.$disconnect()
})






