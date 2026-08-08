import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Multi-Level Referrals')
@Controller('api/referrals')
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @ApiOperation({ summary: 'Get referral statistics, referral link, and commission logs' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getReferralDashboard(@GetUser('id') userId: string) {
    return this.referralsService.getUserReferralDashboard(userId);
  }
}
