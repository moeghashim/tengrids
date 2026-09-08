import * as React from "react";
import { act, cleanup, render, renderHook, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GridCellKind, type GridCell, type GridColumn, type Item } from "tengrids";
import type { FilterField } from "../src/index.js";
import { FilterRail, memoryStore, summarizeField, useFilterRailState, useGridFilters } from "../src/index.js";

const fields: FilterField[] = [
    { key: "name", title: "Name", kind: "text" },
    { key: "cost", title: "Cost", kind: "number" },
    { key: "status", title: "Status", kind: "enum", values: ["draft", "active", "closed"] },
    { key: "paid", title: "Paid", kind: "boolean" },
];
const columns: GridColumn[] = fields.map(f => ({ id: f.key, title: f.title, width: 1 }));
const data = [
    { name: "Ada", cost: 10, status: "draft", paid: true },
    { name: "Grace", cost: 20, status: "active", paid: false },
    { name: "Linus", cost: 30, status: "active", paid: true },
    { name: "Mia", cost: 40, status: "closed", paid: false },
];

function getCellContent([col, row]: Item): GridCell {
    const r = data[row];
    if (col === 0) return { kind: GridCellKind.Text, data: r.name, displayData: r.name, allowOverlay: false };
    if (col === 1) return { kind: GridCellKind.Number, data: r.cost, displayData: String(r.cost), allowOverlay: false };
    if (col === 2) return { kind: GridCellKind.Text, data: r.status, displayData: r.status, allowOverlay: false };
    return { kind: GridCellKind.Boolean, data: r.paid, allowOverlay: false };
}

function Harness(props: {
    store?: ReturnType<typeof memoryStore>;
    renderField?: React.ComponentProps<typeof FilterRail>["renderField"];
}) {
    const filters = useGridFilters({
        fields,
        columns,
        rows: data.length,
        getCellContent,
        store: props.store,
    });
    return <FilterRail filters={filters} renderField={props.renderField} />;
}

describe("summarizeField", () => {
    const status = fields[2];
    const cost = fields[1];
    const name = fields[0];
    const paid = fields[3];

    it("returns undefined when inactive", () => {
        expect(summarizeField(status, [])).toBeUndefined();
    });

    it("summarizes in, compares, empty, boolean, and ranges", () => {
        expect(summarizeField(status, [{ column: "status", op: "in", value: ["draft", "active"] }])).toBe(
            "Status: draft, active"
        );
        expect(summarizeField(cost, [{ column: "cost", op: "gte", value: 100 }])).toBe("Cost ≥ 100");
        expect(
            summarizeField(cost, [
                { column: "cost", op: "gte", value: 10 },
                { column: "cost", op: "lte", value: 40 },
            ])
        ).toBe("Cost 10–40");
        expect(summarizeField(name, [{ column: "name", op: "contains", value: "acme" }])).toBe("Name contains acme");
        expect(summarizeField(name, [{ column: "name", op: "empty" }])).toBe("Name is empty");
        expect(summarizeField(paid, [{ column: "paid", op: "eq", value: true }])).toBe("Paid: true");
    });
});

describe("useFilterRailState", () => {
    it("opens, toggles, and clears", () => {
        const { result } = renderHook(() => {
            const filters = useGridFilters({ fields, columns, rows: data.length, getCellContent });
            const rail = useFilterRailState(filters);
            return { filters, rail };
        });
        expect(result.current.rail.openKey).toBeUndefined();
        act(() => result.current.rail.open("status"));
        expect(result.current.rail.openKey).toBe("status");
        act(() => result.current.rail.toggle("status"));
        expect(result.current.rail.openKey).toBeUndefined();
        act(() => result.current.filters.setClause("status", { column: "status", op: "in", value: ["active"] }));
        expect(result.current.rail.isActive("status")).toBe(true);
        expect(result.current.rail.summary("status")).toContain("active");
        act(() => result.current.rail.clearField("status"));
        expect(result.current.rail.isActive("status")).toBe(false);
        act(() => result.current.filters.setClause("paid", { column: "paid", op: "eq", value: true }));
        act(() => result.current.rail.clearAll());
        expect(result.current.rail.hasActive).toBe(false);
    });
});

