# Stock 720x - PDV Mobile & Controle de Estoque

Sistema de Ponto de Venda (PDV) mobile com sincronização em tempo real com a Nuvemshop.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20Supabase-blue)

## 📋 Sobre o Projeto

Sistema desenvolvido para sincronizar o estoque entre loja física e loja online (Nuvemshop), eliminando a necessidade de controle manual e planilhas.

### Funcionalidades Principais

| Módulo | Descrição |
|--------|-----------|
| 🛒 **PDV Mobile** | Venda rápida via leitura de código de barras pelo celular |
| 🔄 **Sincronização** | Estoque atualiza automaticamente na Nuvemshop e vice-versa |
| 📦 **Inventário** | Auditoria de estoque usando câmera do celular |
| 💰 **Financeiro** | Registro automático de vendas com cálculo de taxas |
| 🔔 **Alertas** | Notificações de estoque mínimo para reposição |

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   App Mobile    │────▶│   API Next.js   │────▶│   Nuvemshop     │
│     (PWA)       │     │   + Supabase    │◀────│   (Webhooks)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (PWA) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase Edge Functions
- **Banco de Dados**: Supabase (PostgreSQL)
- **Integração**: API REST Nuvemshop + OAuth2 + Webhooks
- **Deploy**: Vercel + Supabase Cloud

## 📱 Fluxos Principais

### 1. Venda Física (PDV)
```
Escaneia código → Seleciona pagamento → Finaliza → Estoque baixa no site
```

### 2. Venda Online (Webhook)
```
Cliente compra no site → Webhook notifica → Estoque local atualiza
```

### 3. Inventário
```
Escaneia prateleiras → Compara com sistema → Ajusta divergências → Sincroniza
```

## 📅 Cronograma de Desenvolvimento

| 1 | Conexão Nuvemshop + Sync de Produtos | ✅ Concluído |
| 2 | PDV Mobile + Baixa Automática + Módulo de Movimentação | ✅ Concluído |
| 3 | Alertas de Estoque + Relatórios | 🔄 Em andamento |
| 4 | Módulo Financeiro + Entrega Final | ⏳ Pendente |

**Progresso Real**: Estágio final da Semana 3 (Relatórios concluídos, Alertas pendentes).

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Conta Supabase
- Aplicativo cadastrado no [Painel de Parceiros Nuvemshop](https://partners.nuvemshop.com.br/)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/stock-720x.git
cd stock-720x

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Execute em modo desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```env
# Nuvemshop
NUVEMSHOP_CLIENT_ID=seu_client_id
NUVEMSHOP_CLIENT_SECRET=seu_client_secret
NUVEMSHOP_REDIRECT_URI=https://seu-dominio.com/api/auth/callback

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service
```

## 📚 Documentação

- [Plano de Implementação Detalhado](docs/implementation_plan.md)
- [API da Nuvemshop](https://tiendanube.github.io/api-documentation/)
- [Documentação Supabase](https://supabase.com/docs)

## 📄 Licença

Este projeto é proprietário e desenvolvido sob demanda para fins comerciais.

---

**Desenvolvido para 720x** | 2026
