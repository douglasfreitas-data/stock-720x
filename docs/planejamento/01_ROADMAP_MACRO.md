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
> **Status:** EM ANDAMENTO
- [ ] **Etiquetas e QR Code**: Geração e impressão de etiquetas PDF.
- [ ] **Testes de Ponta a Ponta**: Validação contínua do uso no galpão.
- [ ] **Onboarding & Docs**: Documentação final e tratamento offline básico.

## Fase 5: Expansão 🔲
> **Status:** Futuro
- [ ] Multi-loja
- [ ] **Notificações Push Nativas (Web Push)**
  - Configurar Service Worker (`sw.js`) no Frontend PWA.
  - Implementar solicitação nativa de permissão (`Notification.requestPermission()`).
  - Gerar e configurar chaves seguras VAPID no backend.
  - Criar tabela `push_subscriptions` atrelada aos usuários logados.
  - Criar endpoint para envio de payloads (`api/notifications/send`).
  - Integrar disparo visual com webhooks (ex: Nova Venda Nuvemshop).
