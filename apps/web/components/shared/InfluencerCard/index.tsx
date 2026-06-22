import Link from 'next/link';
import { InfluencerProfile } from '../../../types/api';
import { ScoreBadge } from '../ScoreBadge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { buttonVariants } from '../../ui/button';
import { formatFollowers, formatPrice, formatER } from '../../../lib/utils/formatters';
import { cn } from '../../../lib/utils';

interface InfluencerCardProps {
  influencer: InfluencerProfile;
}

export function InfluencerCard({ influencer }: InfluencerCardProps) {
  const topFollowers = Math.max(
    influencer.instagramFollowers,
    influencer.tiktokFollowers,
    influencer.youtubeSubscribers,
  );

  return (
    <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            {influencer.avatarUrl && <AvatarImage src={influencer.avatarUrl} />}
            <AvatarFallback className="bg-[#4F6EF7]/20 text-[#4F6EF7] text-sm font-medium">
              {influencer.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">{influencer.displayName}</p>
            <p className="text-xs text-zinc-500">{influencer.country}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <ScoreBadge score={influencer.overallScore} />
          {influencer.reliabilityScore !== undefined && (
            <span className={`text-xs font-medium tabular-nums ${
              Number(influencer.reliabilityScore) >= 80 ? 'text-emerald-400'
              : Number(influencer.reliabilityScore) >= 50 ? 'text-amber-400'
              : 'text-red-400'
            }`}>
              {Math.round(Number(influencer.reliabilityScore))}% reliable
            </span>
          )}
        </div>
      </div>

      {influencer.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {influencer.categories.slice(0, 3).map((cat) => (
            <span key={cat} className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {cat}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div>
          <p className="text-sm font-semibold text-zinc-100">{formatFollowers(topFollowers)}</p>
          <p className="text-xs text-zinc-500">followers</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">{formatER(influencer.instagramER)}</p>
          <p className="text-xs text-zinc-500">ER</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">
            {influencer.priceFrom ? formatPrice(influencer.priceFrom) : '—'}
          </p>
          <p className="text-xs text-zinc-500">from</p>
        </div>
      </div>

      <Link
        href={`/influencers/${influencer.id}`}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'mt-auto border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
        )}
      >
        View Profile
      </Link>
    </div>
  );
}
