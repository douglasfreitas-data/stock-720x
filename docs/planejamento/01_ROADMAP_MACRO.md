# 🗺️ Roadmap Macro — Stock 720x

**Visão Geral de Longo Prazo**

---

## Fase 1: Mockup/Protótipo ✅
> **Status:** Concluída (Jan/2026)
- [x] PWA com 11 telas funcionais
- [x] Design system completo
- [x] Scanner simulado

## Fase 2: Backend + Integração Nuvemshop ✅
> **Status:** Concluída (Fev/2026)
- [x] Next.js + OAuth2
- [x] Sync Nuvemshop → Supabase (Dual-write)
- [x] Módulo de Movimentação (Entrada/Saída/Ajuste)

## Fase 3: Polimento & Funcionalidades Core ✅
> **Status:** Concluída (Mar/2026)
- [x] **Limpeza Técnica**: Remover tabelas obsoletas, limpar código morto.
- [x] **UX/Design**: Revisão visual, responsividade, feedback de loading.
- [x] **Relatórios**: Filtros avançados, design clean e exportação PDF.
- [x] **Automação**: Cron jobs inteligentes (reconciliação Nuvemshop) e webhooks em tempo real.

## Fase 4: Operação Física & Produção 🔄
> **Status:** Concluída (Mar/2026)
- [x] **Etiquetas e QR Code**: Catálogo de Produtos e leitura via câmera mobile.
  - *Pendente (Aguardando Cliente)*: Impressão física de etiquetas térmicas e A4.
- [x] **Testes de Ponta a Ponta**: Framework Playwright + Smoke Tests.
- [x] **Seguridade Operacional**: Tratamento de Erros Offline e visualização robusta.
- [x] **Onboarding & Docs**: Otimização PWA (Manifest) e Tutorial Interativo (In-App).

## Fase 5: Expansão ✅
> **Status:** Concluída (Mar/2026)
- [x] **🛡️ CI/CD e Proteção de Deploy**
  - [x] Limpeza de `vercel.json` e estabilização de builds SSR.
  - [ ] Criar branch `dev` para desenvolvimento isolado (Pendente operacional).
- [x] **Web Push Nativo & Alertas**
  - [x] Implementação de Criptografia VAPID nativa (bypass limitações Vercel).
  - [x] Alertas de Estoque Mínimo via Push e Dashboard.
- [x] **Inteligência de Busca & Estoque Infinito**
  - [x] Busca por SKU, Código de Barras e ID em todo o app.
  - [x] Tratamento de `stock_management: false` (Estoque Infinito Nuvemshop).
- [x] **PDV Cloud & Vendas Pendentes**
  - [x] Lógica de Reserva e Estorno de estoque físico.
  - [x] Edição manual de preços.

## Fase 6: Próximos Passos (Pronto para Início) 🔲
- [ ] Multi-loja (Análise de viabilidade).
- [ ] Relatórios Avançados de Performance de Vendas por Período.
- [ ] Dashboards de BI Customizados.
