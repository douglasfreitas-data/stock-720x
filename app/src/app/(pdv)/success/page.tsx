'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, Check, Camera, ArrowLeft } from 'lucide-react';

export default function SuccessPage() {
    return (
        <div className="success-screen">
            <div className="success-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <CheckCircle size={80} color="var(--success)" strokeWidth={1.5} />
            </div>
            <h2 className="success-title">Venda Realizada!</h2>

            <p className="success-subtitle">
                O estoque foi atualizado e a venda registrada com sucesso.
            </p>

            {/* Sync Status */}
            <div className="sync-status" style={{ marginBottom: '40px' }}>
                <div className="sync-item">
                    <Check size={16} /> Estoque Local
                </div>
                <div className="sync-item">
                    <Check size={16} /> Nuvemshop
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                <Link
                    href="/scan?mode=sale"
                    className="btn-confirm"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <Camera size={20} /> Nova Venda
                </Link>

                <Link
                    href="/"
                    className="btn-back"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                >
                    <ArrowLeft size={18} /> Voltar ao Início
                </Link>
            </div>
        </div>
    );
}
