import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Atualiza (refresh) a sessão do Supabase no middleware.
 * Retorna o response com os cookies atualizados.
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Seta cookies no request (para o server component conseguir ler)
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // Recria o response com os cookies atualizados
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Não colocar lógica entre createServerClient e getUser.
    // Um simples erro aqui pode fazer o usuário ser deslogado aleatoriamente.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return { user, supabaseResponse };
}
