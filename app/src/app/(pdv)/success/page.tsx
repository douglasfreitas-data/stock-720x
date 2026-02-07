'use client';

import React from 'react';
import Link from 'next/link';

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-fade-in">
            <div className="text-6xl mb-6">✅</div>

            <h1 className="text-2xl font-bold text-[var(--success)] mb-2">
                Venda Realizada!
            </h1>

            <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                O estoque foi atualizado e a venda registrada com sucesso.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <Link
                    href="/scan?mode=sale"
                    className="w-full py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-white hover:border-[var(--accent)] transition-colors flex items-center justify-center gap-2"
                >
                    📷 Nova Venda
                </Link>

                <Link
                    href="/"
                    className="w-full py-3 text-gray-500 hover:text-white transition-colors"
                >
                    Voltar ao Menu
                </Link>
            </div>
        </div>
    );
}
