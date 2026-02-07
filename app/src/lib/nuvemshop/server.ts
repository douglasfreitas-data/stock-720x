import { cookies } from 'next/headers';
import { NuvemshopAPI } from './api';

interface TokenData {
    access_token: string;
    store_id: string;
    scope: string;
}

/**
 * Obtém uma instância autentiada da API Nuvemshop (Server-Side)
 * Lê o token do cookie 'nuvemshop_token'
 */
export async function getNuvemshopClient(): Promise<NuvemshopAPI | null> {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('nuvemshop_token');

    // 1. Tenta recuperar do cookie
    if (tokenCookie) {
        try {
            const tokenData: TokenData = JSON.parse(tokenCookie.value);
            return new NuvemshopAPI(tokenData.store_id, tokenData.access_token);
        } catch (error) {
            console.error('Erro ao decodificar token Nuvemshop:', error);
        }
    }

    // 2. Fallback: Recupera do Banco de Dados (Supabase)
    // Pega a loja mais recente (assumindo single-tenant ou uso principal)
    const { supabaseAdmin } = await import('@/lib/supabase/client');
    const { data: stores } = await supabaseAdmin
        .from('nuvemshop_stores')
        .select('store_id, access_token')
        .order('updated_at', { ascending: false })
        .limit(1);

    if (stores && stores.length > 0) {
        const store = stores[0];
        return new NuvemshopAPI(store.store_id, store.access_token);
    }

    return null;
}
