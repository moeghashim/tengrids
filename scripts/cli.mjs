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
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = ["core", "cells", "source", "ai"];
const CORE_PKG = "tengrids";
const BANNER = { core: "Glide Data Grid", cells: "Glide Data Grid Cells", source: "Glide Data Grid Source", ai: "tengrids AI" };
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
        child.on("exit", code => (code === 0 ? res() : rej(new Error(`${cmd} ${args.slice(0, 3).join(" ")}… exited with ${code}`))));
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

    await run(bin("tsc"), ["-p", `tsconfig.${kind}.json`, "--outdir", `./${tmp}`, "--declarationDir", `./${dtsTmp}`], { cwd: pkgDir });

    const jsFiles = walk(join(pkgDir, tmp), ".js").map(f => relative(pkgDir, f).split(sep).join("/"));
    await run(
        bin("wyw-in-js"),
        ["-r", `${tmp}/`, "-m", "esnext", "-o", `${tmp}/`, ...jsFiles, "-t", "-i", tmp, "-c", "../../config/linaria.json"],
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
    mkdirSync(join(pkgDir, "dist"), { recursive: true });
    await Promise.all([compile(pkgDir, "esm"), compile(pkgDir, "cjs")]);
    generateIndexCss(pkgDir);
    console.log(cyan(`🎉 ${BANNER[name]} build complete 🎉`));
}

async function build(args) {
    const all = args.includes("--all");
    const names = all ? PACKAGES : args.filter(a => !a.startsWith("-"));
    if (names.length === 0) throw new Error("build: specify packages (core, cells, source) or --all");
    // cells, source, and ai compile against core's dist, so core goes first.
    if (names.includes("core")) await buildPackage("core");
    await Promise.all(names.filter(n => n !== "core").map(buildPackage));
}

// ---------------------------------------------------------------- version

// Mirrors the old update-version.sh: propagate a version to the root and
// every workspace package, and pin the workspace dependency on core.
function version(args) {
    const rootPkgPath = join(REPO_ROOT, "package.json");
    const root = readJson(rootPkgPath);
    const next = (args.find(a => !a.startsWith("-")) ?? root.version).replace(/^"|"$/g, "");

    root.version = next;
    writeJson(rootPkgPath, root);
    console.log(`package.json → ${next}`);

    for (const name of PACKAGES) {
        const p = join(REPO_ROOT, "packages", name, "package.json");
        const pkg = readJson(p);
        pkg.version = next;
        if (pkg.dependencies?.[CORE_PKG] !== undefined) pkg.dependencies[CORE_PKG] = next;
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

    const snapshot = ["package.json", "package-lock.json"].map(f => [join(REPO_ROOT, f), readFileSync(join(REPO_ROOT, f), "utf8")]);
    const userEvent = react === "18" ? "@testing-library/user-event@14.5.1" : "@testing-library/user-event@latest";
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    try {
        await run(npm, ["i", "-D", `react@${react}`, `react-dom@${react}`, "@testing-library/react@latest", userEvent, "@testing-library/dom"]);
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
        symlinkSync(relative(dirname(link), join(REPO_ROOT, "packages", "core")), link, process.platform === "win32" ? "junction" : "dir");
        console.log(`${name}: linked ${CORE_PKG} → packages/core`);
    }
}

// ------------------------------------------------------------------- main

const HELP = `tengrids developer CLI

  build <core|cells|source>... | --all   compile ESM + CJS, extract linaria CSS, emit dist/
  version [newVersion]                    set the version across all workspace packages
  test [--react 18|19|latest] [--no-restore] [vitest args]
                                          run the core suite, optionally against another React
  bootstrap                               install the downstream consumer test projects
`;

const [command, ...rest] = process.argv.slice(2);
const commands = { build, version, test, bootstrap };
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
