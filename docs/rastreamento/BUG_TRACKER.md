# 🐛 Bug Tracker

**Resumo:**
- 🔴 Crítico (Bloqueia uso): 0
- 🟡 Importante (Prejudica UX): 0
- 🟢 Baixa (Melhoria): 0

---

---
> Histórico de bugs corrigidos nas últimas sessões.

- (22/02) **Bug 5: Checkout Travado/Redirect** — Resolvido via `isInitialized` guard + Timeouts/Try-catch na Server Action.
- (22/02) **Bug 10: Venda sem Estoque** — Bloqueio visual e lógico no `addToCart` e `updateCartQuantity`.
- (22/02) **Bug 11: Sync Reverso (NS -> App)** — Implementado via Webhook `product/*` para estoque global.

- (14/02) **Bug 5: Checkout Redireciona** — `isCompleted` trocado de `useState` para `useRef` + `clearCart()` antes de navegar
- (14/02) **Bug 6: Busca no Scanner Vendas** — Autocomplete funcional via SearchModal popup
- (14/02) **Bug 7: Dropdown Sobreposto** — Operação acima da busca + SearchModal popup
- (14/02) **Bug 8: Lista Itens Compacta** — Layout `Nx Nome`, modal edição/remoção
- (14/02) **Bug 9: Autocomplete Sobrepõe Conteúdo** — SearchModal fullscreen em todas as telas
- (14/02) Scanner Inventário 404 — Módulo recriado como `/stock/inventory`
- (14/02) Autocomplete Entrada — Busca via Supabase
- (14/02) Estilo Botões Operação — Classes aplicadas
- (10/02) Fix Header na Home
- (10/02) Fix Posição botão Cart
- (10/02) Fix Botão Câmera pequeno
- (10/02) Fix Crash scanner entrada estoque

[SYNCED: 1402_lista bugs.md (11:41)]
