import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { ScoreHistory } from './entities/score-history.entity';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InfluencerProfile, ScoreHistory])],
  controllers: [ScoringController],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