describe("FilterRail", () => {
    beforeEach(() => {
        const el = document.createElement("div");
        el.id = "portal";
        document.body.appendChild(el);
    });
    afterEach(() => {
        cleanup();
        document.getElementById("portal")?.remove();
    });

    it("renders one chip per field and portals the popover into #portal", async () => {
        render(<Harness />);
        expect(screen.getByTestId("filter-rail")).toBeTruthy();
        expect(screen.getByTestId("filter-chip-status").textContent).toContain("Status");
        await userEvent.click(screen.getByTestId("filter-chip-status"));
        const portal = document.getElementById("portal");
        expect(portal).toBeTruthy();
        expect(within(portal as HTMLElement).getByRole("dialog")).toBeTruthy();
        expect(within(portal as HTMLElement).getByTestId("filter-option-status-active")).toBeTruthy();
    });

    it("checking an enum value filters and shows a summary + clear all", async () => {
        const store = memoryStore();
        render(<Harness store={store} />);
        await userEvent.click(screen.getByTestId("filter-chip-status"));
        await userEvent.click(screen.getByTestId("filter-option-status-active"));
        expect(store.get().clauses).toEqual([{ column: "status", op: "in", value: ["active"] }]);
        expect(screen.getByTestId("filter-chip-status").textContent).toContain("Status: active");
        expect(screen.getByTestId("filter-clear-all")).toBeTruthy();
        await userEvent.click(screen.getByTestId("filter-clear-all"));
        expect(store.get().clauses).toEqual([]);
    });

    it("chip clear button removes only that field", async () => {
        const store = memoryStore({
            clauses: [
                { column: "status", op: "in", value: ["active"] },
                { column: "paid", op: "eq", value: true },
            ],
        });
        render(<Harness store={store} />);
        await userEvent.click(screen.getByLabelText("Clear Status"));
        expect(store.get().clauses).toEqual([{ column: "paid", op: "eq", value: true }]);
    });

    it("text control writes contains clauses", async () => {
        const store = memoryStore();
        render(<Harness store={store} />);
        await userEvent.click(screen.getByTestId("filter-chip-name"));
        const input = screen.getByLabelText("Name value");
        await userEvent.type(input, "Ada");
        expect(store.get().clauses[0]).toMatchObject({ column: "name", op: "contains", value: "Ada" });
    });

    it("number from/to writes gte and lte", async () => {
        const store = memoryStore();
        render(<Harness store={store} />);
        await userEvent.click(screen.getByTestId("filter-chip-cost"));
        await userEvent.type(screen.getByLabelText("Cost from"), "15");
        await userEvent.type(screen.getByLabelText("Cost to"), "35");
        const ops = store.get().clauses.map(c => c.op);
        expect(ops).toContain("gte");
        expect(ops).toContain("lte");
    });

    it("boolean any/true/false", async () => {
        const store = memoryStore();
        render(<Harness store={store} />);
        await userEvent.click(screen.getByTestId("filter-chip-paid"));
        await userEvent.click(screen.getByTestId("filter-option-paid-true"));
        expect(store.get().clauses).toEqual([{ column: "paid", op: "eq", value: true }]);
        await userEvent.click(screen.getByTestId("filter-option-paid-any"));
        expect(store.get().clauses).toEqual([]);
    });

    it("renderField replaces a field's control", async () => {
        render(
            <Harness
                renderField={field =>
                    field.key === "status" ? <div data-testid="custom-status">custom</div> : undefined
                }
            />
        );
        await userEvent.click(screen.getByTestId("filter-chip-status"));
        expect(screen.getByTestId("custom-status")).toBeTruthy();
        expect(screen.queryByTestId("filter-option-status-active")).toBeNull();
    });

    it("renders hostile clause values as text, not HTML", () => {
        const store = memoryStore({
            clauses: [{ column: "name", op: "contains", value: "<img src=x onerror=alert(1)>" }],
        });
        render(<Harness store={store} />);
        const chip = screen.getByTestId("filter-chip-name");
        expect(chip.querySelector("img")).toBeNull();
        expect(chip.querySelector("button")).toBeNull();
        expect(chip.textContent).toContain("<img src=x");
    });

    it("keeps a draft operator until a value is typed", async () => {
        const store = memoryStore();
        render(<Harness store={store} />);
        await userEvent.click(screen.getByTestId("filter-chip-name"));
        await userEvent.selectOptions(screen.getByLabelText("Name operator"), "startsWith");
        expect(store.get().clauses).toEqual([]);
        expect((screen.getByLabelText("Name operator") as HTMLSelectElement).value).toBe("startsWith");
        await userEvent.type(screen.getByLabelText("Name value"), "Ad");
        expect(store.get().clauses[0]).toMatchObject({ column: "name", op: "startsWith", value: "Ad" });
    });

    it("does not write both range bounds under OR", async () => {
        const store = memoryStore({ conjunction: "or", clauses: [] });
        render(<Harness store={store} />);
        await userEvent.click(screen.getByTestId("filter-chip-cost"));
        await userEvent.type(screen.getByLabelText("Cost from"), "10");
        await userEvent.type(screen.getByLabelText("Cost to"), "20");
        const ops = store.get().clauses.map(c => c.op);
        expect(ops).toContain("gte");
        expect(ops).not.toContain("lte");
        expect(store.get().conjunction).toBe("or");
    });
});

describe("FilterRail keyboard (B5)", () => {
    beforeEach(() => {
        const el = document.createElement("div");
        el.id = "portal";
        document.body.appendChild(el);
    });
    afterEach(() => {
        cleanup();
        document.getElementById("portal")?.remove();
    });

    it("tabs between chips, Enter opens, Escape closes, arrows move in the list", async () => {
        render(<Harness />);
        await userEvent.tab();
        expect(document.activeElement).toBe(screen.getByTestId("filter-chip-name"));
        await userEvent.tab();
        expect(document.activeElement).toBe(screen.getByTestId("filter-chip-cost"));
        await userEvent.tab();
        expect(document.activeElement).toBe(screen.getByTestId("filter-chip-status"));
        await userEvent.keyboard("{Enter}");
        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(document.activeElement).toBe(screen.getByTestId("filter-option-status-draft"));
        await userEvent.keyboard("{ArrowDown}");
        expect(document.activeElement).toBe(screen.getByTestId("filter-option-status-active"));
        await userEvent.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(screen.getByTestId("filter-chip-status"));
    });

    it("Space opens a chip and toggles a checkbox without imperative focus", async () => {
        const store = memoryStore();
        render(<Harness store={store} />);
        await userEvent.tab();
        await userEvent.tab();
        await userEvent.tab();
        expect(document.activeElement).toBe(screen.getByTestId("filter-chip-status"));
        await userEvent.keyboard(" ");
        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(document.activeElement).toBe(screen.getByTestId("filter-option-status-draft"));
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard(" ");
        expect(store.get().clauses[0]).toMatchObject({ op: "in", value: ["active"] });
    });
});
