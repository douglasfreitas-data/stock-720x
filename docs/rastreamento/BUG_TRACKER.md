# 🐛 Bug Tracker

**Resumo:**
- 🔴 Crítico (Bloqueia uso): 1 (checkout)
- 🟡 Importante (Prejudica UX): 0
- 🟢 Baixa (Melhoria): 0

---

## 🔴 Críticos (Prioridade Alta)

### 5. Checkout Redireciona para Carrinho (14/02) — PERSISTENTE
- **Descrição**: Ao finalizar venda, tela de sucesso carrega brevemente e volta para carrinho. Botão voltar do Android mostra "Finalizar Operação" (checkout). Tentativas anteriores com `useRef` e `clearCart()` antes de navegar NÃO resolveram.
- **Origem**: `1402_lista bugs.md`
- **Status**: 🔲 Aberto (próxima sessão)
- **Tentativas anteriores**:
  1. `clearCart()` no success page via useEffect → não resolveu
  2. `history.replaceState` + `popstate` listener → não resolveu
  3. `isCompleted` como `useRef` + `clearCart()` antes de `router.replace` → não resolveu
- **Ação próxima sessão**:
  - Investigar se `router.replace('/success')` está realmente fazendo client-side navigation ou se há full page reload no Android
  - Adicionar `console.log` no guard do checkout para confirmar se o redirect vem de lá
  - Testar com `window.location.href = '/success'` ao invés de `router.replace`
  - Verificar se o `processSessionAction` está retornando `success: true` corretamente
  - Testar remover completamente o guard `if (cart.length === 0)` e substituir por UI condicional

---
> Histórico de bugs corrigidos nas últimas sessões.

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
