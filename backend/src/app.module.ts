import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { PlansModule } from './plans/plans.module';
import { ContractsModule } from './contracts/contracts.module';
import { MiningModule } from './mining/mining.module';
import { DepositsModule } from './deposits/deposits.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { ReferralsModule } from './referrals/referrals.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BlockchainModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    PlansModule,
    ContractsModule,
    MiningModule,
    DepositsModule,
    WithdrawalsModule,
    ReferralsModule,
    AdminModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
