import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { Deal } from '../deals/entities/deal.entity';
import { ReliabilityEvent } from '../reliability/entities/reliability-event.entity';
import { ReliabilityModule } from '../reliability/reliability.module';
import { PartnershipModule } from '../partnership/partnership.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Deal, ReliabilityEvent]),
    ReliabilityModule,
    PartnershipModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
