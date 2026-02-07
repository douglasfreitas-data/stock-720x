'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/providers/ToastProvider';

export function SyncButton() {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/sync', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Erro ao sincronizar');

            showToast(`Sincronização concluída! ${data.count} produtos atualizados.`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Falha na sincronização.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={loading}
            className={`px-4 py-2 rounded text-white font-medium ${loading ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
                }`}
        >
            {loading ? 'Sincronizando...' : 'Sincronizar'}
        </button>
    );
}
