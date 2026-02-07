---
name: "git_workflow"
description: "Standard Git workflow for commits and branches"
---

# Git Workflow Standards

## Goal
Maintain a clean and traceable commit history.

## Instructions

1.  **Commit Messages**:
    -   Use Conventional Commits format: `type(scope): description`.
    -   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
    -   Example: `feat(auth): implement login with Clerk`

2.  **Branching**:
    -   `main` or `master`: Production-ready code.
    -   `develop` (optional): Integration branch.
    -   Feature branches: `feat/feature-name`
    -   Fix branches: `fix/bug-name`

3.  **Before Pushing**:
    -   Ensure the code builds (`npm run build`).
    -   Ensure no lint errors (`npm run lint`).

## Triggers
- "Commit changes"
- "Push to git"
- "Create a new branch"
