# 🗺️ Stock 720x — Roadmap Geral

**Última atualização:** 19/03/2026  
**Horas acumuladas:** 90h

---

## Fase 1: Mockup/Protótipo ✅
> 18h — Jan/2026

- [x] PWA com 11 telas funcionais
- [x] Design system completo
- [x] Scanner simulado
- [x] Deploy Vercel

---

## Fase 2: Backend + Integração Nuvemshop ✅
> 23h — Início: 07/02/2026

| Data | Horas | Entregas |
|------|-------|----------|
| 07/02 | 12.5h | Next.js + OAuth2, Webhooks LGPD, Migração frontend, Deploy Vercel, Supabase, Instalação Nuvemshop, UX Audit |
| 10/02 | 10.5h | Fix sync, Dual-write, Módulo movimentação, Relatórios, `/atualize`, UX Fixes (11 bugs), Modal Quantidade + Autocomplete |

### Tarefas
- [x] F2.1 — Next.js + OAuth2 + Deploy Vercel *(07/02)*
- [x] F2.2 — Webhooks LGPD *(07/02)*
- [x] F2.3 — Sync Nuvemshop → Supabase com paginação *(10/02)*
- [x] F2.4 — Dual-write App → Nuvemshop + Supabase *(10/02)*
- [x] F2.5 — Rota `/api/products/barcode` server-side *(10/02)*
- [x] F2.6 — Módulo de Movimentação: Sessões + Movements *(10/02)*
- [x] F2.7 — Telas: Entrada, Saída, Ajuste, Relatórios *(10/02)*

---

## Fase 3: Polimento & Funcionalidades Core 🔲
> Estimativa: ~12h — Início previsto: 10/02/2026

### 3.1 — Limpeza Técnica (~1h)
- [ ] F3.1.1 — Remover tabela `inventory_logs` do Supabase
- [ ] F3.1.2 — Limpar imports e código morto

### 3.2 — UX/Design ✅
- [x] F3.2.1 — Revisão visual das telas de Entrada/Saída/Ajuste
- [x] F3.2.2 — Responsividade mobile (testar em dispositivo real)
- [x] F3.2.3 — Loading states e feedback visual
- [x] F3.2.4 — Tema dark/light

### 3.3 — QR Code ✅
- [x] F3.3.1 — Geração de QR/Barcode para produtos
- [x] F3.3.2 — Impressão de etiquetas (PDF)

### 3.4 — Automação de Sync ✅
- [x] F3.4.1 — Vercel Cron Job para sync automático
- [x] F3.4.2 — Webhook de produtos Nuvemshop (sync em tempo real)

### 3.5 — Relatórios Avançados (~3h)
- [ ] F3.5.1 — Filtros por data, operação, produto
- [ ] F3.5.2 — Exportar CSV/PDF
- [ ] F3.5.3 — Dashboard com gráficos (Recharts)

---

## Fase 4: Produção & Testes 🔲
> Estimativa: ~8h

- [ ] F4.1 — Testes end-to-end (Playwright ou manual)
- [ ] F4.2 — Tratamento de erros e offline mode
- [ ] F4.3 — Onboarding: tela de primeira instalação
- [ ] F4.4 — Documentação do usuário final
- [ ] F4.5 — Teste em dispositivo real com loja

---

## Fase 5: Expansão (Futuro) 🔲
> Quando o core estiver validado

- [ ] F5.1 — Multi-loja / multi-usuário
- [ ] F5.2 — Financeiro (contas a pagar/receber)
- [ ] F5.3 — Integração com leitor Bluetooth
- [ ] F5.4 — Notificações push (estoque baixo)

---

## Como Usar Este Roadmap

Cada tarefa tem um **ID único** (ex: `F3.3.1`). Ao iniciar uma sessão:

1. Consulte este arquivo para saber o próximo item
2. Crie um `implementation_plan.md` com os sub-passos
3. Execute e marque `[x]` com a data quando concluir
4. Atualize `SUMMARY.md` e `TIMESHEET.md` via `/atualize`
