import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cria um cliente Supabase para uso em Server Components e Server Actions.
 * Lê e grava cookies automaticamente para manter a sessão do usuário.
 */
export async function createSupabaseServer() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Pode falhar em Server Components (read-only).
                        // Funciona normalmente em Server Actions e Route Handlers.
                    }
                },
            },
        }
    );
}
