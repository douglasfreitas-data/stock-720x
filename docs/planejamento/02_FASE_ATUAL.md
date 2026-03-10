# 🎯 Fase 3: Polimento & Core (Detalhado)

> **LEMBRETE PARA A PRÓXIMA SESSÃO (via /iniciar):**
> "Quero recuperar a função de Estoque Mínimo no inventário que arquivamos na tarefa F3.1.3"

**Foco da Semana:** Estabilizar funcionalidades, corrigir bugs críticos e implementar automação de sync.

---

## 🚨 Prioridade 0: Bugs Críticos (Bloqueantes)
> **Origem:** BUG_TRACKER.md

- [x] **Scanner Inventário 404**: Reconstruído como `/stock/inventory` (sem rotas dinâmicas).
- [x] **Checkout Travado**: Resolvido com isInitialized guard e timeouts em Server Actions.
- [x] **Autocomplete Entrada**: Implementado `SearchModal` fullscreen.

---

## 📦 Bloco 3.1: Limpeza Técnica & Core
- [x] **F3.1.1** Remover tabela `inventory_logs` do Supabase. (Arquivo local removido. Drop na DB remota pendente.)
- [x] **F3.1.2** Limpar imports não utilizados e código morto.
- [x] **F3.1.3** Recuperar funcionalidade de **Estoque Mínimo** no inventário.

- [x] **F3.4.1** Vercel Cron Job para `POST /api/sync` (1x/dia às 3h BRT — limite do plano Hobby).
- [x] **F3.4.2** Webhook de produtos (atualização em tempo real Nuvemshop -> Supabase).
- [x] **Validação de Estoque**: Bloqueio de adição ao carrinho se `stock <= 0` no PDV.

## 🎨 Bloco 3.2: UX & Design
- [x] **F3.2.1** Revisão visual (Entrada/Saída/Ajuste) - espaçamentos e feedback.
- [x] **F3.2.2** Responsividade mobile (testar em device real).
- [x] **F3.2.3** Loading states (spinners, skeletons).
- [ ] **F3.2.4** Tema Dark/Light.
- [x] **Fix Estético**: Botões "Tipo de Operação" no checkout (estilo cards).

## 🏷️ Bloco 3.3: QR Code
- [ ] **F3.3.1** Geração de imagem de QR/Barcode na tela de produto.
- [ ] **F3.3.2** Impressão de etiquetas em PDF.

## 📊 Bloco 3.5: Relatórios Avançados
- [x] **F3.5.1** Filtros por data, operação e produto.
- [x] **F3.5.2** Exportação para CSV/PDF.
- [x] **F3.5.3** Gráficos com Recharts.
