# 🎯 Fase 5: Expansão

**Foco da Semana:** Estabilizar deploy e implementar Alertas de Estoque Mínimo (Popup).

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

## 🖥️ Bloco 5.7: UX & Responsividade Desktop — BKP/ROADMAP
> Adaptações necessárias caso o PDV web passe a ser utilizado extensivamente num navegador de Desktop ou Totem.
- [ ] Implementação de **CSS Grid** e `max-width` global (ver specs em `docs/planejamento/03_RESPONSIVIDADE_DESKTOP.md`).
