import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load env from root and app .env.local if present
try { dotenv.config({ path: path.resolve(__dirname, '../../.env.local') }) } catch {}
try { dotenv.config({ path: path.resolve(__dirname, '../../../.env') }) } catch {}

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@nexa.local'
  const name = 'Admin'
  const password = 'NexaAdmin!123'
  const hash = await bcrypt.hash(password, 10)

  // Detect password column
  const userModel = (prisma as any)._dmmf?.modelMap?.User
  const fields: string[] = userModel ? userModel.fields.map((f: any)=>f.name) : []
  const passwordField = fields.includes('passwordHash') ? 'passwordHash' : (fields.includes('hashedPassword') ? 'hashedPassword' : null)
  if (!passwordField) {
    console.log('Could not detect password field. Expected one of: passwordHash, hashedPassword')
    return
  }

  // Upsert
  const data: Record<string, any> = { email, name }
  data[passwordField] = hash
  if (fields.includes('role')) data['role'] = 'ADMIN'

  const user = await prisma.user.upsert({
    where: { email },
    update: data,
    create: data,
  })

  console.log(`Seeded admin user: ${user.email}`)
}

main().finally(async ()=>{
  await prisma.$disconnect()
})


