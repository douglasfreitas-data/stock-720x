import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rotas públicas que NÃO precisam de autenticação
    const publicPaths = [
        '/login',
        '/register',
        '/api/auth',              // OAuth Nuvemshop
        '/auth/error',
        '/api/webhooks',          // Webhooks Nuvemshop
        '/api/sync',              // Cron jobs
        '/_next',
        '/favicon.ico',
        '/manifest.json',
        '/icons/'
    ];

    const isPublic = publicPaths.some(path => pathname.startsWith(path));

    if (isPublic) {
        return NextResponse.next();
    }

    // Atualiza a sessão do Supabase e verifica se o usuário está logado
    try {
        const { user, supabaseResponse } = await updateSession(request);

        if (!user) {
            // Limpa cookie antigo do sistema anterior, se existir
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('stock_session');
            return response;
        }

        // Limpa cookie antigo se ainda existir no browser de antes
        if (request.cookies.has('stock_session')) {
            supabaseResponse.cookies.delete('stock_session');
        }

        return supabaseResponse;
    } catch (error) {
        // Se o Supabase falhar por qualquer motivo (env vars, rede, etc),
        // NÃO permitir acesso — redirecionar para login por segurança
        console.error('[Middleware] Erro ao verificar sessão:', error);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
