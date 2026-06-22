export type UserRole = 'BRAND' | 'INFLUENCER' | 'ADMIN' | 'MODERATOR';

export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'WARNING' | 'SUSPICIOUS';

export type DealStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COUNTERED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type DealFormat = 'STORY' | 'REEL' | 'POST' | 'VIDEO' | 'INTEGRATION';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface BrandProfile {
  id: string;
  userId: string;
  companyName: string;
  website?: string;
  industry: string;
  description?: string;
  logoUrl?: string;
  country: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InfluencerProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  country: string;
  city?: string;
  categories: string[];
  languages?: string[];
  priceFrom?: number;
  priceTo?: number;
  instagramHandle?: string;
  instagramFollowers: number;
  instagramER: number;
  instagramAvgReach: number;
  tiktokHandle?: string;
  tiktokFollowers: number;
  tiktokAvgViews: number;
  youtubeHandle?: string;
  youtubeSubscribers: number;
  youtubeAvgViews: number;
  reachScore?: number;
  engagementScore?: number;
  audienceScore?: number;
  overallScore?: number;
  verificationStatus: VerificationStatus;
  reliabilityScore?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  brandId: string;
  influencerId: string;
  status: DealStatus;
  budget: number;
  format: DealFormat;
  description: string;
  deadline: string;
  counterBudget?: number;
  counterNote?: string;
  brandRating?: number | null;
  revisionCount?: number | null;
  noResponseWarnedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  brand?: BrandProfile;
  influencer?: InfluencerProfile;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
