import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BrandProfile } from '../../profiles/entities/brand-profile.entity';
import { InfluencerProfile } from '../../profiles/entities/influencer-profile.entity';

export enum PartnershipTier {
  NONE = 'NONE',
  RETURNING = 'RETURNING',   // 2 completed deals
  TRUSTED = 'TRUSTED',       // 3 completed deals
  EXCLUSIVE = 'EXCLUSIVE',   // 5+ completed deals
}

export const TIER_DISCOUNT: Record<PartnershipTier, number> = {
  [PartnershipTier.NONE]:      0,
  [PartnershipTier.RETURNING]: 0.05,
  [PartnershipTier.TRUSTED]:   0.10,
  [PartnershipTier.EXCLUSIVE]: 0.15,
};

export const TIER_LABELS: Record<PartnershipTier, string> = {
  [PartnershipTier.NONE]:      '',
  [PartnershipTier.RETURNING]: 'Returning Partner',
  [PartnershipTier.TRUSTED]:   'Trusted Partner',
  [PartnershipTier.EXCLUSIVE]: 'Exclusive Partner',
};

export function calculateTier(count: number): PartnershipTier {
  if (count >= 5) return PartnershipTier.EXCLUSIVE;
  if (count >= 3) return PartnershipTier.TRUSTED;
  if (count >= 2) return PartnershipTier.RETURNING;
  return PartnershipTier.NONE;
}

export function decayTier(tier: PartnershipTier): PartnershipTier {
  switch (tier) {
    case PartnershipTier.EXCLUSIVE: return PartnershipTier.TRUSTED;
    case PartnershipTier.TRUSTED:   return PartnershipTier.RETURNING;
    case PartnershipTier.RETURNING: return PartnershipTier.NONE;
    default: return PartnershipTier.NONE;
  }
}

@Entity('partnership_scores')
@Unique(['brandId', 'influencerId'])
export class PartnershipScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brandId: string;

  @ManyToOne(() => BrandProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brandId' })
  brand: BrandProfile;

  @Column()
  influencerId: string;

  @ManyToOne(() => InfluencerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'influencerId' })
  influencer: InfluencerProfile;

  @Column({ default: 0 })
  completedDealsCount: number;

  @Column({ type: 'enum', enum: PartnershipTier, default: PartnershipTier.NONE })
  tier: PartnershipTier;

  @Column({ type: 'timestamp', nullable: true })
  lastCompletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
