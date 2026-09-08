import type {
    BooleanColumnOptions,
    ColumnDef,
    CustomColumnOptions,
    DateColumnOptions,
    EnumColumnOptions,
    ImageColumnOptions,
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

function booleanCol<O extends BooleanColumnOptions = BooleanColumnOptions<false>>(
    options?: O
): ColumnDef<O["allowIndeterminate"] extends true ? boolean | undefined : boolean> {
    return { ...(options ?? {}), kind: "boolean" } as ColumnDef<
        O["allowIndeterminate"] extends true ? boolean | undefined : boolean
    >;
}

function date(options: DateColumnOptions = {}): ColumnDef<Date | undefined> {
    return { ...options, kind: "date" };
}

function enumCol<T extends string, O extends EnumColumnOptions<T> = EnumColumnOptions<T>>(
    options: O & { readonly values: readonly T[] }
): ColumnDef<O["multiple"] extends true ? readonly T[] : T> {
    return { ...options, kind: "enum" } as ColumnDef<O["multiple"] extends true ? readonly T[] : T>;
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
