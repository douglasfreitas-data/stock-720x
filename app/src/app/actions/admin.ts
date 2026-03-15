'use server';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase/server';

// Função para criar o cliente admin (para não inicializar no carregamento do módulo)
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
        throw new Error('Acesso negado. Apenas o administrador pode realizar esta ação.');
    }

    return getAdminClient();
}

export async function listUsersAction() {
    try {
        const supabaseAdmin = await verifyAdminAccess();

        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            console.error('Error listing users:', error);
            return { error: 'Falha ao listar usuários.' };
        }

        return { 
            users: users.map(u => ({ 
                id: u.id, 
                email: u.email,
                createdAt: u.created_at,
                lastSignInAt: u.last_sign_in_at
            })) 
        };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function createUserAction(formData: FormData) {
    try {
        const supabaseAdmin = await verifyAdminAccess();

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password || password.length < 6) {
            return { error: 'E-mail inválido ou senha muito curta (mínimo 6 caracteres).' };
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirma o e-mail para que possam fazer o login imediatamente
        });

        if (error) {
            console.error('Error creating user:', error);
            return { error: error.message };
        }

        return { success: true, user: { id: data.user.id, email: data.user.email } };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteUserAction(userId: string) {
    try {
        const supabaseAdmin = await verifyAdminAccess();

        // Security check: we probably shouldn't let the admin delete themselves
        // Let's get the user to check their email first, or just try to delete
        const { data: { user }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (fetchError || !user) {
            return { error: 'Usuário não encontrado.' };
        }

        if (user.email === process.env.ADMIN_EMAIL) {
            return { error: 'Você não pode excluir a conta de administrador principal.' };
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            console.error('Error deleting user:', error);
            return { error: 'Falha ao excluir o usuário.' };
        }

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
