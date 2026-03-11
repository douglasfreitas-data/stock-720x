'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithPassword } from '@/app/actions/auth';

function LoginForm() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('from') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('password', password);
            
            const result = await loginWithPassword(formData);

            if (result.success) {
                router.push(redirectTo);
            } else {
                setError(result.error || 'Erro ao fazer login');
            }
        } catch (err) {
            setError('Falha de conexão. Tente novamente.');
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
                        Stock 720x
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                        Acesso Restrito ao Galpão
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-section">
                        <label className="form-label" htmlFor="password">Senha de Acesso</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="Digite a senha..."
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-confirm"
                        disabled={isLoading}
                        style={{ marginTop: '8px' }}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <a href="/api/auth/login" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'underline' }}>
                            Configurar Integração Nuvemshop (Admin)
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'white' }}>
                Carregando...
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
