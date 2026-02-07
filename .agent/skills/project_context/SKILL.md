---
name: "project_context"
description: "Manage project context and session summaries using SUMMARY.md"
---

# Project Context Management

## Goal
Maintain continuity between agent sessions by using SUMMARY.md, drastically reducing token usage and preventing context loss.

## Instructions

### Starting a New Session
1. **Always read `.agent/SUMMARY.md` first** before starting any work
2. Use the summary to understand:
   - Current project status
   - Pending tasks
   - Known issues and bugs
   - Recent architectural decisions

### Ending a Session
1. **Update `.agent/SUMMARY.md`** with:
   - Completed tasks (move from pending to completed)
   - New pending tasks discovered
   - Any bugs found or fixed
   - Important decisions made

### SUMMARY.md Format
```markdown
# Project Summary - [Project Name]
**Last Updated:** [Date/Time]

## Status
- **Current Phase:** [Phase description]
- **Deployment:** [Deployment status]
- **Next Step:** [Immediate next action]

## Key Decisions
- [Decision 1]
- [Decision 2]

## Active Tasks
- [x] Completed task
- [ ] Pending task

## Known Issues
- [Issue description]

## Environment & Tokens
- [Important env vars and credentials info]
```

## Token Economy Benefits
- Reduces context from ~50,000 tokens to ~2,000 tokens
- Prevents repetition of explanations across sessions
- Maintains project knowledge without full history

## Triggers
- "Start session"
- "End session"
- "Update summary"
- "What's the project status?"
