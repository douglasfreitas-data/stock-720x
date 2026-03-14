---
description: Start a new development session by analyzing project context and logs.
---

# Start of Session Automation (/iniciar)

This workflow ensures the agent is fully synchronized with the project's CENTRALIZED DOCUMENTATION.

## 🔴 PRÉ-VÔO: Saúde do Deploy (OBRIGATÓRIO)

0. **Verificar Saúde do Deploy Vercel**
   - Executar `vercel ls | head -n 5` para checar se o último deploy está `● Ready`.
   - Se estiver `● Error`, **NÃO prosseguir com dev**. Ler `docs/rastreamento/INCIDENTE_VERCEL_2026-03-13.md` e resolver o deploy primeiro.
   - Verificar se existe branch `dev`. Se não existir, **criar antes de qualquer código novo** (`git checkout -b dev`).

## Passos Padrão

1. **Analyze Master Plan**
   - Read `docs/00_PROJETO_MASTER.md`. This is the ONLY entry point.
   - Follow the links in the "Acesso Rápido" table to understand the current phase.

2. **Check Current Sprint & Bugs**
   - Read `docs/planejamento/02_FASE_ATUAL.md` for active tasks.
   - Read `docs/rastreamento/BUG_TRACKER.md` for blocking issues.

3. **Consult History & Incidents**
   - Read the latest entry in `docs/historico/` (e.g., `docs/historico/2026-03.md`) to see the last session's output.
   - Check for any active incident reports in `docs/rastreamento/INCIDENTE_*.md`.

4. **Proteção de Produção (se não existir)**
   - Verificar se branch `dev` existe: `git branch -a | grep dev`
   - Se não: criar `dev` e trabalhar nela. Só fazer merge para `main` após `vercel build` local passar.
   - Verificar se há GitHub Actions configurado. Se não, sugerir ao usuário criar um CI básico com `next build`.

5. **Synchronize with User**
   - Propose the next logical step based on `02_FASE_ATUAL.md` and `BUG_TRACKER.md`.
   - Ask the user for approval or reprioritization.

6. **Initialize Task Boundary**
   - Start the work using the `task_boundary` tool.
