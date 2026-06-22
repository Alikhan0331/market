import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { Deal, DealStatus } from '../deals/entities/deal.entity';
import { ReliabilityService } from '../reliability/reliability.service';
import {
  ReliabilityEvent,
  ReliabilityEventType,
} from '../reliability/entities/reliability-event.entity';
import { PartnershipService } from '../partnership/partnership.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Deal)
    private dealsRepo: Repository<Deal>,
    @InjectRepository(ReliabilityEvent)
    private reliabilityEventsRepo: Repository<ReliabilityEvent>,
    private reliabilityService: ReliabilityService,
    private partnershipService: PartnershipService,
  ) {}

  // Every day at midnight — flag overdue deals as LATE
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleLateDeals() {
    const today = new Date().toISOString().split('T')[0];

    const overdueDeals = await this.dealsRepo.find({
      where: {
        status: In([DealStatus.ACCEPTED, DealStatus.ACTIVE]),
        deadline: LessThan(today),
      },
    });

    let flagged = 0;
    for (const deal of overdueDeals) {
      const alreadyFlagged = await this.reliabilityEventsRepo.findOne({
        where: { dealId: deal.id, eventType: ReliabilityEventType.LATE },
      });
      if (alreadyFlagged) continue;

      await this.reliabilityService.recordEvent(
        deal.influencerId,
        deal.id,
        ReliabilityEventType.LATE,
        'Auto-flagged by system: deadline passed',
      );
      flagged++;
    }

    if (flagged > 0) {
      this.logger.log(`Late deals cron: flagged ${flagged} overdue deals`);
    }
  }

  // 1st day of each month at 01:00 — decay inactive partnership tiers
  @Cron('0 1 1 * *')
  async handlePartnershipDecay() {
    const decayed = await this.partnershipService.decayInactiveTiers();
    if (decayed > 0) {
      this.logger.log(`Partnership decay cron: decayed ${decayed} tiers`);
    }
  }
}
