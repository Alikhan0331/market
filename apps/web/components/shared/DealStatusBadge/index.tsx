import { cn } from '../../../lib/utils';
import { DealStatus } from '../../../types/api';

const STATUS_CONFIG: Record<DealStatus, { label: string; dot: string; text: string }> = {
  PENDING:   { label: 'Pending',   dot: 'bg-yellow-400',  text: 'text-yellow-400' },
  ACCEPTED:  { label: 'Accepted',  dot: 'bg-emerald-400', text: 'text-emerald-400' },
  REJECTED:  { label: 'Rejected',  dot: 'bg-red-400',     text: 'text-red-400' },
  COUNTERED: { label: 'Countered', dot: 'bg-blue-400',    text: 'text-blue-400' },
  ACTIVE:    { label: 'Active',    dot: 'bg-emerald-400', text: 'text-emerald-400' },
  COMPLETED: { label: 'Completed', dot: 'bg-zinc-400',    text: 'text-zinc-400' },
  CANCELLED: { label: 'Cancelled', dot: 'bg-zinc-600',    text: 'text-zinc-500' },
};

interface DealStatusBadgeProps {
  status: DealStatus;
  className?: string;
}

export function DealStatusBadge({ status, className }: DealStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', config.text, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
