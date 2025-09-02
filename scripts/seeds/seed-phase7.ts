/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const TENANT = 'demo-tenant'

async function seedSuppliers() {
  const s1 = await prisma.supplier.upsert({ where: { code: 'SUPP-001' }, update: {}, create: { code: 'SUPP-001', tenantId: TENANT, name: 'Acme Components' } })
  const s2 = await prisma.supplier.upsert({ where: { code: 'SUPP-002' }, update: {}, create: { code: 'SUPP-002', tenantId: TENANT, name: 'Global Parts' } })
  return [s1, s2]
}

async function seedPOs(supplierId: string) {
  const po = await prisma.purchaseOrder.upsert({
    where: { number: 'PO-1001' },
    update: {},
    create: {
      number: 'PO-1001', tenantId: TENANT, supplierId, currency: 'GBP',
      lines: { create: [{ lineNo: 1, sku: 'ABC-001', qty: 100, price: 1.25 }] },
    },
  })
  return po
}

async function seedWorkOrders() {
  await prisma.workOrder.upsert({
    where: { number: 'WO-2001' },
    update: {},
    create: { number: 'WO-2001', tenantId: TENANT, itemCode: 'FG-100', quantity: 50 },
  })
}

async function seedWms() {
  const wh = await prisma.warehouse.upsert({ where: { code: 'MAIN' }, update: {}, create: { code: 'MAIN', tenantId: TENANT, name: 'Main DC' } })
  const locA1 = await prisma.location.upsert({ where: { id: 'seed-ignore-a1' }, update: { code: 'A1' }, create: { id: 'seed-ignore-a1', tenantId: TENANT, warehouseId: wh.id, code: 'A1' } })
  await prisma.asn.upsert({ where: { number: 'ASN-3001' }, update: {}, create: { number: 'ASN-3001', tenantId: TENANT, supplierRef: 'SUPP-001' } })
  await prisma.wave.upsert({ where: { number: 'WAVE-4001' }, update: {}, create: { number: 'WAVE-4001', tenantId: TENANT } })
  await prisma.inventoryItem.upsert({ where: { id: 'seed-inv-1' }, update: { qtyOnHand: 200 }, create: { id: 'seed-inv-1', tenantId: TENANT, sku: 'ABC-001', qtyOnHand: 200, warehouseId: wh.id, locationId: locA1.id } })
}

async function seedPayroll() {
  const sched = await prisma.paySchedule.upsert({ where: { id: 'seed-sched' }, update: { name: 'Monthly' }, create: { id: 'seed-sched', tenantId: TENANT, name: 'Monthly', frequency: 'monthly' } })
  const emp = await prisma.employee.upsert({ where: { empNo: 'E-100' }, update: {}, create: { empNo: 'E-100', tenantId: TENANT, firstName: 'Emma', lastName: 'Jones' } })
  await prisma.payrollRun.create({ data: { tenantId: TENANT, scheduleId: sched.id, periodStart: new Date(Date.now() - 30*86400000), periodEnd: new Date() } })
  await prisma.payslip.create({ data: { tenantId: TENANT, runId: (await prisma.payrollRun.findFirstOrThrow({ orderBy: { createdAt: 'desc' } })).id, employeeId: emp.id, grossPay: 3000, netPay: 2400 } })
}

async function seedMarketplace() {
  const ch = await prisma.channel.upsert({ where: { id: 'seed-amazon' }, update: { provider: 'amazon', name: 'Amazon UK' }, create: { id: 'seed-amazon', tenantId: TENANT, provider: 'amazon', name: 'Amazon UK', config: {} } })
  await prisma.listing.upsert({ where: { id: 'seed-listing-1' }, update: { price: 19.99 }, create: { id: 'seed-listing-1', tenantId: TENANT, channelId: ch.id, sku: 'FG-100', title: 'Finished Good 100', price: 19.99 } })
}

async function main() {
  const [s1] = await seedSuppliers()
  await seedPOs(s1.id)
  await seedWorkOrders()
  await seedWms()
  await seedPayroll()
  await seedMarketplace()
}

main().then(async () => {
  await prisma.$disconnect()
  console.log('seed-phase7 done')
}).catch(async (e) => {
  console.error('seed-phase7 error', e?.message || e)
  await prisma.$disconnect()
  process.exit(1)
})


