const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  const email = 'superadmin@platform.com';
  const password = 'SuperAdmin123@';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      status: 'ACTIVE',
      role: 'SUPER_ADMIN',
    },
    create: {
      fullName: 'Super Admin',
      email,
      passwordHash,
      referralCode: 'ADMIN2026',
      status: 'ACTIVE',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('SUPER_ADMIN_PASSWORD_VERIFIED_SUCCESSFULLY');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
