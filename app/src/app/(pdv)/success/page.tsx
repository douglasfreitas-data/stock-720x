'use client';

import React from 'react';
import Link from 'next/link';

export default function SuccessPage() {
    return (
        <div className="success-screen">
            <div className="success-icon">✅</div>
            <h2 className="success-title">Venda Realizada!</h2>

            <p className="success-subtitle">
                O estoque foi atualizado e a venda registrada com sucesso.
            </p>

            {/* Sync Status */}
            <div className="sync-status" style={{ marginBottom: '40px' }}>
                <div className="sync-item">
                    ✔ Estoque Local
                </div>
                <div className="sync-item">
                    ✔ Nuvemshop
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                <Link
                    href="/scan?mode=sale"
                    className="btn-confirm"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    📷 Nova Venda
                </Link>

                <Link
                    href="/"
                    className="btn-back"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                >
                    ← Voltar ao Início
                </Link>
            </div>
        </div>
    );
}
