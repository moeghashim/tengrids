# /handoff

Purpose: package the current state so another agent or person can continue immediately.

Include, and append the same to `progress.md` via `node scripts/progress-log.mjs append`:

1. Scope, completed work, remaining tasks (tie each to a PRD criterion where possible).
2. `git status -sb` summary and branch name; last commit sha.
3. Commands run with outcomes (`npm run build`, `npm test`, package suites, `npm run visual:docker`).
4. Blockers, risks, and required follow-up.
5. Ordered next steps with exact commands.
