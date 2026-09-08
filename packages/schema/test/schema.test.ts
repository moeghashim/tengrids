import { describe, expect, it } from "vitest";
import {
    GridCellKind,
    type GridCell,
    type TextCell,
    type NumberCell,
    type BooleanCell,
    type UriCell,
    type ImageCell,
    type MarkdownCell,
    type BubbleCell,
    type CustomCell,
} from "tengrids";
import type { RowEditedCallback, RowToCell } from "tengrids-source";
import { col, createSchema, type InferRow } from "../src/index.js";

const example = createSchema({
    name: col.text({ title: "Name", width: 160 }),
    cost: col.number({ title: "Cost", format: "currency", currency: "USD", width: 110 }),
    status: col.enum({ title: "Status", values: ["draft", "active", "closed"] as const }),
    due: col.date({ title: "Due" }),
    paid: col.boolean({ title: "Paid" }),
    site: col.uri({ title: "Website" }),
    notes: col.markdown({ title: "Notes", readonly: true }),
});

type ExampleRow = InferRow<typeof example>;

const row: ExampleRow = {
    name: "Acme",
    cost: 12.5,
    status: "draft",
    due: new Date(2026, 0, 15),
    paid: false,
    site: "https://acme.example",
    notes: "_n/a_",
};

describe("createSchema keys and columns", () => {
    it("exposes keys in insertion order", () => {
        expect([...example.keys]).toEqual(["name", "cost", "status", "due", "paid", "site", "notes"]);
    });
    it("columns() always sets id and uses width when provided", () => {
        const cols = example.columns();
        expect(cols.map(c => c.id)).toEqual(["name", "cost", "status", "due", "paid", "site", "notes"]);
        expect(cols[0]).toMatchObject({ title: "Name", id: "name", width: 160 });
        expect(cols[1]).toMatchObject({ title: "Cost", width: 110 });
    });
    it("columns() without width still has id (AutoGridColumn)", () => {
        const s = createSchema({ title: col.text({ title: "Title" }) });
        expect(s.columns()[0]).toEqual({ title: "Title", id: "title" });
    });
    it("defaults title and id to the key", () => {
        const s = createSchema({ nickname: col.text() });
        expect(s.columns()[0]).toMatchObject({ title: "nickname", id: "nickname" });
    });
    it("passes through group, icon, hasMenu, grow, themeOverride", () => {
        const s = createSchema({
            a: col.text({
                group: "Meta",
                icon: "headerString",
                hasMenu: true,
                grow: 1,
                themeOverride: { accentColor: "#f00" },
            }),
        });
        expect(s.columns()[0]).toMatchObject({
            group: "Meta",
            icon: "headerString",
            hasMenu: true,
            grow: 1,
            themeOverride: { accentColor: "#f00" },
        });
    });
    it("memoizes columns() and filterFields() and print()", () => {
        expect(example.columns()).toBe(example.columns());
        expect(example.filterFields()).toBe(example.filterFields());
        expect(example.print()).toBe(example.print());
    });
});

describe("col.text", () => {
    const s = createSchema({ name: col.text({ title: "Name", multiline: true, maxLength: 5 }) });
    it("renders a Text cell and trims on edit", () => {
        const cell = s.cell({ name: " Ada " }, "name") as TextCell;
        expect(cell.kind).toBe(GridCellKind.Text);
        expect(cell.data).toBe(" Ada ");
        expect(cell.allowWrapping).toBe(true);
        const next = s.applyEdit({ name: "Ada" }, "name", { ...cell, data: "  Hi  ", displayData: "  Hi  " });
        expect(next).toEqual({ name: "Hi" });
    });
    it("rejects edits longer than maxLength", () => {
        const cell: TextCell = { kind: GridCellKind.Text, data: "toolong", displayData: "toolong", allowOverlay: true };
        expect(s.applyEdit({ name: "Ada" }, "name", cell)).toBeUndefined();
    });
});

