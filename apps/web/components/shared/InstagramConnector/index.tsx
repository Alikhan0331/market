'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { instagramApi } from '../../../lib/api/instagram';
import { buttonVariants } from '../../ui/button';
import { cn } from '../../../lib/utils';

function fmt(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

interface Props {
    token: string;
    lastSyncAt?: string;
    onSaved: () => void;
}

export function InstagramConnector({ token, lastSyncAt, onSaved }: Props) {
    const searchParams = useSearchParams();
    const qc = useQueryClient();

    // Показываем toast после OAuth редиректа
    useEffect(() => {
        const status = searchParams.get('instagram');
        if (status === 'connected') {
            toast.success('Instagram connected!');
            qc.invalidateQueries({ queryKey: ['instagram-me'] });
            qc.invalidateQueries({ queryKey: ['profile'] });
            onSaved();
        } else if (status === 'error') {
            toast.error(searchParams.get('msg') ?? 'Instagram connection failed');
        }
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['instagram-me'],
        queryFn: () => instagramApi.getMe(token),
        enabled: !!token,
    });

    const connectUrl = instagramApi.getConnectUrl(token);

    return (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-300">Instagram</p>
                {lastSyncAt && (
                    <p className="text-xs text-zinc-600">
                        Last sync: {new Date(lastSyncAt).toLocaleDateString()}
                    </p>
                )}
            </div>

            {isLoading ? (
                <p className="text-xs text-zinc-500">Loading…</p>
            ) : data?.connected ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        {data.profile_picture_url && (
                            <img
                                src={data.profile_picture_url}
                                alt={data.username}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        )}
                        <div>
                            <p className="text-sm font-semibold text-zinc-100">
                                @{data.username}
                            </p>
                            <p className="text-xs text-zinc-500">{data.account_type}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-0.5">
                            <p className="text-xs text-zinc-500">Followers</p>
                            <p className="text-sm font-medium text-zinc-100">
                                {fmt(data.followers_count ?? 0)}
                            </p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs text-zinc-500">Posts</p>
                            <p className="text-sm font-medium text-zinc-100">
                                {data.media_count ?? 0}
                            </p>
                        </div>
                    </div>
                    {data.biography && (
                        <p className="text-xs text-zinc-400 line-clamp-2">{data.biography}</p>
                    )}
                    <a
                        href={connectUrl}
                        className={cn(
                            buttonVariants({ variant: 'outline' }),
                            'border-zinc-700 text-zinc-300 w-full text-center',
                        )}
                    >
                        Reconnect Instagram
                    </a>
                </div>
            ) : (
                <a
                    href={connectUrl}
                    className={cn(
                        buttonVariants(),
                        'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white w-full text-center block',
                    )}
                >
                    Connect Instagram
                </a>
            )}
        </div>
    );
}