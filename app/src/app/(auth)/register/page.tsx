'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup } from '@/app/actions/auth';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não conferem.');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            setIsLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);

            const result = await signup(formData);

            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch {
            // redirect() do Next.js lança um erro interno, é esperado
            router.push('/');
            router.refresh();
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
                        Criar Conta
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                        Cadastre-se para acessar o Stock 720x
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-section">
                        <label className="form-label" htmlFor="name">Nome</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            placeholder="Seu nome completo"
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-section">
                        <label className="form-label" htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="seu@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-section">
                        <label className="form-label" htmlFor="password">Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="Mínimo 6 caracteres"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-section">
                        <label className="form-label" htmlFor="confirmPassword">Confirmar Senha</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input"
                            placeholder="Repita a senha"
                            required
                            autoComplete="new-password"
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
                        {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        <Link href="/login" style={{ color: 'var(--accent)', fontSize: '0.9rem', textDecoration: 'none' }}>
                            Já tem uma conta? <strong>Faça login</strong>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
