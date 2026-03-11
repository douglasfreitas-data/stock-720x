'use client';

import React, { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Verifica se já está instalado (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) {
            return;
        }

        // Se o usuário dispensou antes na sessão atual
        if (sessionStorage.getItem('pwa_prompt_dismissed')) {
            setIsDismissed(true);
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            // Previne o mini-infobar nativo de aparecer
            e.preventDefault();
            // Guarda o evento para dispararmos depois
            setDeferredPrompt(e);
            // Atualiza o estado para mostrar o nosso prompt customizado
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Se a instalação for feita com sucesso, esconde o prompt
        window.addEventListener('appinstalled', () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
            console.log('PWA instalado com sucesso');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Mostra o prompt nativo de instalação
        deferredPrompt.prompt();

        // Espera pela decisão do usuário
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('Usuário aceitou a instalação do PWA');
        } else {
            console.log('Usuário recusou a instalação do PWA');
        }

        // O prompt só pode ser usado uma vez
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    const handleDismiss = () => {
        setIsInstallable(false);
        setIsDismissed(true);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isInstallable || isDismissed) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 9999,
            width: '90%',
            maxWidth: '350px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/icon-192.png" alt="720x Logo" style={{ width: '48px', height: '48px', borderRadius: '8px' }} />
                <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Instalar Stock 720x</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Instale o aplicativo para uma experiência mais rápida e integrada no celular.</p>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                    onClick={handleInstallClick}
                    style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Instalar
                </button>
                <button 
                    onClick={handleDismiss}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Agora não
                </button>
            </div>
        </div>
    );
}
