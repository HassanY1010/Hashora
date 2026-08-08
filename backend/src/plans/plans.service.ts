import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanStatus } from '../common/types/enums';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.syncDefaultPlans();
  }

  private async syncDefaultPlans() {
    const plansCount = await this.prisma.miningPlan.count();
    if (plansCount === 0) {
      await this.prisma.miningPlan.createMany({
        data: [
          {
            name: 'Free Trial',
            price: 0.0,
            hashrate: 20,
            durationDays: 3,
            description: 'Free trial contract (≈ 0.10 - 0.50 USDT expected yield). 1 claim per account.',
            status: PlanStatus.ACTIVE,
          },
          {
            name: 'Starter',
            price: 5.0,
            hashrate: 100,
            durationDays: 30,
            description: 'Starter contract (≈ 5 - 8 USDT expected yield). Daily automated payouts.',
            status: PlanStatus.ACTIVE,
          },
          {
            name: 'Pro',
            price: 10.0,
            hashrate: 700,
            durationDays: 30,
            description: 'Pro contract (≈ 10 - 18 USDT expected yield). Hourly reward updates & priority queue.',
            status: PlanStatus.ACTIVE,
          },
          {
            name: 'Premium',
            price: 20.0,
            hashrate: 4500,
            durationDays: 30,
            description: 'Premium contract (≈ 20 - 35 USDT expected yield). Maximum mining capacity & VIP support.',
            status: PlanStatus.ACTIVE,
          },
        ],
      });
    }
  }

  async getAllActivePlans() {
    return this.prisma.miningPlan.findMany({
      where: { status: PlanStatus.ACTIVE },
      orderBy: { price: 'asc' },
    });
  }

  async getAllPlansForAdmin() {
    return this.prisma.miningPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.miningPlan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException(`Mining plan with ID ${id} not found`);
    }
    return plan;
  }

  async createPlan(dto: CreatePlanDto) {
    return this.prisma.miningPlan.create({
      data: {
        name: dto.name,
        price: dto.price,
        hashrate: dto.hashrate,
        durationDays: dto.durationDays,
        description: dto.description,
        status: dto.status || PlanStatus.ACTIVE,
      },
    });
  }

  async updatePlan(id: string, dto: Partial<CreatePlanDto>) {
    await this.getPlanById(id);
    return this.prisma.miningPlan.update({
      where: { id },
      data: dto,
    });
  }

  async deletePlan(id: string) {
    await this.getPlanById(id);
    return this.prisma.miningPlan.delete({
      where: { id },
    });
  }
}
