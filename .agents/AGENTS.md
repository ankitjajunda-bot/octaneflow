# Workspace Quality Guidelines

To maintain production stability and avoid regressions on client devices:

1. **Syntax Verification Check**:
   - Before committing or pushing any JavaScript changes, run `node -c app.js` in the terminal to verify the code compiles without syntax errors (e.g., mismatched brackets, braces, or invalid syntax).

2. **Defensive Initialization & Try-Catch Blocks**:
   - Never assume configuration variables (like database URL, keys, or Gist IDs) are valid or conform to format requirements on boot.
   - Always wrap client initialization (like `supabase.createClient`), JSON parsing (`JSON.parse`), and local storage reading inside try-catch blocks with defensive checks (e.g., checking if URLs start with `https://`).

3. **PWA Cache Invalidation**:
   - Whenever `app.js` or `index.html` is modified, you must increment the version code in the service worker (`CACHE_NAME` inside `service-worker.js`) to notify and update operator browser tabs safely.
