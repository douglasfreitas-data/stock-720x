# Bug: Push Notification Não Dispara Automaticamente

**Data:** 2026-03-15  
**Status:** 🟢 Resolvido  
**Resolvido em:** 2026-03-15  
**Prioridade:** Média

## Sintoma
Ao reduzir o estoque de um produto abaixo do mínimo ideal pelo App, a notificação push **não chega** no dispositivo do usuário.

## Diagnóstico
A infraestrutura de push está 100% funcional:
- ✅ Chaves VAPID válidas
- ✅ Service Worker registrado
- ✅ Inscrição salva no banco (`push_subscriptions`)
- ✅ Disparo manual via `POST /api/push/send` → **recebido com sucesso**

**Causa raiz:** Race condition no ambiente Serverless da Vercel.

Em `app/src/app/actions/stock.ts` (linhas ~120-131), o `fetch` para `/api/push/send` é disparado **sem `await`**:

```typescript
// O fetch é "fire and forget" — não aguarda resultado
fetch(`${baseUrl}/api/push/send`, { ... })
  .then(...)
  .catch(...);

return { success: true, message: syncStatus }; // ← Vercel encerra o processo aqui
```

A Vercel mata o processo serverless assim que o `return` é executado, cancelando o `fetch` pendente antes dele completar.

## Correção Proposta

**Opção 1 — Simples (adicionar `await`):**
```typescript
// Aguardar o envio antes de retornar
await fetch(`${baseUrl}/api/push/send`, { ... });
```
*Trade-off:* A resposta para o usuário fica ~200ms mais lenta.

**Opção 2 — Usar `waitUntil` (Next.js 15+):**
```typescript
import { after } from 'next/server';

after(async () => {
  await fetch(`${baseUrl}/api/push/send`, { ... });
});
return { success: true, message: syncStatus };
```
*Trade-off:* Requer verificar compatibilidade com Server Actions.

## Arquivo de Teste
O arquivo `app/test-push-trigger.js` pode ser usado para testar o disparo manual:
```bash
cd app && node test-push-trigger.js
```
