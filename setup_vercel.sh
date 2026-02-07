#!/bin/bash

# Script de configuração de variáveis de ambiente na Vercel
# Uso: ./setup_vercel.sh

echo "🚀 Iniciando configuração de variáveis na Vercel..."
echo "Este script vai te pedir as credenciais e configurar o projeto automaticamente."
echo ""

# Função para adicionar variável
add_env() {
    local key=$1
    local value=$2
    
    if [ -z "$value" ]; then
        echo "❌ Valor para $key não pode ser vazio."
        return 1
    fi

    echo "Configurando $key..."
    # Executar dentro da pasta app onde está linkado o projeto
    echo "$value" | (cd app && vercel env add "$key" production)
    echo "$value" | (cd app && vercel env add "$key" preview)
    echo "$value" | (cd app && vercel env add "$key" development)
    echo "✅ $key configurado!"
    echo ""
}

# 1. Nuvemshop
echo "--- Configuração Nuvemshop ---"
echo "O Client ID já está configurado como 25971."
# Perguntar Client Secret
read -s -p "Digite o NUVEMSHOP_CLIENT_SECRET: " NUVEMSHOP_SECRET
echo ""
add_env "NUVEMSHOP_CLIENT_SECRET" "$NUVEMSHOP_SECRET"

# Configurar URLs (valores fixos conhecidos)
echo "Configurando URLs..."
echo "https://stock720x.vercel.app/api/auth/callback" | (cd app && vercel env add NUVEMSHOP_REDIRECT_URI production)
echo "https://stock720x.vercel.app" | (cd app && vercel env add NEXT_PUBLIC_APP_URL production)
echo "✅ URLs configuradas!"
echo ""

# 2. Supabase
echo "--- Configuração Supabase ---"
echo "Acesse https://supabase.com/dashboard/project/_/settings/api para pegar estes valores."
echo ""

read -p "Digite a URL do Projeto (NEXT_PUBLIC_SUPABASE_URL): " SUPABASE_URL
add_env "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"

read -s -p "Digite a Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY): " SUPABASE_ANON
echo ""
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON"

read -s -p "Digite a Service Role Key (SUPABASE_SERVICE_ROLE_KEY): " SUPABASE_SERVICE
echo ""
add_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE"

echo "🎉 Configuração finalizada!"
echo "Para aplicar as alterações, vamos fazer um novo deploy."
read -p "Deseja fazer o deploy agora? (s/n): " DO_DEPLOY

if [ "$DO_DEPLOY" = "s" ]; then
    (cd app && vercel deploy --prod)
else
    echo "Ok! Lembre-se de fazer um redeploy depois para as variáveis funcionarem."
fi
