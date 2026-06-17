import { apiClient } from './client';
import { BrandProfile } from '../../types/api';

export const brandsApi = {
  getMe: (token: string) => apiClient.get<BrandProfile>('/brands/me', token),

  getById: (id: string, token?: string) =>
    apiClient.get<BrandProfile>(`/brands/${id}`, token),

  createProfile: (data: Partial<BrandProfile>, token: string) =>
    apiClient.post<BrandProfile>('/brands/profile', data, token),

  updateMe: (data: Partial<BrandProfile>, token: string) =>
    apiClient.put<BrandProfile>('/brands/me', data, token),
};
