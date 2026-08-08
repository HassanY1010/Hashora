import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class AdjustBalanceDto {
  @ApiProperty({ example: 50.0, description: 'Amount to add (positive) or deduct (negative)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Manual balance correction for promo reward', description: 'Mandatory reason for audit log' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Reason must be at least 5 characters long for audit records' })
  reason: string;
}