describe("col.number", () => {
    it("formats currency, percent, integer, and plain", () => {
        const s = createSchema({
            cash: col.number({ format: "currency", currency: "USD" }),
            pct: col.number({ format: "percent", decimals: 0 }),
            whole: col.number({ format: "integer" }),
            raw: col.number({ decimals: 2 }),
        });
        const cash = s.cell({ cash: 12.5, pct: 0.15, whole: 3.7, raw: 1.2 }, "cash") as NumberCell;
        const pct = s.cell({ cash: 12.5, pct: 0.15, whole: 3.7, raw: 1.2 }, "pct") as NumberCell;
        const whole = s.cell({ cash: 12.5, pct: 0.15, whole: 3.7, raw: 1.2 }, "whole") as NumberCell;
        const raw = s.cell({ cash: 12.5, pct: 0.15, whole: 3.7, raw: 1.2 }, "raw") as NumberCell;
        expect(cash.displayData).toContain("12.50");
        expect(pct.displayData).toContain("15");
        expect(whole.displayData).toBe("4");
        expect(raw.displayData).toBe("1.20");
        expect(whole.fixedDecimals).toBe(0);
    });
    it("round-trips a numeric edit", () => {
        const s = createSchema({ cost: col.number() });
        const next = s.applyEdit({ cost: 1 }, "cost", {
            kind: GridCellKind.Number,
            data: 99,
            displayData: "99",
            allowOverlay: true,
        });
        expect(next).toEqual({ cost: 99 });
    });
    it("rejects NaN, letters, and values outside min/max", () => {
        const s = createSchema({ cost: col.number({ min: 0, max: 10 }) });
        const current = { cost: 5 };
        expect(
            s.applyEdit(current, "cost", {
                kind: GridCellKind.Number,
                data: undefined,
                displayData: "abc",
                allowOverlay: true,
            })
        ).toBeUndefined();
        expect(
            s.applyEdit(current, "cost", {
                kind: GridCellKind.Text,
                data: "nope",
                displayData: "nope",
                allowOverlay: true,
            })
        ).toBeUndefined();
        expect(
            s.applyEdit(current, "cost", { kind: GridCellKind.Number, data: -1, displayData: "-1", allowOverlay: true })
        ).toBeUndefined();
        expect(
            s.applyEdit(current, "cost", { kind: GridCellKind.Number, data: 11, displayData: "11", allowOverlay: true })
        ).toBeUndefined();
        expect(
            s.applyEdit(current, "cost", {
                kind: GridCellKind.Number,
                data: Number.NaN,
                displayData: "NaN",
                allowOverlay: true,
            })
        ).toBeUndefined();
    });
    it("does not mutate the original row", () => {
        const s = createSchema({ cost: col.number() });
        const current = { cost: 1 };
        s.applyEdit(current, "cost", { kind: GridCellKind.Number, data: 2, displayData: "2", allowOverlay: true });
        expect(current).toEqual({ cost: 1 });
    });
});

describe("col.boolean", () => {
    it("renders and round-trips true/false", () => {
        const s = createSchema({ paid: col.boolean({ title: "Paid" }) });
        const cell = s.cell({ paid: true }, "paid") as BooleanCell;
        expect(cell.kind).toBe(GridCellKind.Boolean);
        expect(cell.data).toBe(true);
        expect(cell.allowOverlay).toBe(false);
        expect(s.applyEdit({ paid: true }, "paid", { ...cell, data: false })).toEqual({ paid: false });
    });
    it("supports indeterminate when allowed", () => {
        const s = createSchema({ flag: col.boolean({ allowIndeterminate: true }) });
        const cell = s.cell({ flag: undefined }, "flag") as BooleanCell;
        expect(cell.data).toBeUndefined();
        expect(s.applyEdit({ flag: true }, "flag", { ...cell, data: undefined })).toEqual({ flag: undefined });
    });
    it("rejects indeterminate when not allowed", () => {
        const s = createSchema({ paid: col.boolean() });
        expect(
            s.applyEdit({ paid: true }, "paid", { kind: GridCellKind.Boolean, data: undefined, allowOverlay: false })
        ).toBeUndefined();
    });
});

