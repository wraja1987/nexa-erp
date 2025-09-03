import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tenantId = 't1'
  const list = [
    { empNo: 'E1001', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
    { empNo: 'E1002', firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' },
  ]
  for (const e of list) {
    await prisma.employee.upsert({
      where: { empNo: e.empNo },
      update: { firstName: e.firstName, lastName: e.lastName, email: e.email, tenantId },
      create: { tenantId, empNo: e.empNo, firstName: e.firstName, lastName: e.lastName, email: e.email },
    })
  }
  console.log('Seeded employees:', list.length)
}

main().finally(()=>prisma.$disconnect())


