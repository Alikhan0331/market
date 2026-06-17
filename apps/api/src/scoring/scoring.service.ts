import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InfluencerProfile,
  VerificationStatus,
} from '../profiles/entities/influencer-profile.entity';
import { ScoreHistory } from './entities/score-history.entity';

interface PlatformBenchmarks {
  avgER: number;
  reachDivisor: number;
}

const BENCHMARKS: Record<string, PlatformBenchmarks> = {
  instagram: { avgER: 0.03, reachDivisor: 1_000_000 },
  tiktok: { avgER: 0.06, reachDivisor: 2_000_000 },
  youtube: { avgER: 0.04, reachDivisor: 1_500_000 },
};

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(InfluencerProfile)
    private influencerRepo: Repository<InfluencerProfile>,
    @InjectRepository(ScoreHistory)
    private historyRepo: Repository<ScoreHistory>,
  ) {}

  async calculateScore(influencerId: string) {
    const profile = await this.influencerRepo.findOne({
      where: { id: influencerId },
    });
    if (!profile) throw new NotFoundException('Influencer profile not found');

    const platformScores = this.computePlatformScores(profile);
    const reachScore = this.clamp(platformScores.reach, 0, 10);
    const engagementScore = this.clamp(platformScores.engagement, 0, 10);
    const audienceScore = this.computeAudienceScore(profile);
    const overallScore = this.clamp(
      reachScore * 0.4 + engagementScore * 0.4 + audienceScore * 0.2,
      0,
      10,
    );

    const verificationStatus = this.determineVerificationStatus(profile);

    Object.assign(profile, {
      reachScore,
      engagementScore,
      audienceScore,
      overallScore,
      verificationStatus,
    });

    await this.influencerRepo.save(profile);

    const history = this.historyRepo.create({
      influencerId,
      reachScore,
      engagementScore,
      overallScore,
    });
    await this.historyRepo.save(history);

    return { reachScore, engagementScore, audienceScore, overallScore, verificationStatus };
  }

  async getScoreHistory(influencerId: string): Promise<ScoreHistory[]> {
    return this.historyRepo.find({
      where: { influencerId },
      order: { calculatedAt: 'DESC' },
      take: 20,
    });
  }

  private computePlatformScores(profile: InfluencerProfile) {
    const scores: number[] = [];
    const erScores: number[] = [];

    if (profile.instagramFollowers > 0) {
      const b = BENCHMARKS.instagram;
      scores.push(Math.min(profile.instagramFollowers / b.reachDivisor, 1) * 10);
      erScores.push(Math.min(profile.instagramER / b.avgER, 1) * 10);
    }
    if (profile.tiktokFollowers > 0) {
      const b = BENCHMARKS.tiktok;
      scores.push(Math.min(profile.tiktokFollowers / b.reachDivisor, 1) * 10);
    }
    if (profile.youtubeSubscribers > 0) {
      const b = BENCHMARKS.youtube;
      scores.push(Math.min(profile.youtubeSubscribers / b.reachDivisor, 1) * 10);
    }

    const reach = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const engagement = erScores.length > 0 ? erScores.reduce((a, b) => a + b, 0) / erScores.length : 0;

    return { reach, engagement };
  }

  private computeAudienceScore(profile: InfluencerProfile): number {
    // Score based on content diversity (number of active platforms)
    let platforms = 0;
    if (profile.instagramFollowers > 0) platforms++;
    if (profile.tiktokFollowers > 0) platforms++;
    if (profile.youtubeSubscribers > 0) platforms++;
    return (platforms / 3) * 10;
  }

  private determineVerificationStatus(profile: InfluencerProfile): VerificationStatus {
    const igER = Number(profile.instagramER);
    const igFollowers = profile.instagramFollowers;
    const igReach = profile.instagramAvgReach;

    if (igER > 0.2) return VerificationStatus.SUSPICIOUS;
    if (igFollowers > 100_000 && igReach > 0 && igReach / igFollowers < 0.01)
      return VerificationStatus.WARNING;

    return VerificationStatus.VERIFIED;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
