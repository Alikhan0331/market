import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../common/entities/user.entity';
import { RefreshToken } from '../common/entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({
      email: dto.email,
      password: hashed,
      role: dto.role,
    });
    await this.usersRepo.save(user);
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  async refresh(rawToken: string) {
    const hashed = this.hashToken(rawToken);
    const stored = await this.refreshTokensRepo.findOne({
      where: { token: hashed },
      relations: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.refreshTokensRepo.remove(stored);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.refreshTokensRepo.remove(stored);
    return this.generateTokens(stored.user);
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokensRepo.delete({ userId });
  }

  async handleGoogleLogin(googleUser: {
    googleId: string;
    email: string;
    displayName: string;
  }) {
    let user = await this.usersRepo.findOne({
      where: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
    });

    if (!user) {
      user = this.usersRepo.create({
        email: googleUser.email,
        googleId: googleUser.googleId,
        role: UserRole.INFLUENCER,
        isVerified: true,
      });
      await this.usersRepo.save(user);
    } else if (!user.googleId) {
      user.googleId = googleUser.googleId;
      user.isVerified = true;
      await this.usersRepo.save(user);
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET', 'changeme'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '7d') as any,
    });

    const rawRefresh = uuidv4();
    const hashedRefresh = this.hashToken(rawRefresh);

    const daysStr = this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN', '30d');
    const days = parseInt(daysStr);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const refreshToken = this.refreshTokensRepo.create({
      token: hashedRefresh,
      userId: user.id,
      expiresAt,
    });
    await this.refreshTokensRepo.save(refreshToken);

    return {
      access_token: accessToken,
      refresh_token: rawRefresh,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
