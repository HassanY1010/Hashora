import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { SubmitDepositDto } from './dto/submit-deposit.dto';
import { DepositStatus, TransactionType, TransactionStatus } from '../common/types/enums';

@Injectable()
export class DepositsService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  getDepositAddress() {
    const address = this.blockchainService.getPlatformReceiverAddress();
    return {
      network: 'TRC20',
      currency: 'USDT',
      address,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${address}`,
      instructions: [
        'Send USDT only using the TRC20 (TRON) network.',
        'Do not send any other tokens or use any other network.',
        'Deposits require 20 network confirmations before funds are credited.',
      ],
    };
  }

  async submitDeposit(userId: string, dto: SubmitDepositDto) {
    if (dto.txHash) {
      const existing = await this.prisma.deposit.findUnique({
        where: { txHash: dto.txHash.trim() },
      });
      if (existing) {
        throw new ConflictException('Transaction hash (TXID) has already been submitted.');
      }
    }

    const platformAddress = this.blockchainService.getPlatformReceiverAddress();

    return this.prisma.deposit.create({
      data: {
        userId,
        amount: dto.amount,
        currency: 'USDT',
        network: 'TRC20',
        txHash: dto.txHash ? dto.txHash.trim() : null,
        toAddress: platformAddress,
        status: DepositStatus.PENDING,
        confirmations: 0,
      },
    });
  }

  async getUserDeposits(userId: string) {
    return this.prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllDepositsForAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      this.prisma.deposit.count(),
      this.prisma.deposit.findMany({
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

  async confirmDepositByAdmin(depositId: string, txHash?: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      throw new NotFoundException(`Deposit ${depositId} not found.`);
    }

    if (deposit.status === DepositStatus.CONFIRMED) {
      throw new BadRequestException('Deposit has already been confirmed.');
    }

    const finalTxHash = txHash ? txHash.trim() : deposit.txHash || `MANUAL_${Date.now()}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update deposit status to CONFIRMED
      const updatedDeposit = await tx.deposit.update({
        where: { id: depositId },
        data: {
          status: DepositStatus.CONFIRMED,
          confirmations: 20,
          txHash: finalTxHash,
        },
      });

      // 2. Credit user available balance in Wallet
      await tx.wallet.update({
        where: { userId: deposit.userId },
        data: {
          availableBalance: { increment: deposit.amount },
        },
      });

      // 3. Log master ledger transaction
      await tx.transaction.create({
        data: {
          userId: deposit.userId,
          type: TransactionType.DEPOSIT,
          amount: deposit.amount,
          status: TransactionStatus.COMPLETED,
          referenceId: deposit.id,
          description: `USDT TRC20 Deposit Confirmed (${deposit.amount} USDT)`,
        },
      });

      // 4. Update Platform Statistics
      await tx.platformStatistics.upsert({
        where: { id: 1 },
        update: { totalUsers: { increment: 0 } },
        create: { id: 1 },
      });

      return updatedDeposit;
    });
  }

  async rejectDepositByAdmin(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      throw new NotFoundException(`Deposit ${depositId} not found.`);
    }

    return this.prisma.deposit.update({
      where: { id: depositId },
      data: { status: DepositStatus.FAILED },
    });
  }
}
