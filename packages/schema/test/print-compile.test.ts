import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import ts from "typescript";
import { GridCellKind } from "tengrids";
import { col, createSchema } from "../src/index.js";

function typecheckPrinted(printed: string): string[] {
    const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const virtual = path.join(dir, "test", "__printed__.ts");
    const code = `import { createSchema, col } from "../src/index.js";\nexport const schema = ${printed};\n`;
    const options: ts.CompilerOptions = {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.Node16,
        moduleResolution: ts.ModuleResolutionKind.Node16,
        target: ts.ScriptTarget.ES2022,
        verbatimModuleSyntax: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        types: [],
    };
    const host = ts.createCompilerHost(options);
    const getSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
        if (path.normalize(fileName) === path.normalize(virtual)) {
            return ts.createSourceFile(virtual, code, languageVersion, true, ts.ScriptKind.TS);
        }
        return getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    };
    const fileExists = host.fileExists.bind(host);
    host.fileExists = fileName => path.normalize(fileName) === path.normalize(virtual) || fileExists(fileName);
    const readFile = host.readFile.bind(host);
    host.readFile = fileName => (path.normalize(fileName) === path.normalize(virtual) ? code : readFile(fileName));
    const program = ts.createProgram({ rootNames: [virtual], options, host });
    return ts
        .getPreEmitDiagnostics(program)
        .filter(d => d.category === ts.DiagnosticCategory.Error)
        .map(d => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
}

describe("print() TypeScript contract", () => {
    it("type-checks the §5.2 schema with the compiler API (zero errors)", () => {
        const schema = createSchema({
            name: col.text({ title: "Name", width: 160 }),
            cost: col.number({ title: "Cost", format: "currency", currency: "USD", width: 110 }),
            status: col.enum({ title: "Status", values: ["draft", "active", "closed"] as const }),
            due: col.date({ title: "Due" }),
            paid: col.boolean({ title: "Paid" }),
            site: col.uri({ title: "Website" }),
            notes: col.markdown({ title: "Notes", readonly: true }),
        });
        const errors = typecheckPrinted(schema.print());
        expect(errors).toEqual([]);
    });
    it("type-checks quoted keys and false flags", () => {
        const schema = createSchema({
            "first-name": col.text({ filterable: false, sortable: false }),
        });
        const src = schema.print();
        expect(src).toContain('"first-name": col.text({ filterable: false, sortable: false })');
        expect(typecheckPrinted(src)).toEqual([]);
    });
    it("throws for accessor/toCell/fromCell instead of emitting invalid stubs", () => {
        const withAccessor = createSchema({
            city: col.text({ accessor: (r: { address: { city: string } }) => r.address.city }),
        });
        expect(() => withAccessor.print()).toThrow(/cannot serialize function options/);
        const withCustom = createSchema({
            n: col.custom<number>({
                toCell: v => ({
                    kind: GridCellKind.Text,
                    data: String(v),
                    displayData: String(v),
                    allowOverlay: true,
                }),
                fromCell: () => undefined,
            }),
        });
        expect(() => withCustom.print()).toThrow(/cannot serialize function options/);
    });
});
