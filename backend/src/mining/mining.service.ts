import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ContractStatus, TransactionType, TransactionStatus } from '../common/types/enums';

@Injectable()
export class MiningService {
  private readonly logger = new Logger(MiningService.name);

  constructor(private prisma: PrismaService) {}

  private async getSystemRewardRate(): Promise<number> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'REWARD_RATE' },
    });
    if (setting && setting.value) {
      return parseFloat(setting.value);
    }
    return 0.0001; // Default rate: 0.0001 USDT per MH/s per day
  }

  /**
   * Cron Job running every hour to distribute hourly mining rewards
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyMiningRewardDistribution() {
    this.logger.log('Starting automated hourly mining reward distribution...');
    return this.processMiningRewards();
  }

  /**
   * Process rewards calculation for all active non-expired contracts
   */
  async processMiningRewards() {
    const rewardRatePerDay = await this.getSystemRewardRate();
    const hourlyRewardRate = rewardRatePerDay / 24;

    const now = new Date();
    const activeContracts = await this.prisma.miningContract.findMany({
      where: {
        status: ContractStatus.ACTIVE,
        endDate: { gte: now },
      },
    });

    if (activeContracts.length === 0) {
      this.logger.log('No active contracts found for reward calculation.');
      return { processedCount: 0, totalAmountDistributed: 0 };
    }

    let processedCount = 0;
    let totalAmountDistributed = 0;

    for (const contract of activeContracts) {
      const rewardAmount = parseFloat((contract.hashrate * hourlyRewardRate).toFixed(6));
      if (rewardAmount <= 0) continue;

      await this.prisma.$transaction(async (tx) => {
        // 1. Credit mining balance in user's wallet
        await tx.wallet.update({
          where: { userId: contract.userId },
          data: {
            miningBalance: { increment: rewardAmount },
            availableBalance: { increment: rewardAmount },
          },
        });

        // 2. Increment contract total earned
        await tx.miningContract.update({
          where: { id: contract.id },
          data: {
            totalEarned: { increment: rewardAmount },
          },
        });

        // 3. Log mining reward
        await tx.miningReward.create({
          data: {
            userId: contract.userId,
            contractId: contract.id,
            hashrate: contract.hashrate,
            rewardRate: rewardRatePerDay,
            amount: rewardAmount,
          },
        });

        // 4. Log master ledger transaction
        await tx.transaction.create({
          data: {
            userId: contract.userId,
            type: TransactionType.MINING_REWARD,
            amount: rewardAmount,
            status: TransactionStatus.COMPLETED,
            referenceId: contract.id,
            description: `Hourly mining yield output (${contract.hashrate} MH/s)`,
          },
        });

        // 5. Update Global Statistics
        await tx.platformStatistics.upsert({
          where: { id: 1 },
          update: { totalPaidRewardsUsdt: { increment: rewardAmount } },
          create: { id: 1, totalPaidRewardsUsdt: rewardAmount },
        });
      });

      processedCount++;
      totalAmountDistributed += rewardAmount;
    }

    this.logger.log(
      `Mining reward run completed: ${processedCount} contracts processed, ${totalAmountDistributed.toFixed(
        4,
      )} USDT distributed.`,
    );

    return {
      processedCount,
      totalAmountDistributed,
      rewardRatePerDay,
    };
  }

  async getMiningPerformanceChart(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const rewards = await this.prisma.miningReward.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    const dailyEarningsMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyEarningsMap.set(dateStr, 0);
    }

    for (const reward of rewards) {
      const dateStr = reward.createdAt.toISOString().split('T')[0];
      const current = dailyEarningsMap.get(dateStr) || 0;
      dailyEarningsMap.set(dateStr, current + Number(reward.amount));
    }

    const chartData = Array.from(dailyEarningsMap.entries()).map(([date, amount]) => ({
      date,
      amount: parseFloat(amount.toFixed(4)),
    }));

    return chartData;
  }

  async getMiningHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      this.prisma.miningReward.count({ where: { userId } }),
      this.prisma.miningReward.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          contract: { select: { planName: true, contractCode: true } },
        },
      }),
    ]);

    return { total, page, limit, totalPages: Math.ceil(total / limit), data };
  }
}
