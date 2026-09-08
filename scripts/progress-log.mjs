#!/usr/bin/env node
// Append an entry to progress.md under today's dated section (borrowed from moeghashim/PI-Starter, adapted to
// this repo's format: `## YYYY-MM-DD` sections, `### Title — STATUS` headings, bullet lines).
//
//   node scripts/progress-log.mjs append --title "PR1 feat/schema" [--status "IN PROGRESS"] \
//        --line "first bullet" --line "second bullet" [--actor "Grok 4.6 via pi"] [--date 2026-09-08]
//
// Prior dated sections are frozen (see progress-append-only-check.mjs); today's section may grow or have its
// checklist items ticked.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const PROGRESS_PATH = "progress.md";

function fail(message) {
    console.error(`progress-log: ${message}`);
    process.exit(1);
}

function usage() {
    console.error(
        'Usage: node scripts/progress-log.mjs append --title "<title>" --line "<bullet>" [--line ...] [--status <text>] [--actor <text>] [--date YYYY-MM-DD]'
    );
}

function readGit(command, fallback) {
    try {
        const value = execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
        return value.length > 0 ? value : fallback;
    } catch {
        return fallback;
    }
}

function parseArgs(argv) {
    if (argv[0] !== "append") {
        usage();
        fail("only the 'append' command is supported");
    }
    const options = { title: "", status: "", actor: "", date: "", lines: [] };
    for (let i = 1; i < argv.length; i += 2) {
        const flag = argv[i];
        const value = argv[i + 1];
        if (!flag.startsWith("--") || value === undefined) {
            usage();
            fail(`bad argument: ${flag}`);
        }
        switch (flag) {
            case "--title":
                options.title = value.trim();
                break;
            case "--status":
                options.status = value.trim();
                break;
            case "--actor":
                options.actor = value.trim();
                break;
            case "--date":
                options.date = value.trim();
                break;
            case "--line":
                options.lines.push(value.replace(/\s+/g, " ").trim());
                break;
            default:
                usage();
                fail(`unknown flag: ${flag}`);
        }
    }
    if (options.title.length === 0) fail("--title is required");
    if (options.lines.length === 0) fail("at least one --line is required");
    if (options.date.length > 0 && !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) fail("--date must be YYYY-MM-DD");
    return options;
}

if (!existsSync(PROGRESS_PATH)) fail(`${PROGRESS_PATH} is missing`);

const options = parseArgs(process.argv.slice(2));
const date = options.date || new Date().toISOString().slice(0, 10);
const branch = readGit("git rev-parse --abbrev-ref HEAD", "unknown");
const actor = options.actor || `${readGit("git config user.name", "unknown")}`;

const heading = options.status ? `### ${options.title} — ${options.status}` : `### ${options.title}`;
const entry = [
    heading,
    ...options.lines.map(line => `- ${line}`),
    `- Branch: \`${branch}\` · Actor: ${actor}`,
    "",
].join("\n");

let content = readFileSync(PROGRESS_PATH, "utf8");
if (!content.endsWith("\n")) content += "\n";
const dateHeading = `## ${date}`;
const lastDateMatch = [...content.matchAll(/^## (\d{4}-\d{2}-\d{2})\s*$/gm)].pop();
const todayExists = lastDateMatch !== undefined && lastDateMatch[1] === date;
const block = todayExists ? `\n${entry}` : `\n${dateHeading}\n\n${entry}`;
writeFileSync(PROGRESS_PATH, `${content}${block}`, "utf8");
console.log(`progress-log: appended "${options.title}" under ${dateHeading}`);
