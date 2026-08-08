import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardOverviewStats() {
    const [
      totalUsersCount,
      activeContractsCount,
      totalDepositsSum,
      totalWithdrawalsSum,
      totalPaidRewardsSum,
      totalHashrateSum,
      recentActivityLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.miningContract.count({ where: { status: 'ACTIVE' } }),
      this.prisma.deposit.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { amount: true },
      }),
      this.prisma.withdrawal.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.miningReward.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.miningContract.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { hashrate: true },
      }),
      this.prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: {
          user: { select: { fullName: true, email: true } },
        },
      }),
    ]);

    const totalDeposits = totalDepositsSum._sum.amount
      ? parseFloat(Number(totalDepositsSum._sum.amount).toFixed(2))
      : 0;
    const totalWithdrawals = totalWithdrawalsSum._sum.amount
      ? parseFloat(Number(totalWithdrawalsSum._sum.amount).toFixed(2))
      : 0;
    const totalPaidRewards = totalPaidRewardsSum._sum.amount
      ? parseFloat(Number(totalPaidRewardsSum._sum.amount).toFixed(2))
      : 0;
    const totalHashrateMhs = totalHashrateSum._sum.hashrate || 0;

    return {
      totalUsers: totalUsersCount,
      activeContracts: activeContractsCount,
      totalDeposits,
      totalWithdrawals,
      totalPaidRewards,
      totalHashrateMhs,
      recentActivity: recentActivityLogs,
    };
  }

  async getAuditLogs(page = 1, limit = 25) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          admin: { select: { fullName: true, email: true } },
          targetUser: { select: { fullName: true, email: true } },
        },
      }),
    ]);

    return { total, page, limit, totalPages: Math.ceil(total / limit), data };
  }

  async getSystemSettings() {
    const settings = await this.prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return {
      REWARD_RATE: settingsMap['REWARD_RATE'] || '0.0001',
      MIN_WITHDRAWAL_AMOUNT: settingsMap['MIN_WITHDRAWAL_AMOUNT'] || '5.0',
      WITHDRAWAL_FEE: settingsMap['WITHDRAWAL_FEE'] || '1.0',
      PLATFORM_TRC20_RECEIVER_ADDRESS:
        settingsMap['PLATFORM_TRC20_RECEIVER_ADDRESS'] || 'TF73CSgKBtnu5kKJaX6AcGMVphD6Wg61An',
      PLATFORM_PAYOUT_SENDER_ADDRESS:
        settingsMap['PLATFORM_PAYOUT_SENDER_ADDRESS'] || 'DK73CSgKBtnu5kKJaX6AcGMVphD6Wg37Am',
      REQUIRED_BLOCK_CONFIRMATIONS: settingsMap['REQUIRED_BLOCK_CONFIRMATIONS'] || '20',
    };
  }

  async updateSystemSetting(key: string, value: string, description?: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }

  async sendNotification(userId: string | null, title: string, message: string, type: any) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'SYSTEM',
      },
    });
  }
}
