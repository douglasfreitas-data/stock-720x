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
                    // Success callback
                    if (scannerRef.current) {
                        scannerRef.current.stop().then(() => {
                            setIsActive(false);
                            onScan(decodedText);
                        }).catch(err => {
                            console.error('Error stopping after scan:', err);
                            setIsActive(false);
                            onScan(decodedText); // Send anyway
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
        <div className="scanner-wrapper w-full flex flex-col items-center">
            <div
                id={containerId}
                className="w-full max-w-[400px] aspect-square bg-black rounded-lg overflow-hidden relative"
            >
                {/* Placeholder / Activate Camera overlay */}
                {!isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <p className="text-white/50 text-sm">Toque para ativar a câmera</p>
                        <button
                            onClick={startScanner}
                            className="px-10 py-5 bg-[var(--accent)] text-white rounded-xl font-semibold text-xl hover:bg-[var(--accent-hover)] transition-colors shadow-lg"
                        >
                            📷 Ativar Câmera
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-100/10 border border-red-500/50 text-red-500 rounded-lg text-center text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}
