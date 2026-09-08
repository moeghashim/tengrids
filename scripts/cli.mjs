#!/usr/bin/env node
// tengrids developer CLI — replaces the former bash build/version/test-matrix
// scripts so the repo needs only Node (no bash 4, no jq).
//
//   node scripts/cli.mjs build <core|cells|source>... | --all
//   node scripts/cli.mjs version [newVersion]
//   node scripts/cli.mjs test [--react 18|19|latest] [--no-restore]
//   node scripts/cli.mjs bootstrap
//
// Every npm script that used to call a .sh file now delegates here, so CI
// and the documented `npm run ...` commands are unchanged.

import { spawn } from "node:child_process";
import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = ["core", "cells", "source", "schema", "ai", "mcp"];
const CORE_PKG = "tengrids";
const BANNER = {
    core: "Glide Data Grid",
    cells: "Glide Data Grid Cells",
    source: "Glide Data Grid Source",
    schema: "tengrids Schema",
    ai: "tengrids AI",
    mcp: "tengrids MCP",
};
const cyan = s => `[0;36m${s}[0m`;

// ---------------------------------------------------------------- helpers

function bin(name) {
    const p = join(REPO_ROOT, "node_modules", ".bin", process.platform === "win32" ? `${name}.cmd` : name);
    if (!existsSync(p)) throw new Error(`${name} not found at ${p} — run npm install first`);
    return p;
}

function run(cmd, args, { cwd = REPO_ROOT, quietStdout = false } = {}) {
    return new Promise((res, rej) => {
        const child = spawn(cmd, args, {
            cwd,
            stdio: ["inherit", quietStdout ? "ignore" : "inherit", "inherit"],
            shell: process.platform === "win32",
        });
        child.on("error", rej);
        child.on("exit", code =>
            code === 0 ? res() : rej(new Error(`${cmd} ${args.slice(0, 3).join(" ")}… exited with ${code}`))
        );
    });
}

function walk(dir, ext, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) walk(p, ext, out);
        else if (entry.name.endsWith(ext)) out.push(p);
    }
    return out;
}

function replaceDir(from, to) {
    rmSync(to, { recursive: true, force: true });
    renameSync(from, to);
}

