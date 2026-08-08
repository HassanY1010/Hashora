import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { WithdrawalStatus, TransactionType, TransactionStatus } from '../common/types/enums';

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  private async getMinWithdrawalAndFee() {
    const minSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'MIN_WITHDRAWAL_AMOUNT' },
    });
    const feeSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'WITHDRAWAL_FEE' },
    });

    const minAmount = minSetting ? parseFloat(minSetting.value) : 10.0;
    const fee = feeSetting ? parseFloat(feeSetting.value) : 1.0;

    return { minAmount, fee };
  }

  async requestWithdrawal(userId: string, dto: RequestWithdrawalDto) {
    if (!this.blockchainService.isValidTronAddress(dto.walletAddress)) {
      throw new BadRequestException(
        'Invalid TRON wallet address. Address must start with "T" and be 34 characters long.',
      );
    }

    const { minAmount, fee } = await this.getMinWithdrawalAndFee();

    if (dto.amount < minAmount) {
      throw new BadRequestException(
        `Minimum withdrawal amount is ${minAmount} USDT. You requested ${dto.amount} USDT.`,
      );
    }

    const totalRequired = dto.amount;
    const netAmount = Math.max(0, dto.amount - fee);

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('User wallet not found.');
    }

    const available = Number(wallet.availableBalance);
    if (available < totalRequired) {
      throw new BadRequestException(
        `Insufficient balance. You requested ${totalRequired} USDT, but available balance is ${available} USDT.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Move funds from availableBalance to pendingBalance
      await tx.wallet.update({
        where: { userId },
        data: {
          availableBalance: { decrement: totalRequired },
          pendingBalance: { increment: totalRequired },
        },
      });

      // 2. Create Withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount: dto.amount,
          fee,
          netAmount,
          walletAddress: dto.walletAddress.trim(),
          network: 'TRC20',
          status: WithdrawalStatus.PENDING,
        },
      });

      // 3. Save wallet address to user's saved addresses
      const existingAddress = await tx.walletAddress.findFirst({
        where: { userId, address: dto.walletAddress.trim() },
      });
      if (!existingAddress) {
        await tx.walletAddress.create({
          data: {
            userId,
            address: dto.walletAddress.trim(),
            network: 'TRC20',
          },
        });
      }

      // 4. Log transaction
      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.WITHDRAWAL,
          amount: totalRequired * -1,
          status: TransactionStatus.PENDING,
          referenceId: withdrawal.id,
          description: `Withdrawal request submitted (${dto.amount} USDT to ${dto.walletAddress.slice(
            0,
            6,
          )}...)`,
        },
      });

      return {
        message: 'Withdrawal request submitted successfully and is pending admin approval.',
        withdrawal,
        netAmountToReceive: netAmount,
        fee,
      };
    });
  }

  async getUserWithdrawals(userId: string) {
    return this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllWithdrawalsForAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      this.prisma.withdrawal.count(),
      this.prisma.withdrawal.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { fullName: true, email: true } },
        },
      }),
    ]);

    return { total, page, limit, totalPages: Math.ceil(total / limit), data };
  }

  async approveWithdrawalByAdmin(withdrawalId: string, txHash?: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new NotFoundException(`Withdrawal ${withdrawalId} not found.`);
    }

    if (withdrawal.status === WithdrawalStatus.COMPLETED) {
      throw new BadRequestException('Withdrawal has already been processed.');
    }

    const finalTxHash = txHash ? txHash.trim() : `TX_OUT_${Date.now()}`;
    const totalAmount = Number(withdrawal.amount);

    return this.prisma.$transaction(async (tx) => {
      // 1. Deduct pendingBalance
      await tx.wallet.update({
        where: { userId: withdrawal.userId },
        data: {
          pendingBalance: { decrement: totalAmount },
        },
      });

      // 2. Update Withdrawal record
      const updated = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.COMPLETED,
          txHash: finalTxHash,
        },
      });

      // 3. Update master ledger transaction status
      const transaction = await tx.transaction.findFirst({
        where: { referenceId: withdrawalId, type: TransactionType.WITHDRAWAL },
      });
      if (transaction) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });
      }

      // 4. Update Platform Statistics
      await tx.platformStatistics.upsert({
        where: { id: 1 },
        update: { completedWithdrawalsCount: { increment: 1 } },
        create: { id: 1, completedWithdrawalsCount: 1 },
      });

      return updated;
    });
  }

  async rejectWithdrawalByAdmin(withdrawalId: string, rejectionReason: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new NotFoundException(`Withdrawal ${withdrawalId} not found.`);
    }

    if (withdrawal.status === WithdrawalStatus.REJECTED) {
      throw new BadRequestException('Withdrawal has already been rejected.');
    }

    const totalAmount = Number(withdrawal.amount);

    return this.prisma.$transaction(async (tx) => {
      // 1. Return funds from pendingBalance back to availableBalance
      await tx.wallet.update({
        where: { userId: withdrawal.userId },
        data: {
          pendingBalance: { decrement: totalAmount },
          availableBalance: { increment: totalAmount },
        },
      });

      // 2. Update Withdrawal record
      const updated = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.REJECTED,
          rejectionReason: rejectionReason || 'Rejected by platform admin',
        },
      });

      // 3. Update transaction status
      const transaction = await tx.transaction.findFirst({
        where: { referenceId: withdrawalId, type: TransactionType.WITHDRAWAL },
      });
      if (transaction) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.CANCELLED },
        });
      }

      return updated;
    });
  }
}
