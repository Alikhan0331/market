import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  PartnershipScore,
  PartnershipTier,
  calculateTier,
  decayTier,
} from './entities/partnership-score.entity';
import { BrandProfile } from '../profiles/entities/brand-profile.entity';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';

@Injectable()
export class PartnershipService {
  constructor(
    @InjectRepository(PartnershipScore)
    private repo: Repository<PartnershipScore>,
    @InjectRepository(BrandProfile)
    private brandRepo: Repository<BrandProfile>,
    @InjectRepository(InfluencerProfile)
    private influencerRepo: Repository<InfluencerProfile>,
  ) {}

  async onDealCompleted(brandId: string, influencerId: string): Promise<PartnershipScore> {
    let partnership = await this.repo.findOne({ where: { brandId, influencerId } });

    if (!partnership) {
      partnership = this.repo.create({
        brandId,
        influencerId,
        completedDealsCount: 0,
        tier: PartnershipTier.NONE,
      });
    }

    partnership.completedDealsCount += 1;
    partnership.tier = calculateTier(partnership.completedDealsCount);
    partnership.lastCompletedAt = new Date();

    return this.repo.save(partnership);
  }

  async getPair(brandId: string, influencerId: string): Promise<PartnershipScore | null> {
    return this.repo.findOne({ where: { brandId, influencerId } });
  }

  async getForBrand(brandId: string): Promise<PartnershipScore[]> {
    return this.repo.find({
      where: { brandId },
      relations: { influencer: true },
      order: { completedDealsCount: 'DESC' },
    });
  }

  async getForInfluencer(influencerId: string): Promise<PartnershipScore[]> {
    return this.repo.find({
      where: { influencerId },
      relations: { brand: true },
      order: { completedDealsCount: 'DESC' },
    });
  }

  async getPairByUserId(userId: string, influencerId: string): Promise<PartnershipScore | null> {
    const brand = await this.brandRepo.findOne({ where: { userId } });
    if (!brand) return null;
    return this.getPair(brand.id, influencerId);
  }

  async getForBrandByUserId(userId: string): Promise<PartnershipScore[]> {
    const brand = await this.brandRepo.findOne({ where: { userId } });
    if (!brand) return [];
    return this.getForBrand(brand.id);
  }

  async getForInfluencerByUserId(userId: string): Promise<PartnershipScore[]> {
    const influencer = await this.influencerRepo.findOne({ where: { userId } });
    if (!influencer) return [];
    return this.getForInfluencer(influencer.id);
  }

  async getAllPartnershipsForBrand(brandId: string): Promise<Map<string, PartnershipTier>> {
    const partnerships = await this.repo.find({ where: { brandId } });
    return new Map(partnerships.map((p) => [p.influencerId, p.tier]));
  }

  // Called by cron: decay tiers inactive for 12+ months
  async decayInactiveTiers(): Promise<number> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const inactive = await this.repo.find({
      where: {
        lastCompletedAt: LessThan(twelveMonthsAgo),
      },
    });

    const toDecay = inactive.filter((p) => p.tier !== PartnershipTier.NONE);
    for (const partnership of toDecay) {
      partnership.tier = decayTier(partnership.tier);
    }

    if (toDecay.length > 0) await this.repo.save(toDecay);
    return toDecay.length;
  }
}
