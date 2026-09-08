# /review-pr (reviewer 1)

Purpose: the first review of a milestone PR. Post one review with numbered findings and a verdict.

Read the PRD section the PR implements, then the diff. Checklist (PRD §9.3):

1. API matches the PRD: names, shapes, defaults. Call out every deviation and say whether it should be fixed or justified.
2. Correctness: coercion edge cases, facet counting that excludes the field's own clause, codec escaping, `getOriginalIndex` chaining, store subscription leaks, index space (`rowMarkerOffset`) when core is touched.
3. Tests actually exercise the criteria: no tautologies, no skipped tests, and the counts required by the PRD (A6, B7, C6) are met.
4. Performance caps are real: `maxRows`, memoization, no O(rows × fields) work on every render.
5. Types: inference works at the call site; no `any` leaks into public signatures.

Out of scope for reviewer 1 (reviewer 2 owns them): repo conventions, docs completeness, security.

Output format:

```
## Review by <model name>
### Findings
1. [must-fix|should-fix|nit] <file:line> — <what is wrong> — <what to do>
...
### Verdict
approve | request changes
```
