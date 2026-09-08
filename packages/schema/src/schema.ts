import type { EditableGridCell, GridCell, GridColumn, Item, LoadingCell } from "tengrids";
import { GridCellKind } from "tengrids";
import { cellToValue, REJECT, valueToCell } from "./convert.js";
import type { ColumnDef, ColumnFlags, FilterField, FilterKind, GridSchema } from "./types.js";

const FACTORY_NAME: Record<ColumnDef["kind"], string> = {
    text: "text",
    number: "number",
    boolean: "boolean",
    date: "date",
    enum: "enum",
    uri: "uri",
    image: "image",
    markdown: "markdown",
    custom: "custom",
};

const KIND_TO_FILTER: Record<ColumnDef["kind"], FilterKind | undefined> = {
    text: "text",
    number: "number",
    boolean: "boolean",
    date: "date",
    enum: "enum",
    uri: "uri",
    image: undefined,
    markdown: "text",
    custom: undefined,
};

const LOADING: LoadingCell = { kind: GridCellKind.Loading, allowOverlay: false };

function toGridColumn(key: string, def: ColumnDef): GridColumn {
    const title = def.title ?? key;
    const id = def.id ?? key;
    const column: GridColumn = {
        title,
        id,
        ...(def.width !== undefined ? { width: def.width } : {}),
        ...(def.grow !== undefined ? { grow: def.grow } : {}),
        ...(def.group !== undefined ? { group: def.group } : {}),
        ...(def.icon !== undefined ? { icon: def.icon } : {}),
        ...(def.hasMenu !== undefined ? { hasMenu: def.hasMenu } : {}),
        ...(def.themeOverride !== undefined ? { themeOverride: def.themeOverride } : {}),
    };
    return column;
}

function printLiteral(value: unknown): string | undefined {
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
        const parts = value.map(printLiteral);
        if (parts.some(p => p === undefined)) return undefined;
        return `[${parts.join(", ")}] as const`;
    }
    if (typeof value === "object") {
        const entries: string[] = [];
        for (const k of Object.keys(value as object)) {
            const v = printLiteral((value as Record<string, unknown>)[k]);
            if (v === undefined) continue;
            entries.push(`${/^[A-Za-z_]\w*$/.test(k) ? k : JSON.stringify(k)}: ${v}`);
        }
        return `{ ${entries.join(", ")} }`;
    }
    return undefined;
}

const SKIP_PRINT = new Set(["kind", "__value"]);

function printIdent(key: string): string {
    return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

function printOptions(key: string, def: ColumnDef): string {
    const entries: string[] = [];
    for (const optionKey of Object.keys(def) as (keyof ColumnDef)[]) {
        if (SKIP_PRINT.has(optionKey)) continue;
        const value = def[optionKey];
        if (value === undefined) continue;
        if (optionKey === "title" && value === key) continue;
        if (optionKey === "id" && value === key) continue;
        if (typeof value === "function") {
            throw new Error(
                "schema.print() cannot serialize function options (accessor, toCell, fromCell); the scaffold consumes JSON schemas without callbacks"
            );
        }
        const printed = printLiteral(value);
        if (printed === undefined) continue;
        entries.push(`${optionKey}: ${printed}`);
    }
    if (entries.length === 0) return "";
    return `{ ${entries.join(", ")} }`;
}

function filterKindFor(def: ColumnDef): FilterKind | undefined {
    if (def.filterable === false) return undefined;
    if (def.kind === "custom") return def.filter;
    return KIND_TO_FILTER[def.kind];
}

export function createSchema<S extends { readonly [K in keyof S]: ColumnDef }>(defs: S): GridSchema<S> {
    const keys = Object.freeze(Object.keys(defs)) as readonly (keyof S & string)[];
    let columnsCache: readonly GridColumn[] | undefined;
    let fieldsCache: readonly FilterField[] | undefined;
    let printCache: string | undefined;

    const cell = <K extends keyof S & string>(row: { [P in keyof S]: unknown }, key: K): GridCell => {
        const def = defs[key];
        if (def === undefined) return LOADING;
        return valueToCell(def, row, key);
    };

    const toCell = (row: { [P in keyof S]: unknown }, colIndex: number): GridCell => {
        const key = keys[colIndex];
        if (key === undefined) return LOADING;
        return cell(row, key);
    };

    const applyEdit = <K extends keyof S & string>(
        row: { [P in keyof S]: unknown },
        key: K,
        edited: GridCell
    ): { [P in keyof S]: unknown } | undefined => {
        const def = defs[key];
        if (def === undefined) return undefined;
        if (def.readonly === true) return undefined;
        const nextValue = cellToValue(def, edited, row, key);
        if (nextValue === REJECT) return undefined;
        return { ...row, [key]: nextValue };
    };

    const onEdited = (
        item: Item,
        newVal: EditableGridCell,
        rowData: { [P in keyof S]: unknown }
    ): { [P in keyof S]: unknown } | undefined => {
        const key = keys[item[0]];
        if (key === undefined) return undefined;
        return applyEdit(rowData, key, newVal);
    };

    const schema: GridSchema<S> = {
        keys,
        columns(): readonly GridColumn[] {
            columnsCache ??= Object.freeze(keys.map(key => toGridColumn(key, defs[key])));
            return columnsCache;
        },
        cell: cell as GridSchema<S>["cell"],
        toCell: toCell as GridSchema<S>["toCell"],
        applyEdit: applyEdit as GridSchema<S>["applyEdit"],
        onEdited: onEdited as GridSchema<S>["onEdited"],
        filterFields(): readonly FilterField[] {
            if (fieldsCache !== undefined) return fieldsCache;
            const fields: FilterField[] = [];
            for (const key of keys) {
                const def = defs[key];
                const kind = filterKindFor(def);
                if (kind === undefined) continue;
                fields.push({
                    key: def.id ?? key,
                    title: def.title ?? key,
                    kind,
                    ...(def.values !== undefined ? { values: def.values } : {}),
                    ...(def.labels !== undefined ? { labels: def.labels } : {}),
                    ...(def.multiple !== undefined ? { multiple: def.multiple } : {}),
                });
            }
            fieldsCache = Object.freeze(fields);
            return fields;
        },
        flags(key: keyof S & string): ColumnFlags {
            const def = defs[key];
            return {
                sortable: def.sortable !== false,
                filterable: def.filterable !== false,
                readonly: def.readonly === true,
            };
        },
        print(): string {
            if (printCache !== undefined) return printCache;
            const lines = keys.map(key => {
                const def = defs[key];
                const factory = FACTORY_NAME[def.kind];
                const opts = printOptions(key, def);
                return `    ${printIdent(key)}: col.${factory}(${opts}),`;
            });
            printCache = `createSchema({\n${lines.join("\n")}\n})`;
            return printCache;
        },
    };
    return schema;
}
