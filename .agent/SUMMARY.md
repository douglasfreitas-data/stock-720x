# Project Summary - Stock - 720x
**Last Updated:** 2026-02-10T18:27:00

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

## Known Issues
- **inventory_logs table:** Deve ser removida do Supabase (substituída por `stock_sessions`/`stock_movements`) - Ver ROADMAP F3.1.1
- **Sync manual:** Sync precisa ser rodado manualmente via `POST /api/sync`. Futuro: automatizar com cron - Ver ROADMAP F3.4.1
- **Autocomplete busca:** Campo de busca por nome no Scanner precisa implementar autocomplete - Ver ROADMAP F3.2.x

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
