# 🗂️ Stock 720x — Painel Mestre de Documentação

> **Este é o único arquivo que você precisa ler para entender o estado do projeto.**

**Última Atualização:** 19/03/2026 (Refatoração de Performance & Supabase Sync)
**Fase Atual:** Fase 5 (Expansão)
**Status Geral:** 🟢 Estabilizado & Ultra-Rápido

---

## 🚀 Acesso Rápido

| O que você procura? | Arquivo Oficial |
|---------------------|-----------------|
| **O que fazer agora?** | [🎯 Fase Atual (Sprint)](./planejamento/02_FASE_ATUAL.md) |
| **Visão de Futuro** | [🗺️ Roadmap Macro](./planejamento/01_ROADMAP_MACRO.md) |
| **Regras de Negócio** | [🧠 Funcionamento do Sistema](./planejamento/04_REGRAS_NEGOCIO.md) |
| **Bugs Conhecidos** | [🐛 Bug Tracker](./rastreamento/BUG_TRACKER.md) |
| **Horas Trabalhadas** | [⏱️ Timesheet](./planejamento/TIMESHEET.md) |
| **Decisões Técnicas** | [🏗️ Arquitetura & Manuais](./ARCHITECTURE.md) |

---

## 📋 Resumo Executivo

O projeto **Stock 720x** é um PDV mobile-first (Next.js PWA) integrado à Nuvemshop (ERP) com cache local no Supabase para performance e offline-first capabilities.

### Onde Estamos (Fase 5)
Já completamos Fase 1 (Mockup), Fase 2 (Backend Base), Fase 3 (Polimento) e Fase 4 (Operação Física). O PWA já funciona offline, possui E2E tests, reconciliações e onboarding ativo.

### Próximo Objetivo Imediato
A fase de estabilização do Web Push e re-estruturação dos Webhooks terminou. O deploy automático da Vercel foi retomado com CI simples no GitHub. O próximo passo da fase atual (Blocos 5.3) concentra-se em planejamento de multi-lojas e multi-estoques, se aprovado.

---

## 🔧 Estrutura de Pastas

A documentação está organizada da seguinte forma:

- `/docs/planejamento`: Onde definimos **O QUE** fazer.
- `/docs/rastreamento`: Onde acompanhamos **STATUS** e **BUGS**.
- `/docs/tecnico`: Onde explicamos **COMO** funciona (arquitetura, manuais).
- `/docs/historico`: Logs de sessões passadas para referência.

---

> **Nota para Agentes:** Sempre comece lendo este arquivo e siga os links para a área específica necessária. Não crie arquivos soltos na raiz.
