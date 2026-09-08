# /execute-pr

Purpose: implement one PRD milestone on its own branch so that two reviewers can approve it without follow-up questions.

1. Run `/pickup` first. Identify the milestone (PR1–PR4 in the PRD §9.1), its branch, and the acceptance criteria it owns.
2. Start with the smallest end-to-end slice (package skeleton, one factory, one test, wiring into `scripts/cli.mjs` and the root scripts) and make it build and test green before widening.
3. Implement to the acceptance criteria. Every criterion gets a test or a documented manual check. Follow `AGENTS.md`: no core changes without justification, React 16–19 rule (no `useId`, `useSyncExternalStore`, `createRoot`), Prettier 4 spaces / 120 columns / double quotes, strict TypeScript, no `any` in public types, no import cycles.
4. Run and keep the real output of: `npm run build`, `npm test`, `npm run test-cells`, `npm run test-source`, `npm run test-ai`, and the new package's suite.
5. Append to `progress.md` with `node scripts/progress-log.mjs append ...` as you go; do not edit earlier dated sections.
6. Commit in logical units as `Moe Ghashim <mohanadgh@gmail.com>` with `Co-Authored-By: <your model name> <email>`.
7. Write the PR description with this template, then stop and report:

```
## What
## Why (link the PRD section)
## Acceptance criteria — status
- [ ] A1 … (how verified)
## Evidence
<pasted command output>
## Risks / follow-ups
## Out of scope (explicitly)
```

8. If a requirement is ambiguous, state the interpretation you took in the PR description under "Risks / follow-ups" instead of guessing silently. If the milestone is too large (> ~2,500 changed lines excluding lockfiles, snapshots, bundled docs), propose a split in the description before opening the second half.
9. When a reviewer posts numbered findings, address each with a commit reference or a one-line reason for disagreement. Never resolve a reviewer's thread yourself.
