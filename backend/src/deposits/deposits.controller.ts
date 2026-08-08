import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DepositsService } from './deposits.service';
import { SubmitDepositDto } from './dto/submit-deposit.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '../common/types/enums';

@ApiTags('USDT Deposits')
@Controller('api/deposits')
export class DepositsController {
  constructor(private depositsService: DepositsService) {}

  @ApiOperation({ summary: 'Get TRC20 Deposit Address and QR Code' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('address')
  async getDepositAddress() {
    return this.depositsService.getDepositAddress();
  }

  @ApiOperation({ summary: 'Submit deposit transaction hash (TXID)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async submitDeposit(@GetUser('id') userId: string, @Body() dto: SubmitDepositDto) {
    return this.depositsService.submitDeposit(userId, dto);
  }

  @ApiOperation({ summary: 'Get user deposit history' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-deposits')
  async getMyDeposits(@GetUser('id') userId: string) {
    return this.depositsService.getUserDeposits(userId);
  }

  @ApiOperation({ summary: 'Admin: Get all platform deposit requests' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('admin/all')
  async getAllForAdmin(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.depositsService.getAllDepositsForAdmin(page ? +page : 1, limit ? +limit : 20);
  }

  @ApiOperation({ summary: 'Admin: Confirm deposit and credit user wallet' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/:id/confirm')
  async confirmByAdmin(@Param('id') depositId: string, @Body('txHash') txHash?: string) {
    return this.depositsService.confirmDepositByAdmin(depositId, txHash);
  }

  @ApiOperation({ summary: 'Admin: Reject invalid deposit' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/:id/reject')
  async rejectByAdmin(@Param('id') depositId: string) {
    return this.depositsService.rejectDepositByAdmin(depositId);
  }
}
