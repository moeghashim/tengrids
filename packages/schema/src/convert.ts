import {
    BooleanIndeterminate,
    type GridCell,
    GridCellKind,
    type ImageCell,
    type NumberCell,
    type TextCell,
} from "tengrids";
import type { ColumnDef, DateFormat, NumberFormat } from "./types.js";

export const REJECT = Symbol("reject");
export type Reject = typeof REJECT;

function readRaw(def: ColumnDef, row: object, key: string): unknown {
    if (def.accessor !== undefined) return def.accessor(row as never);
    return (row as Record<string, unknown>)[key];
}

function asString(value: unknown): string {
    if (value === undefined || value === null) return "";
    return String(value);
}

function formatNumber(
    n: number,
    format: NumberFormat | undefined,
    currency: string | undefined,
    decimals: number | undefined
): string {
    if (format === "currency") {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency ?? "USD",
            ...(decimals !== undefined ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals } : {}),
        }).format(n);
    }
    if (format === "percent") {
        return new Intl.NumberFormat(undefined, {
            style: "percent",
            ...(decimals !== undefined ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals } : {}),
        }).format(n);
    }
    if (format === "integer") {
        return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(n));
    }
    if (decimals !== undefined) return n.toFixed(decimals);
    return String(n);
}

function pad2(n: number): string {
    return n < 10 ? `0${n}` : String(n);
}

function isoDate(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDateDisplay(d: Date, format: DateFormat | undefined, timeZone: string | undefined): string {
    if (format === "relative") {
        const sec = Math.round((d.getTime() - Date.now()) / 1000);
        const abs = Math.abs(sec);
        const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
        if (abs < 60) return rtf.format(Math.round(sec), "second");
        if (abs < 3600) return rtf.format(Math.round(sec / 60), "minute");
        if (abs < 86_400) return rtf.format(Math.round(sec / 3600), "hour");
        if (abs < 86_400 * 30) return rtf.format(Math.round(sec / 86_400), "day");
        if (abs < 86_400 * 365) return rtf.format(Math.round(sec / (86_400 * 30)), "month");
        return rtf.format(Math.round(sec / (86_400 * 365)), "year");
    }
    const opts: Intl.DateTimeFormatOptions =
        format === "datetime" ? { dateStyle: "short", timeStyle: "short", timeZone } : { dateStyle: "short", timeZone };
    return new Intl.DateTimeFormat(undefined, opts).format(d);
}

function isDate(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime());
}

function overlay(readonly: boolean | undefined): boolean {
    return readonly !== true;
}

export function valueToCell(def: ColumnDef, row: object, key: string): GridCell {
    const readonly = def.readonly;
    const value = readRaw(def, row, key);
    switch (def.kind) {
        case "text": {
            const data = asString(value);
            const cell: TextCell = {
                kind: GridCellKind.Text,
                data,
                displayData: data,
                allowOverlay: overlay(readonly),
                readonly,
                allowWrapping: def.multiline === true,
            };
            return cell;
        }
        case "number": {
            const n = typeof value === "number" && !Number.isNaN(value) ? value : undefined;
            const format = def.format as NumberFormat | undefined;
            const cell: NumberCell = {
                kind: GridCellKind.Number,
                data: n,
                displayData: n === undefined ? "" : formatNumber(n, format, def.currency, def.decimals),
                allowOverlay: overlay(readonly),
                readonly,
                fixedDecimals: format === "integer" ? 0 : def.decimals,
                allowNegative: def.min === undefined || def.min < 0,
            };
            return cell;
        }
        case "boolean": {
            let data: boolean | typeof BooleanIndeterminate = false;
            if (value === true || value === false) data = value;
            else if (def.allowIndeterminate === true) data = BooleanIndeterminate;
            return {
                kind: GridCellKind.Boolean,
                data,
                allowOverlay: false,
                readonly,
            };
        }
        case "date": {
            const d = isDate(value) ? value : undefined;
            const format = (def.format as DateFormat | undefined) ?? "date";
            const data = d === undefined ? "" : format === "datetime" ? d.toISOString() : isoDate(d);
            const displayData = d === undefined ? "" : formatDateDisplay(d, format, def.timeZone);
            return {
                kind: GridCellKind.Text,
                data,
                displayData,
                allowOverlay: overlay(readonly),
                readonly,
            };
        }
        case "enum": {
            const labels = def.labels;
            if (def.multiple === true) {
                const list = Array.isArray(value) ? (value as readonly string[]) : [];
                return {
                    kind: GridCellKind.Bubble,
                    data: [...list],
                    allowOverlay: overlay(readonly),
                };
            }
            const raw = asString(value);
            const display = labels?.[raw] ?? raw;
            return {
                kind: GridCellKind.Text,
                data: raw,
                displayData: display,
                allowOverlay: overlay(readonly),
                readonly,
            };
        }
        case "uri": {
            const data = asString(value);
            return {
                kind: GridCellKind.Uri,
                data,
                displayData: data,
                allowOverlay: overlay(readonly),
                readonly,
                hoverEffect: def.hoverEffect ?? (def.displayAsLink === true ? true : undefined),
            };
        }
        case "image": {
            const list = Array.isArray(value) ? (value as readonly string[]) : [];
            const cell: ImageCell = {
                kind: GridCellKind.Image,
                data: [...list],
                allowOverlay: overlay(readonly),
                readonly,
                rounding: def.rounding,
            };
            return cell;
        }
        case "markdown":
            return {
                kind: GridCellKind.Markdown,
                data: asString(value),
                allowOverlay: overlay(readonly),
                readonly,
            };
        case "custom": {
            if (def.toCell === undefined) {
                return { kind: GridCellKind.Loading, allowOverlay: false };
            }
            const cell = def.toCell(value as never, row as never);
            if (readonly === true && cell.kind !== GridCellKind.Loading && cell.kind !== GridCellKind.Protected) {
                if (cell.kind === GridCellKind.Boolean) return { ...cell, readonly: true, allowOverlay: false };
                if (cell.kind === GridCellKind.Bubble || cell.kind === GridCellKind.Drilldown) {
                    return { ...cell, allowOverlay: false };
                }
                return { ...cell, readonly: true, allowOverlay: false };
            }
            return cell;
        }
        default:
            return { kind: GridCellKind.Loading, allowOverlay: false };
    }
}

