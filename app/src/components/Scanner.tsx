'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface ScannerProps {
    onScan: (decodedText: string) => void;
    onError?: (errorMessage: string) => void;
}

export default function Scanner({ onScan, onError }: ScannerProps) {
    const [error, setError] = useState<string | null>(null);
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

            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // Success callback
                    // Stop scanning automatically? Or keep scanning?
                    // For now, let's stop to avoid multiple rapid fires
                    if (scannerRef.current) {
                        scannerRef.current.stop().then(() => {
                            onScan(decodedText);
                        }).catch(err => {
                            console.error('Error stopping after scan:', err);
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
        } catch (err) {
            console.error('Error starting scanner:', err);
            setError(err instanceof Error ? err.message : 'Unknown error starting scanner');
        }
    };

    return (
        <div className="scanner-wrapper w-full flex flex-col items-center">
            <div
                id={containerId}
                className="w-full max-w-[400px] aspect-square bg-black rounded-lg overflow-hidden relative"
            >
                {/* Placeholder before start */}
                {!scannerRef.current && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50">
                        Iniciando câmera...
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-100/10 border border-red-500/50 text-red-500 rounded-lg text-center text-sm">
                    {error}
                </div>
            )}

            <button
                onClick={startScanner}
                className="mt-4 px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
                📷 Ativar Câmera
            </button>
        </div>
    );
}
