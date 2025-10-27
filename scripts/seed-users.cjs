const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const USERS = [
  { email: 'info@nexaai.co.uk', role: 'SUPER_ADMIN', password: 'Wolfish123' },
  { email: 'wraja1987@gmail.com', role: 'ADMIN',       password: 'Wolfish123' },
];

(async () => {
  for (const u of USERS) {
    const email = u.email.toLowerCase();
    const hash = await bcrypt.hash(u.password, 12);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.update({ where: { email }, data: { role: u.role, active: true, passwordHash: hash, emailVerified: new Date() } });
    } else {
      await prisma.user.create({ data: { email, role: u.role, active: true, passwordHash: hash, emailVerified: new Date() } });
    }
  }
  console.log('Seeded: info@nexaai.co.uk (SUPER_ADMIN) & wraja1987@gmail.com (ADMIN) with Wolfish123');
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });













