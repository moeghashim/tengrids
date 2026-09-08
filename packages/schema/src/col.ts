import type {
    BooleanColumnOptions,
    ColumnDef,
    CustomColumnOptions,
    DateColumnOptions,
    EnumColumnOptions,
    ImageColumnOptions,
    InferBooleanValue,
    InferEnumValue,
    MarkdownColumnOptions,
    NumberColumnOptions,
    TextColumnOptions,
    UriColumnOptions,
} from "./types.js";

function text(options: TextColumnOptions = {}): ColumnDef<string> {
    return { ...options, kind: "text" };
}

function number(options: NumberColumnOptions = {}): ColumnDef<number> {
    return { ...options, kind: "number" };
}

function booleanCol<I extends boolean | undefined = undefined>(
    options?: Omit<BooleanColumnOptions, "allowIndeterminate"> & { readonly allowIndeterminate?: I }
): ColumnDef<InferBooleanValue<I>> {
    return { ...(options ?? {}), kind: "boolean" } as ColumnDef<InferBooleanValue<I>>;
}

function date(options: DateColumnOptions = {}): ColumnDef<Date | undefined> {
    return { ...options, kind: "date" };
}

function enumCol<T extends string, M extends boolean | undefined = undefined>(
    options: Omit<EnumColumnOptions<T>, "values" | "multiple"> & {
        readonly values: readonly T[];
        readonly multiple?: M;
    }
): ColumnDef<InferEnumValue<T, M>> {
    return { ...options, kind: "enum" } as ColumnDef<InferEnumValue<T, M>>;
}

function uri(options: UriColumnOptions = {}): ColumnDef<string> {
    return { ...options, kind: "uri" };
}

function image(options: ImageColumnOptions = {}): ColumnDef<readonly string[]> {
    return { ...options, kind: "image" };
}

function markdown(options: MarkdownColumnOptions = {}): ColumnDef<string> {
    return { ...options, kind: "markdown" };
}

function custom<TValue>(options: CustomColumnOptions<TValue>): ColumnDef<TValue> {
    return { ...options, kind: "custom" };
}

export const col = {
    text,
    number,
    boolean: booleanCol,
    date,
    enum: enumCol,
    uri,
    image,
    markdown,
    custom,
};
