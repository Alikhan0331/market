import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AvailabilityStatus } from '../entities/influencer-profile.entity';

export class UpdateAvailabilityDto {
  @ApiProperty({ enum: AvailabilityStatus })
  @IsEnum(AvailabilityStatus)
  availabilityStatus: AvailabilityStatus;
}
