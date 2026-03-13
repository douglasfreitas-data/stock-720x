'use client';

import { useOnlineStatus } from '@/components/providers/OnlineStatusProvider';

export default function OfflineBanner() {
    const { isOnline, wasOffline } = useOnlineStatus();

    if (isOnline && !wasOffline) return null;

    return (
        <div className={`offline-banner ${isOnline ? 'recovered' : ''}`}>
            <span className="offline-banner-icon">
                {isOnline ? '✅' : '📡'}
            </span>
            <span className="offline-banner-text">
                {isOnline
                    ? 'Conexão restaurada!'
                    : 'Sem conexão — algumas ações podem falhar'
                }
            </span>
        </div>
    );
}
