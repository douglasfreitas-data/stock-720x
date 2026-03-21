# 🎯 Fase 5: Expansão

**Foco da Semana:** Finalizar inteligência de busca e tratamento de estoque infinito (Nuvemshop).

---

## 🚨 Prioridade 0: Restaurar Deploy Vercel
> **Origem:** INCIDENTE_VERCEL_2026-03-13.md
- [ ] Verificar se rollback para `8a360bb` restaurou deploy funcional.
- [ ] Limpar `vercel.json` (migrar de `builds` legado para `rootDirectory`).
- [ ] Validar integração Git ↔ Vercel no dashboard.

## 🛡️ Prioridade 1: Proteção Contra Regressões
- [ ] Criar branch `dev` para desenvolvimento.
- [ ] Configurar GitHub Actions com `next build` em PRs para `main`.
- [ ] Adicionar tags de release no Git (`v0.4.0` = estado estável).

---

## 🔔 Bloco 5.1: Alertas de Estoque Mínimo (Web Push Vercel-Safe) — CONCLUÍDO
> Voltamos para Notificações Web Push nativas superando a limitação da Vercel.
- [x] Criar infra nativa de criptografia P-256 (`webpush.ts`)
- [x] Criar API routes de subscrição (`/api/push/subscribe`)
- [x] Criar broadcast de notificação (`/api/push/send`)
- [x] Integrar prompt visual `<PushNotificationPrompt />`
- [x] Sincronização inteligente de subscrições e cross-account RLS bypassing
- [x] Testes no celular (iOS/Android) e validação E2E Build

## 📊 Bloco 5.2: Relatório Inteligente de Reposição (Estoque Mínimo) — CONCLUÍDO
- [x] Criar relatório de produtos no estoque mínimo ou próximos a ele (Crítico e Atenção).
- [x] Definir lógica de cálculo para o estoque "próximo ao mínimo" (regra: 20% acima do mínimo).
- [x] Linkar clique da notificação Push nativa direto para a aba de relatório.
- [x] Refinamento visual: Adaptação de cores ao Dark Theme global (var(--bg-card)), remoção de emojis pesados, substituição da visualização crua pelo formato JSONB polido (Nuvemshop Sync), e ajuste tipográfico.

## 🏢 Bloco 5.3: Multi-loja
- [x] Estruturação (a definir requisitos) - Não será mais necessario

## 🛒 Bloco 5.4: PDV Unificado & Vendas Pendentes — CONCLUÍDO
> Transformação do fluxo de venda rápida no aplicativo, permitindo separar itens sem pagar na hora.
- [x] Unificação das telas `/cart` e `/checkout`.
- [x] Novo recurso: Editar Preço Manualmente (sobreescreve Nuvemshop).
- [x] Novo recurso: Vendas Pendentes ("Salvar Pendente" reserva o estoque temporariamente).
- [x] Rotinas Server-Side de Cancelamento (Estorno) de venda pendente para retorno de estoque físico limpo.
- [x] UI/UX: Destaque visual vermelho dinâmico para "Reservas Estornadas" em relatórios a fim de auditar vendas canceladas.
- [x] Refatoramento inteligente dos arquivos e componentes de UI das listas e do relatorio PDF dinâmico (`Fornecedor` na entrada).

## 🚀 Bloco 5.5: Performance & Resiliência Offline (Sync Queue) — CONCLUÍDO
> Otimizações extremas para lidar com 1700+ variantes e apagões da API Nuvemshop.
- [x] Fila de Sincronização Local-First (`sync_queue`): Operações no PDV agora salvam no Supabase mesmo com Nuvemshop offline, e re-tentam via Cron Job.
- [x] Lazy Loading Otimizado (10 em 10) na Lista de Produtos e na Impressão de Etiquetas.
- [x] Lazy Generation de código QR Base64 para evitar congelamento da UI ao "Selecionar Todos".
- [x] Design: Spinner Laranja corporativo padronizado nas listas e fallbacks de imagens.

