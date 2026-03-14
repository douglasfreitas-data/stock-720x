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

## 🔔 Bloco 5.1: Alertas de Estoque Mínimo (Popup In-App) — PIVOTADO
> ~~Web Push Notifications~~ → Substituído por alertas popup simples ao logar.
- [ ] Criar componente `LowStockAlert` (modal/popup persistente ao login).
- [ ] Criar tabela `alert_preferences` no Supabase (produto silenciado por usuário).
- [ ] Consultar produtos com estoque ≤ mínimo na carga do dashboard.
- [ ] Botão "Lembrar Depois" (ignora até próximo login).
- [ ] Botão "Não avisar mais sobre este produto" (persiste no Supabase).

## 📊 Bloco 5.2: Relatório Inteligente de Reposição (Estoque Mínimo)
- [ ] Criar relatório de produtos no estoque mínimo ou próximos a ele.
- [ ] Definir lógica de cálculo para o estoque "próximo ao mínimo" (ex: % acima do mínimo, ou baseado na velocidade de venda recente).

## 🏢 Bloco 5.3: Multi-loja
- [ ] Estruturação (a definir requisitos)
