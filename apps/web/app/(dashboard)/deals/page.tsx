'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { dealsApi } from '../../../lib/api/deals';
import { DealStatusBadge } from '../../../components/shared/DealStatusBadge';
import { Button, buttonVariants } from '../../../components/ui/button';
import { formatPrice, formatDate } from '../../../lib/utils/formatters';
import { Plus } from 'lucide-react';
import { Deal } from '../../../types/api';
import { cn } from '../../../lib/utils';

export default function DealsPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string;
  const role = (session?.user as any)?.role as string;

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.list(token),
    enabled: !!token,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Deals</h1>
        {role === 'BRAND' && (
          <Link
            href="/deals/new"
            className={cn(buttonVariants({ size: 'sm' }), 'bg-[#4F6EF7] hover:bg-[#3D5CE5] text-white')}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New deal
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg border border-zinc-800 bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-zinc-300">No deals yet</p>
          <p className="text-sm text-zinc-500 mt-1">
            {role === 'BRAND'
              ? 'Browse influencers and send your first offer'
              : 'Deals from brands will appear here'}
          </p>
          {role === 'BRAND' && (
            <Link
              href="/search"
              className={cn(buttonVariants({ size: 'sm' }), 'mt-4 bg-[#4F6EF7] hover:bg-[#3D5CE5] text-white')}
            >
              Browse influencers
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  {role === 'BRAND' ? 'Influencer' : 'Brand'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Format</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Deadline</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900">
              {(deals as Deal[]).map((deal) => (
                <tr key={deal.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 text-zinc-300">
                    {role === 'BRAND'
                      ? deal.influencer?.displayName ?? '—'
                      : deal.brand?.companyName ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{deal.format}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-100 font-medium tabular-nums">
                    {formatPrice(deal.budget)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{formatDate(deal.deadline)}</td>
                  <td className="px-4 py-3">
                    <DealStatusBadge status={deal.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/deals/${deal.id}`}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-zinc-400 hover:text-zinc-100 h-7')}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
