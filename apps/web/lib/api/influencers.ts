import { apiClient } from './client';
import { InfluencerProfile, AvailabilityStatus } from '../../types/api';

export interface SearchParams {
  country?: string;
  city?: string;
  category?: string;
  platform?: 'instagram' | 'tiktok' | 'youtube';
  minFollowers?: number;
  maxFollowers?: number;
  minPrice?: number;
  maxPrice?: number;
  minER?: number;
  sortBy?: 'score' | 'followers' | 'price' | 'er';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  data: InfluencerProfile[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const influencersApi = {
  getMe: (token: string) =>
    apiClient.get<InfluencerProfile>('/influencers/me', token),

  getById: (id: string, token?: string) =>
    apiClient.get<InfluencerProfile>(`/influencers/${id}`, token),

  createProfile: (data: Partial<InfluencerProfile>, token: string) =>
    apiClient.post<InfluencerProfile>('/influencers/profile', data, token),

  updateMe: (data: Partial<InfluencerProfile>, token: string) =>
    apiClient.put<InfluencerProfile>('/influencers/me', data, token),

  updateAvailability: (status: AvailabilityStatus, token: string) =>
    apiClient.patch<InfluencerProfile>('/influencers/me/availability', { availabilityStatus: status }, token),

  search: (params: SearchParams, token?: string) =>
    apiClient.getWithParams<SearchResult>('/influencers', params as Record<string, unknown>, token),
};
