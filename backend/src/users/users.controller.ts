import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserStatus, Role } from '../common/types/enums';

@ApiTags('User Profile & Admin Management')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@GetUser('id') userId: string) {
    return this.usersService.getUserProfile(userId);
  }

  @ApiOperation({ summary: 'Admin: Search & list all registered users' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('admin/all')
  async getAllForAdmin(
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getAllUsersForAdmin(
      search,
      status,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @ApiOperation({ summary: 'Admin: Get user detailed profile with financial breakdown' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/:id')
  async getUserDetailsForAdmin(@Param('id') userId: string) {
    return this.usersService.getUserDetailsForAdmin(userId);
  }

  @ApiOperation({ summary: 'Admin: Adjust user wallet balance (+/- USDT with mandatory reason)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/:id/balance')
  async adjustBalance(
    @GetUser('id') adminId: string,
    @GetUser('email') adminEmail: string,
    @Param('id') userId: string,
    @Body() dto: AdjustBalanceDto,
  ) {
    return this.usersService.adjustUserBalance(adminId, adminEmail, userId, dto);
  }

  @ApiOperation({ summary: 'Admin: Block or Unblock user account' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/:id/block')
  async setBlockStatus(
    @GetUser('id') adminId: string,
    @GetUser('email') adminEmail: string,
    @Param('id') userId: string,
    @Body('isBlocked') isBlocked: boolean,
  ) {
    return this.usersService.setUserBlockStatus(adminId, adminEmail, userId, isBlocked);
  }

  @ApiOperation({ summary: 'Admin: Pause or Resume user mining contracts' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/:id/mining-status')
  async setMiningPauseStatus(
    @GetUser('id') adminId: string,
    @GetUser('email') adminEmail: string,
    @Param('id') userId: string,
    @Body('isPaused') isPaused: boolean,
  ) {
    return this.usersService.setMiningPauseStatus(adminId, adminEmail, userId, isPaused);
  }
}
