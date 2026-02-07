/**
 * Configuração da integração com Nuvemshop
 */

export const NUVEMSHOP_CONFIG = {
    // URLs da API
    API_URL: 'https://api.nuvemshop.com.br',
    AUTH_URL: 'https://www.nuvemshop.com.br',

    // Credenciais (via env)
    CLIENT_ID: process.env.NUVEMSHOP_CLIENT_ID!,
    CLIENT_SECRET: process.env.NUVEMSHOP_CLIENT_SECRET!,
    REDIRECT_URI: process.env.NUVEMSHOP_REDIRECT_URI!,

    // Escopos necessários para o app
    SCOPES: [
        'read_products',
        'write_products',
        'read_orders',
    ].join(','),
} as const;

// URLs de autorização
export const getAuthorizationUrl = (state: string) => {
    const params = new URLSearchParams({
        client_id: NUVEMSHOP_CONFIG.CLIENT_ID,
        redirect_uri: NUVEMSHOP_CONFIG.REDIRECT_URI,
        response_type: 'code',
        state,
    });

    return `${NUVEMSHOP_CONFIG.AUTH_URL}/apps/${NUVEMSHOP_CONFIG.CLIENT_ID}/authorize?${params}`;
};

export const getTokenUrl = () => {
    return `${NUVEMSHOP_CONFIG.AUTH_URL}/apps/authorize/token`;
};
