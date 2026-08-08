import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async getUserReferralDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    const [totalReferralsCount, activeReferralsCount, totalCommissionSum, referralLogs] =
      await Promise.all([
        this.prisma.user.count({ where: { referredById: userId } }),
        this.prisma.user.count({
          where: {
            referredById: userId,
            contracts: { some: { status: 'ACTIVE' } },
          },
        }),
        this.prisma.referral.aggregate({
          where: { referrerId: userId },
          _sum: { commissionAmount: true },
        }),
        this.prisma.referral.findMany({
          where: { referrerId: userId },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            referredUser: { select: { fullName: true, email: true } },
            contract: { select: { planName: true, pricePaid: true } },
          },
        }),
      ]);

    const totalCommission = totalCommissionSum._sum.commissionAmount
      ? parseFloat(Number(totalCommissionSum._sum.commissionAmount).toFixed(6))
      : 0;

    return {
      referralCode: user?.referralCode || '',
      referralLink: `https://cloudmining.com/register?ref=${user?.referralCode || ''}`,
      totalReferrals: totalReferralsCount,
      activeReferrals: activeReferralsCount,
      totalCommission,
      commissionLogs: referralLogs.map((log) => ({
        id: log.id,
        referredUserMaskedName: log.referredUser.fullName.split(' ')[0] + ' ****',
        level: log.level,
        commissionAmount: log.commissionAmount,
        planName: log.contract?.planName || 'N/A',
        createdAt: log.createdAt,
      })),
    };
  }
}
