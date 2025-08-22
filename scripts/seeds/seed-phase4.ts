import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Args = { disableDemo?: boolean }

function parseArgs(): Args {
  const disableDemo = process.argv.includes('--disableDemo')
  return { disableDemo }
}

function mask(text: string, level: number): string {
  if (level <= 0) return text
  return text.replace(/[A-Za-z0-9]/g, '*')
}

async function main() {
  const args = parseArgs()

  const tenant = await prisma.tenant.upsert({
    where: { id: 't-demo' },
    create: { id: 't-demo', name: 'Demo Tenant' },
    update: {},
  })

  await prisma.entity.upsert({
    where: { id: 'e-demo' },
    create: { id: 'e-demo', tenantId: tenant.id, name: 'HQ', currencyCode: 'USD' },
    update: {},
  })

  // Plans
  const plans = ['Free', 'Standard', 'Pro', 'Enterprise']
  for (const [i, name] of plans.entries()) {
    await prisma.plan.upsert({
      where: { code: `plan_${i}` },
      create: { code: `plan_${i}`, name, tier: name, active: true },
      update: {},
    })
  }

  // DemoDataVisibility for a superadmin
  const visibleUntil = new Date(Date.now() + 14 * 24 * 3600 * 1000)
  await prisma.demoDataVisibility.upsert({
    where: { id: 'vis-admin1' },
    create: { id: 'vis-admin1', tenantId: tenant.id, adminUserId: 'admin-1', visibleUntil, maskLevel: 1 },
    update: { visibleUntil },
  })

  if (!args.disableDemo) {
    // Subscriptions
    const plan = await prisma.plan.findFirstOrThrow()
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: plan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    })

    // Usage events (≥100)
    const now = Date.now()
    const events = Array.from({ length: 120 }).map((_, idx) => ({
      tenantId: tenant.id,
      type: idx % 3 === 0 ? 'api' : 'task',
      quantity: (idx % 5) + 1,
      at: new Date(now - idx * 24 * 3600 * 1000 / 6),
      metadata: { edge: idx % 37 === 0 },
    }))
    await prisma.usageEvent.createMany({ data: events })

    // Invoice with fixed hash placeholder
    await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        number: 'INV-DEMO-0001',
        pdfHash: '8a72462281b6dd8de026f3ca7ab870dfb81425fa6227a37789e526aea7d41673',
        total: 100,
        currencyCode: 'USD',
        issuedAt: new Date(now - 3 * 24 * 3600 * 1000),
        dueAt: new Date(now + 27 * 24 * 3600 * 1000),
        status: 'open',
      },
    })

    // API keys
    await prisma.apiKey.createMany({
      data: [
        { tenantId: tenant.id, label: 'Primary', status: 'active', rateLimitPerMin: 60, burst: 120, ipAllowlist: ['127.0.0.1'], secretHash: mask('s1', 1) },
        { tenantId: tenant.id, label: 'Rotating', status: 'rotating', rateLimitPerMin: 30, burst: 60, ipAllowlist: [], secretHash: mask('s2', 1) },
        { tenantId: tenant.id, label: 'Revoked', status: 'revoked', rateLimitPerMin: 0, burst: 0, ipAllowlist: [], secretHash: mask('s3', 1) },
      ] as any,
    })

    // Monitoring jobs
    await prisma.backupJob.createMany({
      data: [
        { tenantId: tenant.id, ranAt: new Date(now - 86400000 * 3), ok: true, summary: 'Nightly OK' },
        { tenantId: tenant.id, ranAt: new Date(now - 86400000 * 2), ok: false, summary: 'Network fail' },
        { tenantId: tenant.id, ranAt: new Date(now - 86400000 * 1), ok: true, summary: 'Nightly OK' },
        { tenantId: tenant.id, ranAt: new Date(now - 86400000 * 4), ok: false, summary: 'Disk full' },
        { tenantId: tenant.id, ranAt: new Date(now - 86400000 * 5), ok: true, summary: 'Nightly OK' },
        { tenantId: tenant.id, ranAt: new Date(now - 86400000 * 6), ok: false, summary: 'Credentials' },
      ],
    })

    await prisma.drDrill.create({
      data: { tenantId: tenant.id, ranAt: new Date(now - 10 * 86400000), ok: true, restoredCounts: { invoices: 1 }, notes: 'Quarterly DR drill' },
    })

    await prisma.siemExportBatch.create({
      data: { tenantId: tenant.id, createdAt: new Date(), filePath: '/tmp/siem.ndjson', recordCount: 3, sha256: '1d47fae7161851a5a3da3c6b79b647288262603da0202c9a6ef19a2e24cfdc1e' },
    })

    // AI suggestions (10)
    for (let i = 0; i < 10; i++) {
      await prisma.notification.create({ data: { tenantId: tenant.id, type: 'ai-tip', body: `Tip ${i + 1}`, readAt: null } })
    }
  }

  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


