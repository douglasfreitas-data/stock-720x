# 🐛 Bug Tracker

**Resumo:**
- 🔴 Crítico (Bloqueia uso): 3 (2 fix aplicado, 1 em investigação)
- 🟡 Importante (Prejudica UX): 1 (fix aplicado)
- 🟢 Baixa (Melhoria): 0

---

## 🔴 Críticos (Prioridade Alta)

### 1. Scanner Inventário 404 (Novo - 11/02)
- **Descrição**: Ao escanear um QR code no inventário, aparece `404: Not Found code: 'not_found'`.
- **Status**: 🔶 Em Investigação (logs diagnósticos adicionados em 14/02)
- **Ação**: Logs adicionados em `getProductById` e `inventory/[id]/page.tsx`. Verificar logs do servidor após próximo deploy para identificar causa exata.

### 2. Checkout Travado (Novo - 11/02)
- **Descrição**: Ao clicar em finalizar venda, a próxima tela (sucesso) não carrega. Se voltar (back do Android), aparece "Finalizar Operação".
- **Status**: ✅ Fix Aplicado (14/02) — aguardando teste manual
- **Ação**: Adicionado state `isCompleted` para evitar race condition entre `clearCart()` e guard de carrinho vazio.

### 3. Autocomplete Entrada (10/02)
- **Descrição**: Campo "Busque por nome" na entrada de estoque não traz resultados.
- **Status**: ✅ Fix Aplicado (14/02) — aguardando teste manual
- **Ação**: Corrigida incompatibilidade de tipo `NuvemshopProduct[]` → `Product[]` na rota `/api/products?search=`.

---

## 🟡 Importantes (UX/Visual)

### 4. Estilo Botões Operação (Novo - 11/02)
- **Descrição**: Botões de "Tipo de Operação" estão colados como tabela. Devem seguir o padrão "cards" da "Forma de Pagamento".
- **Status**: ✅ Fix Aplicado (14/02) — aguardando teste manual
- **Ação**: Botões de operação agora usam classes `payment-option` / `payment-options` (mesmo padrão visual da forma de pagamento).

---

## ✅ Resolvidos Recentemente
> Histórico de bugs corrigidos nas últimas sessões.

- (10/02) Fix Header na Home
- (10/02) Fix Posição botão Cart
- (10/02) Fix Botão Câmera pequeno
- (10/02) Fix Crash scanner entrada estoque (client-side error)
