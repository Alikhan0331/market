import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../common/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: [UserRole.BRAND, UserRole.INFLUENCER] })
  @IsEnum([UserRole.BRAND, UserRole.INFLUENCER])
  role: UserRole.BRAND | UserRole.INFLUENCER;
}
