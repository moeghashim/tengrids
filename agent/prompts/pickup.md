# /pickup

Purpose: rehydrate context before doing implementation or review work in tengrids.

1. Read `AGENTS.md` (commands, architecture map, the nine gotchas, conventions).
2. Read the PRD for the milestone you are working on under `docs/prd/`, in full.
3. Read the last two dated sections of `progress.md` and summarize the decisions that apply to your task.
4. Read the README of every package you will touch (`packages/*/README.md`).
5. Run `git status -sb`; confirm the branch. Never work on `main`.
6. Confirm the toolchain: `node -v` (20.10+), `npm run build -w packages/core` has produced `packages/core/dist` (the other packages' tests import it).
7. List the next 2–3 concrete actions before editing.
