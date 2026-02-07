import { createClient } from '@supabase/supabase-js';

// Cliente para uso no client-side (navegador)
// Usa a chave anônima pública
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente para uso no server-side (API Routes)
// Usa a chave service role (privilégios totais)
// CUIDADO: Nunca use este cliente no frontend!
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
