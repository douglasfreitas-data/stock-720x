# Project Summary - Stock - 720x
**Last Updated:** 2026-02-10T20:43:00

## Status
- **Current Phase:** Correção de Arquitetura + Módulo de Estoque
- **Deployment:** Vercel (Active at `https://stock720x.vercel.app`)
- **Key Success:** Sync Nuvemshop→Supabase funcional, Dual-write implementado.
- **UX Improvement:** PDV works "headless" (using DB token) without Nuvemshop admin login.

## Arquitetura de Dados (Definida 10/02/2026)

**Fonte de verdade:** Nuvemshop (loja online)
**Cache local:** Supabase (consultas rápidas por barcode, logs, relatórios)

```
Nuvemshop ──sync──► Supabase (products, product_variants)
    ▲                     │
    │                     ▼
    └── dual-write ◄── App PDV (Scanner, Inventário)
```

### Fluxo de Dados
1. **Sync** (`POST /api/sync`): Copia produtos Nuvemshop → Supabase
2. **Scanner** (`/api/products/barcode`): Busca no Supabase (server-side)
3. **Estoque** (`actions/stock.ts`): Atualiza Nuvemshop + Supabase simultaneamente
4. **Logs** (`stock_sessions` + `stock_movements`): Rastreabilidade no Supabase

### Códigos de Operação
- **Entrada:** `compra`, `devolucao`
- **Saída:** `venda`, `pregao`, `doacao`, `consumo`
- **Ajuste:** `contagem`, `perda`, `roubo`

## Key Decisions
- **Architecture:** Next.js (App Router), Tailwind CSS, Supabase.
- **Deployment:** Vercel (deployed from `app/` directory).
- **Auth Strategy:** Implemented fallback to Supabase token in `getNuvemshopClient` for PDV operators.
- **Data Access:** Client components use fetch API → API Routes → supabaseAdmin. Nunca acesso direto ao Supabase do client-side.

## Active Skills (5 Total)
- ✅ `documentation_standards` - Documentation patterns
- ✅ `git_workflow` - Conventional commits and branching
- ✅ `timesheet_management` - Time tracking in TIMESHEET.md
- ✅ `project_context` - Session continuity via SUMMARY.md
- ✅ `nuvemshop_integration` - Nuvemshop API patterns for Stock-720x
- ✅ `ai_team_roles` - Model selection strategy for token optimization

## Active Tasks
- [x] Fix Vercel 404 (Deployed from `app/`)
- [x] Test Nuvemshop Product Sync & Installation (Success! 🚀)
- [x] Fix Sync Pagination Bug (404 on last page)
- [x] Implement Dual-Write (Nuvemshop + Supabase)
- [x] Create `/api/products/barcode` server-side route
- [x] Checkout: adicionar código de operação junto com seleção de cliente ✅
- [x] Tela de Sessão de Entrada (compra, devolução) ✅
- [x] Tela de Sessão de Saída (pregão, doação, consumo) ✅
- [x] Dashboard de relatórios (Movimentações) ✅
- [x] Organização: ROADMAP.md + ai_team_roles + /iniciar ✅
- [x] UX Fixes: 6 bugs corrigidos (links, cores, scanner, entrada, lista) ✅
- [x] UX Fixes Round 2: 5 bugs corrigidos (Recuperação limpa) ✅
- [x] Entry Page UX: Modal de Quantidade + Busca Autocomplete ✅

## 🎯 Próxima Sessão — Prioridade: Integração Sólida

**Filosofia:** Integração funcionando perfeitamente primeiro, UX/limpeza depois.

### Prioridade 1: Sync Automático (Cron)
- Configurar Vercel Cron Job para `POST /api/sync` a cada 4-6h
- Garantir que o cache Supabase sempre reflete o estoque real da Nuvemshop

### Prioridade 2: Webhook de Orders (Sync em tempo real)
- Completar o `TODO` em `api/webhooks/orders/route.ts` (linha 48)
- Quando venda online acontece → atualizar estoque no Supabase

### Prioridade 3: Teste End-to-End da Integração
- Venda pelo PDV → estoque baixa na Nuvemshop + Supabase
- Entrada pelo PDV → estoque sobe na Nuvemshop + Supabase
- Venda no site → Supabase reflete automaticamente

### Depois (Baixa prioridade)
- Remover tabela `inventory_logs` do Supabase
- Limpeza de código morto
- UX polish e relatórios avançados

## Tabelas no Supabase
| Tabela | Status | Uso |
|---|---|---|
| `nuvemshop_stores` | ✅ Populada | Credenciais OAuth |
| `products` | ✅ Populada (7) | Cache de produtos |
| `product_variants` | ✅ Populada | Variantes com barcode/estoque |
| `stock_sessions` | ✅ Criada | Sessões de movimentação |
| `stock_movements` | ✅ Criada | Itens de movimentação |
| `sync_logs` | ✅ Criada | Log de sincronizações |
| `inventory_logs` | ⚠️ Remover | Substituída por stock_sessions |

## Environment & Tokens
- **Nuvemshop:** Client ID/Secret in `.env.local`
- **Supabase:** URL/Key in `.env.local`
- **MCP:** Configured in `.agent/mcp_config.json` (only GitHub active)
