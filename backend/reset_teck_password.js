const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  const email = 'teck@gmail.com';
  const password = 'Hhaall112233$$';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      status: 'ACTIVE',
    },
    create: {
      fullName: 'Hassan Barafah',
      email,
      passwordHash,
      referralCode: 'TECK2026',
      status: 'ACTIVE',
      role: 'USER',
    },
  });

  // Ensure wallet exists
  await prisma.wallet.upsert({
    where: { userId: user.id },
    update: {
      availableBalance: 35.0,
      miningBalance: 1250.0,
      pendingBalance: 0.0,
    },
    create: {
      userId: user.id,
      availableBalance: 35.0,
      miningBalance: 1250.0,
      pendingBalance: 0.0,
    },
  });

  console.log('TECK_PASSWORD_RESET_AND_VERIFIED_SUCCESSFULLY');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
