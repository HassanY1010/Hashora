import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractStatus, TransactionType, TransactionStatus } from '../common/types/enums';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  private generateContractCode(): string {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `MC${randomDigits}`;
  }

  async purchasePlan(userId: string, dto: CreateContractDto) {
    const plan = await this.prisma.miningPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan || plan.status !== 'ACTIVE') {
      throw new NotFoundException('Selected mining plan is unavailable or inactive.');
    }

    const planPriceNumber = Number(plan.price);

    // Free Plan Limit Check: 1 free plan per account
    if (planPriceNumber === 0) {
      const existingFreeContract = await this.prisma.miningContract.findFirst({
        where: { userId, pricePaid: 0 },
      });
      if (existingFreeContract) {
        throw new BadRequestException(
          'You have already claimed your Free Trial plan. Each user account is limited to 1 Free plan.',
        );
      }
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('User wallet not found.');
    }

    const availableBalanceNumber = Number(wallet.availableBalance);

    if (planPriceNumber > 0 && availableBalanceNumber < planPriceNumber) {
      throw new BadRequestException(
        `Insufficient balance. Plan costs ${planPriceNumber} USDT, but your available balance is ${availableBalanceNumber} USDT. Please deposit USDT TRC20 first.`,
      );
    }

    let contractCode = this.generateContractCode();
    let isCodeTaken = await this.prisma.miningContract.findUnique({ where: { contractCode } });
    while (isCodeTaken) {
      contractCode = this.generateContractCode();
      isCodeTaken = await this.prisma.miningContract.findUnique({ where: { contractCode } });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    return this.prisma.$transaction(async (tx) => {
      // 1. Deduct plan price if > 0
      let updatedWallet = wallet;
      if (planPriceNumber > 0) {
        updatedWallet = await tx.wallet.update({
          where: { userId },
          data: {
            availableBalance: { decrement: plan.price },
          },
        });
      }

      // 2. Create MiningContract
      const contract = await tx.miningContract.create({
        data: {
          contractCode,
          userId,
          planId: plan.id,
          planName: plan.name,
          pricePaid: plan.price,
          hashrate: plan.hashrate,
          durationDays: plan.durationDays,
          startDate,
          endDate,
          status: ContractStatus.ACTIVE,
          totalEarned: 0.0,
        },
      });

      // 3. Log purchase transaction
      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.PLAN_PURCHASE,
          amount: Number(plan.price) * -1,
          status: TransactionStatus.COMPLETED,
          referenceId: contract.id,
          description: `Activated ${plan.name} mining contract (${plan.hashrate} MH/s for ${plan.durationDays} days)`,
        },
      });

      // 4. Update Platform Statistics
      await tx.platformStatistics.upsert({
        where: { id: 1 },
        update: {
          totalHashrateMhs: { increment: plan.hashrate },
          activeContractsCount: { increment: 1 },
        },
        create: {
          id: 1,
          totalHashrateMhs: BigInt(plan.hashrate),
          activeContractsCount: 1,
        },
      });

      // 5. Trigger 3-Tier Referral Payout if price > 0
      if (planPriceNumber > 0) {
        await this.processReferralPayouts(tx, userId, planPriceNumber, contract.id);
      }

      return {
        message: planPriceNumber === 0 ? 'Free Trial mining contract activated!' : 'Mining contract successfully created and activated!',
        contract,
        remainingBalance: updatedWallet.availableBalance,
      };
    });
  }

  private async processReferralPayouts(tx: any, buyerId: string, planPrice: number, contractId: string) {
    const buyer = await tx.user.findUnique({
      where: { id: buyerId },
      select: { referredById: true },
    });

    if (!buyer || !buyer.referredById) return;

    // Level 1: 5% Commission
    const level1User = await tx.user.findUnique({ where: { id: buyer.referredById } });
    if (level1User) {
      const l1Commission = parseFloat((planPrice * 0.05).toFixed(6));
      await tx.wallet.update({
        where: { userId: level1User.id },
        data: { availableBalance: { increment: l1Commission } },
      });
      await tx.referral.create({
        data: {
          referrerId: level1User.id,
          referredUserId: buyerId,
          level: 1,
          commissionAmount: l1Commission,
          planPurchaseId: contractId,
        },
      });
      await tx.transaction.create({
        data: {
          userId: level1User.id,
          type: TransactionType.REFERRAL_COMMISSION,
          amount: l1Commission,
          status: TransactionStatus.COMPLETED,
          referenceId: contractId,
          description: `Level 1 referral commission (5%) from package purchase`,
        },
      });

      // Level 2: 3% Commission
      if (level1User.referredById) {
        const level2User = await tx.user.findUnique({ where: { id: level1User.referredById } });
        if (level2User) {
          const l2Commission = parseFloat((planPrice * 0.03).toFixed(6));
          await tx.wallet.update({
            where: { userId: level2User.id },
            data: { availableBalance: { increment: l2Commission } },
          });
          await tx.referral.create({
            data: {
              referrerId: level2User.id,
              referredUserId: buyerId,
              level: 2,
              commissionAmount: l2Commission,
              planPurchaseId: contractId,
            },
          });
          await tx.transaction.create({
            data: {
              userId: level2User.id,
              type: TransactionType.REFERRAL_COMMISSION,
              amount: l2Commission,
              status: TransactionStatus.COMPLETED,
              referenceId: contractId,
              description: `Level 2 referral commission (3%) from package purchase`,
            },
          });

          // Level 3: 1% Commission
          if (level2User.referredById) {
            const level3User = await tx.user.findUnique({ where: { id: level2User.referredById } });
            if (level3User) {
              const l3Commission = parseFloat((planPrice * 0.01).toFixed(6));
              await tx.wallet.update({
                where: { userId: level3User.id },
                data: { availableBalance: { increment: l3Commission } },
              });
              await tx.referral.create({
                data: {
                  referrerId: level3User.id,
                  referredUserId: buyerId,
                  level: 3,
                  commissionAmount: l3Commission,
                  planPurchaseId: contractId,
                },
              });
              await tx.transaction.create({
                data: {
                  userId: level3User.id,
                  type: TransactionType.REFERRAL_COMMISSION,
                  amount: l3Commission,
                  status: TransactionStatus.COMPLETED,
                  referenceId: contractId,
                  description: `Level 3 referral commission (1%) from package purchase`,
                },
              });
            }
          }
        }
      }
    }
  }

  async getUserContracts(userId: string) {
    return this.prisma.miningContract.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserContractSummary(userId: string) {
    const contracts = await this.prisma.miningContract.findMany({
      where: { userId, status: ContractStatus.ACTIVE },
    });

    const totalHashrate = contracts.reduce((sum, c) => sum + c.hashrate, 0);
    const activeContractsCount = contracts.length;
    const isMiningRunning = activeContractsCount > 0;

    return {
      totalHashrate,
      activeContractsCount,
      miningStatus: isMiningRunning ? 'RUNNING' : 'PAUSED',
      contracts,
    };
  }

  async getAllContractsForAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      this.prisma.miningContract.count(),
      this.prisma.miningContract.findMany({
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

  async updateContractStatusForAdmin(contractId: string, status: ContractStatus) {
    const contract = await this.prisma.miningContract.findUnique({
      where: { id: contractId },
    });
    if (!contract) {
      throw new NotFoundException(`Contract ${contractId} not found`);
    }

    return this.prisma.miningContract.update({
      where: { id: contractId },
      data: { status },
    });
  }
}
