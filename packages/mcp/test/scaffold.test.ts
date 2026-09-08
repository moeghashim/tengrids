import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
    EXAMPLE_SCHEMA,
    ColumnInputSchema,
    SchemaInputSchema,
    printIdent,
    remapFilteredEdit,
    scaffold,
    splitScaffoldFiles,
} from "../src/scaffold.js";

describe("scaffold snapshots", () => {
    it("react default", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA })).toMatchSnapshot();
    });

    it("react + filters", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, filters: true })).toMatchSnapshot();
    });

    it("react + ai", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, ai: true })).toMatchSnapshot();
    });

    it("react + filters + ai", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, filters: true, ai: true })).toMatchSnapshot();
    });

    it("next default", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, framework: "next" })).toMatchSnapshot();
    });

    it("next + filters", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, filters: true, framework: "next" })).toMatchSnapshot();
    });

    it("next + ai", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, ai: true, framework: "next" })).toMatchSnapshot();
    });

    it("next + filters + ai", () => {
        expect(scaffold({ schema: EXAMPLE_SCHEMA, filters: true, ai: true, framework: "next" })).toMatchSnapshot();
    });
});

describe("scaffold contents", () => {
    it("uses schema.print() output", () => {
        const text = scaffold({ schema: EXAMPLE_SCHEMA });
        expect(text).toContain("col.text");
        expect(text).toContain("col.number");
        expect(text).toContain("col.enum");
        expect(text).toContain('import "tengrids/dist/index.css"');
        expect(text).toContain("useSchemaGrid");
    });

    it("next output splits into two files including ssr: false", () => {
        const text = scaffold({ schema: EXAMPLE_SCHEMA, framework: "next" });
        const files = splitScaffoldFiles(text);
        expect(files.map(f => f.path)).toEqual(["components/ScaffoldGrid.tsx", "pages/scaffold-scratch.tsx"]);
        expect(files[1]?.content).toContain("ssr: false");
        expect(files[1]?.content).toContain("next/dynamic");
        expect(files[1]?.content).toContain("ComponentType");
    });

    it("rejects custom columns and invalid formats at the schema boundary", () => {
        expect(SchemaInputSchema.safeParse({ x: { kind: "custom" } }).success).toBe(false);
        expect(ColumnInputSchema.safeParse({ kind: "number", format: "bogus" }).success).toBe(false);
        expect(SchemaInputSchema.safeParse({ status: { kind: "enum", title: "Status" } }).success).toBe(false);
        expect(SchemaInputSchema.safeParse({ n: { kind: "text", accessor: true } }).success).toBe(false);
    });

    it("quotes non-identifier sample-row keys", () => {
        expect(printIdent("first-name")).toBe('"first-name"');
        expect(printIdent("a b")).toBe('"a b"');
        expect(printIdent('say "hi"')).toBe(JSON.stringify('say "hi"'));
        expect(printIdent("name")).toBe("name");
        const text = scaffold({
            schema: {
                "first-name": { kind: "text" },
                "a b": { kind: "text" },
            },
        });
        expect(text).toContain('"first-name": "Ada"');
        expect(text).toContain('"a b": "Ada"');
    });

    it("emits an array sample for multiple enums", () => {
        const text = scaffold({
            schema: { tags: { kind: "enum", values: ["a", "b"], multiple: true } },
        });
        expect(text).toContain('tags: ["a"]');
        expect(text).not.toMatch(/tags: "a"/u);
    });

    it("remaps filtered visible row 0 to original 1 when the first row is dropped", () => {
        const visibleToOriginal = [1, 2, 3];
        const getOriginalIndex = (row: number) => visibleToOriginal[row] ?? row;
        expect(remapFilteredEdit([0, 0], getOriginalIndex)).toEqual([0, 1]);
        expect(remapFilteredEdit([2, 1], getOriginalIndex)).toEqual([2, 2]);
        const text = scaffold({ schema: EXAMPLE_SCHEMA, filters: true });
        expect(text).toContain("filters.getOriginalIndex");
        expect(text).toContain("getCellsForSelection={true}");
    });
});

describe("scaffold compiler-backed", () => {
    it("typechecks quoted keys and a multiple enum", () => {
        const source = scaffold({
            schema: {
                "first-name": { kind: "text", title: "Name" },
                tags: { kind: "enum", values: ["a", "b"], multiple: true },
            },
        });
        const repo = join(dirname(fileURLToPath(import.meta.url)), "../../..");
        const dir = mkdtempSync(join(tmpdir(), "tengrids-scaffold-"));
        writeFileSync(join(dir, "grid.tsx"), source);
        const tsconfig = join(dir, "tsconfig.json");
        writeFileSync(
            tsconfig,
            JSON.stringify({
                compilerOptions: {
                    target: "ES2022",
                    module: "ESNext",
                    moduleResolution: "bundler",
                    jsx: "react",
                    strict: true,
                    skipLibCheck: true,
                    esModuleInterop: true,
                    noEmit: true,
                    baseUrl: repo,
                    paths: {
                        tengrids: ["packages/core/dist/dts/index.d.ts"],
                        "tengrids-schema": ["packages/schema/dist/dts/index.d.ts"],
                        react: ["node_modules/@types/react/index.d.ts"],
                    },
                },
                include: [join(dir, "grid.tsx")],
            })
        );
        const tsc = join(repo, "node_modules/typescript/bin/tsc");
        const result = spawnSync(process.execPath, [tsc, "--noEmit", "-p", tsconfig], {
            cwd: dir,
            encoding: "utf8",
        });
        if (result.status !== 0) {
            throw new Error(result.stdout + result.stderr);
        }
    });
});
