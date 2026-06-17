'use client';

import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Slider } from '../../ui/slider';
import { Separator } from '../../ui/separator';

export interface Filters {
  country: string;
  category: string;
  platform: string;
  minFollowers: number;
  maxFollowers: number;
  minPrice: number;
  maxPrice: number;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const CATEGORIES = [
  'All', 'Fashion', 'Beauty', 'Tech', 'Gaming', 'Fitness',
  'Food', 'Travel', 'Lifestyle', 'Finance', 'Education',
];

const PLATFORMS = [
  { value: '', label: 'All' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
];

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  function update(partial: Partial<Filters>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <aside className="w-56 shrink-0 space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Country</Label>
        <Input
          placeholder="e.g. United States"
          value={filters.country}
          onChange={(e) => update({ country: e.target.value })}
          className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-sm"
        />
      </div>

      <Separator className="bg-zinc-800" />

      <div className="space-y-2">
        <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Category</Label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const val = cat === 'All' ? '' : cat;
            const active = filters.category === val;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => update({ category: val })}
                className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                  active
                    ? 'bg-[#4F6EF7] text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      <div className="space-y-2">
        <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Platform</Label>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map(({ value, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => update({ platform: value })}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                filters.platform === value
                  ? 'bg-[#4F6EF7] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      <div className="space-y-3">
        <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Followers: {filters.minFollowers.toLocaleString()} – {filters.maxFollowers.toLocaleString()}
        </Label>
        <Slider
          min={0}
          max={1000000}
          step={10000}
          value={[filters.minFollowers, filters.maxFollowers]}
          onValueChange={(val) => {
            const arr = Array.isArray(val) ? val : [val];
            update({ minFollowers: arr[0] ?? 0, maxFollowers: arr[1] ?? 1000000 });
          }}
          className="[&>span]:bg-[#4F6EF7]"
        />
      </div>
    </aside>
  );
}
