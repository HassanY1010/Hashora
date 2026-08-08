import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MiningService } from './mining.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '../common/types/enums';

@ApiTags('Mining Engine & Analytics')
@Controller('api/mining')
export class MiningController {
  constructor(private miningService: MiningService) {}

  @ApiOperation({ summary: 'Get 30-day mining earnings performance chart' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('chart')
  async getPerformanceChart(@GetUser('id') userId: string) {
    return this.miningService.getMiningPerformanceChart(userId);
  }

  @ApiOperation({ summary: 'Get mining yield history logs table' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('history')
  async getMiningHistory(
    @GetUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.miningService.getMiningHistory(userId, page ? +page : 1, limit ? +limit : 20);
  }

  @ApiOperation({ summary: 'Admin: Trigger manual reward calculation cycle' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('admin/run-distribution')
  async triggerDistribution() {
    return this.miningService.processMiningRewards();
  }
}