describe("col.date", () => {
    it("stores ISO in data and formats display", () => {
        const s = createSchema({ due: col.date({ title: "Due" }) });
        const d = new Date(2026, 0, 15);
        const cell = s.cell({ due: d }, "due") as TextCell;
        expect(cell.kind).toBe(GridCellKind.Text);
        expect(cell.data).toBe("2026-01-15");
        expect(cell.displayData.length).toBeGreaterThan(0);
    });
    it("parses ISO and locale-ish dates and treats empty as undefined", () => {
        const s = createSchema({ due: col.date() });
        const iso = s.applyEdit({ due: undefined }, "due", {
            kind: GridCellKind.Text,
            data: "2026-09-08",
            displayData: "2026-09-08",
            allowOverlay: true,
        });
        expect(iso?.due).toBeInstanceOf(Date);
        expect(iso?.due?.getFullYear()).toBe(2026);
        expect(iso?.due?.getMonth()).toBe(8);
        expect(iso?.due?.getDate()).toBe(8);
        const empty = s.applyEdit({ due: new Date() }, "due", {
            kind: GridCellKind.Text,
            data: "  ",
            displayData: "  ",
            allowOverlay: true,
        });
        expect(empty).toEqual({ due: undefined });
    });
    it("rejects invalid dates", () => {
        const s = createSchema({ due: col.date() });
        expect(
            s.applyEdit({ due: undefined }, "due", {
                kind: GridCellKind.Text,
                data: "not-a-date",
                displayData: "not-a-date",
                allowOverlay: true,
            })
        ).toBeUndefined();
    });
    it("rejects invalid calendar dates, non-leap Feb 29, and still accepts leap days", () => {
        const s = createSchema({ due: col.date() });
        const current = { due: undefined as Date | undefined };
        const edit = (data: string) =>
            s.applyEdit(current, "due", {
                kind: GridCellKind.Text,
                data,
                displayData: data,
                allowOverlay: true,
            });
        expect(edit("2026-02-30")).toBeUndefined();
        expect(edit("2026-00-01")).toBeUndefined();
        expect(edit("2026-13-01")).toBeUndefined();
        expect(edit("2025-02-29")).toBeUndefined();
        const leap = edit("2024-02-29");
        expect(leap?.due?.getFullYear()).toBe(2024);
        expect(leap?.due?.getMonth()).toBe(1);
        expect(leap?.due?.getDate()).toBe(29);
        const yearOne = edit("0001-01-02");
        expect(yearOne?.due?.getFullYear()).toBe(1);
        expect(yearOne?.due?.getMonth()).toBe(0);
        expect(yearOne?.due?.getDate()).toBe(2);
    });
    it("formats datetime and relative", () => {
        const s = createSchema({
            at: col.date({ format: "datetime" }),
            rel: col.date({ format: "relative" }),
        });
        const d = new Date();
        const at = s.cell({ at: d, rel: d }, "at") as TextCell;
        const rel = s.cell({ at: d, rel: d }, "rel") as TextCell;
        expect(at.data).toBe(d.toISOString());
        expect(rel.displayData.length).toBeGreaterThan(0);
    });
});

describe("col.enum", () => {
    it("uses labels for displayData and rejects values outside the list", () => {
        const s = createSchema({
            status: col.enum({ values: ["draft", "active", "closed"] as const, labels: { draft: "Draft" } }),
        });
        const cell = s.cell({ status: "draft" }, "status") as TextCell;
        expect(cell.data).toBe("draft");
        expect(cell.displayData).toBe("Draft");
        expect(s.applyEdit({ status: "draft" }, "status", { ...cell, data: "active", displayData: "active" })).toEqual({
            status: "active",
        });
        expect(
            s.applyEdit({ status: "draft" }, "status", { ...cell, data: "nope", displayData: "nope" })
        ).toBeUndefined();
    });
    it("renders Bubble cells when multiple is true", () => {
        const s = createSchema({
            tags: col.enum({ values: ["a", "b", "c"] as const, multiple: true }),
        });
        const cell = s.cell({ tags: ["a", "c"] }, "tags") as BubbleCell;
        expect(cell.kind).toBe(GridCellKind.Bubble);
        expect(cell.data).toEqual(["a", "c"]);
        expect(s.applyEdit({ tags: ["a"] }, "tags", { ...cell, data: ["a", "b"] })).toEqual({ tags: ["a", "b"] });
        expect(s.applyEdit({ tags: ["a"] }, "tags", { ...cell, data: ["z"] })).toBeUndefined();
    });
});

