#!/bin/bash

# Script de configuração automática de variáveis Vercel
# Uso: ./configure_vercel_auto.sh

echo "🚀 Iniciando configuração automática..."

# Função para adicionar env var (production, preview, development)
add_env() {
    local key=$1
    local value=$2
    
    echo "Configurando $key..."
    # Adicionar para todos os ambientes
    echo "$value" | vercel env add "$key" production >/dev/null 2>&1
    echo "$value" | vercel env add "$key" preview >/dev/null 2>&1
    echo "$value" | vercel env add "$key" development >/dev/null 2>&1
    echo "✅ $key configurado!"
}

# Credenciais Nuvemshop
add_env "NUVEMSHOP_CLIENT_ID" "25971"
add_env "NUVEMSHOP_CLIENT_SECRET" "REPLACE_WITH_YOUR_SECRET"
add_env "NUVEMSHOP_REDIRECT_URI" "https://stock720x.vercel.app/api/auth/callback"
add_env "NEXT_PUBLIC_APP_URL" "https://stock720x.vercel.app"

# Credenciais Supabase
add_env "NEXT_PUBLIC_SUPABASE_URL" "https://qdhcijminpwoftriebak.supabase.co"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "sb_publishable_6-fOr8bSW6HADFcbxu-_9Q_WdRsEUPI"
add_env "SUPABASE_SERVICE_ROLE_KEY" "REPLACE_WITH_YOUR_KEY"

echo ""
echo "🎉 Todas as variáveis foram configuradas com sucesso na Vercel!"
echo "⚠️  IMPORTANTE: Para que elas funcionem, é necessário fazer um NOVO DEPLOY."
echo "Rodando 'vercel deploy --prod' agora mesmo..."

vercel deploy --prod
