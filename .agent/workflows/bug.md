---
description: Scan daily bug files in docs/bugs/ and sync them to BUG_TRACKER.md
---

# Bug Sync Workflow (/bug)

This workflow automates the ingestion of bugs from unstructured daily logs into the structured `BUG_TRACKER.md`.

1.  **Scan for New Reports**
    - Look in `docs/bugs/` for files matching `DDMM_lista_bugs.md` (e.g., `1102_lista_bugs.md`).
    - Identify the most recent file or the one specified by the user.

2.  **Analyze Content**
    - Read the file content.
    - Ignore blocks marked as "Resolvido" or "Fixed".
    - identifying distinct issues (look for bullet points, numbered lists, or clear paragraph breaks).

3.  **Update Tracker (`docs/rastreamento/BUG_TRACKER.md`)**
    - For each new issue found:
        - Check if it already exists in the tracker to avoid duplicates.
        - Create a new entry under **🔴 Críticos** (Default priority, agent to adjust if clearly minor).
        - Format: 
          ```markdown
          ### [Short Title] (DD/MM)
          - **Descrição**: [Extracted Text]
          - **Origem**: [Filename]
          - **Status**: 🔲 Aberto
          - **Ação**: [Detailed Technical Plan]
            - *Must include*: Suspected file paths, specific function names (if known), and a concrete debug strategy (e.g., "Add log at line X", "Check network tab for 404 response body").
            - *Avoid generic phrases* like "Fix the bug" or "Investigate". Be specific.
          ```

4.  **Confirm & Clean**
    - Notify the user of how many bugs were imported.
    - (Optional) Append a note to the source file: `[SYNCED]` to prevent re-reading in future (or trust the agent's deduplication logic).