describe("col.uri", () => {
    it("normalizes bare domains and rejects garbage", () => {
        const s = createSchema({ site: col.uri({ hoverEffect: true, displayAsLink: true }) });
        const cell = s.cell({ site: "https://ok.example" }, "site") as UriCell;
        expect(cell.kind).toBe(GridCellKind.Uri);
        expect(cell.hoverEffect).toBe(true);
        expect(s.applyEdit({ site: "" }, "site", { ...cell, data: "example.com", displayData: "example.com" })).toEqual(
            {
                site: "https://example.com",
            }
        );
        expect(
            s.applyEdit({ site: "" }, "site", { ...cell, data: "not a url", displayData: "not a url" })
        ).toBeUndefined();
        expect(
            s.applyEdit({ site: "" }, "site", {
                ...cell,
                data: "javascript://%0aalert(1)",
                displayData: "javascript://%0aalert(1)",
            })
        ).toBeUndefined();
        expect(
            s.applyEdit({ site: "" }, "site", { ...cell, data: "data:text/html,hi", displayData: "data:text/html,hi" })
        ).toBeUndefined();
        expect(s.applyEdit({ site: "x" }, "site", { ...cell, data: "", displayData: "" })).toEqual({ site: "" });
    });
    it("lets an explicit hoverEffect win over displayAsLink", () => {
        const s = createSchema({
            a: col.uri({ hoverEffect: false, displayAsLink: true }),
            b: col.uri({ displayAsLink: true }),
        });
        expect((s.cell({ a: "https://a.example", b: "https://b.example" }, "a") as UriCell).hoverEffect).toBe(false);
        expect((s.cell({ a: "https://a.example", b: "https://b.example" }, "b") as UriCell).hoverEffect).toBe(true);
    });
});

describe("col.image", () => {
    it("renders Image cells and allowAdd controls whether the list can grow", () => {
        const add = createSchema({ pics: col.image({ rounding: 8, allowAdd: true }) });
        const noAdd = createSchema({ pics: col.image({ allowAdd: false }) });
        const cell = add.cell({ pics: ["https://a.example/x.png"] }, "pics") as ImageCell;
        expect(cell.kind).toBe(GridCellKind.Image);
        expect(cell.rounding).toBe(8);
        expect(add.applyEdit({ pics: [] }, "pics", { ...cell, data: ["https://b.example/y.png"] })).toEqual({
            pics: ["https://b.example/y.png"],
        });
        expect(
            noAdd.applyEdit({ pics: ["https://a.example/x.png"] }, "pics", {
                ...cell,
                data: ["https://a.example/x.png", "https://b.example/y.png"],
            })
        ).toBeUndefined();
        expect(
            noAdd.applyEdit({ pics: ["https://a.example/x.png"] }, "pics", {
                ...cell,
                data: ["https://b.example/y.png"],
            })
        ).toEqual({ pics: ["https://b.example/y.png"] });
    });
});

describe("col.markdown", () => {
    it("renders Markdown cells and writes strings", () => {
        const s = createSchema({ notes: col.markdown({ title: "Notes" }) });
        const cell = s.cell({ notes: "# Hi" }, "notes") as MarkdownCell;
        expect(cell.kind).toBe(GridCellKind.Markdown);
        expect(s.applyEdit({ notes: "" }, "notes", { ...cell, data: "**x**" })).toEqual({ notes: "**x**" });
    });
});

