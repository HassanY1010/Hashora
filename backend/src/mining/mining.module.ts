import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MiningService } from './mining.service';
import { MiningController } from './mining.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [MiningController],
  providers: [MiningService],
  exports: [MiningService],
})
export class MiningModule {}
