import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Cloud Mining Platform initial database records...');

  // 1. Seed Super Admin Account
  const superAdminEmail = 'superadmin@platform.com';
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const passwordHash = await bcrypt.hash('SuperAdmin123@', 10);
    const superAdmin = await prisma.user.create({
      data: {
        fullName: 'Super Admin',
        email: superAdminEmail,
        passwordHash,
        role: 'SUPER_ADMIN',
        referralCode: 'SUPERADMIN',
      },
    });

    await prisma.wallet.create({
      data: {
        userId: superAdmin.id,
        availableBalance: 10000.0,
        miningBalance: 0.0,
        pendingBalance: 0.0,
        currency: 'USDT',
      },
    });

    console.log(`Super Admin created: ${superAdminEmail} / SuperAdmin123@`);
  }

  // 2. Clear old plans and Seed Exact Updated Plans
  const plansCount = await prisma.miningPlan.count();
  if (plansCount === 0) {
    await prisma.miningPlan.createMany({
      data: [
        {
          name: 'Free Trial',
          price: 0.0,
          hashrate: 20,
          durationDays: 30,
          description: 'Free trial contract (≈ 0.50 - 1.00 USDT expected yield). 1 claim per account.',
          status: 'ACTIVE',
        },
        {
          name: 'Starter',
          price: 5.0,
          hashrate: 100,
          durationDays: 30,
          description: 'Starter contract (≈ 6.00 - 7.00 USDT expected yield). Daily automated payouts.',
          status: 'ACTIVE',
        },
        {
          name: 'Pro',
          price: 10.0,
          hashrate: 700,
          durationDays: 30,
          description: 'Pro contract (≈ 11.50 - 14.00 USDT expected yield). Hourly reward updates & priority queue.',
          status: 'ACTIVE',
        },
        {
          name: 'Premium',
          price: 20.0,
          hashrate: 4500,
          durationDays: 30,
          description: 'Premium contract (≈ 24.00 - 30.00 USDT expected yield). Maximum mining capacity & VIP support.',
          status: 'ACTIVE',
        },
      ],
    });
  }

  // 3. Seed System Settings with TF73CSgKBtnu5kKJaX6AcGMVphD6Wg61An RECEIVER ADDRESS
  const settings = [
    { key: 'REWARD_RATE', value: '0.0001', description: 'Daily USDT output yield per MH/s' },
    { key: 'MIN_WITHDRAWAL_AMOUNT', value: '5.0', description: 'Minimum withdrawal amount in USDT' },
    { key: 'WITHDRAWAL_FEE', value: '1.0', description: 'Flat TRC20 network fee in USDT' },
    { key: 'PLATFORM_TRC20_RECEIVER_ADDRESS', value: 'TF73CSgKBtnu5kKJaX6AcGMVphD6Wg61An', description: 'Platform deposit receiver wallet address' },
    { key: 'PLATFORM_PAYOUT_SENDER_ADDRESS', value: 'DK73CSgKBtnu5kKJaX6AcGMVphD6Wg37Am', description: 'Platform official payout sender wallet address' },
    { key: 'REQUIRED_BLOCK_CONFIRMATIONS', value: '20', description: 'Required TRON network confirmations' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }
  console.log('System settings seeded with TF73CSgKBtnu5kKJaX6AcGMVphD6Wg61An RECEIVER ADDRESS.');

  // 4. Initialize Platform Statistics
  await prisma.platformStatistics.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      totalUsers: 1,
      totalHashrateMhs: BigInt(0),
      totalPaidRewardsUsdt: 0.0,
      activeContractsCount: 0,
      completedWithdrawalsCount: 0,
    },
  });
  console.log('Platform statistics initialized.');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
