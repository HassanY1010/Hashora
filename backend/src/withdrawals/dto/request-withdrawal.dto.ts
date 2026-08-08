import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class RequestWithdrawalDto {
  @ApiProperty({ example: 50.0, description: 'Amount to withdraw in USDT' })
  @IsNumber()
  @Min(5, { message: 'Minimum withdrawal amount is 5 USDT' })
  amount: number;

  @ApiProperty({ example: 'TXYZ1234567890abcdefghijklmnopqrst', description: 'TRON TRC20 Wallet Address (starts with T)' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}
