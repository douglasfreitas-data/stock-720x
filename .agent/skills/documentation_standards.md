---
name: "documentation_standards"
description: "Documentation standards and process recording"
---

# Documentation Standards

## Goal
Ensure all major architectural decisions, bug fixes, and processes are documented for future reference and team alignment.

## Instructions

1.  **Always Update `SUMMARY.md`**:
    -   At the end of every significant session or task, update `.agent/SUMMARY.md`.
    -   Include: Completed tasks, pending tasks, known bugs, and architectural decisions.

2.  **Create Artifacts for Complex Features**:
    -   For new features, create `docs/feature_name.md`.
    -   Include: Purpose, Implementation Details, API endpoints, key components.

3.  **Document "Why", not just "What"**:
    -   When making a non-obvious choice (e.g., "Using Clerk instead of NextAuth"), verify if it is documented in `ADR` (Architecture Decision Records) or `SUMMARY.md`.

4.  **Readme Updates**:
    -   If a new script or environment variable is added, update `README.md` immediately.

## Triggers
- "Document this"
- "Create documentation"
- "Why did we do this?"
