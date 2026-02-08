# Project Summary - Stock - 720x
**Last Updated:** 2026-02-07T20:20:00

## Status
- **Current Phase:** Nuvemshop Integration Completed ✅
- **Deployment:** Vercel (Active at `https://stock720x.vercel.app`)
- **Key Success:** App installed and syncing products/stock bidirectionally.
- **UX Improvement:** PDV works "headless" (using DB token) without Nuvemshop admin login.

## Key Decisions
- **Architecture:** Next.js (App Router), Tailwind CSS, Supabase.
- **Deployment:** Vercel (deployed from `app/` directory).
- **Auth Strategy:** Implemented fallback to Supabase token in `getNuvemshopClient` for PDV operators.
- **Env Var Fix:** Identified and fixed newline characters (`\n`) in Vercel environment variables that caused `redirect_uri_mismatch`.

## Active Skills (5 Total)
- ✅ `documentation_standards` - Documentation patterns
- ✅ `git_workflow` - Conventional commits and branching
- ✅ `timesheet_management` - Time tracking in TIMESHEET.md
- ✅ `project_context` - Session continuity via SUMMARY.md
- ✅ `nuvemshop_integration` - Nuvemshop API patterns for Stock-720x

## Active Tasks
- [x] Fix Vercel 404 (Deployed from `app/`)
- [x] Create Optimization/Hacks Setup
- [x] Fix Skills structure (reorganized to correct format)
- [x] Test Nuvemshop Product Sync & Installation (Success! 🚀)
- [x] Polimento de Design & UX (alinhar com Mockup)
- [x] Implementar Geração de QR Code para etiquetas
- [ ] Implementar Módulo de **Entrada de Estoque** (com histórico de compras)
- [ ] Implementar **Ajuste de Inventário** (com logs de motivo para auditoria)
- [ ] Implementar alertas de estoque avançados
- [ ] Dashboard de relatórios (Finanças/Vendas)

## Known Issues
- **Cart Persistence:** Cart empties on redirect in Production (Vercel). Works locally. Likely due to mock data/static build.
- **MCP:** `@supabase/mcp-server` and `@vercel/mcp-server` don't exist on npm. Removed from templates.
- **MCP:** Only `@modelcontextprotocol/server-github` works.

## Environment & Tokens
- **Next Step:** Design/UX, QR Code, Entrada de Estoque e Histórico de Ajustes
- **Nuvemshop:** Client ID/Secret in `.env.local`
- **Supabase:** URL/Key in `.env.local`
- **MCP:** Configured in `.agent/mcp_config.json` (only GitHub active)
