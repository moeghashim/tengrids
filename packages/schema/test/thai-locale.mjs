import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSync } from "esbuild";

const schemaRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outfile = join(schemaRoot, "test", ".thai-locale-bundle.mjs");

try {
    buildSync({
        absWorkingDir: schemaRoot,
        stdin: {
            contents: `
import { GridCellKind } from "tengrids";
import { matchesClause } from "./src/filter-spec.ts";
import { evaluateGridFilters, matchesEvaluatorClause } from "./src/filters/evaluate.ts";

export function run() {
    const cell = { kind: GridCellKind.Text, data: "a-b", displayData: "a-b", allowOverlay: false };
    const field = { key: "x", title: "X", kind: "text" };
    const clauses = [
        { column: "x", op: "eq", value: "ab" },
        { column: "x", op: "neq", value: "ab" },
        { column: "x", op: "in", value: ["ab"] },
    ];
    const rows = [];
    for (const clause of clauses) {
        const legacy = matchesClause(cell, clause);
        const evaluator = matchesEvaluatorClause(cell, clause, field);
        rows.push({ op: clause.op, legacy, evaluator, agree: legacy === evaluator });
    }
    const cols = [{ id: "x", title: "X", width: 1 }];
    const names = ["a-b", "ab", "c"];
    const getCell = ([, row]) => {
        const s = names[row];
        return { kind: GridCellKind.Text, data: s, displayData: s, allowOverlay: false };
    };
    const spec = { clauses: [{ column: "x", op: "eq", value: "ab" }] };
    const mapping = evaluateGridFilters(spec, [field], cols, 3, getCell, 3).mapping;
    const expected = names
        .map((s, i) =>
            matchesClause(
                { kind: GridCellKind.Text, data: s, displayData: s, allowOverlay: false },
                spec.clauses[0]
            )
                ? i
                : -1
        )
        .filter(i => i >= 0);
    rows.push({
        op: "mapping",
        legacy: expected,
        evaluator: [...mapping],
        agree: JSON.stringify(expected) === JSON.stringify([...mapping]),
    });
    return { locale: Intl.Collator().resolvedOptions().locale, rows };
}
`,
            resolveDir: schemaRoot,
            sourcefile: "thai-locale-entry.ts",
            loader: "ts",
        },
        bundle: true,
        platform: "node",
        format: "esm",
        outfile,
        external: ["tengrids"],
    });
    const mod = await import(pathToFileURL(outfile).href);
    process.stdout.write(JSON.stringify(mod.run()));
} finally {
    rmSync(outfile, { force: true });
}
