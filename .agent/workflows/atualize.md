---
description: Automatically update project documentation, commit and push changes.
---

# End of Session Automation (/atualize)

This workflow summarizes and persists all work done during the session.

1. **Analyze Session Work**
   - Review all modified files and the task history.
   - Calculate the time spent based on the current local time vs the start of work.

2. **Update Detailed Documentation**
   - Update `walkthrough.md` in the brain.
   - Append a summary entry to `docs/dev/2026-02.md` (or the current month).
   - Update the latest entry in `TIMESHEET.md`.

3. **Project Synchronization**
   - Update `.agent/SUMMARY.md` status and tasks.
   - Update `CHANGELOG.md` with notable changes.

4. **Git Sync**
   - Run `git add .`
   - Commit changes with a descriptive message (e.g., `feat: movement module and documentation update`).
   - Push to the current remote branch.

5. **Final Notification**
   - Notify the user with a summary of which documents were updated and the commit hash.
