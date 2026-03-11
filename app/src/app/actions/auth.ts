'use server';

import { cookies } from 'next/headers';

export async function loginWithPassword(formData: FormData) {
    const password = formData.get('password') as string;
    const correctPassword = process.env.APP_PASSWORD || '720x'; // Fallback if env is missing

    if (!password) {
        return { success: false, error: 'Senha obrigatória' };
    }

    if (password === correctPassword) {
        // Obter cookie store de forma assíncrona no Next 15+
        const cookieStore = await cookies();
        cookieStore.set('stock_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 dias de acesso
            path: '/'
        });

        return { success: true };
    }

    return { success: false, error: 'Senha incorreta' };
}
