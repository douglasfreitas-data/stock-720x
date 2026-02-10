---
name: "session_management"
description: "Guidelines for starting and ending development sessions with automated updates"
---

# Session Management

## Goal
Establish a robust and automated process for documenting development progress and ensuring all records are synchronized before finishing.

## Instructions

### 1. Starting a Session
- Analyze the project context using `SUMMARY.md` and `task.md`.
- Read the last entry in `docs/dev/[month].md`.
- Synchronize `task.md` with the user's immediate needs.
- Initialize the work using `task_boundary`.

### 2. Ending a Session (/atualize)
When the user requests `/atualize` or asks to finish and update everything, the agent MUST follow these steps in order:

1. **Walkthrough**: Update the current `walkthrough.md` (brain artifact) with all changes made in the session.
2. **Dev Log**: Update the corresponding monthly log in `docs/dev/YYYY-MM.md`.
3. **Timesheet**: Add a new entry to `TIMESHEET.md` with the activities and hours spent.
4. **Summary**: Update `.agent/SUMMARY.md` to reflect the new project status and mark tasks as complete.
5. **Changelog**: If significant features were finished, add a new entry or update the "Unreleased" section in `CHANGELOG.md`.
6. **Git Workflow**: 
   - `git add .`
   - `git commit -m "docs: auto-update documentation for session [Date]"` (or a more descriptive one if code changes were significant).
   - `git push origin [current_branch]`.

## Triggers
- "Começar sessão"
- "Analisar o que foi feito"
- "/atualize"
- "Finalizar e atualizar tudo"