function cellText(cell: GridCell): string {
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

function parseDate(text: string): Date | undefined | Reject {
    const s = text.trim();
    if (s === "") return undefined;
    const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (isoDateOnly !== null) {
        const year = Number(isoDateOnly[1]);
        const month = Number(isoDateOnly[2]);
        const day = Number(isoDateOnly[3]);
        if (month < 1 || month > 12 || day < 1 || day > 31) return REJECT;
        const d = new Date(0);
        d.setFullYear(year, month - 1, day);
        d.setHours(0, 0, 0, 0);
        if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return REJECT;
        return d;
    }
    const t = Date.parse(s);
    if (Number.isNaN(t)) return REJECT;
    return new Date(t);
}

function normalizeUri(text: string): string | Reject {
    const s = text.trim();
    if (s === "") return "";
    if (/^(javascript|data|vbscript|file):/i.test(s)) return REJECT;
    if (/^https?:\/\//i.test(s) || /^(mailto|tel):/i.test(s)) return s;
    if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(s)) return `https://${s}`;
    if (/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(s)) return `mailto:${s}`;
    return REJECT;
}

function coerceNumber(cell: GridCell, min: number | undefined, max: number | undefined): number | Reject {
    let n: number | undefined;
    if (cell.kind === GridCellKind.Number) {
        n = cell.data;
        if (n === undefined) {
            const raw = cell.displayData?.trim() ?? "";
            if (raw === "") return REJECT;
            const parsed = Number(raw);
            n = Number.isNaN(parsed) ? undefined : parsed;
        }
    } else {
        const raw = cellText(cell).trim();
        if (raw === "") return REJECT;
        const parsed = Number(raw);
        n = Number.isNaN(parsed) ? undefined : parsed;
    }
    if (n === undefined || Number.isNaN(n)) return REJECT;
    if (min !== undefined && n < min) return REJECT;
    if (max !== undefined && n > max) return REJECT;
    return n;
}

export function cellToValue(def: ColumnDef, cell: GridCell, row: object, key: string): unknown | Reject {
    switch (def.kind) {
        case "text": {
            const s = (cell.kind === GridCellKind.Text ? cell.data : cellText(cell)).trim();
            if (def.maxLength !== undefined && s.length > def.maxLength) return REJECT;
            return s;
        }
        case "number":
            return coerceNumber(cell, def.min, def.max);
        case "boolean": {
            if (cell.kind === GridCellKind.Boolean) {
                if (cell.data === true || cell.data === false) return cell.data;
                if (def.allowIndeterminate === true) return undefined;
                return REJECT;
            }
            const s = cellText(cell).trim().toLowerCase();
            if (s === "true" || s === "yes" || s === "1") return true;
            if (s === "false" || s === "no" || s === "0") return false;
            if (def.allowIndeterminate === true && s === "") return undefined;
            return REJECT;
        }
        case "date": {
            if (
                cell.kind === GridCellKind.Text ||
                cell.kind === GridCellKind.Uri ||
                cell.kind === GridCellKind.Markdown
            ) {
                return parseDate(cell.kind === GridCellKind.Markdown ? cell.data : cell.data);
            }
            return parseDate(cellText(cell));
        }
        case "enum": {
            const values = def.values ?? [];
            if (def.multiple === true) {
                const parts =
                    cell.kind === GridCellKind.Bubble
                        ? [...cell.data]
                        : cellText(cell)
                              .split(",")
                              .map(p => p.trim())
                              .filter(p => p !== "");
                if (parts.some(p => !values.includes(p))) return REJECT;
                return parts;
            }
            const v = (cell.kind === GridCellKind.Text ? cell.data : cellText(cell)).trim();
            if (!values.includes(v)) return REJECT;
            return v;
        }
        case "uri": {
            const raw = cell.kind === GridCellKind.Uri ? cell.data : cellText(cell);
            return normalizeUri(raw);
        }
        case "image": {
            const next =
                cell.kind === GridCellKind.Image
                    ? cell.data
                    : cellText(cell)
                          .split(/[\s,;]+/)
                          .map(p => p.trim())
                          .filter(p => p !== "");
            if (def.allowAdd === false) {
                const prev = readRaw(def, row, key);
                const prevLen = Array.isArray(prev) ? prev.length : 0;
                if (next.length > prevLen) return REJECT;
            }
            return next;
        }
        case "markdown":
            return cell.kind === GridCellKind.Markdown ? cell.data : cellText(cell);
        case "custom": {
            if (def.fromCell === undefined) return REJECT;
            const next = def.fromCell(cell, row as never);
            if (next === undefined) return REJECT;
            return next;
        }
        default:
            return REJECT;
    }
}
