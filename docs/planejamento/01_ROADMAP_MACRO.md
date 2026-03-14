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

## Fase 5: Expansão 🔲
> **Status:** EM ANDAMENTO
- [ ] **🛡️ CI/CD e Proteção de Deploy** *(Prioridade 0)*
  - Criar branch `dev` para desenvolvimento isolado.
  - Configurar GitHub Actions (`next build` em PRs para `main`).
  - Tags de release para rollback facilitado.
- [x] ~~**Notificações Push Nativas (Web Push)**~~ ❌ *Descontinuado (incompatível com Vercel/Edge)*
- [ ] **Alertas de Estoque Mínimo (Popup In-App)** *(substitui Push)*
  - Popup persistente ao logar avisando produtos ≤ estoque mínimo.
  - Botão "Lembrar Depois" e "Não avisar mais sobre este produto".
  - Tabela `alert_preferences` no Supabase.
- [ ] **Relatório Inteligente de Reposição (Estoque Mínimo)**
  - Criar relatório de produtos no estoque mínimo ou próximos a ele.
  - Definir lógica de cálculo para o estoque "próximo ao mínimo".
- [ ] Multi-loja
