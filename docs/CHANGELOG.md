# Changelog

Todas as mudanças notáveis do projeto são documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [0.7.0] - 2026-03-18

### Adicionado
- **PDV Unificado**: Carrinho e Checkout unificados na mesma tela (`/cart`).
- **Edição de Preços**: Possibilidade de editar o preço unitário do produto diretamente no POS antes da venda.
- **Vendas Pendentes**: Usuário agora pode "Salvar como Pendente", que guarda os itens num novo menu, faz baixa imediata provisória no estoque para não haver venda dupla.
- **Estorno Automático**: Cancelar uma venda pendente recupera integralmente o estoque como `estorno_reserva` automaticamente.
- **Relatórios PDV Refinados**: Geração dinâmica via JS de agrupamentos por Fornecedor (entradas) e Cliente (saídas). Valores ocultos corretamente em relatórios de entrada.
- **Relatório de Reposição**: Adicionado Export em PDF separando de modo limpo as seções de níveis de urgência ('Crítico' e 'Em Observação').

---

## [0.6.0] - 2026-03-14

### Adicionado
- **Web Push Nativo (Node.js)**: Infraestrutura própria de criptografia P-256 e payload FCM, superando bloqueios nativos e descontinuados da Vercel Edge.
- **Service Worker Nativo & cross-account RLS bypassing**: Componente `<PushNotificationPrompt />` gerencia autorizações ativas silenciosamente com VAPID no frontend conectando as WebSockets locais via Supabase.
- **Relatório Inteligente de Reposição**: Interface iterativa para listar os SKUs críticos (<= mínimo) ou em atenção (margem até 20% acima do mínimo). Linkada no menu home e direto nos cliques de Notificação Web Push.
- **Design System Adaptivo**: Componente de Reposição 100% migrado para o Dark Theme global da aplicação, substituindo fundos brancos estáticos por paletas suaves (`--bg-card`, `--text-muted`, `--danger`, `--warning`).

### Corrigido
- **Cadeia de Notificação Push (Bug 16)**: Tratados simultaneamente 7 gargalos na conexão Client -> NextJS -> FCM (incluindo parsing DER e cabeçalhos de Urgency).
- **Service Worker Cache Lock**: Implementado `skipWaiting()` e `clients.claim()` no `sw.js` para garantir que o navegador ative atualizações de interface e lógica de notificações push imediatamente, sem exigir restart da aba.
- **React Hydration (Relatório)**: Condição de rendering `isMounted` estabilizada no `formatCurrency` client-side.
- **JSONB Parsing de API**: Corrigido parser de nomes de produtos advindos do Nuvemshop, suportando tanto formato cru (string "Espada") quanto mapa JSON Multilanguage (`{"pt": "Espada"}`).

---

## [0.5.0] - 2026-03-13

### Adicionado
- **Tratamento Offline**: Detecção de conectividade persistente interativa pelo `OnlineStatusProvider` e `OfflineBanner`. Controles do formulário bloqueados e alertas proativos na interface de vendas e entrada durante perda de sinal.
- **Teste End-to-End**: `playwright` framework incorporado na suíte em `/e2e`. Smoke Tests simulando fluxo de navegação protegida de dashboard operando via webServer.
- **Otimização PWA**: Refinadas as propriedades idiomáticas `manifest.json` com ícones isolados do pool `any`/`maskable` e viewport otimizado no SSR.

### Modificado
- **Transição de Fase**: Fase de Operação Física (F4) concluída. Projeto avança estruturalmente para Fase de Expansão (F5).

---

## [0.4.1] - 2026-03-11

### Adicionado
- **Autenticação Individual (Supabase Auth)**: Implementadas telas de Login, Registro e Troca de Senha.
- **Proteção SSR Robusta**: `layout.tsx` do PDV migrado para Server Component para forçar validação hard bloqueando páginas caso a Vercel sirva o HTML em cache estático.
- **Prompt Nativo PWA**: "Bottom-sheet" amigável para convidar o usuário a instalar o web app localmente.

### Corrigido
- Ícone padrão Vercel sobreposto substituído pelos ícones corretos do `manifest.json`.
- Bypass de autenticação ghost (`Bug 15`) travado com expurgo de cookie legado.

---

## [0.4.0] - 2026-03-11

### Adicionado
- **Reconciliação Automática de Estoque**: O Cron Job agora compara o estoque na Nuvemshop com a base local. Discrepâncias silenciosas agora geram um "Ajuste de Estoque" rastreável no sistema.
- **Log de Sincronização**: Toda execução do Cron via `/api/sync` gera um log de sucesso/erro na tabela `sync_logs`, listando as correções efetuadas.
- **Exportação em PDF**: Emissão de relatório formatado para impressão (A4 paisagem) separado por operação (Entrada vs Saída).

### Modificado
- **Redesign dos Relatórios**: UX reconstruída do zero, pautada em simplicidade, dividida em abas e sem gráficos.
- **Transição de Fase**: Encerramento da Fase Core (F3) e entrada na Fase Operacional (F4).
- **Adequação Funcional**: Módulo/cards do "Financeiro" removidos da aplicação para manter escopo voltado unicamente ao gerenciamento físico.

