import { apiClient } from './client';
import { AuthTokens } from '../../types/api';

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    role: 'BRAND' | 'INFLUENCER';
  }) => apiClient.post<AuthTokens>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthTokens>('/auth/login', data),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/auth/refresh', { refreshToken }),

  logout: (token: string) => apiClient.post<void>('/auth/logout', {}, token),
};
