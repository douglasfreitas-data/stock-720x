---
description: Automatically update project documentation, commit and push changes.
---

# Update Session Automation (/atualize)

**CRITICAL**: This workflow MUST be followed strictly to maintain the centralized documentation integrity.

1. **Analyze Session Work**
   - Review all modified files and the task history.
   - Calculate total time spent.

2. **Update Centralized Docs**
   - **Sprint Status**: Update `docs/planejamento/02_FASE_ATUAL.md` marking completed tasks with `[x]`.
   - **Bugs**: Update `docs/rastreamento/BUG_TRACKER.md` if any bugs were fixed or found.
   - **Timesheet**: Append entry to `docs/rastreamento/TIMESHEET.md`.
   - **History**: Append session log to `docs/historico/YYYY-MM.md`.

3. **Project Synchronization**
   - Update `docs/00_PROJETO_MASTER.md` if the Phase or Status changed.
   - Update `docs/CHANGELOG.md` with new features/fixes.

4. **Git Sync**
   - `git add .`
   - `git commit -m "[type]: [description]"`
   - `git push`

5. **Mandatory Validation**
   - Verify that updates were made in `docs/` and NOT in root files.
   - Notify user with the commit hash.
