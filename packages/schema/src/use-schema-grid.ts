import * as React from "react";
import type { CellArray, DataEditorProps, EditableGridCell, GridCell, Item, Rectangle } from "tengrids";
import { GridCellKind } from "tengrids";
import type { ColumnDef, GridSchema, InferRow } from "./types.js";

export interface UseSchemaGridOptions<R> {
    readonly onRowsChange?: (rows: readonly R[]) => void;
    readonly onRowChange?: (index: number, row: R) => void;
    readonly readonly?: boolean;
}

const LOADING: GridCell = { kind: GridCellKind.Loading, allowOverlay: false };

function freezeCell(cell: GridCell): GridCell {
    switch (cell.kind) {
        case GridCellKind.Loading:
        case GridCellKind.Protected:
            return cell;
        case GridCellKind.Boolean:
            return { ...cell, readonly: true, allowOverlay: false };
        case GridCellKind.Bubble:
        case GridCellKind.Drilldown:
            return { ...cell, allowOverlay: false };
        default:
            return { ...cell, readonly: true, allowOverlay: false };
    }
}

export function useSchemaGrid<S extends { readonly [K in keyof S]: ColumnDef }>(
    schema: GridSchema<S>,
    rows: readonly InferRow<GridSchema<S>>[],
    options: UseSchemaGridOptions<InferRow<GridSchema<S>>> = {}
): Pick<DataEditorProps, "columns" | "rows" | "getCellContent" | "onCellEdited" | "getCellsForSelection"> {
    type Row = InferRow<GridSchema<S>>;
    const { onRowsChange, onRowChange, readonly } = options;
    const columns = React.useMemo(() => schema.columns(), [schema]);

    const rowsRef = React.useRef(rows);
    const pendingRef = React.useRef<Row[] | undefined>(undefined);
    if (pendingRef.current !== undefined && rows === pendingRef.current) {
        rowsRef.current = pendingRef.current;
    } else {
        rowsRef.current = rows;
        pendingRef.current = undefined;
    }

    const getCellContent = React.useCallback(
        ([col, row]: Item): GridCell => {
            const current = (pendingRef.current ?? rowsRef.current)[row];
            if (current === undefined) return LOADING;
            const cell = schema.toCell(current, col);
            return readonly === true ? freezeCell(cell) : cell;
        },
        [schema, readonly]
    );

    const onCellEdited = React.useCallback(
        (cell: Item, newVal: EditableGridCell): void => {
            if (readonly === true) return;
            const [, row] = cell;
            const currentRows = pendingRef.current ?? rowsRef.current;
            const current = currentRows[row];
            if (current === undefined) return;
            const key = schema.keys[cell[0]];
            if (key === undefined) return;
            const next = schema.applyEdit(current, key, newVal);
            if (next === undefined) return;
            onRowChange?.(row, next);
            const copy = currentRows.slice();
            copy[row] = next;
            pendingRef.current = copy;
            rowsRef.current = copy;
            onRowsChange?.(copy);
        },
        [schema, readonly, onRowsChange, onRowChange]
    );

    const getCellsForSelection = React.useCallback(
        (selection: Rectangle): CellArray => {
            const result: GridCell[][] = [];
            for (let y = selection.y; y < selection.y + selection.height; y++) {
                const line: GridCell[] = [];
                for (let x = selection.x; x < selection.x + selection.width; x++) {
                    line.push(getCellContent([x, y]));
                }
                result.push(line);
            }
            return result;
        },
        [getCellContent]
    );

    return {
        columns,
        rows: rows.length,
        getCellContent,
        onCellEdited,
        getCellsForSelection,
    };
}
