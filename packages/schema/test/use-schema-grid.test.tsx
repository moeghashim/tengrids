import * as React from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GridCellKind, type BooleanCell, type NumberCell, type TextCell } from "tengrids";
import { useColumnSort } from "tengrids-source";
import { col, createSchema, useSchemaGrid, type InferRow } from "../src/index.js";

const schema = createSchema({
    name: col.text({ title: "Name", width: 160 }),
    cost: col.number({ title: "Cost", format: "currency", currency: "USD", width: 110 }),
    status: col.enum({ title: "Status", values: ["draft", "active", "closed"] as const }),
    due: col.date({ title: "Due" }),
    paid: col.boolean({ title: "Paid" }),
    site: col.uri({ title: "Website" }),
    notes: col.markdown({ title: "Notes", readonly: true }),
});

type Row = InferRow<typeof schema>;

function makeRow(i: number): Row {
    return {
        name: `Row ${i}`,
        cost: i,
        status: i % 2 === 0 ? "draft" : "active",
        due: new Date(2026, 0, (i % 28) + 1),
        paid: i % 3 === 0,
        site: `https://example.com/${i}`,
        notes: "n",
    };
}

describe("useSchemaGrid", () => {
    it("returns columns, row count, getCellContent, onCellEdited, getCellsForSelection", () => {
        const rows = [makeRow(0), makeRow(1)];
        const { result } = renderHook(() => useSchemaGrid(schema, rows));
        expect(result.current.columns).toHaveLength(7);
        expect(result.current.rows).toBe(2);
        expect(result.current.getCellContent([0, 0])).toMatchObject({ kind: GridCellKind.Text, data: "Row 0" });
        expect(result.current.getCellContent([0, 99]).kind).toBe(GridCellKind.Loading);
        const gcs = result.current.getCellsForSelection;
        expect(typeof gcs).toBe("function");
        if (typeof gcs !== "function") return;
        const sel = gcs({ x: 0, y: 0, width: 2, height: 1 }, new AbortController().signal);
        expect(Array.isArray(sel) && sel[0]?.[0]).toMatchObject({ data: "Row 0" });
    });

    it("round-trips number, boolean, enum, and date edits into onRowsChange (A2)", () => {
        const initial = [makeRow(1)];
        const onRowsChange = vi.fn();
        const { result, rerender } = renderHook(
            ({ rows }: { rows: readonly Row[] }) => useSchemaGrid(schema, rows, { onRowsChange }),
            { initialProps: { rows: initial } }
        );

        act(() => {
            result.current.onCellEdited?.([1, 0], {
                kind: GridCellKind.Number,
                data: 42,
                displayData: "42",
                allowOverlay: true,
            } satisfies NumberCell);
        });
        expect(onRowsChange).toHaveBeenLastCalledWith([expect.objectContaining({ cost: 42 })]);

        const afterNumber = onRowsChange.mock.calls.at(-1)?.[0] as Row[];
        rerender({ rows: afterNumber });
        act(() => {
            result.current.onCellEdited?.([4, 0], {
                kind: GridCellKind.Boolean,
                data: true,
                allowOverlay: false,
            } satisfies BooleanCell);
        });
        expect(onRowsChange).toHaveBeenLastCalledWith([expect.objectContaining({ paid: true })]);

        const afterBool = onRowsChange.mock.calls.at(-1)?.[0] as Row[];
        rerender({ rows: afterBool });
        act(() => {
            result.current.onCellEdited?.([2, 0], {
                kind: GridCellKind.Text,
                data: "closed",
                displayData: "closed",
                allowOverlay: true,
            } satisfies TextCell);
        });
        expect(onRowsChange).toHaveBeenLastCalledWith([expect.objectContaining({ status: "closed" })]);

        const afterEnum = onRowsChange.mock.calls.at(-1)?.[0] as Row[];
        rerender({ rows: afterEnum });
        act(() => {
            result.current.onCellEdited?.([3, 0], {
                kind: GridCellKind.Text,
                data: "2026-09-08",
                displayData: "2026-09-08",
                allowOverlay: true,
            } satisfies TextCell);
        });
        const last = onRowsChange.mock.calls.at(-1)?.[0] as Row[];
        expect(last[0].due).toBeInstanceOf(Date);
        expect(last[0].due?.getFullYear()).toBe(2026);
        expect(last[0].due?.getMonth()).toBe(8);
        expect(last[0].due?.getDate()).toBe(8);
        expect(onRowsChange).toHaveBeenCalledTimes(4);
    });

    it("rejects invalid number, enum, and date edits without calling onRowsChange (A3)", () => {
        const rows = [makeRow(0)];
        const onRowsChange = vi.fn();
        const { result } = renderHook(() => useSchemaGrid(schema, rows, { onRowsChange }));
        act(() => {
            result.current.onCellEdited?.([1, 0], {
                kind: GridCellKind.Number,
                data: undefined,
                displayData: "abc",
                allowOverlay: true,
            });
            result.current.onCellEdited?.([2, 0], {
                kind: GridCellKind.Text,
                data: "nope",
                displayData: "nope",
                allowOverlay: true,
            });
            result.current.onCellEdited?.([3, 0], {
                kind: GridCellKind.Text,
                data: "not-a-date",
                displayData: "not-a-date",
                allowOverlay: true,
            });
            result.current.onCellEdited?.([3, 0], {
                kind: GridCellKind.Text,
                data: "2026-02-30",
                displayData: "2026-02-30",
                allowOverlay: true,
            });
        });
        expect(onRowsChange).not.toHaveBeenCalled();
        expect(rows[0].cost).toBe(0);
        expect(rows[0].status).toBe("draft");
    });

    it("calls onRowChange and honors readonly", () => {
        const rows = [makeRow(0)];
        const onRowChange = vi.fn();
        const onRowsChange = vi.fn();
        const { result, rerender } = renderHook(
            ({ readonly }: { readonly: boolean }) =>
                useSchemaGrid(schema, rows, { onRowChange, onRowsChange, readonly }),
            { initialProps: { readonly: false } }
        );
        act(() => {
            result.current.onCellEdited?.([0, 0], {
                kind: GridCellKind.Text,
                data: "Renamed",
                displayData: "Renamed",
                allowOverlay: true,
            });
        });
        expect(onRowChange).toHaveBeenCalledWith(0, expect.objectContaining({ name: "Renamed" }));
        expect(onRowsChange).toHaveBeenCalled();
        rerender({ readonly: true });
        onRowChange.mockClear();
        onRowsChange.mockClear();
        act(() => {
            result.current.onCellEdited?.([0, 0], {
                kind: GridCellKind.Text,
                data: "Nope",
                displayData: "Nope",
                allowOverlay: true,
            });
        });
        expect(onRowChange).not.toHaveBeenCalled();
        expect(result.current.getCellContent([0, 0])).toMatchObject({ readonly: true, allowOverlay: false });
    });

    it("accumulates two edits in one act against a real setState (same row and across rows)", () => {
        const { result } = renderHook(() => {
            const [rows, setRows] = React.useState<readonly Row[]>(() => [makeRow(0), makeRow(1)]);
            const grid = useSchemaGrid(schema, rows, { onRowsChange: setRows });
            return { grid, rows };
        });
        act(() => {
            result.current.grid.onCellEdited?.([1, 0], {
                kind: GridCellKind.Number,
                data: 42,
                displayData: "42",
                allowOverlay: true,
            } satisfies NumberCell);
            result.current.grid.onCellEdited?.([4, 0], {
                kind: GridCellKind.Boolean,
                data: true,
                allowOverlay: false,
            } satisfies BooleanCell);
            result.current.grid.onCellEdited?.([0, 1], {
                kind: GridCellKind.Text,
                data: "Other",
                displayData: "Other",
                allowOverlay: true,
            } satisfies TextCell);
        });
        expect(result.current.rows[0].cost).toBe(42);
        expect(result.current.rows[0].paid).toBe(true);
        expect(result.current.rows[0].name).toBe("Row 0");
        expect(result.current.rows[1].name).toBe("Other");
    });

    it("changes getCellContent identity and sort order on same-length row replacement", () => {
        const { result, rerender } = renderHook(
            ({ rows }: { rows: readonly Row[] }) => {
                const grid = useSchemaGrid(schema, rows);
                const sorted = useColumnSort({
                    columns: grid.columns,
                    getCellContent: grid.getCellContent,
                    rows: grid.rows,
                    sort: { column: grid.columns[0], direction: "asc", mode: "smart" },
                });
                return { grid, sorted };
            },
            { initialProps: { rows: [makeRow(1), makeRow(0)] } }
        );
        const firstGetter = result.current.grid.getCellContent;
        expect(result.current.sorted.getCellContent([0, 0])).toMatchObject({ data: "Row 0" });
        rerender({
            rows: [
                { ...makeRow(1), name: "ZZZ" },
                { ...makeRow(0), name: "AAA" },
            ],
        });
        expect(result.current.grid.getCellContent).not.toBe(firstGetter);
        expect(result.current.grid.getCellContent([0, 0])).toMatchObject({ data: "ZZZ" });
        expect(result.current.sorted.getCellContent([0, 0])).toMatchObject({ data: "AAA" });
    });

    it("does not show uncommitted edits when the parent keeps its rows", () => {
        const initial = [makeRow(0)];
        const { result } = renderHook(() => useSchemaGrid(schema, initial));
        const before = result.current.getCellContent([0, 0]);
        act(() => {
            result.current.onCellEdited?.([0, 0], {
                kind: GridCellKind.Text,
                data: "Nope",
                displayData: "Nope",
                allowOverlay: true,
            } satisfies TextCell);
        });
        expect(result.current.getCellContent([0, 0])).toEqual(before);
        expect(result.current.getCellContent([0, 0])).toMatchObject({ data: "Row 0" });

        const ignored = vi.fn();
        const { result: controlled } = renderHook(() => useSchemaGrid(schema, initial, { onRowsChange: ignored }));
        act(() => {
            controlled.current.onCellEdited?.([0, 0], {
                kind: GridCellKind.Text,
                data: "Nope",
                displayData: "Nope",
                allowOverlay: true,
            } satisfies TextCell);
        });
        expect(ignored).toHaveBeenCalled();
        expect(controlled.current.getCellContent([0, 0])).toMatchObject({ data: "Row 0" });
    });
});
