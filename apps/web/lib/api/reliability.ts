const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type ReliabilityEventType =
  | 'COMPLETED_ON_TIME'
  | 'COMPLETED_EARLY'
  | 'LATE'
  | 'CANCELLED_BY_INFLUENCER'
  | 'CANCELLED_BY_BRAND'
  | 'NO_RESPONSE';

export type ReliabilityEventStatus = 'ACTIVE' | 'DISPUTED' | 'UPHELD' | 'DISMISSED';
export type DisputeStatus = 'PENDING' | 'UPHELD' | 'DISMISSED';

export interface ReliabilityEvent {
  id: string;
  influencerId: string;
  dealId: string;
  eventType: ReliabilityEventType;
  status: ReliabilityEventStatus;
  note: string | null;
  createdAt: string;
}

export interface Dispute {
  id: string;
  eventId: string;
  event: ReliabilityEvent;
  influencerId: string;
  influencer: { displayName: string; avatarUrl: string | null };
  reason: string;
  status: DisputeStatus;
  moderatorNote: string | null;
  createdAt: string;
  updatedAt: string;
}

const headers = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const reliabilityApi = {
  reportNoResponse: async (dealId: string, token: string): Promise<ReliabilityEvent> => {
    const res = await fetch(`${API}/reliability/no-response/${dealId}`, {
      method: 'POST',
      headers: headers(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Failed to report no response');
    }
    return res.json();
  },

  getEvents: async (influencerId: string, token: string): Promise<ReliabilityEvent[]> => {
    const res = await fetch(`${API}/reliability/events/${influencerId}`, {
      headers: headers(token),
    });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  openDispute: async (
    eventId: string,
    reason: string,
    token: string,
  ): Promise<Dispute> => {
    const res = await fetch(`${API}/reliability/events/${eventId}/dispute`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to open dispute');
    return res.json();
  },

  getDisputes: async (token: string): Promise<Dispute[]> => {
    const res = await fetch(`${API}/reliability/disputes`, {
      headers: headers(token),
    });
    if (!res.ok) throw new Error('Failed to fetch disputes');
    return res.json();
  },

  resolveDispute: async (
    disputeId: string,
    decision: 'UPHELD' | 'DISMISSED',
    moderatorNote: string | undefined,
    token: string,
  ): Promise<Dispute> => {
    const res = await fetch(`${API}/reliability/disputes/${disputeId}/resolve`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify({ decision, moderatorNote }),
    });
    if (!res.ok) throw new Error('Failed to resolve dispute');
    return res.json();
  },
};
