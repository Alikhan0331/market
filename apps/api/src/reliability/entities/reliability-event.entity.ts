import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InfluencerProfile } from '../../profiles/entities/influencer-profile.entity';
import { Deal } from '../../deals/entities/deal.entity';

export enum ReliabilityEventType {
  COMPLETED_ON_TIME = 'COMPLETED_ON_TIME',
  COMPLETED_EARLY = 'COMPLETED_EARLY',
  LATE = 'LATE',
  CANCELLED_BY_INFLUENCER = 'CANCELLED_BY_INFLUENCER',
  CANCELLED_BY_BRAND = 'CANCELLED_BY_BRAND',
  NO_RESPONSE = 'NO_RESPONSE',
}

export enum ReliabilityEventStatus {
  ACTIVE = 'ACTIVE',
  DISPUTED = 'DISPUTED',
  UPHELD = 'UPHELD',
  DISMISSED = 'DISMISSED',
}

// Positive weights increase score, negative decrease it
export const EVENT_WEIGHTS: Record<ReliabilityEventType, number> = {
  [ReliabilityEventType.COMPLETED_EARLY]: 1.5,
  [ReliabilityEventType.COMPLETED_ON_TIME]: 1.0,
  [ReliabilityEventType.NO_RESPONSE]: -0.5,
  [ReliabilityEventType.LATE]: -1.0,
  [ReliabilityEventType.CANCELLED_BY_INFLUENCER]: -1.5,
  [ReliabilityEventType.CANCELLED_BY_BRAND]: 0, // neutral, does not affect score
};

@Entity('reliability_events')
export class ReliabilityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  influencerId: string;

  @ManyToOne(() => InfluencerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'influencerId' })
  influencer: InfluencerProfile;

  @Column({ nullable: true })
  dealId: string;

  @ManyToOne(() => Deal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dealId' })
  deal: Deal;

  @Column({ type: 'enum', enum: ReliabilityEventType })
  eventType: ReliabilityEventType;

  @Column({
    type: 'enum',
    enum: ReliabilityEventStatus,
    default: ReliabilityEventStatus.ACTIVE,
  })
  status: ReliabilityEventStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;
}
