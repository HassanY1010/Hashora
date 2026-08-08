import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/types/enums';

@ApiTags('Mining Plans')
@Controller('api/plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @ApiOperation({ summary: 'Get all active mining plans (Public)' })
  @Get()
  async getPublicPlans() {
    return this.plansService.getAllActivePlans();
  }

  @ApiOperation({ summary: 'Get plan details by ID (Public)' })
  @Get(':id')
  async getPlanById(@Param('id') id: string) {
    return this.plansService.getPlanById(id);
  }

  @ApiOperation({ summary: 'Create new mining plan (Admin Only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.plansService.createPlan(dto);
  }

  @ApiOperation({ summary: 'Update mining plan (Admin Only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async updatePlan(@Param('id') id: string, @Body() dto: Partial<CreatePlanDto>) {
    return this.plansService.updatePlan(id, dto);
  }

  @ApiOperation({ summary: 'Delete mining plan (Admin Only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async deletePlan(@Param('id') id: string) {
    return this.plansService.deletePlan(id);
  }
}
