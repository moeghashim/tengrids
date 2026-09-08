import type { EditableGridCell, GridCell, GridColumn, Item, Theme } from "tengrids";

export type ColumnKind = "text" | "number" | "boolean" | "date" | "enum" | "uri" | "image" | "markdown" | "custom";

export type NumberFormat = "plain" | "currency" | "percent" | "integer";
export type DateFormat = "date" | "datetime" | "relative";

/** Kind used by `schema.filterFields()` and `col.custom({ filter })`. */
export type FilterKind = "text" | "number" | "boolean" | "date" | "enum" | "uri";

export interface FilterField {
    readonly key: string;
    readonly title: string;
    readonly kind: FilterKind;
    readonly values?: readonly string[];
    readonly labels?: Readonly<Record<string, string>>;
    readonly multiple?: boolean;
}

export interface SharedColumnOptions<TValue = unknown> {
    readonly title?: string;
    readonly id?: string;
    readonly width?: number;
    readonly grow?: number;
    readonly group?: string;
    readonly icon?: string;
    readonly readonly?: boolean;
    readonly hasMenu?: boolean;
    readonly themeOverride?: Partial<Theme>;
    readonly sortable?: boolean;
    readonly filterable?: boolean;
    /** Read path for nested data. Edits still write `{ ...row, [key]: value }`. */
    readonly accessor?: (row: never) => TValue;
}

/** `on` / `off` for literal flags; `maybe` when the flag is widened (`boolean` or optional `true`). */
export type FlagTri<F> = [F] extends [true] ? "on" : [F] extends [false | undefined] ? "off" : "maybe";

export type InferBooleanValue<F> = FlagTri<F> extends "off" ? boolean : boolean | undefined;

export type InferEnumValue<T extends string, F> =
    FlagTri<F> extends "on" ? readonly T[] : FlagTri<F> extends "off" ? T : T | readonly T[];

export interface ColumnFlags {
    readonly sortable: boolean;
    readonly filterable: boolean;
    readonly readonly: boolean;
}

export interface TextColumnOptions extends SharedColumnOptions<string> {
    readonly multiline?: boolean;
    readonly maxLength?: number;
}

export interface NumberColumnOptions extends SharedColumnOptions<number> {
    readonly format?: NumberFormat;
    readonly currency?: string;
    readonly min?: number;
    readonly max?: number;
    readonly decimals?: number;
}

export interface BooleanColumnOptions<AllowIndeterminate extends boolean = boolean>
    extends SharedColumnOptions<AllowIndeterminate extends true ? boolean | undefined : boolean> {
    readonly allowIndeterminate?: AllowIndeterminate;
}

export interface DateColumnOptions extends SharedColumnOptions<Date | undefined> {
    readonly format?: DateFormat;
    readonly timeZone?: string;
}

export interface EnumColumnOptions<T extends string = string, Multiple extends boolean = boolean>
    extends SharedColumnOptions<Multiple extends true ? readonly T[] : T> {
    readonly values: readonly T[];
    readonly labels?: Readonly<Record<string, string>>;
    readonly multiple?: Multiple;
}

export interface UriColumnOptions extends SharedColumnOptions<string> {
    readonly hoverEffect?: boolean;
    readonly displayAsLink?: boolean;
}

export interface ImageColumnOptions extends SharedColumnOptions<readonly string[]> {
    readonly allowAdd?: boolean;
    readonly rounding?: number;
}

export type MarkdownColumnOptions = SharedColumnOptions<string>;

export interface CustomColumnOptions<TValue> extends SharedColumnOptions<TValue> {
    /** May return any `GridCell` (broader than §5.2's Custom) so a custom column can reuse built-in kinds. */
    readonly toCell: (rowValue: TValue, row: never) => GridCell;
    readonly fromCell: (cell: GridCell, row: never) => TValue | undefined;
    readonly filter?: FilterKind;
}

/**
 * Runtime column definition. Factories set `kind` and the relevant options;
 * `__value` is a phantom field used only by `InferRow`.
 */
export interface ColumnDef<TValue = unknown> extends SharedColumnOptions<TValue> {
    readonly kind: ColumnKind;
    readonly multiline?: boolean;
    readonly maxLength?: number;
    readonly format?: NumberFormat | DateFormat;
    readonly currency?: string;
    readonly min?: number;
    readonly max?: number;
    readonly decimals?: number;
    readonly allowIndeterminate?: boolean;
    readonly timeZone?: string;
    readonly values?: readonly string[];
    readonly labels?: Readonly<Record<string, string>>;
    readonly multiple?: boolean;
    readonly hoverEffect?: boolean;
    readonly displayAsLink?: boolean;
    readonly allowAdd?: boolean;
    readonly rounding?: number;
    readonly toCell?: (rowValue: never, row: never) => GridCell;
    readonly fromCell?: (cell: GridCell, row: never) => unknown;
    readonly filter?: FilterKind;
    readonly __value?: TValue;
}

export type SchemaDefs = Record<string, ColumnDef>;

type RowOf<S> = {
    [K in keyof S]: S[K] extends ColumnDef<infer V> ? V : never;
};

/**
 * Row type inferred from a `createSchema(...)` result or from the defs object.
 * `InferRow<typeof schema>` is the documented call site.
 */
export type InferRow<S> =
    S extends GridSchema<infer D> ? RowOf<D> : S extends Record<string, ColumnDef> ? RowOf<S> : never;

/** Matches `tengrids-source`'s `RowToCell` so `schema.toCell` plugs in with no adapter. */
export type SchemaToCell<R> = (row: R, col: number) => GridCell;

/** Matches `tengrids-source`'s `RowEditedCallback` so `schema.onEdited` plugs in with no adapter. */
export type SchemaOnEdited<R> = (cell: Item, newVal: EditableGridCell, rowData: R) => R | undefined;

export interface GridSchema<S extends { readonly [K in keyof S]: ColumnDef } = SchemaDefs> {
    readonly keys: readonly (keyof S & string)[];
    columns(): readonly GridColumn[];
    cell<K extends keyof S & string>(row: RowOf<S>, key: K): GridCell;
    readonly toCell: SchemaToCell<RowOf<S>>;
    applyEdit<K extends keyof S & string>(row: RowOf<S>, key: K, cell: GridCell): RowOf<S> | undefined;
    readonly onEdited: SchemaOnEdited<RowOf<S>>;
    filterFields(): readonly FilterField[];
    flags(key: keyof S & string): ColumnFlags;
    print(): string;
}
