'use client';

import { useState, useEffect } from 'react';

// Chave pública VAPID injetada pelo .env
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushNotificationPrompt() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window && vapidPublicKey) {
            setIsSupported(true);
            setPermission(Notification.permission);
            // Verifica se já está inscrito
            navigator.serviceWorker.register('/sw.js').then((registration) => {
                registration.pushManager.getSubscription().then((sub) => {
                    setIsSubscribed(!!sub);
                });
            });
        }
    }, []);

    const subscribeButtonOnClick = async () => {
        try {
            const permStatus = await Notification.requestPermission();
            setPermission(permStatus);

            if (permStatus === 'granted') {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!)
                });

                // Salva no backend
                await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription)
                });

                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Falha ao assinar push:', error);
        }
    };

    if (!isSupported || isSubscribed || permission === 'denied') {
        console.log('Push Prompt Hidden:', { isSupported, isSubscribed, permission, vapidKeyExists: !!vapidPublicKey });
        return null;
    }

    return (
        <div style={{
            background: 'var(--accent)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '10px 20px',
            gap: '15px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            <div style={{ flex: 1 }}>
                <strong>Estoque protegido!</strong>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                    Ative as notificações para receber alertas imediatos quando um produto atingir o estoque mínimo.
                </p>
            </div>
            <button 
                onClick={subscribeButtonOnClick}
                style={{
                    background: 'white',
                    color: 'var(--accent)',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Ativar Alertas
            </button>
        </div>
    );
}
