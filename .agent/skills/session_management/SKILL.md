---
name: "session_management"
description: "Guidelines for starting and ending development sessions with automated updates"
---

# Session Management

## Goal
Establish a robust and automated process for documenting development progress and ensuring all records are synchronized before finishing.

## Workflows Available
- **`/iniciar`**: Run this at the start of every session to analyze logs and summary.
- **`/atualize`**: Run this at the end to persist all work and sync with Git.

## Instructions

### 1. Starting a Session
- Analyze the project context using `SUMMARY.md` and `task.md`.
- Read the last entry in `docs/dev/[month].md`.
- Synchronize `task.md` with the user's immediate needs.
- Initialize the work using `task_boundary`.

### 2. Ending a Session (/atualize)
When the user requests `/atualize` or asks to finish and update everything, the agent **MUST** read `.agent/workflows/atualize.md` and follow these steps in order:

1. **Walkthrough**: Update the current `walkthrough.md`.
2. **Dev Log**: Update `docs/dev/YYYY-MM.md`.
3. **Timesheet**: Update `TIMESHEET.md`.
4. **Summary**: Update `.agent/SUMMARY.md`.
5. **Changelog**: Update `docs/CHANGELOG.md`.
6. **Git Workflow**: Add, commit, and push.

**CRITICAL**: Verify all steps using the validation checklist included in the workflow file.

## Triggers
- "Começar sessão"
- "Analisar o que foi feito"
- "/atualize"
- "Finalizar e atualizar tudo"
