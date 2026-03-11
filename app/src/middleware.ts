import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rotas públicas que NÃO precisam de senha do galpão
    const publicPaths = [
        '/login',
        '/api/auth/login',         // Permite o login OAuth com a Nuvemshop
        '/api/auth/callback',
        '/auth/error',
        '/api/webhooks',           // Webhooks Nuvemshop não precisam de cookie
        '/api/sync',               // Cron jobs usam Header/Secret próprio
        '/_next',                  // Arquivos estáticos e internos do Next.js
        '/favicon.ico',
        '/manifest.json',
        '/icons/'
    ];

    const isPublic = publicPaths.some(path => pathname.startsWith(path));

    if (isPublic) {
        return NextResponse.next();
    }

    // Verifica o cookie de sessão do nosso sistema
    const sessionCookie = request.cookies.get('stock_session');

    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
        const loginUrl = new URL('/login', request.url);
        // Pode passar a página de origem para redirecionar depois
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, fonts, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
