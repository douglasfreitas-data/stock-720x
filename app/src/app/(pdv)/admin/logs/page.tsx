'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getSyncLogsAction } from '@/app/actions/logs';
import { useToast } from '@/components/providers/ToastProvider';

interface SyncLog {
    created_at: string;
    status: string;
    message: string;
}

function AdminLogsContent() {
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setIsLoading(true);
        const result = await getSyncLogsAction(100);
        if (result.logs) {
            setLogs(result.logs);
        } else {
            showToast(result.error || 'Erro ao carregar os logs', 'error');
        }
        setIsLoading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle size={18} color="#22c55e" />; // Green
            case 'error':
                return <XCircle size={18} color="#ef4444" />; // Red
            default:
                return <Activity size={18} color="var(--text-secondary)" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'rgba(34, 197, 94, 0.1)';
            case 'error':
                return 'rgba(239, 68, 68, 0.1)';
            default:
                return 'var(--surface)';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} /> Logs do Sistema
                </h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body" style={{ padding: 0 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Carregando logs...
                    </div>
                ) : logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Nenhum log encontrado.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
                        {logs.map((log, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                gap: '16px',
                                padding: '16px',
                                borderBottom: '1px solid var(--border-color)',
                                backgroundColor: getStatusColor(log.status),
                                alignItems: 'flex-start'
                            }}>
                                <div style={{ marginTop: '2px' }}>
                                    {getStatusIcon(log.status)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginBottom: '6px'
                                    }}>
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            fontWeight: 600, 
                                            textTransform: 'uppercase',
                                            color: log.status === 'success' ? '#22c55e' : log.status === 'error' ? '#ef4444' : 'var(--text-secondary)'
                                        }}>
                                            {log.status}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                            <Clock size={12} />
                                            <span>{formatDate(log.created_at)}</span>
                                        </div>
                                    </div>
                                    <p style={{ 
                                        margin: 0, 
                                        fontSize: '0.9rem', 
                                        color: 'var(--text-primary)',
                                        lineHeight: 1.4,
                                        wordBreak: 'break-word'
                                    }}>
                                        {log.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminLogsPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <AdminLogsContent />
        </Suspense>
    );
}
