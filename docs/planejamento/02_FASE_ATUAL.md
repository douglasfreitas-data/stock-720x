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
- [ ] Estruturação (a definir requisitos)
