---
description: Start a new development session by analyzing project context and logs.
---

# Start of Session Automation (/iniciar)

This workflow ensures the agent is fully synchronized with the project's current state.

1. **Analyze Project Context**
   - Read `.agent/SUMMARY.md` to understand the architecture and current progress.
   - Read `app/.gemini/antigravity/brain/*/task.md` (or the local task tracker) to see pending items.

2. **Review Recent History**
   - Identify the current month and read `docs/dev/YYYY-MM.md`.
   - Look for the last "Status Final da Sessão" or "Walkthrough" entry.

3. **Synchronize with User**
   - Check `TIMESHEET.md` to see the last recorded activity.
   - Ask the user for the priority of the day or if they want to proceed with the next task in the backlog.

4. **Initialize Task Boundary**
   - Start the work using the `task_boundary` tool with the identified priority.
