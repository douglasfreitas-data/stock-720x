---
description: Start a new development session by analyzing project context and logs.
---

# Start of Session Automation (/iniciar)

This workflow ensures the agent is fully synchronized with the project's CENTRALIZED DOCUMENTATION.

1. **Analyze Master Plan**
   - Read `docs/00_PROJETO_MASTER.md`. This is the ONLY entry point.
   - Follow the links in the "Acesso Rápido" table to understand the current phase.

2. **Check Current Sprint & Bugs**
   - Read `docs/planejamento/02_FASE_ATUAL.md` for active tasks.
   - Read `docs/rastreamento/BUG_TRACKER.md` for blocking issues.

3. **Consult History**
   - Read the latest entry in `docs/historico/` (e.g., `docs/historico/2026-02.md`) to see the last session's output.

4. **Synchronize with User**
   - Propose the next logical step based on `02_FASE_ATUAL.md` and `BUG_TRACKER.md`.
   - Ask the user for approval or reprioritization.

5. **Initialize Task Boundary**
   - Start the work using the `task_boundary` tool.
