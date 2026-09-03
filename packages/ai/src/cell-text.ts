import { type GridCell, GridCellKind } from "tengrids";

/** The human-readable text of any cell — what a person sees, or would copy. */
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
