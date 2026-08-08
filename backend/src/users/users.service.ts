import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { UserStatus, TransactionType, TransactionStatus, ContractStatus } from '../common/types/enums';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        referralCode: true,
        createdAt: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    return user;
  }

  async getAllUsersForAdmin(search?: string, status?: UserStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const whereCondition: any = {};

    if (status) {
      whereCondition.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      whereCondition.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { referralCode: { contains: q } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where: whereCondition }),
      this.prisma.user.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          referralCode: true,
          createdAt: true,
          wallet: {
            select: { availableBalance: true, miningBalance: true },
          },
        },
      }),
    ]);

    return { total, page, limit, totalPages: Math.ceil(total / limit), data };
  }

  async getUserDetailsForAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        contracts: true,
        deposits: { take: 10, orderBy: { createdAt: 'desc' } },
        withdrawals: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found.`);
    }

    return user;
  }

  async adjustUserBalance(adminId: string, adminEmail: string, userId: string, dto: AdjustBalanceDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { userId },
        data: {
          availableBalance: { increment: dto.amount },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.BALANCE_ADJUSTMENT,
          amount: dto.amount,
          status: TransactionStatus.COMPLETED,
          description: `Admin balance adjustment: ${dto.reason}`,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId,
          adminEmail,
          action: 'ADJUST_USER_BALANCE',
          targetUserId: userId,
          details: JSON.stringify({ amount: dto.amount, reason: dto.reason, newBalance: wallet.availableBalance }),
        },
      });

      return {
        message: `Successfully adjusted balance by ${dto.amount} USDT`,
        newBalance: wallet.availableBalance,
      };
    });
  }

  async setUserBlockStatus(adminId: string, adminEmail: string, userId: string, isBlocked: boolean) {
    const newStatus = isBlocked ? UserStatus.BLOCKED : UserStatus.ACTIVE;
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        adminEmail,
        action: isBlocked ? 'BLOCK_USER_ACCOUNT' : 'UNBLOCK_USER_ACCOUNT',
        targetUserId: userId,
        details: JSON.stringify({ newStatus }),
      },
    });

    return { message: `User account is now ${newStatus}`, user };
  }

  async setMiningPauseStatus(adminId: string, adminEmail: string, userId: string, isPaused: boolean) {
    const targetStatus = isPaused ? ContractStatus.SUSPENDED : ContractStatus.ACTIVE;

    await this.prisma.miningContract.updateMany({
      where: { userId },
      data: { status: targetStatus },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        adminEmail,
        action: isPaused ? 'PAUSE_USER_MINING' : 'RESUME_USER_MINING',
        targetUserId: userId,
        details: JSON.stringify({ isPaused }),
      },
    });

    return { message: `User mining contracts are now ${targetStatus}` };
  }
}
