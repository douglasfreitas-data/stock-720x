# Arquitetura Local-First (Sync Queue)

Esta documentação detalha a infraestrutura de "Fila de Sincronização offline", criada para garantir resiliência contra instabilidades ou quedas completas da API da Nuvemshop.

## 🎯 O Problema

Originalmente, o aplicativo *Stock 720x* possuía um comportamento "Dual Write" engessado:
1. O usuário edita o estoque no PDV (App).
2. O App faz um request para a Nuvemshop atualizando a variante.
3. Se a Nuvemshop retornar `200 OK`, atualiza-se o Supabase (cache local).

**Desvantagem Crtítica:** Se a Nuvemshop cair (Erro 500) ou a conexão oscilar (timeout), a operação do lojista era perdida ou a tela congelava, impedindo o trabalho.

## 🛡️ A Solução: Retry Offline Orientado a Fila

Nós invertemos a prioridade. O sistema agora é **Local-First Orientado a Filas**.

1. O lojista edita o estoque.
2. O App tenta acessar a Nuvemshop.
3. Se a Nuvemshop **falhar**, a operação *não sofre rollback*. Em vez disso:
   - A alteração de estoque é persistida normalmente no banco de dados local Supabase (`products`, `stock_movements`, `stock_sessions`).
   - Um novo registro é inserido/atualizado na tabela `sync_queue` com o estado desejado da variante.
   - O aplicativo informa ao usuário: *"Atualizado apenas no Supabase"*. O lojista pode continuar trabalhando.

## 🔄 Consumo da Fila: O Cron Job de Reconciliação

Temos um job diário configurado no Vercel que ativa o endpoint `/api/sync` às 6h da manhã. 

Antes de varrer a Nuvemshop inteira para "puxar" os estoques atualizados, o cron foi instruído a executar a função `processSyncQueue`:

```typescript
// /src/lib/sync/products.ts
// 1. Drenar a fila pendente local (Local-First Priority)
await processSyncQueue(api);

while (hasMore) {
    // Sincronização descendente tradicional (Nuvemshop -> Supabase).
}
```

O `processSyncQueue` lê todas as linhas pendentes em `sync_queue`. Ele tenta enviar cada estoque represado para a Nuvemshop:
- **Sucesso:** A variante é atualizada na nuvem externa e o registro é `removido` da `sync_queue`.
- **Falha:** O registro permanece na fila para o dia seguinte (ou para quando o robô for acionado manualmente).

Somente após drenar a fila (empurrando dados locais atrasados para cima), o sistema começa a substituição "top-down" tradicional. Isso previne o efeito destrutivo onde a operação da madruga do cron baixaria estoques atrasados da Nuvemshop por cima das operações recém-salvas em `sync_queue`.

## 📦 Estrutura da Tabela no Supabase

\`\`\`sql
CREATE TABLE public.sync_queue (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  variant_id text NOT NULL, /* UNIQUE constraint */
  product_id text NOT NULL,
  stock numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
)
\`\`\`

A restrição `UNIQUE` em `variant_id` combinada com `upsert` assegura que se houver 3 vendas seguidas da mesma blusa no modo offline, a fila armazenará apenas a versão mais atual do estoque (o último estado), evitando enchentes de tráfego.
