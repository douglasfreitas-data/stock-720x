# 🐛 Bug Tracker

**Resumo:**
- 🔴 Crítico (Bloqueia uso): 1 (checkout)
- 🟡 Importante (Prejudica UX): 3 (2 novos + 1 anterior)
- 🟢 Baixa (Melhoria): 0

---

## 🔴 Críticos (Prioridade Alta)

### 5. Checkout Redireciona para Carrinho (14/02)
- **Descrição**: Ao finalizar venda, tela de sucesso carrega brevemente e volta para carrinho. Botão voltar do Android mostra "Finalizar Operação".
- **Origem**: `1402_lista bugs.md`
- **Status**: 🔲 Aberto
- **Ação**: Verificar se `clearCart()` no `useEffect` da `success/page.tsx` está executando corretamente. O `router.replace('/success')` no checkout pode estar sendo revertido pelo browser history. Investigar se `CartProvider` dispara re-render que causa redirect.

---

## 🟡 Importantes (UX/Visual)

### 6. Busca por Nome no Scanner de Vendas (14/02)
- **Descrição**: Campo "Busque por nome" no scanner de vendas é apenas placeholder, sem autocomplete. Funciona em Entrada e Inventário.
- **Origem**: `1402_lista bugs.md`
- **Status**: 🔲 Aberto
- **Ação**: Adicionar lógica de autocomplete no `scan/page.tsx` (modo sale) igual ao que já existe em `stock/entry/page.tsx`: debounce search via `/api/products?search=`, dropdown de resultados, ao selecionar adiciona ao carrinho.

### 7. Dropdown Autocomplete Sobreposto por Botões (14/02)
- **Descrição**: Na tela de Entrada, ao buscar por nome, a lista de resultados fica atrás dos botões de "Tipo de Operação". Usuário quer botões ACIMA da busca.
- **Origem**: `1402_lista bugs.md`
- **Status**: 🔲 Aberto
- **Ação**: Em `stock/entry/page.tsx`, reorganizar a ordem dos elementos: mover "Tipo de Operação" para ANTES do campo de busca (linhas ~255-268 antes de ~198-253). Garantir que dropdown tem `z-index` adequado.

### 8. Lista de Itens na Entrada — Layout Compacto (14/02)
- **Descrição**: Seção "Itens na Sessão" precisa de layout compacto: quantidade na frente do nome, clique no item abre modal de edição/exclusão.
- **Origem**: `1402_lista bugs.md`
- **Status**: 🔲 Aberto
- **Ação**: Em `stock/entry/page.tsx`, reformular a lista (linhas ~280-297): layout `{qty}x {nome}` em uma linha, ao clicar abre modal com opções de alterar quantidade ou excluir.

---

## ✅ Resolvidos Recentemente
> Histórico de bugs corrigidos nas últimas sessões.

- (14/02) **Scanner Inventário 404** — Módulo recriado como `/stock/inventory` (client-side)
- (14/02) **Autocomplete Entrada** — Busca agora usa Supabase direto
- (14/02) **Estilo Botões Operação** — Classes `payment-option` aplicadas
- (10/02) Fix Header na Home
- (10/02) Fix Posição botão Cart
- (10/02) Fix Botão Câmera pequeno
- (10/02) Fix Crash scanner entrada estoque

[SYNCED: 1402_lista bugs.md]
