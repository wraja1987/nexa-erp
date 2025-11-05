import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'

// Load DATABASE_URL from the same environment as the app
function loadEnv() {
  const envPaths = [
    path.resolve(process.cwd(), 'apps/web/.env.local'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'apps/web/.env'),
    path.resolve(process.cwd(), '.env'),
  ]
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const t = fs.readFileSync(p, 'utf8')
      const m = t.match(/^DATABASE_URL=(.+)$/m)
      if (m) process.env.DATABASE_URL = m[1].trim().replace(/^"|"$/g, '')
    }
  }
}

async function main() {
  loadEnv()
  const prisma = new PrismaClient()
  const email = process.env.NEXA_NEW_EMAIL || 'sayeedr222@gmail.com'
  const password = process.env.NEXA_NEW_PASSWORD || 'Wolfish123'
  const role = (process.env.NEXA_NEW_ROLE || 'STAFF').toUpperCase()
  const tenantName = process.env.NEXA_TENANT || 'Master'

  console.log('[upsertUser] Target tenant:', tenantName)
  let tenant = null as null | { id: string }
  try {
    tenant = await (prisma as any).tenant?.findFirst?.({ where: { name: tenantName } })
      || await (prisma as any).tenant?.findFirst?.({ where: { name: 'Demo' } })
  } catch {}
  if (!tenant) {
    // Fallback when Tenant table is not present in the live DB
    tenant = { id: process.env.NEXA_FALLBACK_TENANT_ID || '00000000-0000-0000-0000-000000000001' }
    console.log('[upsertUser] Tenant table missing; using fallback tenantId:', tenant.id)
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.upsert({
    where: { email },
    update: { password_hash: hashed as any, tenantId: tenant.id, role, active: true } as any,
    create: {
      email,
      password_hash: hashed as any,
      name: 'Sayeed R',
      tenantId: tenant.id,
      role,
      active: true,
    } as any,
  })
  console.log('[upsertUser] Upserted:', user.email, 'tenant:', tenant.id, 'role:', role)
  await prisma.$disconnect()
}

main().catch((e)=>{ console.error(e); process.exit(1) })


