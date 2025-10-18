import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const emails = ['info@nexaai.co.uk','wraja1987@gmail.com']

async function run(){
  for(const email of emails){
    await prisma.user.updateMany({
      where: { email },
      data: { mustChangePassword: true as any, mfaEnforced: true as any }
    })
  }
  console.log('Auth flags enforced for admins.')
}

run().finally(()=>prisma.$disconnect())


