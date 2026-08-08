import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/types/enums';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateReferralCode(name: string): string {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5) || 'USER';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `${cleanName}${randomDigits}`;
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists. Please use a different email or log in.');
    }

    let referrerId: string | null = null;
    if (dto.referralCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode: dto.referralCode.trim().toUpperCase() },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    let uniqueRefCode = this.generateReferralCode(dto.fullName);
    let isCodeTaken = await this.prisma.user.findUnique({ where: { referralCode: uniqueRefCode } });
    while (isCodeTaken) {
      uniqueRefCode = this.generateReferralCode(dto.fullName);
      isCodeTaken = await this.prisma.user.findUnique({ where: { referralCode: uniqueRefCode } });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: dto.fullName.trim(),
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          role: Role.USER,
          referralCode: uniqueRefCode,
          referredById: referrerId,
        },
      });

      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          availableBalance: 0.0,
          miningBalance: 0.0,
          pendingBalance: 0.0,
          currency: 'USDT',
        },
      });

      // Update global user statistics
      await tx.platformStatistics.upsert({
        where: { id: 1 },
        update: { totalUsers: { increment: 1 } },
        create: { id: 1, totalUsers: 1 },
      });

      return { user, wallet };
    });

    const token = this.jwtService.sign({
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    return {
      message: 'Account successfully created',
      token,
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
        referralCode: result.user.referralCode,
        wallet: {
          availableBalance: result.wallet.availableBalance,
          miningBalance: result.wallet.miningBalance,
        },
      },
    };
  }

  async login(dto: LoginDto, requiredRole?: Role) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { wallet: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked. Please contact support.');
    }

    if (requiredRole && user.role !== requiredRole && user.role !== Role.SUPER_ADMIN) {
      throw new UnauthorizedException('Access denied. Insufficient administrative privileges.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const expiresIn = dto.rememberMe ? '30d' : '7d';
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn },
    );

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        wallet: user.wallet
          ? {
              availableBalance: user.wallet.availableBalance,
              miningBalance: user.wallet.miningBalance,
            }
          : null,
      },
    };
  }
}
