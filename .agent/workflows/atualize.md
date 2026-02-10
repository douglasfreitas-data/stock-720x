---
description: Automatically update project documentation, commit and push changes.
---

**CRITICAL**: This workflow MUST be followed strictly and in order. Do not skip any documentation steps.

1. **Analyze Session Work**
   - Review all modified files and the task history.
   - Calculate total time spent (current time vs. session start).

2. **Update Detailed Documentation**
   - **Walkthrough**: Update the current `walkthrough.md` in the brain.
   - **Dev Log**: Append/Update entry in `docs/dev/YYYY-MM.md`.
   - **Timesheet**: Update/Add entry in `TIMESHEET.md`.

3. **Project Synchronization**
   - **Summary**: Update `.agent/SUMMARY.md` tasks and known issues.
   - **Changelog**: Update `docs/CHANGELOG.md` with new features/fixes.

4. **Git Sync**
   - `git add .`
   - `git commit -m "[type]: [description]"`
   - `git push`

5. **Mandatory Validation Checklist**
   - BEFORE notifying the user, the agent MUST verify internally that steps 1, 2, 3, and 4 were fully executed.
   - The final notification MUST list the updated files and the commit hash.
