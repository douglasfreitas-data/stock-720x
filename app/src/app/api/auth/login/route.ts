/**
 * Rota para iniciar autenticação com Nuvemshop
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl, generateState } from '@/lib/nuvemshop';

export async function GET(request: NextRequest) {
    // Gera state para proteção CSRF
    const state = generateState();

    // Gera URL de autorização
    const authUrl = getAuthorizationUrl(state);

    // Cria resposta de redirecionamento
    const response = NextResponse.redirect(authUrl);

    // Salva state em cookie para verificar depois
    response.cookies.set('oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 5, // 5 minutos
    });

    return response;
}
