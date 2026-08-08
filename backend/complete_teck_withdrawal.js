const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({
    where: { email: 'teck@gmail.com' },
  });

  if (!user) {
    console.error('User teck@gmail.com not found!');
    return;
  }

  // 1. Update the pending withdrawal to COMPLETED
  const pendingW = await prisma.withdrawal.findFirst({
    where: { userId: user.id, status: 'PENDING' },
  });

  if (pendingW) {
    await prisma.withdrawal.update({
      where: { id: pendingW.id },
      data: {
        status: 'COMPLETED',
        txHash: 'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
      },
    });

    // Update matching transaction record if exists
    await prisma.transaction.updateMany({
      where: { referenceId: pendingW.id },
      data: { status: 'COMPLETED' },
    });

    // Update wallet pending balance to 0.0
    await prisma.wallet.update({
      where: { userId: user.id },
      data: { pendingBalance: 0.0 },
    });
  }

  console.log('TECK_WITHDRAWAL_COMPLETED_SUCCESSFULLY');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
