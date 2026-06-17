import { cn } from '../../../lib/utils';

interface ScoreBadgeProps {
  score?: number | null;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  if (score == null) {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-500', className)}>
        —
      </span>
    );
  }

  const n = Number(score);
  const color =
    n >= 7 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
    n >= 4 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
    'bg-red-500/10 text-red-400 border-red-500/20';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums',
        color,
        className,
      )}
    >
      {n.toFixed(1)}
    </span>
  );
}
