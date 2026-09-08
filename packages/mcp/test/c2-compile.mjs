#!/usr/bin/env node
// C2: write scaffold({ schema: §5.2, framework: "next" }) into next-gdg and tsc --noEmit.
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../../..");
const project = join(repo, "test-projects", "next-gdg");
const distScaffold = join(here, "..", "dist", "scaffold.js");

if (!existsSync(distScaffold)) {
    console.error("c2-compile: packages/mcp/dist missing — run npm run build -w packages/mcp");
    process.exit(1);
}
if (!existsSync(join(project, "node_modules", "typescript"))) {
    console.error("c2-compile: test-projects/next-gdg is not installed — run npm run test-projects");
    process.exit(1);
}

const { EXAMPLE_SCHEMA, scaffold, splitScaffoldFiles } = await import(distScaffold);
const snippet = scaffold({ schema: EXAMPLE_SCHEMA, framework: "next" });
const files = splitScaffoldFiles(snippet);
const written = [];

for (const file of files) {
    const abs = join(project, file.path);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, file.content);
    written.push(abs);
}

// Isolate @types so the monorepo's newer @types/lodash is not parsed by TS 4.6.
const tsconfigPath = join(project, "tsconfig.c2.json");
writeFileSync(
    tsconfigPath,
    JSON.stringify(
        {
            extends: "./tsconfig.json",
            compilerOptions: {
                skipLibCheck: true,
                typeRoots: ["./node_modules/@types"],
                types: ["node", "react"],
            },
            include: ["next-env.d.ts", "components/ScaffoldGrid.tsx"],
        },
        null,
        2
    )
);
written.push(tsconfigPath);

const tsc = join(project, "node_modules", "typescript", "bin", "tsc");
const result = spawnSync(process.execPath, [tsc, "--noEmit", "-p", "tsconfig.c2.json"], {
    cwd: project,
    encoding: "utf8",
});
for (const abs of written) rmSync(abs, { force: true });

if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    console.error("c2-compile: tsc --noEmit failed");
    process.exit(result.status === null ? 1 : result.status);
}
console.log("c2-compile: tsc --noEmit ok");
