import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class SubmitDepositDto {
  @ApiProperty({ example: 100.0, description: 'Amount deposited in USDT' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: '8a7f9b...', description: 'Transaction Hash / TXID' })
  @IsOptional()
  @IsString()
  txHash?: string;
}
