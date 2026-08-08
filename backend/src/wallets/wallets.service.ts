import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async getUserWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          availableBalance: 0.0,
          miningBalance: 0.0,
          pendingBalance: 0.0,
          currency: 'USDT',
        },
      });
    }

    return wallet;
  }

  async getUserTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      this.prisma.transaction.count({ where: { userId } }),
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async getLatestPublicTransactions(limit = 10) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        type: { in: ['DEPOSIT', 'WITHDRAWAL'] },
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { fullName: true },
        },
      },
    });

    return transactions.map((tx) => {
      const nameParts = tx.user.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastNameInitial = nameParts[1] ? ` ${nameParts[1][0]}****` : '';
      const maskedName = `${firstName}${lastNameInitial}`;

      return {
        id: tx.id,
        userMaskedName: maskedName,
        type: tx.type,
        amount: tx.amount,
        createdAt: tx.createdAt,
        status: tx.status,
      };
    });
  }
}
