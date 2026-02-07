/**
 * Rota de callback OAuth2 para Nuvemshop
 * 
 * Esta rota recebe o código de autorização após o usuário
 * aprovar o app no painel Nuvemshop e troca pelo access_token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/nuvemshop';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Verifica se houve erro na autorização
    if (error) {
        console.error('Erro de autorização Nuvemshop:', error);
        return NextResponse.redirect(
            new URL(`/auth/error?message=${encodeURIComponent(error)}`, request.url)
        );
    }

    // Verifica se recebeu o código
    if (!code) {
        return NextResponse.redirect(
            new URL('/auth/error?message=Código de autorização não recebido', request.url)
        );
    }

    try {
        // Troca o código pelo access_token
        const tokenData = await exchangeCodeForToken(code);

        // Buscar detalhes da loja para salvar URL e Nome
        const storeResponse = await fetch(`https://api.nuvemshop.com.br/v1/${tokenData.user_id}/store`, {
            headers: {
                'Authentication': `bearer ${tokenData.access_token}`,
                'User-Agent': 'Stock 720x (dev@720x.com.br)'
            }
        });

        let storeInfo = { name: `Loja ${tokenData.user_id}`, url: '' };
        if (storeResponse.ok) {
            const storeData = await storeResponse.json();
            storeInfo = {
                name: storeData.name_pt || storeData.name_es || storeData.name_en || storeInfo.name,
                url: storeData.url_with_protocol || `https://${storeData.domain}`
            };
        }

        console.log('Autenticação bem sucedida!', {
            storeId: tokenData.user_id,
            scopes: tokenData.scope,
            storeName: storeInfo.name
        });

        // Salvar no Supabase
        const { error: dbError } = await supabaseAdmin
            .from('nuvemshop_stores')
            .upsert({
                store_id: tokenData.user_id.toString(),
                access_token: tokenData.access_token,
                user_id: tokenData.user_id.toString(),
                store_url: storeInfo.url,
                store_name: storeInfo.name,
                updated_at: new Date().toISOString()
            }, { onConflict: 'store_id' });

        if (dbError) {
            console.error('Erro ao salvar no Supabase:', dbError);
            // Não bloqueia o fluxo, mas loga o erro (provavelmente falta criar tabela)
        }

        const response = NextResponse.redirect(
            new URL('/dashboard?auth=success', request.url)
        );

        // Salva o token em cookie httpOnly (backup e compatibilidade)
        response.cookies.set('nuvemshop_token', JSON.stringify({
            access_token: tokenData.access_token,
            store_id: tokenData.user_id,
            scope: tokenData.scope,
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 dias
        });

        return response;

    } catch (err) {
        console.error('Erro ao trocar código por token:', err);
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        return NextResponse.redirect(
            new URL(`/auth/error?message=${encodeURIComponent(message)}`, request.url)
        );
    }
}
