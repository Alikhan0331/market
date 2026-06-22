const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface PricingResult {
  floor: number;
  recommended: number;
  high: number;
  demandSurge: boolean;
  recentOffersCount: number;
  hasEnoughData: boolean;
}

export type MarketPosition = 'above_market' | 'at_market' | 'below_market' | 'no_data';

export interface PricingBreakdown {
  position: MarketPosition;
  marketDiffPct: number | null;
  boosters: string[];
  dampers: string[];
  tip: string | null;
}

const h = (token: string) => ({ Authorization: `Bearer ${token}` });

export const pricingApi = {
  get: async (influencerId: string, token: string): Promise<PricingResult> => {
    const res = await fetch(`${API}/pricing/${influencerId}`, { headers: h(token) });
    if (!res.ok) throw new Error('Failed to fetch pricing');
    return res.json();
  },

  getBreakdown: async (influencerId: string, token: string): Promise<PricingBreakdown> => {
    const res = await fetch(`${API}/pricing/${influencerId}/breakdown`, { headers: h(token) });
    if (!res.ok) throw new Error('Failed to fetch breakdown');
    return res.json();
  },
};
