# Agent workflow

How humans and coding agents work on tengrids together. Borrowed from [moeghashim/PI-Starter](https://github.com/moeghashim/PI-Starter) (`docs/agent-workflow.md`, `.codex/prompts/`, the append-only `progress.md`) and adapted to this repo's conventions. The roles for the current PRD are in `docs/prd/schema-filters-agent-access.md` §9: **executor** (Grok 4.6 via `pi`) → **reviewer 1** (GPT Astra via `codex review`) → **reviewer 2 and sign-off** (Claude Fable 5.1) → **Moe** merges and publishes.

Prompt files that drive each step live in `agent/prompts/`:

| Prompt                        | Who runs it | Purpose                                                                     |
| ----------------------------- | ----------- | --------------------------------------------------------------------------- |
| `agent/prompts/pickup.md`     | any agent   | Rehydrate context before touching code                                      |
| `agent/prompts/execute-pr.md` | executor    | Implement one PRD milestone on its branch, with the PR description template |
| `agent/prompts/review-pr.md`  | reviewer 1  | Numbered findings + verdict against the PRD reviewer-1 checklist            |
| `agent/prompts/signoff-pr.md` | reviewer 2  | Conventions, security, docs, CI; emits the sign-off block                   |
| `agent/prompts/handoff.md`    | any agent   | Package state so the next agent or person continues immediately             |

## Start (pickup)

1. Read `AGENTS.md`, the PRD you are executing, and the READMEs of the packages you will touch.
2. Read the last two dated sections of `progress.md`; they hold decisions and gotchas newer than the docs.
3. Run `git status -sb` and confirm you are on the milestone branch, never on `main`.
4. List the next 2–3 concrete actions before editing.

## Execute

1. One milestone per branch (`feat/<name>`), one logical change per commit, no force-pushes to a branch under review.
2. Every acceptance criterion in the PRD gets a test or a documented manual check; paste real command output in the PR.
3. Append to `progress.md` as work happens:
    ```
    node scripts/progress-log.mjs append --title "PR1 feat/schema" --status "IN PROGRESS" \
        --line "createSchema + col.* factories with InferRow" --line "..." --actor "Grok 4.6 via pi"
    ```
    Today's section may be edited (tick checklists, add results). Earlier days are frozen; `npm run progress:check` enforces it and CI runs it against `origin/main`.
4. Commit as `Moe Ghashim <mohanadgh@gmail.com>` with a `Co-Authored-By:` trailer naming the agent (e.g. `Co-Authored-By: Grok 4.6 <grok@x.ai>`).

## Validate

From the repo root: `npm run build` (tsc ESM+CJS + lint + cycle check for every workspace), `npm test`, `npm run test-cells`, `npm run test-source`, `npm run test-ai`, plus the suites of any new package, and `npm run visual:docker` after a rendering change. The React 18/19/latest matrix runs in CI.

## Review and sign-off

- Reviewer 1 posts one review with numbered findings and `approve` / `request changes` (checklist in the PRD §9.3 and `agent/prompts/review-pr.md`).
- The executor addresses every numbered finding with a commit reference or a one-line reason for disagreement, and never resolves a reviewer's thread.
- Reviewer 2 reviews after reviewer 1's approve, re-runs the suites locally, checks conventions, security, docs, `progress.md`, and CI, then posts the sign-off block from the PRD §9.4. That block is the merge gate.
- Reviewers comment; they do not push to the executor's branch.
- Disagreements escalate to Moe with both positions stated in two sentences each.

## Handoff

State scope, what is done, `git status -sb`, the commands run with outcomes, blockers, and ordered next steps with exact commands. Append it to `progress.md` so the next session starts from it.
