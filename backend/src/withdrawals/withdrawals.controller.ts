import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '../common/types/enums';

@ApiTags('USDT Withdrawals')
@Controller('api/withdraw')
export class WithdrawalsController {
  constructor(private withdrawalsService: WithdrawalsService) {}

  @ApiOperation({ summary: 'Submit withdrawal request (TRC20 Wallet)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async requestWithdrawal(@GetUser('id') userId: string, @Body() dto: RequestWithdrawalDto) {
    return this.withdrawalsService.requestWithdrawal(userId, dto);
  }

  @ApiOperation({ summary: 'Get user withdrawal request history' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-withdrawals')
  async getMyWithdrawals(@GetUser('id') userId: string) {
    return this.withdrawalsService.getUserWithdrawals(userId);
  }

  @ApiOperation({ summary: 'Admin: Get all platform withdrawal requests' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('admin/all')
  async getAllForAdmin(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.withdrawalsService.getAllWithdrawalsForAdmin(page ? +page : 1, limit ? +limit : 20);
  }

  @ApiOperation({ summary: 'Admin: Approve withdrawal and record transaction TXID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/:id/approve')
  async approveByAdmin(@Param('id') withdrawalId: string, @Body('txHash') txHash?: string) {
    return this.withdrawalsService.approveWithdrawalByAdmin(withdrawalId, txHash);
  }

  @ApiOperation({ summary: 'Admin: Reject withdrawal and refund user balance' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/:id/reject')
  async rejectByAdmin(
    @Param('id') withdrawalId: string,
    @Body('reason') rejectionReason: string,
  ) {
    return this.withdrawalsService.rejectWithdrawalByAdmin(withdrawalId, rejectionReason);
  }
}
