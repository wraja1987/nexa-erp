import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findOrCreateDemoTenant() {
  const tenantName = "Nexa Demo";
  const existing = await prisma.tenant.findFirst({ where: { name: tenantName } });
  if (existing) return existing;
  return prisma.tenant.create({ data: { name: tenantName } });
}

async function ensureDemoAdminUser(tenantId: string) {
  const email = "nexaaierp@gmail.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    return prisma.user.create({
      data: {
        email,
        tenant_id: tenantId,
        role: "owner",
        active: true,
      },
    });
  }
  if (existing.tenant_id !== tenantId || existing.role !== "owner" || !existing.active) {
    return prisma.user.update({
      where: { email },
      data: { tenant_id: tenantId, role: "owner", active: true },
    });
  }
  return existing;
}

async function insertLightSampleData(tenantId: string) {
  // Finance: minimal COA account
  await prisma.account.upsert({
    where: { tenantId_code: { tenantId, code: "1000" } },
    update: {},
    create: { tenantId, code: "1000", name: "Cash", type: "asset" },
  });

  // AR: one customer invoice (note: number unique globally in current schema)
  await prisma.customerInvoice.upsert({
    where: { number: "INV-0001" },
    update: {},
    create: {
      tenantId,
      number: "INV-0001",
      customerId: "CUST-001",
      currency: "GBP",
      total: "199",
      status: "draft",
      issuedAt: new Date(),
      dueAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });

  // Inventory: one item with on-hand qty
  const sku = "DEMO-001";
  const existingItem = await prisma.inventoryItem.findFirst({ where: { tenantId, sku } });
  if (!existingItem) {
    await prisma.inventoryItem.create({
      data: { tenantId, sku, qtyOnHand: "50" },
    });
  } else if (existingItem.qtyOnHand.toString() !== "50") {
    await prisma.inventoryItem.update({
      where: { id: existingItem.id },
      data: { qtyOnHand: "50" },
    });
  }
}

async function main() {
  const tenant = await findOrCreateDemoTenant();
  console.log("✓ Demo tenant ready:", tenant.name);

  const user = await ensureDemoAdminUser(tenant.id);
  console.log("✓ Demo user ready:", user.email, "(role:", user.role + ")");

  await insertLightSampleData(tenant.id);
  console.log("✓ Sample data inserted (Account, CustomerInvoice, InventoryItem).");

  console.log("\nAll done. You can sign in with email:", "nexaaierp@gmail.com");
  console.log("Note: No password field exists in current User schema; your auth flow may be magic-link or external IdP.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




