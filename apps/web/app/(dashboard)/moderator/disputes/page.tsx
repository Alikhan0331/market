'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldCheck, ShieldX, Clock } from 'lucide-react';
import { reliabilityApi, Dispute } from '../../../../lib/api/reliability';
import { Button } from '../../../../components/ui/button';

const EVENT_LABEL: Record<string, string> = {
  COMPLETED_ON_TIME: 'Completed on time',
  COMPLETED_EARLY: 'Completed early',
  LATE: 'Late delivery',
  CANCELLED_BY_INFLUENCER: 'Cancelled by influencer',
  CANCELLED_BY_BRAND: 'Cancelled by brand',
  NO_RESPONSE: 'No response',
};

const EVENT_COLOR: Record<string, string> = {
  COMPLETED_ON_TIME: 'text-emerald-400',
  COMPLETED_EARLY: 'text-emerald-400',
  LATE: 'text-red-400',
  CANCELLED_BY_INFLUENCER: 'text-red-400',
  CANCELLED_BY_BRAND: 'text-zinc-400',
  NO_RESPONSE: 'text-amber-400',
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400',
  UPHELD: 'bg-red-500/15 text-red-400',
  DISMISSED: 'bg-emerald-500/15 text-emerald-400',
};

function DisputeCard({ dispute, token }: { dispute: Dispute; token: string }) {
  const qc = useQueryClient();
  const [note, setNote] = useState('');

  const resolve = useMutation({
    mutationFn: (decision: 'UPHELD' | 'DISMISSED') =>
      reliabilityApi.resolveDispute(dispute.id, decision, note || undefined, token),
    onSuccess: () => {
      toast.success('Dispute resolved');
      qc.invalidateQueries({ queryKey: ['disputes'] });
    },
    onError: () => toast.error('Failed to resolve'),
  });

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-100">
            {dispute.influencer?.displayName ?? '—'}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {new Date(dispute.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[dispute.status]}`}>
          {dispute.status}
        </span>
      </div>

      <div className="rounded-md bg-zinc-800/60 px-3 py-2.5 space-y-1">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">Event</p>
        <p className={`text-sm font-medium ${EVENT_COLOR[dispute.event?.eventType] ?? 'text-zinc-300'}`}>
          {EVENT_LABEL[dispute.event?.eventType] ?? dispute.event?.eventType}
        </p>
      </div>

      <div className="rounded-md bg-zinc-800/60 px-3 py-2.5 space-y-1">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">Influencer's reason</p>
        <p className="text-sm text-zinc-300">{dispute.reason}</p>
      </div>

      {dispute.status === 'PENDING' && (
        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <input
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            placeholder="Moderator note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
              disabled={resolve.isPending}
              onClick={() => resolve.mutate('DISMISSED')}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Dismiss (remove event)
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1.5"
              disabled={resolve.isPending}
              onClick={() => resolve.mutate('UPHELD')}
            >
              <ShieldX className="h-3.5 w-3.5" />
              Uphold (keep event)
            </Button>
          </div>
        </div>
      )}

      {dispute.moderatorNote && (
        <div className="rounded-md bg-zinc-800/60 px-3 py-2.5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Moderator note</p>
          <p className="text-sm text-zinc-400">{dispute.moderatorNote}</p>
        </div>
      )}
    </div>
  );
}

export default function DisputesPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string;
  const role = (session?.user as any)?.role as string;
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');

  const { data: disputes, isLoading } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => reliabilityApi.getDisputes(token),
    enabled: !!token && (role === 'MODERATOR' || role === 'ADMIN'),
  });

  if (role && role !== 'MODERATOR' && role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-lg font-medium text-zinc-300">Access restricted</p>
        <p className="text-sm text-zinc-500 mt-1">Moderator access only</p>
      </div>
    );
  }

  const filtered = disputes?.filter((d) =>
    filter === 'PENDING' ? d.status === 'PENDING' : true,
  );

  const pendingCount = disputes?.filter((d) => d.status === 'PENDING').length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Disputes</h1>
          <p className="text-sm text-zinc-500">
            {pendingCount > 0 ? `${pendingCount} pending` : 'No pending disputes'}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {(['PENDING', 'ALL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f === 'PENDING' ? 'Pending' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg border border-zinc-800 bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : !filtered?.length ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Clock className="h-10 w-10 text-zinc-700 mb-3" />
          <p className="text-base font-medium text-zinc-300">
            {filter === 'PENDING' ? 'No pending disputes' : 'No disputes yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((d) => (
            <DisputeCard key={d.id} dispute={d} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}
