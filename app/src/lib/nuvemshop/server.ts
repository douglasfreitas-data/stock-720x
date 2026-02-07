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

    if (!tokenCookie) {
        return null; // Não logado
    }

    try {
        const tokenData: TokenData = JSON.parse(tokenCookie.value);
        return new NuvemshopAPI(tokenData.store_id, tokenData.access_token);
    } catch (error) {
        console.error('Erro ao decodificar token Nuvemshop:', error);
        return null;
    }
}