function readJson(p) {
    return JSON.parse(readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
    writeFileSync(p, JSON.stringify(obj, null, 4) + "\n");
}

// ------------------------------------------------------------------ build

// Mirrors the old config/build-util.sh `compile`: tsc into a temp dir, run
// wyw-in-js (linaria) over the emitted JS to extract CSS, strip the CSS
// import side effects, then atomically swap the temp dir into place.
async function compile(pkgDir, kind) {
    const isEsm = kind === "esm";
    const tmp = `dist/${kind}-tmp`;
    const dtsTmp = isEsm ? "dist/dts-tmp" : `dist/dts-${kind}-tmp`;

    await run(bin("tsc"), ["-p", `tsconfig.${kind}.json`, "--outdir", `./${tmp}`, "--declarationDir", `./${dtsTmp}`], {
        cwd: pkgDir,
    });

    const jsFiles = walk(join(pkgDir, tmp), ".js").map(f => relative(pkgDir, f).split(sep).join("/"));
    await run(
        bin("wyw-in-js"),
        [
            "-r",
            `${tmp}/`,
            "-m",
            "esnext",
            "-o",
            `${tmp}/`,
            ...jsFiles,
            "-t",
            "-i",
            tmp,
            "-c",
            "../../config/linaria.json",
        ],
        { cwd: pkgDir, quietStdout: true }
    );

    for (const f of walk(join(pkgDir, tmp), ".js")) {
        const src = readFileSync(f, "utf8");
        const stripped = src
            .split("\n")
            .filter(line => !/import ".*\.css";/.test(line) && !/require\(".*\.css"\);/.test(line))
            .join("\n");
        if (stripped !== src) writeFileSync(f, stripped);
    }

    replaceDir(join(pkgDir, tmp), join(pkgDir, "dist", kind));
    if (isEsm) replaceDir(join(pkgDir, dtsTmp), join(pkgDir, "dist", "dts"));
    else rmSync(join(pkgDir, dtsTmp), { recursive: true, force: true });
    rmSync(join(pkgDir, "dist", `tsconfig.${kind}.tsbuildinfo`), { force: true });
}

function generateIndexCss(pkgDir) {
    const esm = join(pkgDir, "dist", "esm");
    const lines = ["/* Auto-generated file */"];
    for (const f of walk(esm, ".css")) lines.push(`@import "./esm/${relative(esm, f).split(sep).join("/")}";`);
    writeFileSync(join(pkgDir, "dist", "index.css"), lines.join("\n") + "\n");
}

async function buildPackage(name) {
    if (!PACKAGES.includes(name)) throw new Error(`unknown package "${name}" (expected one of ${PACKAGES.join(", ")})`);
    const pkgDir = join(REPO_ROOT, "packages", name);
    console.log(cyan(`🏗️  Building ${BANNER[name]} 🏗️`));
    if (name === "mcp") {
        // Node CLI: ESM-only plain tsc to dist/, no linaria. Bundle docs first so dist/cli.js can load them.
        await docsBundle();
        mkdirSync(join(pkgDir, "dist"), { recursive: true });
        await run(bin("tsc"), ["-p", "tsconfig.build.json"], { cwd: pkgDir });
        console.log(cyan(`🎉 ${BANNER[name]} build complete 🎉`));
        return;
    }
    mkdirSync(join(pkgDir, "dist"), { recursive: true });
    await Promise.all([compile(pkgDir, "esm"), compile(pkgDir, "cjs")]);
    generateIndexCss(pkgDir);
    console.log(cyan(`🎉 ${BANNER[name]} build complete 🎉`));
}

async function build(args) {
    const all = args.includes("--all");
    const names = all ? PACKAGES : args.filter(a => !a.startsWith("-"));
    if (names.length === 0) throw new Error("build: specify packages (core, cells, source, schema, ai, mcp) or --all");
    // cells, source, schema, and ai compile against core's dist, so core goes first.
    // ai depends on schema's dist, so schema goes before the remaining packages.
    if (names.includes("core")) await buildPackage("core");
    const rest = names.filter(n => n !== "core");
    if (rest.includes("schema")) await buildPackage("schema");
    await Promise.all(rest.filter(n => n !== "schema").map(buildPackage));
}

// ---------------------------------------------------------------- version

// Mirrors the old update-version.sh: propagate a version to the root and
// every workspace package, and pin every workspace-to-workspace dependency.
function version(args) {
    const rootPkgPath = join(REPO_ROOT, "package.json");
    const root = readJson(rootPkgPath);
    const next = (args.find(a => !a.startsWith("-")) ?? root.version).replace(/^"|"$/g, "");

    root.version = next;
    writeJson(rootPkgPath, root);
    console.log(`package.json → ${next}`);

    const workspaceNames = new Set(
        PACKAGES.map(name => readJson(join(REPO_ROOT, "packages", name, "package.json")).name)
    );

    for (const name of PACKAGES) {
        const p = join(REPO_ROOT, "packages", name, "package.json");
        const pkg = readJson(p);
        pkg.version = next;
        for (const field of ["dependencies", "devDependencies", "peerDependencies"]) {
            const bag = pkg[field];
            if (bag === undefined) continue;
            for (const dep of Object.keys(bag)) {
                if (workspaceNames.has(dep)) bag[dep] = next;
            }
        }
        writeJson(p, pkg);
        console.log(`packages/${name}/package.json → ${next}`);
    }
}

// ------------------------------------------------------------------- test

// Mirrors the old setup-react-*.sh scripts, with one fix: they rewrote
// package.json/package-lock.json permanently. Outside CI the originals are
// restored afterwards (pass --no-restore to keep the swapped React).
async function test(args) {
    const reactIdx = args.indexOf("--react");
    const react = reactIdx === -1 ? undefined : args[reactIdx + 1];
    const passthrough = args.filter((a, i) => a !== "--react" && i !== reactIdx + 1 && a !== "--no-restore");
    const restore = !args.includes("--no-restore") && !process.env.CI;
    const coreDir = join(REPO_ROOT, "packages", "core");

    if (react === undefined) {
        await run(bin("vitest"), ["run", ...passthrough], { cwd: coreDir });
        return;
    }
    if (!/^(\d+|latest)$/.test(react)) throw new Error(`--react expects a major version or "latest", got "${react}"`);

    const snapshot = ["package.json", "package-lock.json"].map(f => [
        join(REPO_ROOT, f),
        readFileSync(join(REPO_ROOT, f), "utf8"),
    ]);
    const userEvent = react === "18" ? "@testing-library/user-event@14.5.1" : "@testing-library/user-event@latest";
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    try {
        await run(npm, [
            "i",
            "-D",
            `react@${react}`,
            `react-dom@${react}`,
            "@testing-library/react@latest",
            userEvent,
            "@testing-library/dom",
        ]);
        await run(bin("vitest"), ["run", ...passthrough], { cwd: coreDir });
    } finally {
        if (restore) {
            for (const [p, content] of snapshot) writeFileSync(p, content);
            console.log("restoring the original React version (npm install)…");
            await run(npm, ["install", "--no-audit", "--no-fund"]);
        }
    }
}

// -------------------------------------------------------------- bootstrap

// Mirrors test-projects/bootstrap-projects.sh: install each downstream
// consumer project and point its copy of core at the workspace package.
async function bootstrap() {
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    for (const name of ["next-gdg", "cra5-gdg"]) {
        const dir = join(REPO_ROOT, "test-projects", name);
        await run(npm, ["ci"], { cwd: dir });
        const link = join(dir, "node_modules", ...CORE_PKG.split("/"));
        rmSync(link, { recursive: true, force: true });
        symlinkSync(
            relative(dirname(link), join(REPO_ROOT, "packages", "core")),
            link,
            process.platform === "win32" ? "junction" : "dir"
        );
        console.log(`${name}: linked ${CORE_PKG} → packages/core`);
        const pkg = readJson(join(dir, "package.json"));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (typeof deps["tengrids-schema"] === "string" && deps["tengrids-schema"].startsWith("file:")) {
            const schemaLink = join(dir, "node_modules", "tengrids-schema");
            rmSync(schemaLink, { recursive: true, force: true });
            symlinkSync(
                relative(dirname(schemaLink), join(REPO_ROOT, "packages", "schema")),
                schemaLink,
                process.platform === "win32" ? "junction" : "dir"
            );
            console.log(`${name}: linked tengrids-schema → packages/schema`);
        }
    }
}

// ------------------------------------------------------------- docs-bundle

function parseHeadings(text) {
    const headings = [];
    let heading = "";
    let buf = [];
    const flush = () => {
        const body = buf.join("\n").replace(/\s+$/u, "");
        if (heading.length > 0 || body.length > 0) headings.push({ heading, text: body });
        buf = [];
    };
    for (const line of text.split(/\n/u)) {
        const m = /^(#{1,6})\s+(.*)$/u.exec(line);
        if (m) {
            flush();
            heading = m[2].trim();
        } else {
            buf.push(line);
        }
    }
    flush();
    return headings;
}

function firstTitle(text, fallback) {
    const m = /^#\s+(.+)$/mu.exec(text);
    return m ? m[1].trim() : fallback;
}

function storyTitle(src, fallback) {
    const m = /title:\s*["'`]([^"'`]+)["'`]/u.exec(src);
    return m ? m[1] : fallback;
}

function walkStories(dir, out = []) {
    if (!existsSync(dir)) return out;
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "coverage") continue;
        const p = join(dir, entry.name);
        if (entry.isDirectory()) walkStories(p, out);
        else if (entry.name.endsWith(".stories.tsx")) out.push(p);
    }
    return out;
}

function storyId(rel) {
    return (
        "story-" +
        rel
            .replace(/\.stories\.tsx$/u, "")
            .replace(/^packages\//u, "")
            .replace(/\//gu, "-")
    );
}

function docsBundle() {
    const outDir = join(REPO_ROOT, "packages", "mcp", "docs");
    mkdirSync(outDir, { recursive: true });

    const docs = [];
    const push = (id, fallbackTitle, rel, text, { story = false } = {}) => {
        docs.push({
            id,
            title: story ? storyTitle(text, fallbackTitle) : firstTitle(text, fallbackTitle),
            path: rel,
            headings: story ? [{ heading: storyTitle(text, fallbackTitle), text }] : parseHeadings(text),
            text,
        });
    };

    const addFile = (rel, id, fallbackTitle) => {
        const abs = join(REPO_ROOT, rel);
        if (!existsSync(abs)) {
            console.warn(`docs-bundle: skip missing ${rel}`);
            return;
        }
        push(id, fallbackTitle, rel, readFileSync(abs, "utf8"));
    };

    addFile("packages/core/API.md", "api", "API reference");
    addFile("AGENTS.md", "agents", "AGENTS.md");
    addFile("llms.txt", "llms", "llms.txt");
    for (const name of PACKAGES) {
        addFile(`packages/${name}/README.md`, `readme-${name}`, `${name} README`);
    }

    const llmsParts = [];
    for (const rel of [
        "README.md",
        "packages/core/API.md",
        "AGENTS.md",
        "packages/schema/README.md",
        "packages/mcp/README.md",
    ]) {
        const abs = join(REPO_ROOT, rel);
        if (existsSync(abs)) llmsParts.push(readFileSync(abs, "utf8"));
    }
    const llmsFull = llmsParts.join("\n\n---\n\n");
    writeFileSync(join(outDir, "llms-full.txt"), llmsFull);
    push("llms-full", "llms-full.txt", "llms-full.txt", llmsFull);

    for (const name of PACKAGES) {
        for (const abs of walkStories(join(REPO_ROOT, "packages", name))) {
            const rel = relative(REPO_ROOT, abs).split(sep).join("/");
            const src = readFileSync(abs, "utf8");
            push(storyId(rel), storyId(rel), rel, src, { story: true });
        }
    }

    const version = readJson(join(REPO_ROOT, "package.json")).version;
    writeFileSync(join(outDir, "index.json"), JSON.stringify({ version, docs }));
    console.log(`docs-bundle: ${docs.length} docs → packages/mcp/docs/`);
}

// ------------------------------------------------------------------- main

const HELP = `tengrids developer CLI

  build <core|cells|source|schema|ai|mcp>... | --all   compile ESM + CJS, extract linaria CSS, emit dist/
                                          mcp is ESM-only tsc (docs-bundle first, no linaria)
  version [newVersion]                    set the version across all workspace packages
  test [--react 18|19|latest] [--no-restore] [vitest args]
                                          run the core suite, optionally against another React
  bootstrap                               install the downstream consumer test projects
  docs-bundle                             generate packages/mcp/docs JSON + llms-full.txt
`;

const [command, ...rest] = process.argv.slice(2);
const commands = { build, version, test, bootstrap, "docs-bundle": docsBundle };
try {
    if (command === undefined || command === "help" || command === "--help") {
        console.log(HELP);
    } else if (commands[command] === undefined) {
        throw new Error(`unknown command "${command}"\n\n${HELP}`);
    } else {
        await commands[command](rest);
    }
} catch (e) {
    console.error(`[31m✗ ${e.message}[0m`);
    process.exit(1);
}
