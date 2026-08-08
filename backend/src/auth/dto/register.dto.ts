import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ahmed Mohammed', description: 'Full name of user (min 3 chars)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Full name must be at least 3 characters long' })
  fullName: string;

  @ApiProperty({ example: 'ahmed@gmail.com', description: 'Unique user email' })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Ahmed123@', description: 'Password must contain uppercase, lowercase, number, min 8 chars' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and a number or special character',
  })
  password: string;

  @ApiPropertyOptional({ example: 'AHMED5588', description: 'Optional referral code' })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
