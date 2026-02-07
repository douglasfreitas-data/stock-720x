/**
 * Rota de callback OAuth2 para Nuvemshop
 * 
 * Esta rota recebe o código de autorização após o usuário
 * aprovar o app no painel Nuvemshop e troca pelo access_token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/nuvemshop';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Verifica se houve erro na autorização
    if (error) {
        console.error('Erro de autorização Nuvemshop:', error);
        return NextResponse.redirect(
            new URL(`/auth/error?message=${encodeURIComponent(error)}`, request.url)
        );
    }

    // Verifica se recebeu o código
    if (!code) {
        return NextResponse.redirect(
            new URL('/auth/error?message=Código de autorização não recebido', request.url)
        );
    }

    try {
        // Troca o código pelo access_token
        const tokenData = await exchangeCodeForToken(code);

        console.log('Autenticação bem sucedida!', {
            storeId: tokenData.user_id,
            scopes: tokenData.scope,
        });

        // TODO: Salvar tokenData no Supabase
        // Por enquanto, armazenar em cookie seguro para dev
        const response = NextResponse.redirect(
            new URL('/dashboard?auth=success', request.url)
        );

        // Salva o token em cookie httpOnly (temporário - usar Supabase em produção)
        response.cookies.set('nuvemshop_token', JSON.stringify({
            access_token: tokenData.access_token,
            store_id: tokenData.user_id,
            scope: tokenData.scope,
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 dias
        });

        return response;

    } catch (err) {
        console.error('Erro ao trocar código por token:', err);
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        return NextResponse.redirect(
            new URL(`/auth/error?message=${encodeURIComponent(message)}`, request.url)
        );
    }
}
