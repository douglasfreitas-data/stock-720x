---
name: "ai_team_roles"
description: "Guidelines for assigning tasks to different AI models to optimize token usage and efficiency."
---

# AI Team Structure & Token Optimization

## 🎯 Objective
Maximize project efficiency and minimize token costs by assigning tasks to the specific AI model best suited for the complexity level. Treat your AI interaction as managing a team of developers with different seniorities.

## 👥 The Team (Model Roles)

### 1. **Architect & Lead (Opus 4.6 / o1)**
*   **Role:** Tech Lead / Staff Engineer.
*   **Best for:**
    *   **Planning phases:** Creating the initial `implementation_plan.md`.
    *   **Complex Debugging:** Diagnosing root causes when multiple files interact (e.g., sync + database + frontend conflicts).
    *   **Architecture:** Designing database schemas, data flow diagrams.
    *   **Context Management:** updating `SUMMARY.md` and high-level project direction.
*   **Cost:** $$$$ (Use sparingly, for high-value decisions).

### 2. **Senior Developer (Opus 4.5 / Sonnet 3.5)**
*   **Role:** Senior Full-Stack Dev.
*   **Best for:**
    *   **Implementation:** Writing functional code for complete features.
    *   **Refactoring:** Improving code quality and splitting large files.
    *   **Review:** checking code against the plan.
    *   **Documentation:** Updating `task.md`, `walkthrough.md`.
*   **Cost:** $$$ (The workhorse for complex coding).

### 3. **Developer / Junior (Gemini / GPT-4o)**
*   **Role:** Mid-level Dev.
*   **Best for:**
    *   **Routine Tasks:** "Create a new page following the pattern of page X".
    *   **Simple Fixes:** "Fix the lint error on line 45".
    *   **Tests:** Writing unit tests for existing functions.
    *   **Scripts:** Creating small utility scripts.
*   **Cost:** $$ (Good for volume).

## 🔄 Workflow Strategy

1.  **Start with the Lead (Opus 4.6):**
    *   Brief the problem.
    *   Ask for a plan (`implementation_plan.md`) and task breakdown (`task.md`).
    *   *Result:* A concrete roadmap.

2.  **Handoff to Developers (Sonnet/Gemini):**
    *   Switch to a cheaper model.
    *   Execute the plan item by item.
    *   *Prompt:* "Execute task 1 from `task.md`. Context is in `implementation_plan.md`."

3.  **Review & Verify (Opus 4.5/4.6):**
    *   Verify the work (`verify_implementation`).
    *   Update `SUMMARY.md` and `TIMESHEET.md`.

## 📂 Context Management (Crucial for Savings)

To save tokens, **do not** make the model read every file every time. Rely on:

*   `task.md`: What are we doing *now*?
*   `implementation_plan.md`: *How* are we doing it?
*   `SUMMARY.md`: What is the *current state* of the project?

**Tip:** When switching models, ask the new model to "Read `SUMMARY.md` and `task.md` to get up to speed" instead of dumping the whole history.
