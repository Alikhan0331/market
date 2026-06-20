import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';
import { BrandProfile } from '../profiles/entities/brand-profile.entity';

// Industry → content category affinity map
const INDUSTRY_CATEGORY_MAP: Record<string, string[]> = {
  Fashion: ['Fashion', 'Lifestyle', 'Beauty', 'Travel'],
  Beauty: ['Beauty', 'Fashion', 'Lifestyle', 'Health'],
  Technology: ['Technology', 'Gaming', 'Science', 'Education'],
  Food: ['Food', 'Lifestyle', 'Travel', 'Health'],
  Travel: ['Travel', 'Lifestyle', 'Photography', 'Adventure'],
  Fitness: ['Fitness', 'Health', 'Lifestyle', 'Sports'],
  Gaming: ['Gaming', 'Technology', 'Entertainment', 'Esports'],
  Finance: ['Finance', 'Business', 'Education', 'Technology'],
  Health: ['Health', 'Fitness', 'Lifestyle', 'Wellness'],
  Entertainment: ['Entertainment', 'Music', 'Movies', 'Lifestyle'],
  Education: ['Education', 'Technology', 'Science', 'Business'],
  Sports: ['Sports', 'Fitness', 'Health', 'Lifestyle'],
  Automotive: ['Automotive', 'Technology', 'Travel', 'Lifestyle'],
  Retail: ['Lifestyle', 'Fashion', 'Shopping', 'Home'],
  Music: ['Music', 'Entertainment', 'Lifestyle', 'Art'],
};

export interface MatchResult {
  influencer: InfluencerProfile;
  matchScore: number;           // 0-100
  breakdown: MatchBreakdown;
}

export interface MatchBreakdown {
  categoryScore: number;        // 0-30  — how well categories align with brand industry
  countryScore: number;         // 0-20  — same country bonus
  engagementScore: number;      // 0-25  — overall influencer quality score
  budgetScore: number;          // 0-15  — price compatibility (0 if no brand budget hint)
  verificationScore: number;    // 0-10  — verified status bonus
  matchedCategories: string[];  // human-readable list of matched categories
  reasons: string[];            // human-readable match reasons
}

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(InfluencerProfile)
    private influencerRepo: Repository<InfluencerProfile>,
    @InjectRepository(BrandProfile)
    private brandRepo: Repository<BrandProfile>,
  ) {}

  async getRecommended(
    brandUserId: string,
    limit = 20,
  ): Promise<MatchResult[]> {
    const brand = await this.brandRepo.findOne({ where: { userId: brandUserId } });
    if (!brand) throw new NotFoundException('Brand profile not found');

    const influencers = await this.influencerRepo.find({
      where: {},
      take: 500,   // pool to score from
      order: { overallScore: 'DESC' },
    });

    const results: MatchResult[] = influencers
      .map((inf) => this.scoreMatch(brand, inf))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return results;
  }

  private scoreMatch(brand: BrandProfile, influencer: InfluencerProfile): MatchResult {
    const breakdown: MatchBreakdown = {
      categoryScore: 0,
      countryScore: 0,
      engagementScore: 0,
      budgetScore: 0,
      verificationScore: 0,
      matchedCategories: [],
      reasons: [],
    };

    // 1. Category alignment (0-30)
    const affinities = INDUSTRY_CATEGORY_MAP[brand.industry] ?? [];
    const influencerCats = influencer.categories ?? [];
    const matched = influencerCats.filter(
      (c) => affinities.some((a) => a.toLowerCase() === c.toLowerCase()),
    );
    breakdown.matchedCategories = matched;
    const categoryRatio = affinities.length > 0 ? matched.length / Math.min(affinities.length, 3) : 0;
    breakdown.categoryScore = Math.min(categoryRatio * 30, 30);
    if (matched.length > 0)
      breakdown.reasons.push(`Content matches ${brand.industry} industry (${matched.join(', ')})`);

    // 2. Country match (0-20)
    if (
      brand.country &&
      influencer.country &&
      brand.country.toLowerCase() === influencer.country.toLowerCase()
    ) {
      breakdown.countryScore = 20;
      breakdown.reasons.push(`Same country (${brand.country})`);
    } else {
      // partial score for similar region (naive: first two chars match)
      if (
        brand.country &&
        influencer.country &&
        brand.country.slice(0, 2).toLowerCase() === influencer.country.slice(0, 2).toLowerCase()
      ) {
        breakdown.countryScore = 8;
        breakdown.reasons.push('Similar region');
      }
    }

    // 3. Engagement / quality score (0-25) — uses overallScore (0-10 scale → /10*25)
    if (influencer.overallScore != null) {
      breakdown.engagementScore = (Number(influencer.overallScore) / 10) * 25;
      if (Number(influencer.overallScore) >= 7)
        breakdown.reasons.push(`High quality score (${Number(influencer.overallScore).toFixed(1)}/10)`);
    }

    // 4. Budget compatibility (0-15)
    // We don't store brand budget; give full 15 if influencer has set a price range
    if (influencer.priceFrom != null && influencer.priceTo != null) {
      breakdown.budgetScore = 15;
      breakdown.reasons.push('Has defined pricing');
    } else if (influencer.priceFrom != null) {
      breakdown.budgetScore = 8;
      breakdown.reasons.push('Has starting price listed');
    }

    // 5. Verification bonus (0-10)
    switch (influencer.verificationStatus) {
      case 'VERIFIED':
        breakdown.verificationScore = 10;
        breakdown.reasons.push('Verified account');
        break;
      case 'UNVERIFIED':
        breakdown.verificationScore = 4;
        break;
      case 'WARNING':
        breakdown.verificationScore = 1;
        break;
      case 'SUSPICIOUS':
        breakdown.verificationScore = 0;
        break;
    }

    const matchScore = Math.round(
      breakdown.categoryScore +
      breakdown.countryScore +
      breakdown.engagementScore +
      breakdown.budgetScore +
      breakdown.verificationScore,
    );

    return { influencer, matchScore, breakdown };
  }
}
