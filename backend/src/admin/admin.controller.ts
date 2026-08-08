import { Controller, Get, Post, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/types/enums';

@ApiTags('Admin Portal & Dashboard')
@Controller('api/admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @ApiOperation({ summary: 'Admin Dashboard Overview Metrics & Activity Feed' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.adminService.getDashboardOverviewStats();
  }

  @ApiOperation({ summary: 'Get System Audit Logs' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('audit-logs')
  async getAuditLogs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAuditLogs(page ? +page : 1, limit ? +limit : 25);
  }

  @ApiOperation({ summary: 'Get System Settings' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('settings')
  async getSettings() {
    return this.adminService.getSystemSettings();
  }

  @ApiOperation({ summary: 'Update System Setting (e.g. REWARD_RATE, MIN_WITHDRAWAL_AMOUNT)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('settings')
  async updateSetting(
    @Body('key') key: string,
    @Body('value') value: string,
    @Body('description') description?: string,
  ) {
    return this.adminService.updateSystemSetting(key, value, description);
  }

  @ApiOperation({ summary: 'Send system notification to user or broadcast' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('notifications')
  async sendNotification(
    @Body('userId') userId: string | null,
    @Body('title') title: string,
    @Body('message') message: string,
    @Body('type') type?: any,
  ) {
    return this.adminService.sendNotification(userId, title, message, type);
  }
}
