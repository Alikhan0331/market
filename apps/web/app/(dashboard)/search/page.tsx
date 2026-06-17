'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { influencersApi, SearchParams } from '../../../lib/api/influencers';
import { FilterSidebar, Filters } from '../../../components/shared/FilterSidebar';
import { InfluencerCard } from '../../../components/shared/InfluencerCard';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

const DEFAULT_FILTERS: Filters = {
  country: '',
  category: '',
  platform: '',
  minFollowers: 0,
  maxFollowers: 1000000,
  minPrice: 0,
  maxPrice: 0,
};

export default function SearchPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string | undefined;
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('score');
  const [showFilters, setShowFilters] = useState(true);

  const params: SearchParams = {
    ...(filters.country && { country: filters.country }),
    ...(filters.category && { category: filters.category }),
    ...(filters.platform && { platform: filters.platform as any }),
    ...(filters.minFollowers > 0 && { minFollowers: filters.minFollowers }),
    ...(filters.maxFollowers < 1000000 && { maxFollowers: filters.maxFollowers }),
    sortBy: sortBy as any,
    sortOrder: 'desc',
    page,
    limit: 20,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['influencers', params],
    queryFn: () => influencersApi.search(params, token),
  });

  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f);
    setPage(1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Discover Influencers</h1>
          {data && (
            <p className="text-sm text-zinc-400">
              {data.meta.total.toLocaleString()} results
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => { if (v) setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-36 border-zinc-700 bg-zinc-800 text-zinc-300 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="followers">Followers</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="er">Engagement</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {showFilters && (
          <FilterSidebar filters={filters} onChange={handleFiltersChange} />
        )}

        <div className="flex-1 min-w-0">
          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-lg border border-zinc-800 bg-zinc-900 animate-pulse"
                />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium text-zinc-300">No influencers found</p>
              <p className="text-sm text-zinc-500 mt-1">Try adjusting your filters</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-zinc-700 text-zinc-400"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data?.data.map((influencer) => (
                <InfluencerCard key={influencer.id} influencer={influencer} />
              ))}
            </div>
          )}

          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-zinc-400">
                {page} / {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                disabled={page === data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
