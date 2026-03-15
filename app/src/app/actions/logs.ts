'use server';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase/server';

function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase Service Role Key não configurada.');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// Verifica se o usuário logado é o administrador configurado
async function verifyAdminAccess() {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
        throw new Error('Acesso negado. Apenas o administrador pode acessar os logs.');
    }

    return getAdminClient();
}

export async function getSyncLogsAction(limit = 100) {
    try {
        const supabaseAdmin = await verifyAdminAccess();

        const { data, error } = await supabaseAdmin
            .from('sync_logs')
            .select('created_at, status, message')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching sync logs:', error);
            return { error: 'Falha ao buscar os logs.' };
        }

        return { logs: data };
    } catch (error: any) {
        return { error: error.message };
    }
}
