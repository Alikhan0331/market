'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { influencersApi } from '../../../../lib/api/influencers';
import { reliabilityApi, ReliabilityEvent } from '../../../../lib/api/reliability';
import { pricingApi, PricingBreakdown } from '../../../../lib/api/pricing';
import { partnershipsApi, TIER_LABELS, TIER_COLOR, TIER_DISCOUNT } from '../../../../lib/api/partnerships';
import { ScoreBadge } from '../../../../components/shared/ScoreBadge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Badge } from '../../../../components/ui/badge';
import { buttonVariants } from '../../../../components/ui/button';
import { formatFollowers, formatER, formatPrice } from '../../../../lib/utils/formatters';
import { MapPin, ShieldCheck, Zap, TrendingUp, TrendingDown, HelpCircle, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useState } from 'react';

const POSITION_CONFIG = {
  above_market:  { label: 'Above market',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  at_market:     { label: 'At market',     color: 'text-[#4F6EF7]',   bg: 'bg-[#4F6EF7]/10 border-[#4F6EF7]/20' },
  below_market:  { label: 'Below market',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  no_data:       { label: 'No market data', color: 'text-zinc-500',   bg: 'bg-zinc-800 border-zinc-700' },
};

function PricingBreakdownModal({
  breakdown,
  onClose,
}: {
  breakdown: PricingBreakdown;
  onClose: () => void;
}) {
  const pos = POSITION_CONFIG[breakdown.position];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100">How is this price calculated?</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Market position */}
        <div className={`rounded-lg border px-4 py-3 flex items-center justify-between ${pos.bg}`}>
          <span className="text-sm text-zinc-300">Market position</span>
          <div className="text-right">
            <span className={`text-sm font-semibold ${pos.color}`}>{pos.label}</span>
            {breakdown.marketDiffPct !== null && breakdown.marketDiffPct !== 0 && (
              <span className={`block text-xs ${pos.color} opacity-75`}>
                {breakdown.marketDiffPct > 0 ? '+' : ''}{breakdown.marketDiffPct}% vs avg niche
              </span>
            )}
          </div>
        </div>

        {/* Boosters */}
        {breakdown.boosters.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Raising your price
            </p>
            <ul className="space-y-1.5">
              {breakdown.boosters.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dampers */}
        {breakdown.dampers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
              Holding it back
            </p>
            <ul className="space-y-1.5">
              {breakdown.dampers.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tip */}
        {breakdown.tip && (
          <div className="rounded-lg border border-[#4F6EF7]/20 bg-[#4F6EF7]/5 px-4 py-3">
            <p className="text-xs text-[#7B93FA]">💡 {breakdown.tip}</p>
          </div>
        )}

        <a
          href="/how-it-works"
          className="block text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors pt-1"
        >
          Learn more about how pricing works →
        </a>
      </div>
    </div>
  );
}

const EVENT_LABEL: Record<string, string> = {
  COMPLETED_ON_TIME: 'Completed on time',
  COMPLETED_EARLY: 'Completed early',
  LATE: 'Late delivery',
  CANCELLED_BY_INFLUENCER: 'Cancelled',
  CANCELLED_BY_BRAND: 'Cancelled by brand',
  NO_RESPONSE: 'No response',
};

const EVENT_COLOR: Record<string, string> = {
  COMPLETED_ON_TIME: 'text-emerald-400',
  COMPLETED_EARLY: 'text-emerald-400',
  LATE: 'text-red-400',
  CANCELLED_BY_INFLUENCER: 'text-red-400',
  CANCELLED_BY_BRAND: 'text-zinc-500',
  NO_RESPONSE: 'text-amber-400',
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center">
      <p className="text-lg font-semibold text-zinc-100 tabular-nums">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function InfluencerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string | undefined;
  const role = (session?.user as any)?.role as string | undefined;
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { data: influencer, isLoading } = useQuery({
    queryKey: ['influencer', id],
    queryFn: () => influencersApi.getById(id, token),
  });

  const { data: reliabilityEvents } = useQuery({
    queryKey: ['reliability-events', id],
    queryFn: () => reliabilityApi.getEvents(id, token!),
    enabled: !!token && !!influencer,
  });

  const { data: pricing } = useQuery({
    queryKey: ['pricing', id],
    queryFn: () => pricingApi.get(id, token!),
    enabled: !!token,
  });

  const { data: partnership } = useQuery({
    queryKey: ['partnership-pair', id],
    queryFn: () => partnershipsApi.getPair(id, token!),
    enabled: !!token && role === 'BRAND',
  });

  const { data: breakdown } = useQuery({
    queryKey: ['pricing-breakdown', id],
    queryFn: () => pricingApi.getBreakdown(id, token!),
    enabled: !!token && showBreakdown,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-lg border border-zinc-800 bg-zinc-900 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg border border-zinc-800 bg-zinc-900 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!influencer) return <p className="text-zinc-400">Influencer not found</p>;

  return (
    <>
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {influencer.avatarUrl && <AvatarImage src={influencer.avatarUrl} />}
            <AvatarFallback className="bg-[#4F6EF7]/20 text-[#4F6EF7] text-xl font-medium">
              {influencer.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-zinc-100">{influencer.displayName}</h1>
              <ScoreBadge score={influencer.overallScore} />
              {partnership && partnership.tier !== 'NONE' && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TIER_COLOR[partnership.tier]}`}>
                  {TIER_LABELS[partnership.tier]}
                  {TIER_DISCOUNT[partnership.tier] > 0 && ` · ${TIER_DISCOUNT[partnership.tier]}% off`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-zinc-400">
              <MapPin className="h-3.5 w-3.5" />
              {influencer.country}{influencer.city && `, ${influencer.city}`}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {influencer.categories.map((cat) => (
                <Badge key={cat} variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {role === 'BRAND' && (
          <Link
            href={`/deals/new?influencerId=${influencer.id}`}
            className={cn(buttonVariants(), 'bg-[#4F6EF7] hover:bg-[#3D5CE5] text-white')}
          >
            Send Offer
          </Link>
        )}
      </div>

      {influencer.bio && (
        <p className="text-sm text-zinc-300 leading-relaxed">{influencer.bio}</p>
      )}

      {/* Scores */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">AI Scores</h2>
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Overall" value={influencer.overallScore ? Number(influencer.overallScore).toFixed(1) : '—'} />
          <StatCard label="Reach" value={influencer.reachScore ? Number(influencer.reachScore).toFixed(1) : '—'} />
          <StatCard label="Engagement" value={influencer.engagementScore ? Number(influencer.engagementScore).toFixed(1) : '—'} />
          <StatCard label="Audience" value={influencer.audienceScore ? Number(influencer.audienceScore).toFixed(1) : '—'} />
        </div>
      </div>

      {/* Instagram */}
      {influencer.instagramHandle && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">
            Instagram @{influencer.instagramHandle}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Followers" value={formatFollowers(influencer.instagramFollowers)} />
            <StatCard label="Eng. Rate" value={formatER(influencer.instagramER)} />
            <StatCard label="Avg Reach" value={formatFollowers(influencer.instagramAvgReach)} />
          </div>
        </div>
      )}

      {/* TikTok */}
      {influencer.tiktokHandle && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">
            TikTok @{influencer.tiktokHandle}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Followers" value={formatFollowers(influencer.tiktokFollowers)} />
            <StatCard label="Avg Views" value={formatFollowers(influencer.tiktokAvgViews)} />
          </div>
        </div>
      )}

      {/* YouTube */}
      {influencer.youtubeHandle && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">
            YouTube @{influencer.youtubeHandle}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Subscribers" value={formatFollowers(influencer.youtubeSubscribers)} />
            <StatCard label="Avg Views" value={formatFollowers(influencer.youtubeAvgViews)} />
          </div>
        </div>
      )}

      {/* Pricing zones */}
      {pricing?.hasEnoughData && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Pricing</p>
              <button
                onClick={() => setShowBreakdown(true)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-[#7B93FA] transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                How is this calculated?
              </button>
            </div>
            {pricing.demandSurge && (
              <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 rounded-full px-2 py-0.5">
                <Zap className="h-3 w-3" />
                High demand
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Floor', value: pricing.floor, color: 'text-amber-400', desc: 'Minimum' },
              { label: 'Recommended', value: pricing.recommended, color: 'text-emerald-400', desc: 'Best chance' },
              { label: 'High', value: pricing.high, color: 'text-[#4F6EF7]', desc: 'Premium' },
            ].map(({ label, value, color, desc }) => (
              <div key={label} className="rounded-md bg-zinc-800/60 p-3">
                <p className={`text-base font-semibold tabular-nums ${color}`}>{formatPrice(value)}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
                <p className="text-xs text-zinc-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reliability */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Reliability
          </h2>
          {influencer.reliabilityScore != null ? (
            <span className={`text-lg font-semibold tabular-nums ${
              Number(influencer.reliabilityScore) >= 80 ? 'text-emerald-400'
              : Number(influencer.reliabilityScore) >= 50 ? 'text-amber-400'
              : 'text-red-400'
            }`}>
              {Math.round(Number(influencer.reliabilityScore))}
              <span className="text-sm font-normal text-zinc-500 ml-0.5">/ 100</span>
            </span>
          ) : (
            <span className="text-sm text-zinc-500 italic">New</span>
          )}
        </div>

        {influencer.reliabilityScore === null || influencer.reliabilityScore === undefined ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
            <p className="text-sm text-zinc-500">New — insufficient deal history to calculate score (min. 5 events)</p>
          </div>
        ) : null}

        {reliabilityEvents && reliabilityEvents.length > 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
            {reliabilityEvents
              .filter((e: ReliabilityEvent) => e.status !== 'DISMISSED')
              .map((event: ReliabilityEvent) => (
                <div key={event.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${EVENT_COLOR[event.eventType] ?? 'text-zinc-300'}`}>
                      {EVENT_LABEL[event.eventType] ?? event.eventType}
                    </span>
                    {event.status === 'DISPUTED' && (
                      <span className="text-xs rounded-full bg-amber-500/15 text-amber-400 px-2 py-0.5">
                        Disputed
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No deal history yet</p>
        )}
      </div>
    </div>

    {showBreakdown && breakdown && (
      <PricingBreakdownModal breakdown={breakdown} onClose={() => setShowBreakdown(false)} />
    )}
    </>
  );
}