describe("col.custom", () => {
    it("delegates toCell/fromCell and rejects undefined fromCell", () => {
        const s = createSchema({
            n: col.custom<number>({
                toCell: (v): GridCell => ({
                    kind: GridCellKind.Custom,
                    data: { n: v },
                    copyData: String(v),
                    allowOverlay: true,
                }),
                fromCell: (cell): number | undefined => {
                    if (cell.kind !== GridCellKind.Custom) return undefined;
                    const n = (cell.data as { n?: unknown }).n;
                    return typeof n === "number" ? n : undefined;
                },
                filter: "number",
            }),
        });
        const cell = s.cell({ n: 7 }, "n") as CustomCell;
        expect(cell.kind).toBe(GridCellKind.Custom);
        expect(cell.copyData).toBe("7");
        expect(s.applyEdit({ n: 7 }, "n", { ...cell, data: { n: 8 } })).toEqual({ n: 8 });
        expect(s.applyEdit({ n: 7 }, "n", { ...cell, data: { n: "x" } })).toBeUndefined();
    });
    it("applies shared readonly to the generated custom cell", () => {
        const s = createSchema({
            n: col.custom<number>({
                readonly: true,
                toCell: (v): GridCell => ({
                    kind: GridCellKind.Custom,
                    data: { n: v },
                    copyData: String(v),
                    allowOverlay: true,
                }),
                fromCell: (): number | undefined => 1,
            }),
        });
        const cell = s.cell({ n: 7 }, "n") as CustomCell;
        expect(cell.readonly).toBe(true);
        expect(cell.allowOverlay).toBe(false);
        expect(s.applyEdit({ n: 7 }, "n", cell)).toBeUndefined();
    });
});

describe("readonly and accessor", () => {
    it("rejects edits on readonly columns", () => {
        const s = createSchema({ notes: col.text({ readonly: true }) });
        const cell = s.cell({ notes: "a" }, "notes") as TextCell;
        expect(cell.readonly).toBe(true);
        expect(s.applyEdit({ notes: "a" }, "notes", { ...cell, data: "b", displayData: "b" })).toBeUndefined();
    });
    it("reads nested values through accessor", () => {
        const s = createSchema({
            city: col.text({ accessor: (r: { address: { city: string } }) => r.address.city }),
        });
        const nested = { city: "ignored", address: { city: "Paris" } };
        expect((s.cell(nested, "city") as TextCell).data).toBe("Paris");
        expect(
            s.applyEdit(nested, "city", {
                kind: GridCellKind.Text,
                data: "Lyon",
                displayData: "Lyon",
                allowOverlay: true,
            })
        ).toEqual({
            ...nested,
            city: "Lyon",
        });
    });
});

describe("toCell / onEdited", () => {
    it("matches useAsyncDataSource RowToCell / RowEditedCallback without adapters (A4)", () => {
        const toCell: RowToCell<ExampleRow> = example.toCell;
        const onEdited: RowEditedCallback<ExampleRow> = example.onEdited;
        expect(toCell(row, 0).kind).toBe(GridCellKind.Text);
        expect(
            onEdited([0, 0], { kind: GridCellKind.Text, data: "Z", displayData: "Z", allowOverlay: true }, row)?.name
        ).toBe("Z");
    });
    it("toCell indexes by column and onEdited writes back", () => {
        const cell = example.toCell(row, 0);
        expect(cell.kind).toBe(GridCellKind.Text);
        const edited = example.onEdited(
            [1, 0],
            { kind: GridCellKind.Number, data: 50, displayData: "50", allowOverlay: true },
            row
        );
        expect(edited?.cost).toBe(50);
        expect(edited).not.toBe(row);
        expect(
            example.onEdited([99, 0], { kind: GridCellKind.Text, data: "x", displayData: "x", allowOverlay: true }, row)
        ).toBeUndefined();
        expect(example.toCell(row, 99).kind).toBe(GridCellKind.Loading);
    });
});

