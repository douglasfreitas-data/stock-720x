# 🐛 Bug Tracker

**Resumo:**
- 🔴 Crítico (Bloqueia uso): 0
- 🟡 Importante (Prejudica UX): 0
- 🟢 Baixa (Melhoria): 0

---

---
> Histórico de bugs corrigidos nas últimas sessões.

- (15/03) **Bug 17: Push Notification Race Condition** — Corrigida falha silenciosa nas notificações Push. A Vercel cancelava as requisições porque o `fetch` para `/api/push/send` não possuía `await` em `app/src/app/actions/stock.ts`. O mesmo erro se repetia em `app/src/app/api/webhooks/orders/route.ts`, que também sofria falta do payload completo da Nuvemshop (resolvido injetando uma nova requisição `api.getOrder` para pegar as informações essenciais).
- (14/03) **Bug 16: Silent Push Notification Failures** — Corrigida cadeia completa do Web Push (7 bugs encontrados): `.env.local` colado, parsing DER corrompido em `webpush.ts`, bloqueio pelo `middleware.ts`, requisição fetch fire-and-forget sem auth em `stock.ts`, ausência de Headers de TTL/Urgency exigidos pelo FCM e erro de Hydration no componente de Relatório (pendente teste).
- (11/03) **Bug 15: Autenticação Bypass (Middleware)** — Resolvido adicionando try/catch no Server Component do Layout (`PDVLayout`) após falha de intercepção do middleware estático na Vercel. Limpeza de cookie legado `stock_session`.
- (22/02) **Bug 12: Edição de Estoque Mínimo Bloqueada** — Resolvido destravando validação de input vazio na UI de Inventário.
- (22/02) **Bug 13: Overwrite de Estoque Mínimo no Sync** — Resolvido omitindo `min_stock` local do payload de upsert (evita race condition).
- (22/02) **Bug 14: Busca Retornando Valores Mockados** — Corrigida API `/api/products` para consultar a coluna verdadeira do Supabase em vez de injetar o valor 5.

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
