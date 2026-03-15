'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';

/**
 * Login com e-mail e senha
 */
export async function login(formData: FormData) {
    const supabase = await createSupabaseServer();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'E-mail e senha são obrigatórios.' };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: 'E-mail ou senha incorretos.' };
    }

    redirect('/');
}

/**
 * Cadastro de novo usuário
 */
export async function signup(formData: FormData) {
    const supabase = await createSupabaseServer();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'E-mail e senha são obrigatórios.' };
    }

    if (password.length < 6) {
        return { error: 'A senha deve ter pelo menos 6 caracteres.' };
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name || '',
            },
        },
    });

    if (error) {
        if (error.message.includes('already registered')) {
            return { error: 'Este e-mail já está cadastrado.' };
        }
        return { error: 'Erro ao criar conta. Tente novamente.' };
    }

    redirect('/');
}

/**
 * Logout
 */
export async function signout() {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
    redirect('/login');
}

/**
 * Alterar senha do usuário logado
 */
export async function updatePassword(formData: FormData) {
    const supabase = await createSupabaseServer();

    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!newPassword || !confirmPassword) {
        return { error: 'Preencha todos os campos.' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'As senhas não conferem.' };
    }

    if (newPassword.length < 6) {
        return { error: 'A senha deve ter pelo menos 6 caracteres.' };
    }

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        return { error: 'Erro ao alterar senha. Tente novamente.' };
    }

    return { success: true };
}

/**
 * Verifica se o usuário logado é o administrador
 */
export async function getAdminStatus() {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === process.env.ADMIN_EMAIL;
}
