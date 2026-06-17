import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InfluencerProfile } from '../../profiles/entities/influencer-profile.entity';

@Entity('score_history')
export class ScoreHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  influencerId: string;

  @ManyToOne(() => InfluencerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'influencerId' })
  influencer: InfluencerProfile;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  reachScore: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  engagementScore: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  overallScore: number;

  @CreateDateColumn()
  calculatedAt: Date;
}
