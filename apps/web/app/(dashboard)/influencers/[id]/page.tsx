'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { influencersApi } from '../../../../lib/api/influencers';
import { ScoreBadge } from '../../../../components/shared/ScoreBadge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Badge } from '../../../../components/ui/badge';
import { buttonVariants } from '../../../../components/ui/button';
import { formatFollowers, formatER, formatPrice } from '../../../../lib/utils/formatters';
import { MapPin } from 'lucide-react';
import { cn } from '../../../../lib/utils';

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

  const { data: influencer, isLoading } = useQuery({
    queryKey: ['influencer', id],
    queryFn: () => influencersApi.getById(id, token),
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-zinc-100">{influencer.displayName}</h1>
              <ScoreBadge score={influencer.overallScore} />
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

      {/* Pricing */}
      {(influencer.priceFrom || influencer.priceTo) && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Price range</p>
          <p className="text-lg font-semibold text-zinc-100">
            {influencer.priceFrom ? formatPrice(influencer.priceFrom) : '—'}
            {influencer.priceTo && ` – ${formatPrice(influencer.priceTo)}`}
          </p>
        </div>
      )}
    </div>
  );
}