---

## [0.3.0] - 2026-03-10

### Adicionado
- **Relatórios Avançados**: Página `/reports` reescrita com filtros (data, tipo, operação, produto), gráficos Recharts (BarChart por dia + PieChart por operação), cards resumo e exportação CSV/PDF.
- **Loading Skeletons**: Skeleton de carregamento na lista de produtos via `loading.tsx` (Suspense).
- **Spinner de Carregamento**: Indicador visual na página de relatórios.
- **Cron Job Vercel**: Sincronização automática de produtos 1x/dia às 3h BRT via `/api/sync`.
- **Botões Checkout Cards**: Tipo de operação no checkout redesenhado como cards com ícones.

### Corrigido
- **Deploy Vercel**: Cron de 4h bloqueava deploy no plano Hobby; ajustado para 1x/dia.
- **ESLint Warnings**: Limpeza de imports não utilizados, variáveis mortas e `<a>` substituído por `next/link`.
- **Alinhamento Inventário**: Margin-top dos botões de ação corrigido.

---

## [0.2.4] - 2026-02-22

### Adicionado
- **Indicadores de Estoque**: Cores (Verde/Amarelo/Vermelho) no Inventário para alertar sobre o nível em relação ao Mínimo Ideal.
- **Edição de Estoque Mínimo**: Interface na tela de Inventário para ajustar a meta de `min_stock` independentemente da contagem física.
- **Webhooks de Produto**: Sync reverso em tempo real Nuvemshop -> Supabase.
- **Validação de Estoque**: Bloqueio de itens sem saldo no PDV (Scan e Carrinho).
- **Timeouts de API**: Proteção de 8 segundos contra travamentos em requisições externas.

### Corrigido
- **Sync Overwrite**: Previne que o webhook da Nuvemshop zere o `min_stock` local restaurando configs de race condition.
- **Search API**: Correção da rota de pesquisa que retornava dados ignorando o estoque mínimo real do banco (Bug 14).
- **Checkout Redirect**: Fim do "ejetar usuário" ao carregar a página via guard de inicialização.
- **Freeze no Checkout**: Tratamento de erro robusto no fluxo de finalização de venda.

---

## [0.2.3] - 2026-02-14

### Adicionado
- **SearchModal**: Componente de busca fullscreen para mobile (Scan, Entrada, Inventário).
- **Módulo Inventário**: Nova página `/stock/inventory` estática com scanner e ajuste de estoque.
- **Layout Entrada**: Lista de itens compacta e botões de operação reposicionados.

### Corrigido
- **Race Condition Checkout**: Refatoração com `useRef` e limpeza antecipada de carrinho (parcialmente resolvido).

---

## [0.2.2] - 2026-02-10

### Adicionado
- **Modal de Quantidade**: Scan na Entrada de Estoque agora abre modal para escolher quantidade antes de adicionar.
- **Busca Autocomplete**: Campo "busque por nome" com debounce 300ms e dropdown de resultados.
- **Backend Search**: API `GET /api/products?search=` para busca por nome.

---

## [0.2.1] - 2026-02-10

### Adicionado
- **Organização**: Novo `ROADMAP.md` centralizado e guia prático `ai_team_roles`.
- **UX/UI Round 1 & 2**: 11 correções visuais e funcionais.
- **Header**: Ícone de carrinho 🛒 persistente no cabeçalho global.
- **Scanner**: Novo design de overlay para ativação da câmera.
- **Busca por Nome**: Suporte inicial para campo de busca por nome no Scanner.

### Corrigido
- **Next.js 16 Compatibility**: Fix 404 no inventário aguardando `params` (Promise).
- **Scanner Stability**: Proteção contra crashes client-side na entrada de estoque.
- **Visual**: Remoção de sublinhados globais e correção de cores de botões para branco.
- **Acessibilidade**: Botão de ativação de câmera aumentado e centralizado.

---

## [0.2.0] - 2026-02-10

### Adicionado
- **Módulo de Movimentação**: Registro de entradas e saídas via sessões.
- **Tela de Entrada**: Novo fluxo para registro de compras e devoluções.
- **Tela de Ajuste**: Correção de estoque (balanço) com registro de perda/roubo/consumo.
- **Relatórios**: Dashboard de histórico de movimentações detalhado.
- **Dual-Write**: Sincronização em tempo real entre Nuvemshop e Supabase.
- **Busca por Barcode**: API server-side segura para consulta de produtos.

### Corrigido
- Paginação na sincronização Nuvemshop → Supabase (fix 404).
- Inconsistência de estoque entre plataformas.

---

## [Unreleased]

### Adicionado
- Estrutura Next.js 16 com TypeScript para backend (`/app`)
- Integração OAuth2 com Nuvemshop
- API de produtos com busca por código de barras
- API de estoque para baixa automática
- Estrutura de documentação profissional

---

## [0.1.0] - 2026-02-01

### Adicionado
- Mockup PWA completo com 11 telas
- Design system customizado
- Scanner de QR code simulado
- Deploy no Vercel
