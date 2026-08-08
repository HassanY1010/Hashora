import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { PlanStatus } from '../../common/types/enums';

export class CreatePlanDto {
  @ApiProperty({ example: 'Pro Plan', description: 'Name of the mining plan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 100.0, description: 'Price in USDT' })
  @IsNumber()
  @Min(1)
  price: number;

  @ApiProperty({ example: 700, description: 'Mining power in MH/s' })
  @IsNumber()
  @Min(1)
  hashrate: number;

  @ApiProperty({ example: 90, description: 'Contract duration in days' })
  @IsNumber()
  @Min(1)
  durationDays: number;

  @ApiPropertyOptional({ example: 'Professional cloud mining contract', description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: PlanStatus, default: PlanStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;
}
