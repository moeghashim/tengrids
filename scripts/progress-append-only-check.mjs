#!/usr/bin/env node
// Guard for progress.md (borrowed from moeghashim/PI-Starter, relaxed for this repo's format): everything before
// the most recent `## YYYY-MM-DD` section in the base version is frozen. Today's section may be edited (checklist
// items ticked, results appended); older days may not be rewritten.
//
//   node scripts/progress-append-only-check.mjs            # staged progress.md vs HEAD (pre-commit)
//   node scripts/progress-append-only-check.mjs --base origin/main   # working tree vs a ref (CI)

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PROGRESS_PATH = "progress.md";

function fail(message) {
    console.error(`progress-append-only-check: ${message}`);
    process.exit(1);
}

function read(command, args) {
    return execFileSync(command, args, { encoding: "utf8" });
}

function exists(command, args) {
    return spawnSync(command, args, { stdio: "ignore" }).status === 0;
}

function frozenPrefix(content) {
    const headings = [...content.matchAll(/^## \d{4}-\d{2}-\d{2}\s*$/gm)];
    if (headings.length === 0) return content;
    return content.slice(0, headings[headings.length - 1].index);
}

const baseIndex = process.argv.indexOf("--base");
const baseRef = baseIndex === -1 ? "HEAD" : process.argv[baseIndex + 1];
if (baseRef === undefined) fail("--base needs a ref");

let candidate;
if (baseIndex === -1) {
    const staged = read("git", ["diff", "--cached", "--name-only", "--", PROGRESS_PATH]).trim();
    if (staged.length === 0) process.exit(0);
    candidate = read("git", ["show", `:${PROGRESS_PATH}`]);
} else {
    candidate = readFileSync(PROGRESS_PATH, "utf8");
}

if (!exists("git", ["cat-file", "-e", `${baseRef}:${PROGRESS_PATH}`])) process.exit(0);
const base = read("git", ["show", `${baseRef}:${PROGRESS_PATH}`]);
const frozen = frozenPrefix(base);

if (!candidate.startsWith(frozen)) {
    fail(
        `${PROGRESS_PATH} is append-only for past days. Only the most recent dated section in ${baseRef} may change; add new work under today's date instead of editing earlier entries.`
    );
}
console.log(`progress-append-only-check: ok (${frozen.split("\n").length} frozen lines vs ${baseRef})`);
