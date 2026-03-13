'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface OnlineStatusContextType {
    isOnline: boolean;
    wasOffline: boolean;
    clearWasOffline: () => void;
}

const OnlineStatusContext = createContext<OnlineStatusContextType>({
    isOnline: true,
    wasOffline: false,
    clearWasOffline: () => {},
});

export function OnlineStatusProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        // Set initial state from browser
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            // Mark that we recovered from offline so UI can show "Conexão restaurada"
            setWasOffline(true);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Auto-clear the "wasOffline" recovery message after 4 seconds
    useEffect(() => {
        if (wasOffline) {
            const timer = setTimeout(() => setWasOffline(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [wasOffline]);

    const clearWasOffline = useCallback(() => setWasOffline(false), []);

    return (
        <OnlineStatusContext.Provider value={{ isOnline, wasOffline, clearWasOffline }}>
            {children}
        </OnlineStatusContext.Provider>
    );
}

export function useOnlineStatus() {
    return useContext(OnlineStatusContext);
}
