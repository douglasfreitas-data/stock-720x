'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { updatePassword } from '@/app/actions/auth';

export default function UpdatePasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('newPassword', newPassword);
            formData.append('confirmPassword', confirmPassword);

            const result = await updatePassword(formData);

            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                setSuccess(true);
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch {
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            background: 'var(--bg-primary)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--surface)',
                padding: '32px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        🔑 Alterar Senha
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                        Digite sua nova senha abaixo
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-section">
                        <label className="form-label" htmlFor="newPassword">Nova Senha</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-input"
                            placeholder="Mínimo 6 caracteres"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-section">
                        <label className="form-label" htmlFor="confirmPassword">Confirmar Nova Senha</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input"
                            placeholder="Repita a nova senha"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ color: 'var(--success, #4ade80)', fontSize: '0.875rem', textAlign: 'center' }}>
                            ✅ Senha alterada com sucesso!
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-confirm"
                        disabled={isLoading}
                        style={{ marginTop: '8px' }}
                    >
                        {isLoading ? 'Alterando...' : 'Alterar Senha'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
                            ← Voltar ao sistema
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
