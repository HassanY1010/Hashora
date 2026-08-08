import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ example: 'mining-plan-uuid-or-id', description: 'ID of the plan to purchase' })
  @IsString()
  @IsNotEmpty()
  planId: string;
}
