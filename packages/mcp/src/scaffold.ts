import { col, createSchema, type ColumnDef } from "tengrids-schema";
import { z } from "zod";

const KINDS = ["text", "number", "boolean", "date", "enum", "uri", "image", "markdown"] as const;

export const ColumnInputSchema = z
    .object({
        kind: z.enum(KINDS),
        title: z.string().optional(),
        id: z.string().optional(),
        width: z.number().optional(),
        grow: z.number().optional(),
        group: z.string().optional(),
        icon: z.string().optional(),
        readonly: z.boolean().optional(),
        hasMenu: z.boolean().optional(),
        sortable: z.boolean().optional(),
        filterable: z.boolean().optional(),
        multiline: z.boolean().optional(),
        maxLength: z.number().optional(),
        format: z.string().optional(),
        currency: z.string().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        decimals: z.number().optional(),
        allowIndeterminate: z.boolean().optional(),
        timeZone: z.string().optional(),
        values: z.array(z.string()).optional(),
        labels: z.record(z.string()).optional(),
        multiple: z.boolean().optional(),
        hoverEffect: z.boolean().optional(),
        displayAsLink: z.boolean().optional(),
        allowAdd: z.boolean().optional(),
        rounding: z.number().optional(),
    })
    .strict();

export const SchemaInputSchema = z
    .record(z.string().min(1), ColumnInputSchema)
    .refine(obj => Object.keys(obj).length > 0, {
        message: "schema must have at least one column",
    });

export const ScaffoldInputSchema = z
    .object({
        schema: SchemaInputSchema,
        filters: z.boolean().optional(),
        ai: z.boolean().optional(),
        framework: z.enum(["react", "next"]).optional(),
    })
    .strict();

export type ScaffoldInput = z.infer<typeof ScaffoldInputSchema>;
export type ColumnInput = z.infer<typeof ColumnInputSchema>;

/** The §5.2 schema used by C1/C2 and the README worked example. */
export const EXAMPLE_SCHEMA: Record<string, ColumnInput> = {
    name: { kind: "text", title: "Name", width: 160 },
    cost: { kind: "number", title: "Cost", format: "currency", currency: "USD", width: 110 },
    status: { kind: "enum", title: "Status", values: ["draft", "active", "closed"] },
    due: { kind: "date", title: "Due" },
    paid: { kind: "boolean", title: "Paid" },
    site: { kind: "uri", title: "Website" },
    notes: { kind: "markdown", title: "Notes", readonly: true },
};

const PORTAL = `<div id="portal" style={{ position: "fixed", left: 0, top: 0, zIndex: 9999 }} />`;

function sampleLiteral(column: ColumnInput): string {
    switch (column.kind) {
        case "text":
            return `"Ada"`;
        case "number":
            return "12.5";
        case "boolean":
            return "true";
        case "date":
            return `new Date("2026-09-01")`;
        case "enum":
            return JSON.stringify(column.values?.[0] ?? "draft");
        case "uri":
            return `"https://example.com"`;
        case "image":
            return `["https://example.com/a.png"]`;
        case "markdown":
            return `"_ok_"`;
        default: {
            const _never: never = column.kind;
            return _never;
        }
    }
}

function buildSchema(input: Record<string, ColumnInput>) {
    const defs: Record<string, ColumnDef> = {};
    for (const key of Object.keys(input)) {
        const column = input[key];
        const { kind, ...opts } = column;
        if (kind === "enum") {
            const values = opts.values;
            if (values === undefined || values.length === 0) {
                throw new Error(`enum column "${key}" requires a non-empty values array`);
            }
            defs[key] = col.enum({ ...opts, values });
        } else if (kind === "text") {
            defs[key] = col.text(opts);
        } else if (kind === "number") {
            defs[key] = col.number(opts as Parameters<typeof col.number>[0]);
        } else if (kind === "boolean") {
            defs[key] = col.boolean(opts);
        } else if (kind === "date") {
            defs[key] = col.date(opts as Parameters<typeof col.date>[0]);
        } else if (kind === "uri") {
            defs[key] = col.uri(opts);
        } else if (kind === "image") {
            defs[key] = col.image(opts);
        } else {
            defs[key] = col.markdown(opts);
        }
    }
    return createSchema(defs);
}

function sampleRow(schema: Record<string, ColumnInput>): string {
    const fields = Object.keys(schema).map(key => `        ${key}: ${sampleLiteral(schema[key])},`);
    return `{\n${fields.join("\n")}\n    }`;
}

