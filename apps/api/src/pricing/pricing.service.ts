import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';
import { Deal, DealStatus } from '../deals/entities/deal.entity';

export interface PricingResult {
  floor: number;        // cents
  recommended: number;  // cents
  high: number;         // cents
  demandSurge: boolean;
  recentOffersCount: number;
  hasEnoughData: boolean;
}

const PRICE_PER_1K_FOLLOWERS = 15; // $15 per 1000 followers base

const NICHE_COEFFICIENTS: Record<string, number> = {
  luxury:        1.5,
  fashion:       1.4,
  beauty:        1.3,
  lifestyle:     1.2,
  travel:        1.2,
  fitness:       1.15,
  health:        1.15,
  food:          1.1,
  technology:    1.1,
  business:      1.1,
  entertainment: 1.0,
  gaming:        0.9,
  education:     0.85,
};

function getNicheCoefficient(categories: string[]): number {
  if (!categories?.length) return 1.0;
  const coefficients = categories.map((cat) => {
    const key = cat.toLowerCase().trim();
    return NICHE_COEFFICIENTS[key] ?? 1.0;
  });
  return Math.max(...coefficients);
}

function getPerformanceMultiplier(reliabilityScore: number | null): number {
  if (reliabilityScore === null) return 1.0; // new influencer — neutral
  if (reliabilityScore >= 90) return 1.4;
  if (reliabilityScore >= 70) return 1.2;
  if (reliabilityScore >= 50) return 1.0;
  return 0.85;
}

// Simplified base price for market comparison — no DB calls needed
function simpleBasePrice(profile: InfluencerProfile): number {
  const topFollowers = Math.max(
    profile.instagramFollowers ?? 0,
    profile.tiktokFollowers ?? 0,
    profile.youtubeSubscribers ?? 0,
  );
  if (topFollowers === 0) return 0;
  const igER = Number(profile.instagramER ?? 0);
  const erFactor = igER > 0 ? Math.min(igER / 0.03, 3) : 1.0;
  const nicheCoef = getNicheCoefficient((profile.categories ?? []).filter(Boolean));
  return (topFollowers / 1000) * PRICE_PER_1K_FOLLOWERS * erFactor * nicheCoef;
}

export type MarketPosition = 'above_market' | 'at_market' | 'below_market' | 'no_data';

