'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { listUsersAction, createUserAction, deleteUserAction } from '@/app/actions/admin';
import { useToast } from '@/components/providers/ToastProvider';

interface User {
    id: string;
    email?: string;
    createdAt: string;
    lastSignInAt?: string;
}

function AdminUsersContent() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // New User form state
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        const result = await listUsersAction();
        if (result.users) {
            setUsers(result.users);
        } else {
            showToast(result.error || 'Erro ao carregar usuários', 'error');
        }
        setIsLoading(false);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsCreating(true);

        const formData = new FormData();
        formData.append('email', newEmail);
        formData.append('password', newPassword);

        const result = await createUserAction(formData);

        if (result.error) {
            setError(result.error);
            showToast(result.error, 'error');
        } else if (result.success) {
            showToast('Usuário criado com sucesso!', 'success');
            setShowCreateModal(false);
            setNewEmail('');
            setNewPassword('');
            loadUsers(); // Refresh the list
        }

        setIsCreating(false);
    };

    const handleDeleteUser = async (userId: string, email: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o usuário ${email}? Esta ação não pode ser desfeita e removerá o acesso ao sistema.`)) {
            return;
        }

        setIsLoading(true);
        const result = await deleteUserAction(userId);
        if (result.error) {
            showToast(result.error, 'error');
            setIsLoading(false);
        } else {
            showToast('Usuário excluído com sucesso.', 'success');
            loadUsers(); // refresh
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} /> Gestão de Usuários
                </h3>
                <button 
                    onClick={() => setShowCreateModal(true)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '8px' }}
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="modal-body">
                <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <ShieldAlert color="var(--accent)" size={24} style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Esta é uma área administrativa. Usuários criados aqui terão acesso ao sistema e poderão gerenciar o estoque.
                    </p>
                </div>

                <div className="form-section">
                    <label className="form-label" style={{ marginBottom: '16px', display: 'block' }}>Contas Ativas no Sistema ({users.length})</label>
                    
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            Carregando usuários...
                        </div>
                    ) : users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            Nenhum usuário encontrado.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {users.map(user => (
                                <div key={user.id} style={{ 
                                    background: 'var(--surface)', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: 'var(--radius)', 
                                    padding: '16px' 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{user.email}</h4>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id, user.email || 'Desconhecido')}
                                            style={{ 
                                                background: 'transparent', 
                                                border: 'none', 
                                                color: 'var(--danger)', 
                                                cursor: 'pointer',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Excluir Usuário"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <span>Criado em: {new Date(user.createdAt).toLocaleDateString()}</span>
                                        <span>Último login: {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Nunca'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Criar Novo Usuário */}
                {showCreateModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', padding: '24px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Criar Novo Usuário</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                A conta será ativada imediatamente para acesso.
                            </p>

                            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-section">
                                    <label className="form-label">E-mail</label>
                                    <input
                                        type="email"
                                        required
                                        className="form-input"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                        placeholder="email@loja.com"
                                    />
                                </div>
                                <div className="form-section">
                                    <label className="form-label">Senha Inicial</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="form-input"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 caracteres"
                                    />
                                </div>

                                {error && (
                                    <div style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>
                                        {error}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCreateModal(false)}
                                        style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-confirm" 
                                        style={{ flex: 1, margin: 0 }}
                                        disabled={isCreating}
                                    >
                                        {isCreating ? 'Criando...' : 'Criar Conta'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <AdminUsersContent />
        </Suspense>
    );
}
