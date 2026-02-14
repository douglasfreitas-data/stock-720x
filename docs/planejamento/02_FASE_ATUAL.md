# 🎯 Fase 3: Polimento & Core (Detalhado)

**Foco da Semana:** Estabilizar funcionalidades, corrigir bugs críticos e implementar automação de sync.

---

## 🚨 Prioridade 0: Bugs Críticos (Bloqueantes)
> **Origem:** BUG_TRACKER.md

- [ ] **Scanner Inventário 404**: Erro ao escanear produtos no inventário.
- [ ] **Checkout Travado**: Tela de sucesso não carrega após venda.
- [ ] **Autocomplete Entrada**: Busca por nome não funciona na entrada de estoque.

---

## 📦 Bloco 3.1: Limpeza Técnica
- [ ] **F3.1.1** Remover tabela `inventory_logs` do Supabase.
- [ ] **F3.1.2** Limpar imports não utilizados e código morto.

## 🔄 Bloco 3.4: Automação de Sync
- [ ] **F3.4.1** Vercel Cron Job para `POST /api/sync` (a cada 4-6h).
- [ ] **F3.4.2** Webhook de produtos (atualização em tempo real Nuvemshop -> Supabase).

## 🎨 Bloco 3.2: UX & Design
- [ ] **F3.2.1** Revisão visual (Entrada/Saída/Ajuste) - espaçamentos e feedback.
- [ ] **F3.2.2** Responsividade mobile (testar em device real).
- [ ] **F3.2.3** Loading states (spinners, skeletons).
- [ ] **F3.2.4** Tema Dark/Light.
- [ ] **Fix Estético**: Botões "Tipo de Operação" no checkout (estilo cards).

## 🏷️ Bloco 3.3: QR Code
- [ ] **F3.3.1** Geração de imagem de QR/Barcode na tela de produto.
- [ ] **F3.3.2** Impressão de etiquetas em PDF.

## 📊 Bloco 3.5: Relatórios Avançados
- [ ] **F3.5.1** Filtros por data, operação e produto.
- [ ] **F3.5.2** Exportação para CSV/PDF.
- [ ] **F3.5.3** Gráficos com Recharts.
