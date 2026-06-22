import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReliabilityEvent,
  ReliabilityEventType,
  ReliabilityEventStatus,
  EVENT_WEIGHTS,
} from './entities/reliability-event.entity';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';
import { Deal, DealStatus } from '../deals/entities/deal.entity';
import { User, UserRole } from '../common/entities/user.entity';

@Injectable()
export class ReliabilityService {
  constructor(
    @InjectRepository(ReliabilityEvent)
    private eventsRepo: Repository<ReliabilityEvent>,
    @InjectRepository(Dispute)
    private disputesRepo: Repository<Dispute>,
    @InjectRepository(InfluencerProfile)
    private influencerRepo: Repository<InfluencerProfile>,
    @InjectRepository(Deal)
    private dealsRepo: Repository<Deal>,
  ) {}

  async recordEvent(
    influencerId: string,
    dealId: string,
    eventType: ReliabilityEventType,
    note?: string,
  ): Promise<ReliabilityEvent> {
    const event = this.eventsRepo.create({
      influencerId,
      dealId,
      eventType,
      note,
      status: ReliabilityEventStatus.ACTIVE,
    });
    await this.eventsRepo.save(event);
    await this.recalculateScore(influencerId);
    return event;
  }

  async reportNoResponse(
    dealId: string,
    user: User,
  ): Promise<{ warned: boolean; hoursLeft?: number }> {
    const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
    if (!deal) throw new NotFoundException('Deal not found');

    const brand = await this.influencerRepo.manager
      .getRepository('brand_profiles')
      .findOne({ where: { userId: user.id } });
    if (!brand || deal.brandId !== (brand as any).id)
      throw new ForbiddenException('You do not own this deal');

    if (deal.status !== DealStatus.PENDING)
      throw new BadRequestException('Can only report no response on PENDING deals');

    const daysSinceCreated =
      (Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 3)
      throw new BadRequestException('Deal must be at least 3 days old to report no response');

    const existing = await this.eventsRepo.findOne({
      where: { dealId, eventType: ReliabilityEventType.NO_RESPONSE },
    });
    if (existing) throw new BadRequestException('No response already reported for this deal');

    // First call: send warning and start 24h countdown
    if (!deal.noResponseWarnedAt) {
      deal.noResponseWarnedAt = new Date();
      await this.dealsRepo.save(deal);
      return { warned: true };
    }

    // Subsequent calls: check if 24h have passed
    const hoursSinceWarning =
      (Date.now() - new Date(deal.noResponseWarnedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceWarning < 24) {
      const hoursLeft = Math.ceil(24 - hoursSinceWarning);
      throw new BadRequestException(
        `Warning was sent. The influencer has ${hoursLeft} more hour(s) to respond before the event is recorded.`,
      );
    }

    await this.recordEvent(deal.influencerId, dealId, ReliabilityEventType.NO_RESPONSE);
    return { warned: false };
  }

  async getInfluencerEvents(influencerId: string): Promise<ReliabilityEvent[]> {
    return this.eventsRepo.find({
      where: { influencerId },
      order: { createdAt: 'DESC' },
      relations: { deal: true },
    });
  }

  async openDispute(
    eventId: string,
    reason: string,
    user: User,
  ): Promise<Dispute> {
    const event = await this.eventsRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.influencerId !== (await this.getInfluencerIdByUser(user.id)))
      throw new ForbiddenException('This event does not belong to you');
    if (event.status !== ReliabilityEventStatus.ACTIVE)
      throw new BadRequestException('Event is already disputed or resolved');

    const existing = await this.disputesRepo.findOne({ where: { eventId } });
    if (existing) throw new BadRequestException('Dispute already opened for this event');

    event.status = ReliabilityEventStatus.DISPUTED;
    await this.eventsRepo.save(event);

    const dispute = this.disputesRepo.create({
      eventId,
      influencerId: event.influencerId,
      reason,
      status: DisputeStatus.PENDING,
    });
    return this.disputesRepo.save(dispute);
  }

  async getAllDisputes(): Promise<Dispute[]> {
    return this.disputesRepo.find({
      order: { createdAt: 'DESC' },
      relations: { event: true, influencer: true },
    });
  }

  async resolveDispute(
    disputeId: string,
    decision: 'UPHELD' | 'DISMISSED',
    moderatorNote: string | undefined,
  ): Promise<Dispute> {
    const dispute = await this.disputesRepo.findOne({
      where: { id: disputeId },
      relations: { event: true },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    if (dispute.status !== DisputeStatus.PENDING)
      throw new BadRequestException('Dispute already resolved');

    dispute.status = decision === 'UPHELD' ? DisputeStatus.UPHELD : DisputeStatus.DISMISSED;
    if (moderatorNote) dispute.moderatorNote = moderatorNote;

    // Update event status accordingly
    dispute.event.status =
      decision === 'DISMISSED'
        ? ReliabilityEventStatus.DISMISSED // removed from score
        : ReliabilityEventStatus.UPHELD; // stays in score
    await this.eventsRepo.save(dispute.event);

    await this.disputesRepo.save(dispute);
    await this.recalculateScore(dispute.influencerId);
    return dispute;
  }

  private async recalculateScore(influencerId: string): Promise<void> {
    const MIN_EVENTS_FOR_SCORE = 5;

    const allEvents = await this.eventsRepo.find({ where: { influencerId } });

    // Below threshold → insufficient data, show as "New"
    if (allEvents.length < MIN_EVENTS_FOR_SCORE) {
      await this.influencerRepo.update(influencerId, { reliabilityScore: null });
      return;
    }

    const countableEvents = allEvents.filter(
      (e) =>
        e.status === ReliabilityEventStatus.ACTIVE ||
        e.status === ReliabilityEventStatus.UPHELD,
    );

    // Has history but all dismissed → benefit of the doubt
    if (countableEvents.length === 0) {
      await this.influencerRepo.update(influencerId, { reliabilityScore: 100 });
      return;
    }

    const now = Date.now();
    let positiveWeight = 0;
    let negativeWeight = 0;

    for (const event of countableEvents) {
      const weight = EVENT_WEIGHTS[event.eventType];
      if (weight === 0) continue;

      const daysSince = (now - new Date(event.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.max(0.1, 1 - daysSince / 730);
      const decayed = Math.abs(weight) * decayFactor;

      if (weight > 0) positiveWeight += decayed;
      else negativeWeight += decayed;
    }

    const total = positiveWeight + negativeWeight;
    const score = total === 0 ? 100 : Math.round((positiveWeight / total) * 100);

    await this.influencerRepo.update(influencerId, {
      reliabilityScore: Math.max(0, Math.min(100, score)),
    });
  }

  private async getInfluencerIdByUser(userId: string): Promise<string> {
    const profile = await this.influencerRepo.findOne({ where: { userId } });
    if (!profile) throw new ForbiddenException('Influencer profile not found');
    return profile.id;
  }
}
