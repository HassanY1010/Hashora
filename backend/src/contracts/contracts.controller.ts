import { Controller, Get, Post, Body, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ContractStatus, Role } from '../common/types/enums';

@ApiTags('Mining Contracts')
@Controller('api/contracts')
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @ApiOperation({ summary: 'Purchase a new mining plan and activate contract' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async purchasePlan(@GetUser('id') userId: string, @Body() dto: CreateContractDto) {
    return this.contractsService.purchasePlan(userId, dto);
  }

  @ApiOperation({ summary: 'Get current user active mining summary & contracts' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-summary')
  async getMySummary(@GetUser('id') userId: string) {
    return this.contractsService.getUserContractSummary(userId);
  }

  @ApiOperation({ summary: 'Get list of user contracts' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-contracts')
  async getMyContracts(@GetUser('id') userId: string) {
    return this.contractsService.getUserContracts(userId);
  }

  @ApiOperation({ summary: 'Admin: Get all contracts across platform' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('admin/all')
  async getAllForAdmin(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.contractsService.getAllContractsForAdmin(page ? +page : 1, limit ? +limit : 20);
  }

  @ApiOperation({ summary: 'Admin: Suspend, Resume, or Terminate a contract' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/:id/status')
  async updateStatusForAdmin(
    @Param('id') contractId: string,
    @Body('status') status: ContractStatus,
  ) {
    return this.contractsService.updateContractStatusForAdmin(contractId, status);
  }
}
