# 📖 Documentação Completa — Stock 720x

> **Gerada em:** 20/03/2026 — Baseada na varredura completa do código-fonte do projeto.

---

## Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura de Dados (Dual-Write)](#3-arquitetura-de-dados-dual-write)
4. [Banco de Dados (Supabase)](#4-banco-de-dados-supabase)
5. [Autenticação e Autorização](#5-autenticação-e-autorização)
6. [PDV — Ponto de Venda (Frente de Caixa)](#6-pdv--ponto-de-venda-frente-de-caixa)
7. [Movimentação de Estoque](#7-movimentação-de-estoque)
8. [Vendas Pendentes (Reservas / Fiado)](#8-vendas-pendentes-reservas--fiado)
9. [Integração Nuvemshop (ERP)](#9-integração-nuvemshop-erp)
10. [Webhooks — Máquina de Estados de Pedidos](#10-webhooks--máquina-de-estados-de-pedidos)
11. [Webhooks — Produtos](#11-webhooks--produtos)
12. [Sincronização (Sync Queue / Cron)](#12-sincronização-sync-queue--cron)
13. [Notificações Push (Web Push)](#13-notificações-push-web-push)
14. [Auditoria de Integridade](#14-auditoria-de-integridade)
15. [Relatórios](#15-relatórios)
16. [Administração de Usuários](#16-administração-de-usuários)
17. [Geração de QR Code / Etiquetas](#17-geração-de-qr-code--etiquetas)
18. [Busca de Produtos](#18-busca-de-produtos)
19. [Estoque Infinito](#19-estoque-infinito)
20. [Middleware e Segurança](#20-middleware-e-segurança)
21. [Cron Jobs (Vercel)](#21-cron-jobs-vercel)
22. [Webhooks LGPD](#22-webhooks-lgpd)
23. [Mapa Completo de Rotas e Arquivos](#23-mapa-completo-de-rotas-e-arquivos)

---

## 1. Visão Geral do Sistema

O **Stock 720x** é um sistema de **Ponto de Venda (PDV) mobile-first** desenvolvido para sincronizar o estoque físico e online em tempo real. Ele elimina furos de estoque e planilhas manuais, integrando-se diretamente com a **Nuvemshop** como ERP / fonte da verdade.

**Funcionalidades principais:**
- PDV com leitura de código de barras via câmera do celular
- Controle completo de estoque (entradas, saídas, ajustes, inventário)
- Integração bidirecional com Nuvemshop (dual-write)
- Reservas de estoque para pedidos online e vendas pendentes (fiado)
- Auditoria para detectar e corrigir divergências de estoque
- Notificações push quando estoque atinge nível mínimo
- Relatórios de movimentação e reposição
- Impressão de etiquetas QR code
- Resiliência offline via fila de sincronização

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Frontend** | Next.js 16 (App Router) + React 19 | Full-stack, PWA instalável no celular |
| **Estilo** | Tailwind CSS v4 | Prototipagem rápida, design system |
| **Scanner** | `html5-qrcode` | Leitura de códigos de barras via câmera |
| **PDF/QR** | `jspdf` + `qrcode` | Geração de etiquetas e relatórios PDF |
| **Banco de Dados** | Supabase (PostgreSQL) | Auth pronto, RLS, realtime |
| **Integração** | API REST Nuvemshop | Aplicativo Externo (OAuth2) |
| **Deploy** | Vercel | Deploy automático, Cron Jobs |
| **Push** | Web Push API (VAPID) | Notificações nativas sem Firebase |

---

## 3. Arquitetura de Dados (Dual-Write)

O sistema opera em um modelo **híbrido Sync + Cache**:

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Nuvemshop   │◄──────►│  Next.js API │◄──────►│   Supabase   │
│  (ERP/Master)│  Sync  │   (Backend)  │  Cache │  (PostgreSQL)│
└──────────────┘  Cron  └──────────────┘        └──────────────┘
                  Webhook       ▲
                               │
                        ┌──────┴──────┐
                        │  PWA Mobile │
                        │   (React)   │
                        └─────────────┘
```

### Fluxo de uma operação de estoque:

1. O usuário realiza uma operação no App (venda, entrada, ajuste)
2. O App tenta **atualizar a Nuvemshop primeiro** (fonte da verdade)
3. Se **sucesso**: atualiza o Supabase (cache local)
4. Se **falha** (timeout, erro 500, sem internet): persiste no Supabase e adiciona à `sync_queue` para reconciliação posterior
5. Em ambos os casos, registra a movimentação nas tabelas `stock_sessions` + `stock_movements`

> **Princípio:** O App sempre funciona. Nunca trava por causa da Nuvemshop.

---

## 4. Banco de Dados (Supabase)

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `nuvemshop_stores` | Credenciais OAuth2 das lojas (store_id, access_token, scope) |
| `products` | Cache dos produtos da Nuvemshop (id, name em JSONB, handle, images, published) |
| `product_variants` | Variantes com estoque real (id, sku, barcode, price, stock, stock_management, min_stock, values, image_url) |
| `stock_sessions` | Sessões de movimentação (tipo, operação, notas, user_email). Cada venda/entrada/ajuste cria uma sessão |
| `stock_movements` | Itens individuais de cada sessão (variant_id, quantity, old_stock, new_stock) |
| `pending_sales` | Vendas pendentes / reservas (client_name, items em JSONB, status: pending/completed/canceled) |
| `sync_queue` | Fila de sincronização offline (variant_id UNIQUE, product_id, stock desejado) |
| `sync_logs` | Log de execuções da sincronização (status, mensagem, timestamp) |
| `push_subscriptions` | Assinaturas Web Push dos dispositivos (endpoint, p256dh, auth) |

### Campos Importantes em `product_variants`

| Campo | Descrição |
|-------|-----------|
| `id` | ID da variante na Nuvemshop (usado como chave primária) |
| `barcode` | Código de barras para leitura no scanner |
| `sku` | Código de referência |
| `stock` | Quantidade atual em estoque |
| `min_stock` | Estoque mínimo ideal (definido pelo usuário no App, NÃO vem da Nuvemshop) |
| `stock_management` | `true` = estoque gerenciado, `false` = estoque infinito (∞) |
| `values` | Array JSONB com variações (cor, tamanho, etc.) Ex: `[{"pt":"Azul"},{"pt":"M"}]` |
| `image_url` | URL da imagem específica dessa variante |

### Índices de Performance

- `idx_variants_barcode` — busca ultra-rápida por código de barras
- `idx_variants_sku` — busca por referência
- `idx_variants_product_id` — join com a tabela products
- `idx_products_store_id` — filtro por loja

### Segurança (RLS)

Todas as tabelas têm **Row Level Security** habilitado. O acesso é feito exclusivamente via `service_role` (backend), nunca expondo dados diretamente ao client.

---

## 5. Autenticação e Autorização

### 5.1. Login de Usuários (Supabase Auth)

**Arquivo:** [auth.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/actions/auth.ts)

| Ação | Descrição |
|------|-----------|
| `login()` | Login com e-mail + senha via Supabase Auth |
| `signup()` | Cadastro de novo usuário (senha mínima 6 caracteres) |
| `signout()` | Logout e redirecionamento para `/login` |
| `updatePassword()` | Alteração de senha do usuário logado |
| `getAdminStatus()` | Verifica se o usuário logado corresponde ao `ADMIN_EMAIL` configurado no `.env` |

### 5.2. OAuth2 com Nuvemshop

**Arquivos:**
- [/api/auth/login/route.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/api/auth/login/route.ts) — Redireciona para tela de autorização da Nuvemshop
- [/api/auth/callback/route.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/api/auth/callback/route.ts) — Recebe o `code`, troca por `access_token`, salva no Supabase e em cookie

**Fluxo:**
```
Lojista → App → Nuvemshop /authorize → Lojista aprova → Callback com code → App troca por token → Salva token no Supabase + Cookie
```

### 5.3. Controle de Acesso

- **Middleware** (`middleware.ts`) protege todas as rotas exceto: `/login`, `/api/auth`, `/api/webhooks`, `/api/sync`, `/api/push`, Service Worker e assets estáticos
- Se o usuário não estiver logado, é redirecionado para `/login?from=<rota_original>`
- Funções administrativas (`admin.ts`, `audit.ts`, `logs.ts`) verificam se `user.email === process.env.ADMIN_EMAIL`

---

## 6. PDV — Ponto de Venda (Frente de Caixa)

### 6.1. Tela Principal (`/`)

**Arquivo:** [page.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/(pdv)/page.tsx)

Dashboard principal do PDV com acesso rápido a todas as funcionalidades.

### 6.2. Scanner de Código de Barras (`/scan`)

**Arquivo:** [scan/page.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/(pdv)/scan/page.tsx)

- Utiliza a câmera do dispositivo via `html5-qrcode`
- Lê códigos de barras EAN-13, Code128, QR Code, entre outros
- Ao ler, busca o produto instantaneamente no Supabase (cache local)
- Resposta típica: < 50ms (sem chamada à API da Nuvemshop)

**Componente:** [Scanner.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/components/Scanner.tsx)

### 6.3. Carrinho (`/cart`)

**Arquivo:** [cart/page.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/(pdv)/cart/page.tsx)

- Acumula itens escaneados com quantidades
- Permite alterar quantidade de cada item
- Permite alterar preço customizado (para negociações)
- Suporta remoção de itens individuais

### 6.4. Checkout (`/checkout`)

**Arquivo:** [checkout/page.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/(pdv)/checkout/page.tsx)

**Server Action:** [session.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/actions/session.ts) → `processSessionAction()`

**Fluxo de uma venda:**

1. Cria uma **sessão de estoque** (`stock_sessions`) com `type: 'saida'` e `operation: 'venda'`
2. Para cada item do carrinho:
   - Busca estoque atual FRESCO do Supabase (evita race conditions)
   - Calcula `newStock = currentStock - quantity` (mín: 0)
   - Chama `updateStockAction()` que faz o dual-write (Nuvemshop + Supabase)
   - Registra o movimento em `stock_movements`
3. Se o estoque atingir o `min_stock`, dispara **push notification**
4. Redireciona para tela de sucesso

**Operações suportadas no checkout:**

| Tipo | Operação | Descrição |
|------|----------|-----------|
| `saida` | `venda` | Venda física no balcão |
| `saida` | `doacao` | Doação de produto |
| `saida` | `consumo` | Consumo interno |
| `saida` | `pregao` | Venda em pregão/leilão |
| `entrada` | `compra` | Entrada de mercadoria (compra) |
| `entrada` | `devolucao` | Devolução de cliente |

### 6.5. Tela de Sucesso (`/success`)

**Arquivo:** [success/page.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/(pdv)/success/page.tsx)

Confirmação visual da operação concluída.

---

## 7. Movimentação de Estoque

### 7.1. Server Action Principal: `updateStockAction()`

**Arquivo:** [stock.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/actions/stock.ts)

Esta é a **função central** do sistema. Toda alteração de estoque passa por ela.

**Parâmetros:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `variantId` | number | ID da variante |
| `newStock` | number | Novo estoque desejado (≥ 0) |
| `sessionType` | string | `'entrada'` / `'saida'` / `'ajuste'` |
| `operation` | string | `'compra'`, `'venda'`, `'perda'`, `'contagem'`, `'reserva'`, etc. |
| `quantity` | number | Quantidade movimentada (sempre positivo) |
| `minStock` | number? | Estoque mínimo ideal (opcional) |
| `observation` | string? | Nota/observação |
| `sessionId` | string? | UUID de sessão existente (para vendas em lote) |

**Fluxo interno:**

```
1. Buscar estoque atual (variantData.stock)
2. Tentar atualizar Nuvemshop (dual-write)
   ├─ Sucesso → nuvemshopUpdated = true
   └─ Falha → Adiciona à sync_queue (upsert por variant_id)
3. Atualizar estoque no Supabase (product_variants)
4. Criar sessão OU usar sessão existente (stock_sessions)
5. Registrar movimentação (stock_movements)
6. Revalidar caches do Next.js (/products, /scan)
7. Se newStock ≤ min_stock → Disparar push notification
```

### 7.2. Entrada de Estoque (`/stock/entry`)

**Arquivo:** [stock/entry/page.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/(pdv)/stock/entry/page.tsx)

- Scan do produto → Digite a quantidade → Motivo (compra/devolução) → Confirma
- Gera sessão `type: 'entrada'`

### 7.3. Inventário / Contagem (`/stock/inventory`)

**Arquivo:** [stock/inventory/page.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/(pdv)/stock/inventory/page.tsx)

- Scan do produto na prateleira → Compare com o estoque registrado → Ajuste a divergência
- Gera sessão `type: 'ajuste'`, `operation: 'contagem'`
- Diferenças geram movimentações com `operation: 'perda'` ou `'sobra'`

---

## 8. Vendas Pendentes (Reservas / Fiado)

**Arquivo:** [pendingSales.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/actions/pendingSales.ts)

**Página:** [pending-sales/page.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/(pdv)/pending-sales/page.tsx)

### Como funciona:

1. **Criar Reserva** (`createPendingSaleAction`):
   - Insere na tabela `pending_sales` com `status: 'pending'`
   - Para cada item, debita o estoque imediatamente via `updateStockAction()` com `operation: 'reserva'`
   - O estoque **já fica reservado** fisicamente

2. **Finalizar Venda** (`completePendingSaleAction`):
   - Muda status para `'completed'`
   - NÃO altera estoque (já foi debitado na criação)

3. **Cancelar Reserva** (`cancelPendingSaleAction`):
   - Muda status para `'canceled'`
   - **Estorna o estoque**: soma de volta a quantidade de cada item
   - Usa `operation: 'estorno_reserva'` para rastreabilidade
   - Marca a sessão original com a nota `(Estornada)` em vermelho nos relatórios

4. **Listagem** (`getPendingSalesAction`):
   - Retorna apenas vendas com `status: 'pending'` E `payment_method ≠ 'Nuvemshop'`
   - Vendas da Nuvemshop são filtradas para não confundir o caixa físico

### Campos da tabela `pending_sales`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `client_name` | TEXT | Nome do cliente ou "Pedido Nuvemshop #XXX" |
| `payment_method` | TEXT | Dinheiro, Cartão, Pix, Nuvemshop |
| `payment_term` | TEXT | À vista, 30 dias, Online |
| `operation_type` | TEXT | `'venda_pendente'`, `'venda_online'` |
| `items` | JSONB | Array de `{productId, quantity, customPrice, product}` |
| `status` | TEXT | `'pending'` / `'completed'` / `'canceled'` |
| `observations` | TEXT | Notas livres |
| `user_email` | TEXT | E-mail do operador que criou |

---

## 9. Integração Nuvemshop (ERP)

### 9.1. Cliente API

**Arquivo:** [nuvemshop/api.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/lib/nuvemshop/api.ts)

**Classe `NuvemshopAPI`** — Métodos:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `getProducts(page, perPage)` | `GET /products` | Lista produtos paginada |
| `searchProducts(query)` | `GET /products?q=` | Busca por nome |
| `getProduct(id)` | `GET /products/:id` | Produto individual |
| `updateVariantStock(productId, variantId, stock)` | `PUT /products/:id/variants/:id` | Atualiza estoque |
| `findVariantByBarcode(barcode)` | Busca interna | Itera todos os produtos para encontrar por barcode |
| `getOrders(page, perPage)` | `GET /orders` | Lista pedidos |
| `getOrder(orderId)` | `GET /orders/:id` | Pedido individual |
| `getWebhooks()` | `GET /webhooks` | Lista webhooks registrados |
| `createWebhook(event, url)` | `POST /webhooks` | Registra novo webhook |

**Timeout padrão:** 8 segundos (configurável)

### 9.2. API Routes para Estoque

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/stock` | `POST` | Baixa de estoque por barcode (venda rápida) |
| `/api/stock` | `PUT` | Atualiza estoque direto (product_id, variant_id, stock) |

---

## 10. Webhooks — Máquina de Estados de Pedidos

**Arquivo:** [webhooks/orders/route.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/api/webhooks/orders/route.ts)

**Endpoint:** `POST /api/webhooks/orders`

Este é o webhook mais complexo do sistema. Implementa uma **máquina de estados** para gerenciar pedidos online:

### Estados do Pedido:

```
┌──────────┐    Pago/Fechado   ┌──────────────┐
│  ABERTO  │──────────────────►│  CONFIRMADO  │
│  (open)  │                   │  (paid/closed)│
└────┬─────┘                   └──────────────┘
     │ Cancelado
     ▼
┌──────────────┐
│  CANCELADO   │
│  (canceled)  │
└──────────────┘
```

### Detalhamento:

#### Estado 1: Pedido Aberto (`open`)
- **Condição:** `order.status === 'open'` E `payment_status ≠ 'paid'`
- **Ações:**
  1. Verifica se já existe reserva → se sim, ignora (idempotência)
  2. Cria `pending_sale` com `status: 'pending'` e `payment_method: 'Nuvemshop'`
  3. Cria `stock_session` com `operation: 'reserva'`
  4. **Debita estoque imediatamente** no Supabase para cada item
  5. Se estoque atingir `min_stock`, dispara push notification
  6. A reserva fica **oculta** da listagem do caixa físico (filtrada por `payment_method ≠ 'Nuvemshop'`)

#### Estado 2: Pedido Confirmado (`paid` / `closed`)
- **Condição:** `payment_status === 'paid'` OU `status === 'closed'`
- **Ações (com reserva existente):**
  1. Muda status de `pending_sale` para `'completed'`
  2. Muda `operation` da sessão de `'reserva'` para `'venda_online'`
  3. Muda `notes` de `'Reserva - Pedido #X'` para `'Venda Online - Pedido #X'`
  4. **NÃO debita estoque novamente** (já foi debitado na reserva)
- **Ações (sem reserva prévia — fallback):**
  1. Cria `pending_sale` com `status: 'completed'` diretamente
  2. Cria `stock_session` com `operation: 'venda_online'`
  3. Debita estoque normalmente

#### Estado 3: Pedido Cancelado (`canceled`)
- **Condição:** `order.status === 'canceled'`
- **Ações:**
  1. Se não existia reserva → ignora (evita entrada a mais)
  2. Se reserva já cancelada → ignora (idempotência)
  3. Muda status de `pending_sale` para `'canceled'`
  4. Cria `stock_session` com `operation: 'estorno_reserva'`, `type: 'entrada'`
  5. **Devolve estoque** de cada item ao Supabase
  6. Marca a sessão original da reserva com nota `(Estornada)` para destaque visual nos relatórios

---

## 11. Webhooks — Produtos

**Arquivo:** [webhooks/products/route.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/api/webhooks/products/route.ts)

**Endpoint:** `POST /api/webhooks/products`

| Evento | Ação |
|--------|------|
| `product/created` | Busca dados do produto na API → upsert no Supabase (**ignora estoque** para evitar race conditions com webhook de pedidos) |
| `product/updated` | Idem ao created (upsert com `ignoreStockSync: true`) |
| `product/deleted` | Deleta o produto da tabela `products` (variantes caem por CASCADE) |
| `app/uninstalled` | Deleta o produto (mesmo comportamento de delete) |

> **Importante:** O webhook de produtos **nunca altera o campo `stock`** para evitar conflitos com o webhook de pedidos que debita estoque em paralelo.

---

## 12. Sincronização (Sync Queue / Cron)

### 12.1. Sync Queue (Fila de Reconciliação Offline)

**Arquivo:** [sync/products.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/lib/sync/products.ts)

Quando a Nuvemshop está offline, o sistema funciona em modo **local-first**:

1. A operação é salva normalmente no Supabase
2. Um registro é inserido/atualizado (upsert) na tabela `sync_queue`
3. O `UNIQUE` em `variant_id` garante que múltiplas operações na mesma variante armazenam apenas o **último estado** (evita enchente de tráfego)

### 12.2. Cron de Sincronização

**Endpoint:** `GET /api/sync` (Vercel Cron às **06:00 UTC**)

**Fluxo do Cron:**

```
1. Processar sync_queue (LOCAL → NUVEMSHOP)
   Para cada item na fila:
   ├─ Sucesso → Deleta da fila
   └─ Falha → Permanece na fila para o próximo dia
   
2. Sincronização descendente (NUVEMSHOP → SUPABASE)
   Para cada página de produtos:
   ├─ Upsert produto + variantes
   └─ Se estoque divergente:
       ├─ Gera sessão tipo 'sync_auto'
       ├─ Registra movimentação com diff
       └─ Atualiza estoque local para o remoto
```

> **Ordem crítica:** A fila é processada **ANTES** da sincronização descendente. Isso evita que dados antigos da Nuvemshop sobrescrevam operações offline recentes.

### 12.3. Logs de Sincronização

Cada execução registra na tabela `sync_logs`:
- Quantidade de divergências encontradas e corrigidas
- IDs das sessões de ajuste geradas
- Status (success/error) e mensagem descritiva

---

## 13. Notificações Push (Web Push)

### 13.1. Assinatura

**Endpoint:** `POST /api/push/subscribe`

- Requer autenticação (Supabase Auth)
- Salva `endpoint`, `p256dh`, `auth` na tabela `push_subscriptions`
- Se o endpoint já existe, transfere ownership para o usuário atual (upsert)

**Cancelamento:** `DELETE /api/push/subscribe`

### 13.2. Disparo de Notificações

**Endpoint:** `POST /api/push/send`

**Quando é chamado:**
1. Automaticamente via `updateStockAction()` quando `newStock ≤ min_stock`
2. Automaticamente via webhook de pedidos quando estoque atinge nível mínimo
3. Via Cron diário às **09:00 UTC** (verifica estoque baixo)

**Fluxo:**
1. Verifica se há assinaturas ativas
2. Consulta `product_variants` com `stock ≤ min_stock` e `stock_management = true`
3. Se há itens em baixa, envia push para **todos os dispositivos** assinados
4. Remove assinaturas inválidas (status 410 Gone)

### 13.3. Implementação Técnica

**Arquivo:** [push/webpush.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/lib/push/webpush.ts)

- Implementação **zero-dependency** do Web Push (sem `web-push` npm)
- JWT VAPID assinado com ECDSA P-256
- Notificações **payloadless** (sem payload criptografado) — o Service Worker exibe uma mensagem genérica
- Chaves VAPID configuradas via variáveis de ambiente

---

## 14. Auditoria de Integridade

**Arquivo:** [audit.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/actions/audit.ts)

**Página:** `/admin/audit` — Acesso exclusivo do administrador

### Funcionalidades:

#### Detecção de Divergências (`getStockDifferencesAction`)
1. Busca **todos** os produtos publicados do Supabase (cache local)
2. Busca **todos** os produtos da Nuvemshop (paginação completa)
3. Compara estoque variante a variante
4. Retorna lista de divergências com: nome, estoque local, estoque Nuvemshop, diferença

#### Correção Top-Down (`syncAuditItemAction`)
1. Aceita o `variantId` e o `correctStock` (valor da Nuvemshop)
2. Cria uma sessão com `operation: 'auditoria_admin'`
3. Atualiza o estoque local para o valor correto
4. Registra o movimento com `old_stock` → `new_stock`

> **Nota:** A auditoria corrige apenas o Supabase (App), forçando-o a seguir o ERP (Nuvemshop).

---

## 15. Relatórios

**Arquivo:** [reports.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/actions/reports.ts)

### 15.1. Histórico de Movimentações (`/reports`)

**Action:** `getStockSessionsAction(filters)`

- Lista sessões de estoque com seus movimentos detalhados
- Filtros: data (de/até), tipo (entrada/saída), operação (venda/compra/etc)
- Join com `stock_movements` → `product_variants` → `products`
- Inclui: SKU, barcode, nome, preço, valores da variante, usuário responsável
- Limite: 200 registros

### 15.2. Reposição de Estoque (`/reports/replenishment`)

**Action:** `getReplenishmentDataAction()`

- Lista variantes onde `min_stock > 0` e `stock_management = true`
- Ordenado por estoque ascendente (mais urgentes primeiro)
- Divide em:
  - **Estoque Crítico:** `stock ≤ min_stock`
  - **Estoque em Atenção:** `stock` entre `min_stock` e `min_stock + 20%`
- Gera relatório em PDF via `jspdf`

---

## 16. Administração de Usuários

**Arquivo:** [admin.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/actions/admin.ts)

**Página:** `/admin/users` — Acesso exclusivo do administrador

| Action | Descrição |
|--------|-----------|
| `listUsersAction()` | Lista todos os usuários do Supabase Auth |
| `createUserAction(formData)` | Cria novo usuário com e-mail autoconfirmado |
| `deleteUserAction(userId)` | Exclui usuário (bloqueia exclusão do admin principal) |

### 16.1. Logs de Sincronização

**Arquivo:** [logs.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/actions/logs.ts)

**Página:** `/admin/logs`

- Action `getSyncLogsAction(limit)` — Retorna histórico das últimas 100 sincronizações
- Mostra: data/hora, status (success/error), mensagem detalhada

### 16.2. Alteração de Senha

**Página:** `/update-password` — Disponível para todos os usuários logados

---

## 17. Geração de QR Code / Etiquetas

**Página:** `/products/print-qr`

**Componentes:**
- [PrintQRClient.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/app/(pdv)/products/print-qr/PrintQRClient.tsx)
- [PrintQRModal.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/components/PrintQRModal.tsx)

**Funcionalidades:**
- Lista todos os produtos com suas variantes
- Seleciona produtos para impressão
- Gera etiquetas com QR code contendo o barcode/ID da variante
- Exporta em PDF para impressão em etiquetadoras
- Usa `jspdf` + `qrcode` para geração

---

## 18. Busca de Produtos

### 18.1. Busca por Código de Barras (Supabase)

**Arquivo:** [products.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/lib/products.ts)

**Endpoint:** `GET /api/products/barcode?code=XXX` ou `?id=XXX`

- Busca na tabela `product_variants` por `barcode`, `sku` ou `id`
- Resposta instantânea (< 50ms)
- Join com `products` para nome e imagens

### 18.2. Busca Textual Agnóstica (Memória JS)

**Endpoint:** `GET /api/products?search=XXX`

- A busca de produtos agora é processada em memória pelo Node.js após buscar as variantes no Supabase.
- **Busca Multi-Termos Independente:** A frase pesquisada é dividida em palavras ("lamina escola"). Para dar match, o produto deve conter TODAS as palavras em qualquer ordem.
- **Insensível a Acentos e Formatação:** O utilitário `normalizeSearchString` (NFD) ignora acentos e converte a string limpando traços e pontuações, garantindo que buscas inexatas funcionem de primeira.
- Verifica os termos pesquisados nas colunas: Nome, SKU, Barcode e ID.
- Limite de 50 resultados retornados para popular modal de autocompletar e tela de Etiquetas de forma abrangente.
- Sem necessidade de token Nuvemshop.

### 18.3. Modal de Busca

**Componente:** [SearchModal.tsx](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/components/SearchModal.tsx)

- Busca em tempo real enquanto o usuário digita
- Exibe nome, variante, imagem, preço, estoque
- Permite selecionar produto para adicionar ao carrinho

---

## 19. Estoque Infinito

Produtos marcados na Nuvemshop com `stock_management: false`:
- Exibem o símbolo **"∞"** nas listas de produtos
- **NÃO** geram alertas de reposição
- **NÃO** bloqueiam vendas por falta de estoque
- **NÃO** são considerados na auditoria push
- Filtrados nas consultas de reposição (`stock_management = true`)

---

## 20. Middleware e Segurança

**Arquivo:** [middleware.ts](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/app/src/middleware.ts)

### Rotas Públicas (sem autenticação):

| Rota | Motivo |
|------|--------|
| `/login` | Página de login |
| `/api/auth/*` | Fluxo OAuth Nuvemshop |
| `/auth/error` | Erros de autenticação |
| `/api/webhooks/*` | Webhooks Nuvemshop (chamados externamente) |
| `/api/sync` | Cron job (protegido por `CRON_SECRET`) |
| `/api/push/*` | Push notifications (protegido por `SUPABASE_SERVICE_ROLE_KEY`) |
| `/_next/*`, `/favicon.ico`, `/manifest.json`, `/sw.js`, `/icons/*` | Assets estáticos e PWA |

### Rotas Protegidas (requer Supabase Auth):

Todas as demais rotas (`/`, `/scan`, `/cart`, `/checkout`, `/products/*`, `/reports/*`, `/admin/*`, etc.)

### Rotas de Admin (requer `ADMIN_EMAIL`):

| Rota | Funcionalidade |
|------|---------------|
| `/admin/audit` | Auditoria de integridade |
| `/admin/users` | Gerenciamento de usuários |
| `/admin/logs` | Logs de sincronização |

---

## 21. Cron Jobs (Vercel)

**Arquivo:** [vercel.json](file:///home/douglas/Documentos/Projects/Stock%20-%20720x/vercel.json)

| Job | Rota | Horário | Descrição |
|-----|------|---------|-----------|
| Sincronização | `GET /api/sync` | `0 6 * * *` (06:00 UTC) | Drena sync_queue + sincroniza Nuvemshop → Supabase |
| Push Notifications | `GET /api/push/send` | `0 9 * * *` (09:00 UTC) | Verifica estoque baixo e notifica dispositivos |

Ambos protegidos por `CRON_SECRET` no header `Authorization: Bearer`.

---

## 22. Webhooks LGPD

| Endpoint | Evento | Descrição |
|----------|--------|-----------|
| `/api/webhooks/lgpd/customers-data-request` | LGPD | Solicitação de dados do cliente |
| `/api/webhooks/lgpd/customers-redact` | LGPD | Remoção de dados do cliente |
| `/api/webhooks/lgpd/store-redact` | LGPD | Remoção de dados da loja |

Endpoints obrigatórios para compliance com a Nuvemshop. Retornam `200 OK` para validação.

---

## 23. Mapa Completo de Rotas e Arquivos

### API Routes (`/api/*`)

| Rota | Método | Arquivo |
|------|--------|---------|
| `/api/auth/login` | GET | `api/auth/login/route.ts` |
| `/api/auth/callback` | GET | `api/auth/callback/route.ts` |
| `/api/products` | GET | `api/products/route.ts` |
| `/api/products/barcode` | GET | `api/products/barcode/route.ts` |
| `/api/stock` | POST, PUT | `api/stock/route.ts` |
| `/api/sync` | GET, POST | `api/sync/route.ts` |
| `/api/push/subscribe` | POST, DELETE | `api/push/subscribe/route.ts` |
| `/api/push/send` | POST, GET | `api/push/send/route.ts` |
| `/api/webhooks/orders` | POST | `api/webhooks/orders/route.ts` |
| `/api/webhooks/products` | POST | `api/webhooks/products/route.ts` |
| `/api/webhooks/lgpd/*` | POST | `api/webhooks/lgpd/*/route.ts` |

### Páginas (`(pdv)/*`)

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `(pdv)/page.tsx` | Dashboard PDV |
| `/scan` | `(pdv)/scan/page.tsx` | Scanner de código de barras |
| `/cart` | `(pdv)/cart/page.tsx` | Carrinho de compras |
| `/checkout` | `(pdv)/checkout/page.tsx` | Finalização de operação |
| `/success` | `(pdv)/success/page.tsx` | Confirmação de sucesso |
| `/products` | `(pdv)/products/page.tsx` | Lista de produtos |
| `/products/list` | `(pdv)/products/list/page.tsx` | Lista completa com infinite scroll |
| `/products/print-qr` | `(pdv)/products/print-qr/page.tsx` | Geração de etiquetas QR |
| `/stock/entry` | `(pdv)/stock/entry/page.tsx` | Entrada de estoque |
| `/stock/inventory` | `(pdv)/stock/inventory/page.tsx` | Inventário / contagem |
| `/pending-sales` | `(pdv)/pending-sales/page.tsx` | Vendas pendentes |
| `/reports` | `(pdv)/reports/page.tsx` | Relatórios de movimentação |
| `/reports/replenishment` | `(pdv)/reports/replenishment/page.tsx` | Relatório de reposição |
| `/admin/audit` | `(pdv)/admin/audit/page.tsx` | Auditoria de integridade |
| `/admin/users` | `(pdv)/admin/users/page.tsx` | Gerenciamento de usuários |
| `/admin/logs` | `(pdv)/admin/logs/page.tsx` | Logs de sincronização |
| `/update-password` | `(pdv)/update-password/page.tsx` | Alteração de senha |

### Server Actions (`actions/*`)

| Arquivo | Actions |
|---------|---------|
| `auth.ts` | `login`, `signup`, `signout`, `updatePassword`, `getAdminStatus` |
| `stock.ts` | `updateStockAction` |
| `session.ts` | `processSessionAction` |
| `pendingSales.ts` | `createPendingSaleAction`, `completePendingSaleAction`, `cancelPendingSaleAction`, `getPendingSalesCountAction`, `getPendingSalesAction` |
| `audit.ts` | `getStockDifferencesAction`, `syncAuditItemAction` |
| `reports.ts` | `getReplenishmentDataAction`, `getStockSessionsAction` |
| `admin.ts` | `listUsersAction`, `createUserAction`, `deleteUserAction` |
| `logs.ts` | `getSyncLogsAction` |

### Lib Modules (`lib/*`)

| Módulo | Arquivos | Responsabilidade |
|--------|----------|------------------|
| `nuvemshop/` | `api.ts`, `auth.ts`, `config.ts`, `index.ts`, `server.ts` | Cliente da API Nuvemshop, OAuth, configuração |
| `supabase/` | `client.ts`, `server.ts`, `middleware.ts` | Clientes Supabase (admin / server / middleware) |
| `sync/` | `products.ts` | Sincronização completa + sync_queue |
| `push/` | `webpush.ts` | Envio de Web Push (VAPID) |
| `products.ts` | — | Busca de produtos por barcode/id no Supabase |
| `types.ts` | — | Interfaces `Product`, `CartItem` |

### Componentes Compartilhados (`components/*`)

| Componente | Descrição |
|------------|-----------|
| `Scanner.tsx` | Leitura de código de barras via câmera |
| `SearchModal.tsx` | Modal de busca textual de produtos |
| `PrintQRModal.tsx` | Modal para seleção e impressão de QR codes |
| `OfflineBanner.tsx` | Banner de aviso quando sem internet |
| `PWAInstallPrompt.tsx` | Prompt para instalação do PWA |
| `PushNotificationPrompt.tsx` | Prompt para ativação de notificações push |

---

> **Última atualização:** 20/03/2026 — Gerada por varredura completa do código-fonte.
