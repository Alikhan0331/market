import { apiClient } from './client';

export interface InstagramData {
    connected: boolean;
    id?: string;
    username?: string;
    followers_count?: number;
    media_count?: number;
    biography?: string;
    profile_picture_url?: string;
    error?: string;
}

export const instagramApi = {
    // Получить данные подключённого Instagram
    getMe: (token: string) =>
        apiClient.get<InstagramData>('/instagram/me', token),

    // Построить URL для OAuth редиректа (state = JWT токен пользователя)
    getConnectUrl: (token: string) =>
        `${process.env.NEXT_PUBLIC_API_URL}/instagram/connect?state=${encodeURIComponent(token)}`,
};