## 🔍 Bloco 5.6: Auditoria & Integridade Nuvemshop — CONCLUÍDO
> Resolução de conflitos de estoque gerados por webhooks corrompidos e criação de ferramentas de segurança.
- [x] Máquina de Estados de Reserva para Webhooks: Pedidos Online "open" viram "Vendas Pendentes" no backend com estorno automático no `canceled`.
- [x] Bugfix crítico de Lifecycle da Nuvemshop (Mapeamento de `payment_status === 'paid'` transacionando em background enquanto o pedido fica estático em `open`).
- [x] Prevenção de race condition e Idempotência cravada: webhook ignora repetições da Vercel.
- [x] Dashboard de Auditoria de Estoque Automatizado (Admin): Varredura das 1700+ variantes contra a API Nuvemshop apontando divergências reais.
- [x] Ocultação de "Reservas Nuvemshop" da UI do PDV físico para manter usabilidade do caixa local.

## 🚀 Bloco 5.8: Inteligência de Busca & Estoque Infinito — CONCLUÍDO
> Expansão da capacidade de localização de itens e tratamento de modelos sem controle de estoque.
- [x] **Nova Busca em todo o App**: Além do nome, agora é possível buscar por **SKU**, **Código de Barras** e **ID do Produto** nas telas de PDV, Entrada, Inventário e Relatórios.
- [x] **Busca Multi-Termos (Agnóstica)**: O motor de busca (`normalizeSearchString`) agora ignora acentos, traços e caracteres especiais. Além disso, a busca processa palavras independentes (ex: digitar "lamina escola" encontra o produto mesmo que a ordem ou palavras no meio divirjam), e o limite de resultados no autocomplete foi ampliado para 50itens.
- [x] **Fix Truncamento de Busca (Supabase)**: Adicionado `.limit(10000)` à query da API para evitar o truncamento silencioso do PostgREST (limite padrão: 1000 linhas), que causava produtos faltantes nos resultados de busca.
- [x] **Suporte a Estoque Infinito**: Implementação da regra de negócio para produtos com `stock_management: false` na Nuvemshop.
  - O app ignora alertas de estoque baixo e permite vendas mesmo com saldo "0" (Tratando como `Infinity`).
  - Símbolo **"∞"** exibido nas listas para clareza visual.
  - Sincronização automática ignora divergências para estes itens.
- [x] **Refinamento de UX (Toast)**: Redução de pop-ups intrusivos (removido "Produto Adicionado/Encontrado") para agilizar a operação de caixa.
- [x] **Placeholders Inteligentes**: Atualização de todos os inputs de busca para informar os novos critérios (Nome, Código ou Barras).

## 📄 Bloco 5.9: Melhorias em Relatórios PDF & Etiquetas QR — CONCLUÍDO
> Correções de exibição e melhorias de usabilidade nos PDFs gerados pelo sistema.
- [x] **Relatório PDF — Campo de Produto Ampliado**: Aumento de 40% na largura do campo "Produto" nos PDFs de Movimentação e Reposição, com reposicionamento de todas as colunas adjacentes.
- [x] **Relatório PDF — Saldo Infinito (∞)**: Correção de bug onde produtos com `stock_management: false` exibiam saldo `0` ao invés de `∞`. Adicionado campo `stock_management` à query de relatórios e criada função `formatStock()` para formatação condicional tanto na tela quanto no PDF.
- [x] **Etiquetas QR Code — Rotação 180° (Coluna Direita)**: Implementação de rotação via **Matriz de Transformação PDF (CTM)** (`[-1, 0, 0, -1, 2*cx, 2*cy] cm`) para que ao cortar a folha A4 ao meio, ambas as colunas de etiquetas tenham a margem de furo no lado correto. Código original preservado em `PrintQRClient_backup.tsx`.

## 🖥️ Bloco 5.10: UX & Responsividade Desktop — BKP/ROADMAP
> Adaptações necessárias caso o PDV web passe a ser utilizado extensivamente num navegador de Desktop ou Totem.
- [ ] Implementação de **CSS Grid** e `max-width` global (ver specs em `docs/planejamento/03_RESPONSIVIDADE_DESKTOP.md`).
