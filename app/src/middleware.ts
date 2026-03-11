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
    const { user, supabaseResponse } = await updateSession(request);

    if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
