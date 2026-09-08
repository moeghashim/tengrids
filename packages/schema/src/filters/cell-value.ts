import type { GridCell } from "tengrids";
import { GridCellKind } from "tengrids";
import type { FilterField } from "../types.js";

/** Display / compare string for a cell, matching FilterSpec evaluation. */
export function cellText(cell: GridCell): string {
    switch (cell.kind) {
        case GridCellKind.Text:
        case GridCellKind.Number:
        case GridCellKind.Uri:
            return cell.displayData ?? (cell.data === undefined ? "" : String(cell.data));
        case GridCellKind.Markdown:
        case GridCellKind.RowID:
            return cell.data ?? "";
        case GridCellKind.Boolean:
            return cell.data === true ? "true" : cell.data === false ? "false" : "";
        case GridCellKind.Bubble:
        case GridCellKind.Image:
            return cell.data.join(", ");
        case GridCellKind.Drilldown:
            return cell.data.map(d => d.text).join(", ");
        case GridCellKind.Custom:
            return cell.copyData ?? "";
        case GridCellKind.Loading:
        case GridCellKind.Protected:
            return "";
        default:
            return "";
    }
}

export function numericValue(cell: GridCell): number | undefined {
    if (cell.kind === GridCellKind.Number) {
        return typeof cell.data === "number" && !Number.isNaN(cell.data) ? cell.data : undefined;
    }
    if (cell.kind === GridCellKind.Boolean) {
        return cell.data === true ? 1 : cell.data === false ? 0 : undefined;
    }
    const text = cell.kind === GridCellKind.Text || cell.kind === GridCellKind.Uri ? (cell.data ?? "") : cellText(cell);
    if (text === "") return undefined;
    const n = Number(text);
    if (Number.isFinite(n) && text.trim() !== "") return n;
    const t = Date.parse(text);
    return Number.isNaN(t) ? undefined : t;
}

/** Distinct values counted toward a values-facet (bubble items counted separately). */
export function facetStrings(cell: GridCell, field: FilterField): readonly string[] {
    if (cell.kind === GridCellKind.Boolean) {
        if (cell.data === true) return ["true"];
        if (cell.data === false) return ["false"];
        return [""];
    }
    if (cell.kind === GridCellKind.Bubble) {
        return cell.data.length === 0 ? [""] : cell.data;
    }
    if (field.kind === "enum" && field.multiple === true && cell.kind === GridCellKind.Text) {
        return cell.data === "" ? [""] : cell.data.split(",").map(s => s.trim());
    }
    return [cellText(cell)];
}
