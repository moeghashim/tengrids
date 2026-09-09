#!/usr/bin/env node
// C2: write scaffold({ schema: §5.2, framework: "next" }) into next-gdg and tsc --noEmit.
// Compiles both generated files and the filters/ai option combinations.
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../../..");
const project = join(repo, "test-projects", "next-gdg");
const distIndex = join(here, "..", "dist", "index.js");

if (!existsSync(distIndex)) {
    console.error("c2-compile: packages/mcp/dist missing — run npm run build -w packages/mcp");
    process.exit(1);
}
if (!existsSync(join(project, "node_modules", "typescript"))) {
    console.error("c2-compile: test-projects/next-gdg is not installed — run npm run test-projects");
    process.exit(1);
}

const { EXAMPLE_SCHEMA, scaffold, splitScaffoldFiles } = await import(distIndex);

const combos = [
    { framework: "next" },
    { framework: "next", filters: true },
    { framework: "next", ai: true },
    { framework: "next", filters: true, ai: true },
];

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
                baseUrl: ".",
                paths: {
                    react: ["./node_modules/@types/react/index.d.ts"],
                },
            },
            include: ["next-env.d.ts", "components/ScaffoldGrid.tsx", "pages/scaffold-scratch.tsx"],
        },
        null,
        2
    )
);

const tsc = join(project, "node_modules", "typescript", "bin", "tsc");
let failed = false;

try {
    for (const combo of combos) {
        const snippet = scaffold({ schema: EXAMPLE_SCHEMA, ...combo });
        const files = splitScaffoldFiles(snippet);
        const written = [];
        for (const file of files) {
            const abs = join(project, file.path);
            mkdirSync(dirname(abs), { recursive: true });
            writeFileSync(abs, file.content);
            written.push(abs);
        }
        const result = spawnSync(process.execPath, [tsc, "--noEmit", "-p", "tsconfig.c2.json"], {
            cwd: project,
            encoding: "utf8",
        });
        const label = JSON.stringify(combo);
        if (result.status !== 0) {
            console.error(`c2-compile: tsc failed for ${label}`);
            console.error(result.stdout);
            console.error(result.stderr);
            failed = true;
        } else {
            console.log(`c2-compile: tsc --noEmit ok ${label}`);
        }
        for (const abs of written) rmSync(abs, { force: true });
        if (failed) break;
    }
} finally {
    rmSync(tsconfigPath, { force: true });
}

if (failed) process.exit(1);
console.log("c2-compile: all combinations ok");
