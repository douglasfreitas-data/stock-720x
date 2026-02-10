'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface ScannerProps {
    onScan: (decodedText: string) => void;
    onError?: (errorMessage: string) => void;
}

export default function Scanner({ onScan, onError }: ScannerProps) {
    const [error, setError] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerId = 'scanner-container';

    useEffect(() => {
        // Cleanup function
        return () => {
            if (scannerRef.current) {
                try {
                    if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
                        scannerRef.current.stop();
                    }
                } catch (e) {
                    console.error('Error stopping scanner cleanup:', e);
                }
            }
        };
    }, []);

    const startScanner = async () => {
        try {
            // First, check if camera is available to prevent library crash
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError('📷 Seu navegador não suporta acesso à câmera.');
                return;
            }

            // Pre-check camera availability
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                // Stop the test stream immediately
                stream.getTracks().forEach(track => track.stop());
            } catch (mediaErr: unknown) {
                const msg = mediaErr instanceof Error ? mediaErr.message : '';
                if (msg.includes('NotFoundError') || msg.includes('device not found') || msg.includes('Requested device not found')) {
                    setError('📷 Câmera não encontrada. Conecte uma câmera e tente novamente.');
                } else if (msg.includes('NotAllowedError') || msg.includes('Permission denied')) {
                    setError('🔒 Acesso à câmera negado. Permita o uso da câmera nas configurações do navegador.');
                } else {
                    setError(`Erro ao acessar câmera: ${msg}`);
                }
                return;
            }

            const container = document.getElementById(containerId);
            if (!container) {
                setError('Scanner container not found');
                return;
            }

            // Se já existe instância, usa ou para antes
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(containerId);
            }

            // Se já está rodando, não inicia de novo
            if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
                return;
            }

            setIsActive(true);

            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // Success callback — stop scanning to avoid multiple rapid fires
                    if (scannerRef.current) {
                        scannerRef.current.stop().then(() => {
                            setIsActive(false);
                            onScan(decodedText);
                        }).catch(err => {
                            console.error('Error stopping after scan:', err);
                            setIsActive(false);
                            onScan(decodedText);
                        });
                    } else {
                        onScan(decodedText);
                    }
                },
                (errorMessage) => {
                    // Ignore frame scan errors
                    if (onError) onError(errorMessage);
                }
            );
        } catch (err: unknown) {
            console.error('Error starting scanner:', err);
            setIsActive(false);
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';

            // Handle common camera errors gracefully
            if (errorMessage.includes('NotFoundError') || errorMessage.includes('device not found')) {
                setError('📷 Câmera não encontrada. Conecte uma câmera e tente novamente.');
            } else if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
                setError('🔒 Acesso à câmera negado. Permita o uso da câmera nas configurações do navegador.');
            } else {
                setError(`Erro ao iniciar câmera: ${errorMessage}`);
            }
        }
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Wrapper: position relative so overlay can sit on top */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '1/1' }}>
                {/* Scanner container — Html5Qrcode manages this div, keep it clean */}
                <div
                    id={containerId}
                    style={{
                        width: '100%',
                        height: '100%',
                        background: '#000',
                        borderRadius: '12px',
                        overflow: 'hidden',
                    }}
                />
                {/* Overlay: sits ON TOP of scanner container as a sibling */}
                {!isActive && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                            zIndex: 10,
                            borderRadius: '12px',
                            background: 'rgba(0,0,0,0.7)',
                        }}
                    >
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>
                            Toque para ativar a câmera
                        </p>
                        <button
                            onClick={startScanner}
                            style={{
                                padding: '20px 40px',
                                background: 'var(--accent)',
                                color: '#fff',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '1.25rem',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                        >
                            📷 Ativar Câmera
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(255,0,0,0.1)',
                    border: '1px solid rgba(255,0,0,0.5)',
                    color: '#ef4444',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}
