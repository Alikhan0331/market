import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReliabilityController } from './reliability.controller';
import { ReliabilityService } from './reliability.service';
import { ReliabilityEvent } from './entities/reliability-event.entity';
import { Dispute } from './entities/dispute.entity';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';
import { Deal } from '../deals/entities/deal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReliabilityEvent, Dispute, InfluencerProfile, Deal])],
  controllers: [ReliabilityController],
  providers: [ReliabilityService],
  exports: [ReliabilityService],
})
export class ReliabilityModule {}