describe("filterFields", () => {
    it("derives fields from kinds and values, skipping unfilterable", () => {
        const s = createSchema({
            name: col.text(),
            cost: col.number(),
            status: col.enum({ values: ["a", "b"] as const, labels: { a: "A" }, multiple: true }),
            due: col.date(),
            paid: col.boolean(),
            site: col.uri(),
            pics: col.image(),
            notes: col.markdown({ filterable: false }),
            hidden: col.text({ filterable: false }),
            custom: col.custom<string>({
                toCell: (v): GridCell => ({ kind: GridCellKind.Text, data: v, displayData: v, allowOverlay: true }),
                fromCell: c => (c.kind === GridCellKind.Text ? c.data : undefined),
                filter: "text",
            }),
        });
        const fields = s.filterFields();
        expect(fields.map(f => [f.key, f.kind])).toEqual([
            ["name", "text"],
            ["cost", "number"],
            ["status", "enum"],
            ["due", "date"],
            ["paid", "boolean"],
            ["site", "uri"],
            ["custom", "text"],
        ]);
        expect(fields.find(f => f.key === "status")).toMatchObject({
            values: ["a", "b"],
            labels: { a: "A" },
            multiple: true,
        });
    });
});

describe("print", () => {
    it("emits TypeScript source for the §5.2 schema", () => {
        const src = example.print();
        expect(src).toContain("createSchema({");
        expect(src).toContain('name: col.text({ title: "Name", width: 160 })');
        expect(src).toContain('cost: col.number({ title: "Cost", format: "currency", currency: "USD", width: 110 })');
        expect(src).toContain('status: col.enum({ title: "Status", values: ["draft", "active", "closed"] as const })');
        expect(src).toContain("due: col.date(");
        expect(src).toContain("paid: col.boolean(");
        expect(src).toContain("site: col.uri(");
        expect(src).toContain("notes: col.markdown(");
        expect(src).toContain("readonly: true");
        const js = src.replace(/ as const/g, "");
        const recreate = new Function("createSchema", "col", `"use strict"; return (${js});`) as (
            cs: typeof createSchema,
            c: typeof col
        ) => typeof example;
        const again = recreate(createSchema, col);
        expect([...again.keys]).toEqual([...example.keys]);
        expect(again.columns().map(c => c.id)).toEqual(example.columns().map(c => c.id));
    });
    it("quotes non-identifier keys, keeps filterable/sortable false, and stubs callbacks", () => {
        const s = createSchema({
            "first-name": col.text({ filterable: false, sortable: false }),
            extra: col.custom<string>({
                toCell: (v): GridCell => ({ kind: GridCellKind.Text, data: v, displayData: v, allowOverlay: true }),
                fromCell: c => (c.kind === GridCellKind.Text ? c.data : undefined),
            }),
        });
        const src = s.print();
        expect(src).toContain('"first-name": col.text({ filterable: false, sortable: false })');
        expect(src).toContain("toCell: /* toCell */");
        expect(src).toContain("fromCell: /* fromCell */");
        const recreate = new Function("createSchema", "col", `"use strict"; return (${src});`) as (
            cs: typeof createSchema,
            c: typeof col
        ) => ReturnType<typeof createSchema>;
        const again = recreate(createSchema, col);
        expect([...again.keys]).toEqual(["first-name", "extra"]);
        expect(again.flags("first-name")).toEqual({ sortable: false, filterable: false, readonly: false });
    });
});

describe("flags", () => {
    it("defaults sortable and filterable to true and readonly to false", () => {
        const s = createSchema({
            a: col.text(),
            b: col.text({ sortable: true, filterable: true }),
            c: col.text({ sortable: false, filterable: false, readonly: true }),
        });
        expect(s.flags("a")).toEqual({ sortable: true, filterable: true, readonly: false });
        expect(s.flags("b")).toEqual({ sortable: true, filterable: true, readonly: false });
        expect(s.flags("c")).toEqual({ sortable: false, filterable: false, readonly: true });
    });
});

describe("InferRow", () => {
    it("accepts a value of the documented example type", () => {
        const typed: ExampleRow = row;
        expect(typed.status === "draft" || typed.status === "active" || typed.status === "closed").toBe(true);
        const due: Date | undefined = typed.due;
        expect(due === undefined || due instanceof Date).toBe(true);
    });
});
