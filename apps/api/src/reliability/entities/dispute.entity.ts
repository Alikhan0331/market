import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReliabilityEvent } from './reliability-event.entity';
import { InfluencerProfile } from '../../profiles/entities/influencer-profile.entity';

export enum DisputeStatus {
  PENDING = 'PENDING',
  UPHELD = 'UPHELD',
  DISMISSED = 'DISMISSED',
}

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => ReliabilityEvent, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'eventId' })
  event: ReliabilityEvent;

  @Column()
  influencerId: string;

  @ManyToOne(() => InfluencerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'influencerId' })
  influencer: InfluencerProfile;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.PENDING })
  status: DisputeStatus;

  @Column({ type: 'text', nullable: true })
  moderatorNote: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