function gridComponent(opts: {
    printed: string;
    schema: Record<string, ColumnInput>;
    filters: boolean;
    ai: boolean;
}): string {
    const schemaImports = ["createSchema", "col", "useSchemaGrid", "type InferRow"];
    if (opts.filters) schemaImports.push("useGridFilters", "FilterRail");

    const lines: string[] = [
        `import React, { useState${opts.ai ? ", useRef" : ""} } from "react";`,
        `import { DataEditor${opts.ai ? ", type DataEditorRef" : ""} } from "tengrids";`,
        `import { ${schemaImports.join(", ")} } from "tengrids-schema";`,
        `import "tengrids/dist/index.css";`,
    ];
    if (opts.filters) lines.push(`import "tengrids-schema/dist/index.css";`);
    if (opts.ai) lines.push(`import { useAiCells, type AiProvider } from "tengrids-ai";`);
    lines.push("");
    lines.push(`const schema = ${opts.printed};`);
    lines.push("");
    lines.push(`type Row = InferRow<typeof schema>;`);
    lines.push("");
    lines.push(`const initialRows: readonly Row[] = [`);
    lines.push(`    ${sampleRow(opts.schema)},`);
    lines.push(`];`);
    lines.push("");
    if (opts.ai) {
        lines.push(`const provider: AiProvider = {`);
        lines.push(`    complete: async () => "",`);
        lines.push(`};`);
        lines.push("");
    }
    lines.push(`export default function TengridsGrid() {`);
    lines.push(`    const [rows, setRows] = useState<readonly Row[]>(initialRows);`);
    if (opts.ai) lines.push(`    const gridRef = useRef<DataEditorRef | null>(null);`);
    lines.push(`    const grid = useSchemaGrid(schema, rows, { onRowsChange: setRows });`);
    if (opts.filters) {
        lines.push(`    const filters = useGridFilters({`);
        lines.push(`        fields: schema.filterFields(),`);
        lines.push(`        columns: grid.columns,`);
        lines.push(`        rows: grid.rows,`);
        lines.push(`        getCellContent: grid.getCellContent,`);
        lines.push(`    });`);
    }
    if (opts.ai) {
        const content = opts.filters ? "filters.getCellContent" : "grid.getCellContent";
        lines.push(`    const ai = useAiCells({`);
        lines.push(`        provider,`);
        lines.push(`        columns: grid.columns,`);
        lines.push(`        getCellContent: ${content},`);
        lines.push(`        gridRef,`);
        lines.push(`    });`);
    }
    lines.push(`    return (`);
    lines.push(`        <div style={{ width: "100%", height: 500 }}>`);
    if (opts.filters) lines.push(`            <FilterRail filters={filters} />`);
    const editorProps: string[] = [];
    if (opts.ai) editorProps.push(`ref={gridRef}`);
    editorProps.push(`{...grid}`);
    if (opts.filters) {
        editorProps.push(`rows={filters.rows}`);
        editorProps.push(opts.ai ? `getCellContent={ai.getCellContent}` : `getCellContent={filters.getCellContent}`);
    } else if (opts.ai) {
        editorProps.push(`getCellContent={ai.getCellContent}`);
    }
    if (opts.ai) {
        editorProps.push(`customRenderers={ai.customRenderers}`);
        editorProps.push(`onVisibleRegionChanged={ai.onVisibleRegionChanged}`);
    }
    editorProps.push(`width={800}`);
    editorProps.push(`height={460}`);
    lines.push(`            <DataEditor ${editorProps.join(" ")} />`);
    lines.push(`            ${PORTAL}`);
    lines.push(`        </div>`);
    lines.push(`    );`);
    lines.push(`}`);
    lines.push("");
    return lines.join("\n");
}

function nextWrapper(): string {
    return [
        `import dynamic from "next/dynamic";`,
        `import React from "react";`,
        ``,
        `const TengridsGrid = dynamic(() => import("../components/ScaffoldGrid"), { ssr: false });`,
        ``,
        `export default function ScaffoldPage() {`,
        `    return <TengridsGrid />;`,
        `}`,
        ``,
    ].join("\n");
}

export function scaffold(input: ScaffoldInput): string {
    const schema = input.schema;
    const printed = buildSchema(schema).print();
    const filters = input.filters === true;
    const ai = input.ai === true;
    const framework = input.framework ?? "react";
    const grid = gridComponent({ printed, schema, filters, ai });
    if (framework === "next") {
        return `// FILE: components/ScaffoldGrid.tsx\n${grid}\n// FILE: pages/scaffold-scratch.tsx\n${nextWrapper()}`;
    }
    return grid;
}

export function splitScaffoldFiles(snippet: string): { path: string; content: string }[] {
    if (!snippet.startsWith("// FILE: ")) {
        return [{ path: "TengridsGrid.tsx", content: snippet }];
    }
    const files: { path: string; content: string }[] = [];
    const parts = snippet.split(/^\/\/ FILE: /mu).filter(part => part.length > 0);
    for (const part of parts) {
        const nl = part.indexOf("\n");
        const path = (nl === -1 ? part : part.slice(0, nl)).trim();
        const content = nl === -1 ? "" : part.slice(nl + 1);
        files.push({ path, content });
    }
    return files;
}
