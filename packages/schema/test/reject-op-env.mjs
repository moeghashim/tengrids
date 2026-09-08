import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

const srcPath = join(dirname(fileURLToPath(import.meta.url)), "../src/filters/use-grid-filters.ts");
const src = readFileSync(srcPath, "utf8");
const start = src.indexOf("function rejectOp");
const end = src.indexOf("function asClauseList", start);
if (start < 0 || end <= start) {
    process.stdout.write(JSON.stringify({ error: "rejectOp not found" }));
    process.exit(1);
}
const rejectOpSrc = src.slice(start, end).trim();

function run(nodeEnv) {
    const wrapped = `${rejectOpSrc}\nrejectOp("cost", "contains", "number");`;
    const { code } = transformSync(wrapped, {
        loader: "ts",
        format: "iife",
        define: { "process.env.NODE_ENV": JSON.stringify(nodeEnv) },
    });
    new Function(code)();
}

const g = globalThis;
const saved = g.process;
delete g.process;
const result = { dev: "ok", prod: "ok" };
try {
    try {
        run("development");
    } catch (e) {
        result.dev = e instanceof Error ? e.name : "threw";
    }
    try {
        run("production");
    } catch (e) {
        result.prod = e instanceof Error ? e.name : "threw";
    }
} finally {
    g.process = saved;
}
process.stdout.write(JSON.stringify(result));
