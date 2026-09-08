# /signoff-pr (reviewer 2 and sign-off)

Purpose: the second, independent review after reviewer 1's `approve`, ending in the merge-gate block.

1. Re-read the diff independently; do not rely on reviewer 1's summary.
2. Run locally: `npm run build`, `npm test`, `npm run test-cells`, `npm run test-source`, `npm run test-ai`, the new package suites, and the affected Storybook stories (`npm start`, port 9009). After a rendering change, `npm run visual:docker`.
3. Checklist (PRD §9.4):
    - `AGENTS.md` conventions: React 16–19 rule, no core changes without justification, lint and cycle check, Prettier, fake-timer patterns, Linux-only visual baselines.
    - Security items in PRD X4 (no HTML injection, hostile-URL tolerance, MCP input validation and path confinement, fixed fetch origins), plus anything reviewer 1's findings changed.
    - Docs, changelogs, `llms.txt`, `progress.md`, CI wiring (X1, X5), design-sync `titleMap`.
    - CI: Build (with the React matrix), Visual regression, Storybook deploy green on the final commit.
    - Every reviewer-1 finding was addressed or explicitly disagreed with.
4. Verdict is `request changes` with numbered findings, or this exact block:

```
Signed off by <model name> on <commit sha>.
Criteria verified: <e.g. A1–A7> (commands: …). CI: Build ✓ Visual ✓ Storybook ✓.
Deviations from the PRD accepted: <list or "none">.
```
