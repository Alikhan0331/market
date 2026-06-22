const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type PartnershipTier = 'NONE' | 'RETURNING' | 'TRUSTED' | 'EXCLUSIVE';

export const TIER_LABELS: Record<PartnershipTier, string> = {
  NONE:      '',
  RETURNING: 'Returning Partner',
  TRUSTED:   'Trusted Partner',
  EXCLUSIVE: 'Exclusive Partner',
};

export const TIER_DISCOUNT: Record<PartnershipTier, number> = {
  NONE:      0,
  RETURNING: 5,
  TRUSTED:   10,
  EXCLUSIVE: 15,
};

export const TIER_COLOR: Record<PartnershipTier, string> = {
  NONE:      '',
  RETURNING: 'bg-zinc-700 text-zinc-300',
  TRUSTED:   'bg-[#4F6EF7]/15 text-[#7B93FA]',
  EXCLUSIVE: 'bg-amber-500/15 text-amber-400',
};

export interface PartnershipScore {
  id: string;
  brandId: string;
  influencerId: string;
  completedDealsCount: number;
  tier: PartnershipTier;
  lastCompletedAt: string | null;
  influencer?: { displayName: string; avatarUrl: string | null };
  brand?: { companyName: string; logoUrl: string | null };
}

const headers = (token: string) => ({ Authorization: `Bearer ${token}` });

export const partnershipsApi = {
  getPair: async (influencerId: string, token: string): Promise<PartnershipScore | null> => {
    const res = await fetch(`${API}/partnerships/pair/${influencerId}`, {
      headers: headers(token),
    });
    if (!res.ok) return null;
    return res.json();
  },

  getForBrand: async (token: string): Promise<PartnershipScore[]> => {
    const res = await fetch(`${API}/partnerships/brand`, { headers: headers(token) });
    if (!res.ok) return [];
    return res.json();
  },

  getForInfluencer: async (token: string): Promise<PartnershipScore[]> => {
    const res = await fetch(`${API}/partnerships/influencer`, { headers: headers(token) });
    if (!res.ok) return [];
    return res.json();
  },
};
