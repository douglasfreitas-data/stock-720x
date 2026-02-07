/**
 * Serviço de autenticação OAuth2 para Nuvemshop
 */

import { NUVEMSHOP_CONFIG, getTokenUrl } from './config';

export interface NuvemshopTokenResponse {
    access_token: string;
    token_type: string;
    scope: string;
    user_id: string; // ID da loja
}

export interface NuvemshopAuthError {
    error: string;
    error_description?: string;
}

/**
 * Troca o código de autorização pelo access_token
 */
export async function exchangeCodeForToken(code: string): Promise<NuvemshopTokenResponse> {
    const response = await fetch(getTokenUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: NUVEMSHOP_CONFIG.CLIENT_ID,
            client_secret: NUVEMSHOP_CONFIG.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
        }),
    });

    if (!response.ok) {
        const error: NuvemshopAuthError = await response.json();
        throw new Error(error.error_description || error.error || 'Falha na autenticação');
    }

    return response.json();
}

/**
 * Gera um state para proteção CSRF
 */
export function generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
