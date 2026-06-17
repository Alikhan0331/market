import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { BrandProfile } from './entities/brand-profile.entity';
import { InfluencerProfile } from './entities/influencer-profile.entity';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [TypeOrmModule.forFeature([BrandProfile, InfluencerProfile]), ScoringModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
