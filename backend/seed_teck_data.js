const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({
    where: { email: 'teck@gmail.com' },
    include: { wallet: true },
  });

  if (!user) {
    console.error('User teck@gmail.com not found!');
    return;
  }

  // 1. Update Wallet Balances to attractive realistic amounts
  await prisma.wallet.update({
    where: { userId: user.id },
    data: {
      availableBalance: 450.0,
      miningBalance: 1250.0,
      pendingBalance: 65.0,
    },
  });
  console.log('Wallet updated: Available 450 USDT, Mining 1250 USDT, Pending 65 USDT.');

  // 2. Clear existing withdrawals for teck@gmail.com if any
  await prisma.withdrawal.deleteMany({ where: { userId: user.id } });

  // 3. Seed 4 realistic TRC20 withdrawals
  const now = new Date();
  const withdrawalsData = [
    {
      userId: user.id,
      amount: 50.0,
      fee: 1.0,
      netAmount: 49.0,
      walletAddress: 'TX73CSgKBtnu5kKJaX6AcGMVphD6Wg61An',
      network: 'TRC20',
      txHash: '3a8f9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
      status: 'COMPLETED',
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      amount: 120.0,
      fee: 1.0,
      netAmount: 119.0,
      walletAddress: 'TX73CSgKBtnu5kKJaX6AcGMVphD6Wg61An',
      network: 'TRC20',
      txHash: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      status: 'COMPLETED',
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      amount: 80.0,
      fee: 1.0,
      netAmount: 79.0,
      walletAddress: 'TX73CSgKBtnu5kKJaX6AcGMVphD6Wg61An',
      network: 'TRC20',
      txHash: '1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
      status: 'COMPLETED',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      amount: 65.0,
      fee: 1.0,
      netAmount: 64.0,
      walletAddress: 'TX73CSgKBtnu5kKJaX6AcGMVphD6Wg61An',
      network: 'TRC20',
      txHash: null,
      status: 'PENDING',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  ];

  for (const w of withdrawalsData) {
    const createdW = await prisma.withdrawal.create({ data: w });
    // Also create matching ledger transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'WITHDRAWAL',
        amount: -w.amount,
        status: w.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        referenceId: createdW.id,
        description: `USDT TRC20 Withdrawal payout to ${w.walletAddress.substring(0, 10)}...`,
        createdAt: w.createdAt,
      },
    });
  }

  console.log('4 realistic withdrawals and matching transaction ledgers created successfully for teck@gmail.com!');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
