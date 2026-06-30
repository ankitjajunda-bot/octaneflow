# OctaneFlow Project - AI Agent Guardrails

You are assisting the owner of a fuel station in building an offline-first vanilla Javascript application. 
Because the application is highly stateful and relies on direct DOM manipulation and `localStorage`, tiny mistakes (like undefined variables or race conditions) will cause catastrophic data loss for the user's business.

You MUST follow these strict rules on every interaction.

## Rule 1: No Undefined Variables
Before modifying or inserting any code, you MUST physically verify that every variable you reference is declared in the local scope, or explicitly passed as a function argument, or explicitly declared as a global variable elsewhere in the codebase.
If you are unsure, use the `grep_search` tool to find the variable definition before writing the code.

## Rule 2: Synchronous Local Storage Safety
Do not introduce `await` inside critical `localStorage` loops unless absolutely necessary.
Always merge `cloudData` safely. Never overwrite local properties implicitly.

## Rule 3: Single Source of Truth
Never allow employee devices to overwrite the master `app_state`. `app_state` (Settings, Users, Prices) is strictly Owner-Authoritative.
If modifying `sync.js`, ensure `isOwner` checks are perfectly preserved.

## Rule 4: HTML Hardcoding
If you add a dynamic feature to JS, verify that the corresponding HTML elements exist in `index.html` (e.g. `document.getElementById`).

## Rule 5: Version Bumping
When modifying Javascript files, ALWAYS bump the `CACHE_NAME` in `service-worker.js` and the `?v=` query parameters in `index.html` to force cache busting on employee mobile devices. Failure to do so will result in employees running outdated code.

**By reading this file, you acknowledge these constraints and commit to zero-defect engineering.**
