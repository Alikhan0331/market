import { apiClient } from './client';
import { InfluencerProfile, PaginatedResponse } from '../../types/api';

export interface SearchParams {
  country?: string;
  city?: string;
  category?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minPrice?: number;
  maxPrice?: number;
  minER?: number;
  platform?: 'instagram' | 'tiktok' | 'youtube';
  sortBy?: 'score' | 'followers' | 'price' | 'er';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const influencersApi = {
  search: (params: SearchParams, token?: string) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    return apiClient.get<PaginatedResponse<InfluencerProfile>>(
      `/influencers?${qs.toString()}`,
      token,
    );
  },

  getById: (id: string, token?: string) =>
    apiClient.get<InfluencerProfile>(`/influencers/${id}`, token),

  getMe: (token: string) => apiClient.get<InfluencerProfile>('/influencers/me', token),

  createProfile: (data: Partial<InfluencerProfile>, token: string) =>
    apiClient.post<InfluencerProfile>('/influencers/profile', data, token),

  updateMe: (data: Partial<InfluencerProfile>, token: string) =>
    apiClient.put<InfluencerProfile>('/influencers/me', data, token),
};
