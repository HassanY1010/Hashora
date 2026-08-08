import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Wallets & Ledger')
@Controller('api')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @ApiOperation({ summary: 'Get current user wallet balances' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('wallet')
  async getWallet(@GetUser('id') userId: string) {
    return this.walletsService.getUserWallet(userId);
  }

  @ApiOperation({ summary: 'Get current user transaction ledger history' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('transactions')
  async getTransactions(
    @GetUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletsService.getUserTransactions(userId, page ? +page : 1, limit ? +limit : 20);
  }

  @ApiOperation({ summary: 'Get latest public transactions for Landing Page (privacy-masked)' })
  @Get('public/transactions')
  async getPublicTransactions() {
    return this.walletsService.getLatestPublicTransactions();
  }
}