export interface PricingBreakdown {
  position: MarketPosition;
  marketDiffPct: number | null;   // e.g. +22 means 22% above avg niche price
  boosters: string[];
  dampers: string[];
  tip: string | null;
}

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(InfluencerProfile)
    private influencerRepo: Repository<InfluencerProfile>,
    @InjectRepository(Deal)
    private dealsRepo: Repository<Deal>,
  ) {}

  async calculatePricing(influencerId: string): Promise<PricingResult> {
    const profile = await this.influencerRepo.findOne({ where: { id: influencerId } });
    if (!profile) return this.emptyResult();

    const topFollowers = Math.max(
      profile.instagramFollowers ?? 0,
      profile.tiktokFollowers ?? 0,
      profile.youtubeSubscribers ?? 0,
    );

    if (topFollowers === 0) return this.emptyResult();

    // Base: $10 per 1000 followers
    const baseUsd = (topFollowers / 1000) * PRICE_PER_1K_FOLLOWERS;

    // ER factor — normalized to platform average (3%), capped at 3x
    const igER = Number(profile.instagramER ?? 0);
    const erFactor = igER > 0 ? Math.min(igER / 0.03, 3) : 1.0;

    // Niche coefficient
    const nicheCoef = getNicheCoefficient(profile.categories ?? []);

    // Demand surge: 2+ accepted/active deals in last 14 days (counts genuine interest, not raw offers)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentOffersCount = await this.dealsRepo.count({
      where: {
        influencerId,
        status: In([DealStatus.ACCEPTED, DealStatus.ACTIVE, DealStatus.COMPLETED]),
        createdAt: MoreThan(fourteenDaysAgo),
      },
    });
    const demandSurge = recentOffersCount >= 2;
    const surgeMultiplier = demandSurge ? 1.2 : 1.0;

    // Performance multiplier from reliability score (null = new influencer = neutral 1.0x)
    const reliability = profile.reliabilityScore !== null ? Number(profile.reliabilityScore) : null;
    const performanceMultiplier = getPerformanceMultiplier(reliability);

    // Final calculations in USD
    const recommendedUsd = baseUsd * erFactor * nicheCoef * surgeMultiplier;

    // Floor = max(auto floor, manual floor from priceFrom)
    const autoFloorUsd = recommendedUsd * 0.6;
    // priceFrom is stored in dollars
    const manualFloorUsd = profile.priceFrom ? profile.priceFrom : 0;
    const floorUsd = Math.max(autoFloorUsd, manualFloorUsd);

    const highUsd = recommendedUsd * performanceMultiplier;

    return {
      floor: Math.round(floorUsd * 100),
      recommended: Math.round(recommendedUsd * 100),
      high: Math.round(highUsd * 100),
      demandSurge,
      recentOffersCount,
      hasEnoughData: true,
    };
  }

  async getPricingBreakdown(influencerId: string): Promise<PricingBreakdown> {
    const [profile, pricing] = await Promise.all([
      this.influencerRepo.findOne({ where: { id: influencerId } }),
      this.calculatePricing(influencerId),
    ]);
    if (!profile) {
      return { position: 'no_data', marketDiffPct: null, boosters: [], dampers: [], tip: null };
    }

    const categories = (profile.categories ?? []).filter(Boolean);
    const igER = Number(profile.instagramER ?? 0);
    const nicheCoef = getNicheCoefficient(categories);
    const reliability = profile.reliabilityScore !== null ? Number(profile.reliabilityScore) : null;

    // ── Market position ───────────────────────────────────────────────────────
    let position: MarketPosition = 'no_data';
    let marketDiffPct: number | null = null;

    if (pricing.hasEnoughData && categories.length > 0) {
      const allInfluencers = await this.influencerRepo.find({ take: 2000 });
      const thisPrice = simpleBasePrice(profile);

      const peerPrices = allInfluencers
        .filter((p) => p.id !== influencerId)
        .filter((p) => {
          const pCats = (p.categories ?? []).filter(Boolean);
          return pCats.some((cat) =>
            categories.some((c) => c.toLowerCase() === cat.toLowerCase()),
          );
        })
        .map((p) => simpleBasePrice(p))
        .filter((p) => p > 0);

      if (peerPrices.length >= 3) {
        const avg = peerPrices.reduce((a, b) => a + b, 0) / peerPrices.length;
        const ratio = avg > 0 ? thisPrice / avg : 1;
        marketDiffPct = Math.round((ratio - 1) * 100);
        if (ratio >= 1.15) position = 'above_market';
        else if (ratio <= 0.85) position = 'below_market';
        else position = 'at_market';
      }
    }

    // ── Boosters ─────────────────────────────────────────────────────────────
    const boosters: string[] = [];

    if (igER >= 5) boosters.push(`Excellent engagement rate (${igER.toFixed(1)}%)`);
    else if (igER >= 3) boosters.push(`Good engagement rate (${igER.toFixed(1)}%)`);

    if (nicheCoef >= 1.3) {
      const topNiche = categories.find((c) => (NICHE_COEFFICIENTS[c.toLowerCase()] ?? 0) >= 1.3);
      boosters.push(`Premium niche${topNiche ? ` (${topNiche})` : ''}`);
    }

    if (pricing.demandSurge) boosters.push('High demand — multiple active deals recently');

    if (reliability !== null && reliability >= 80)
      boosters.push(`High reliability score (${Math.round(reliability)}%)`);

    if (profile.verificationStatus === 'VERIFIED') boosters.push('Verified account');

    if (profile.priceFrom) boosters.push('Floor price set — protects minimum rate');

    // ── Dampers ──────────────────────────────────────────────────────────────
    const dampers: string[] = [];

    if (igER > 0 && igER < 1.5) dampers.push(`Low engagement rate (${igER.toFixed(1)}%)`);
    else if (igER === 0) dampers.push('No engagement rate data');

    if (nicheCoef <= 0.9) dampers.push('Lower-demand niche');

    if (reliability === null) dampers.push('No reliability score yet — fewer than 5 deals');
    else if (reliability < 50) dampers.push(`Low reliability score (${Math.round(reliability)}%)`);

    if (profile.verificationStatus === 'WARNING' || profile.verificationStatus === 'SUSPICIOUS')
      dampers.push('Account verification warning');
    else if (profile.verificationStatus === 'UNVERIFIED')
      dampers.push('Account not verified');

    const topFollowers = Math.max(
      profile.instagramFollowers ?? 0,
      profile.tiktokFollowers ?? 0,
      profile.youtubeSubscribers ?? 0,
    );
    if (topFollowers === 0) dampers.push('No follower count set in profile');

    // ── Tip ──────────────────────────────────────────────────────────────────
    let tip: string | null = null;
    if (reliability === null)
      tip = 'Complete 5 deals to unlock your Reliability Score and boost your pricing tier';
    else if (reliability < 60)
      tip = 'Improving your reliability score will increase your High price tier';
    else if (profile.verificationStatus !== 'VERIFIED')
      tip = 'Get verified to unlock an additional pricing boost';
    else if (igER < 1.5 && igER > 0)
      tip = 'Higher engagement rate on Instagram significantly increases your recommended price';

    return { position, marketDiffPct, boosters, dampers, tip };
  }

  private emptyResult(): PricingResult {
    return {
      floor: 0,
      recommended: 0,
      high: 0,
      demandSurge: false,
      recentOffersCount: 0,
      hasEnoughData: false,
    };
  }
}
