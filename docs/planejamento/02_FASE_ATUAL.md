# 🎯 Fase 5: Expansão

**Foco da Semana:** Expandir as capacidades do Stock 720x implementando de início Notificações Push (Web Push).

---

## 🚨 Prioridade 0: Bugs Críticos (Bloqueantes)
> **Origem:** BUG_TRACKER.md
- *(Nenhum bug bloqueante documentado no momento)*

---

## 🔔 Bloco 5.1: Notificações Push Nativas (Web Push)
- [ ] Configurar Service Worker (`sw.js`) no Frontend PWA.
- [ ] Implementar solicitação nativa de permissão (`Notification.requestPermission()`).
- [ ] Gerar e configurar chaves seguras VAPID no backend.
- [ ] Criar tabela `push_subscriptions` atrelada aos usuários logados.
- [ ] Criar endpoint para envio de payloads (`api/notifications/send`).
- [ ] Integrar disparo visual com webhooks (ex: Nova Venda Nuvemshop).

## 📊 Bloco 5.2: Relatório Inteligente de Reposição (Estoque Mínimo)
- [ ] Criar relatório de produtos no estoque mínimo ou próximos a ele.
- [ ] Definir lógica de cálculo para o estoque "próximo ao mínimo" (ex: % acima do mínimo, ou baseado na velocidade de venda recente).

## 🏢 Bloco 5.3: Multi-loja
- [ ] Estruturação (a definir requisitos)
