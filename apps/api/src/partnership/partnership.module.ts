import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnershipController } from './partnership.controller';
import { PartnershipService } from './partnership.service';
import { PartnershipScore } from './entities/partnership-score.entity';
import { BrandProfile } from '../profiles/entities/brand-profile.entity';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartnershipScore, BrandProfile, InfluencerProfile])],
  controllers: [PartnershipController],
  providers: [PartnershipService],
  exports: [PartnershipService],
})
export class PartnershipModule {}
