import * as React from "react";
import { createPortal } from "react-dom";
import type { FilterClause, FilterOp } from "../filter-spec.js";
import type { FilterField } from "../types.js";
import type { Facet } from "./evaluate.js";
import {
    Chip,
    ChipClear,
    ChipLabel,
    ClearAll,
    ControlInput,
    ControlLabel,
    ControlSelect,
    Count,
    FieldList,
    OptionRow,
    Popover,
    RailRoot,
    TruncatedNote,
} from "./filter-rail-style.js";
import { FILTER_OPS_BY_KIND } from "./ops.js";
import type { UseGridFiltersResult } from "./use-grid-filters.js";
import { clausesForField, useFilterRailState } from "./use-filter-rail-state.js";

let railSeq = 0;
function nextId(prefix: string): string {
    railSeq += 1;
    return `gdg-filter-${prefix}-${railSeq}`;
}

export interface FilterFieldRenderContext {
    readonly close: () => void;
    readonly filters: UseGridFiltersResult;
}

export interface FilterRailProps {
    readonly filters: UseGridFiltersResult;
    readonly renderField?: (field: FilterField, ctx: FilterFieldRenderContext) => React.ReactNode;
}

function portalTarget(): HTMLElement | null {
    if (typeof document === "undefined") return null;
    return document.getElementById("portal");
}

function toDateInput(value: unknown): string {
    if (typeof value === "number" && Number.isFinite(value)) {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "";
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    }
    if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
    return "";
}

function EnumControl(props: { field: FilterField; filters: UseGridFiltersResult }): React.ReactElement {
    const { field, filters } = props;
    const facet = filters.facets.get(field.key);
    const selected = new Set(
        clausesForField(filters.spec.clauses, field).flatMap(c =>
            c.op === "in" && Array.isArray(c.value)
                ? c.value.map(String)
                : c.value !== undefined
                  ? [String(c.value)]
                  : []
        )
    );
    const known = field.values ?? (facet?.kind === "values" ? facet.values.map(v => v.value) : []);
    const counts = new Map(facet?.kind === "values" ? facet.values.map(v => [v.value, v.count] as const) : []);
    const [query, setQuery] = React.useState("");
    const q = query.trim().toLowerCase();
    const shown = q === "" ? known : known.filter(v => (field.labels?.[v] ?? v).toLowerCase().includes(q));
    const showSearch = known.length > 8;

    const toggle = (value: string): void => {
        const next = new Set(selected);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        if (next.size === 0) filters.setClause(field.key, undefined);
        else filters.setClause(field.key, { column: field.key, op: "in", value: [...next] });
    };

    const onListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const boxes = e.currentTarget.querySelectorAll("input[type='checkbox']");
        const i = [...boxes].indexOf(document.activeElement as HTMLInputElement);
        const dir = e.key === "ArrowDown" ? 1 : -1;
        const next = boxes[(i + dir + boxes.length) % boxes.length] as HTMLInputElement | undefined;
        next?.focus();
    };

    return (
        <FieldList>
            {showSearch && (
                <ControlInput
                    type="search"
                    value={query}
                    placeholder="Search"
                    aria-label={`Search ${field.title}`}
                    onChange={e => setQuery(e.target.value)}
                />
            )}
            <div role="group" aria-label={field.title} onKeyDown={onListKeyDown}>
                {shown.map(value => (
                    <OptionRow key={value}>
                        <input
                            type="checkbox"
                            checked={selected.has(value)}
                            onChange={() => toggle(value)}
                            data-testid={`filter-option-${field.key}-${value}`}
                        />
                        <span>{field.labels?.[value] ?? value}</span>
                        <Count>{counts.get(value) ?? 0}</Count>
                    </OptionRow>
                ))}
            </div>
        </FieldList>
    );
}

function RangeControl(props: { field: FilterField; filters: UseGridFiltersResult }): React.ReactElement {
    const { field, filters } = props;
    const clauses = clausesForField(filters.spec.clauses, field);
    const gte = clauses.find(c => c.op === "gte" || c.op === "gt");
    const lte = clauses.find(c => c.op === "lte" || c.op === "lt");
    const facet: Facet | undefined = filters.facets.get(field.key);
    const isDate = field.kind === "date";
    const from = isDate ? toDateInput(gte?.value) : gte?.value === undefined ? "" : String(gte.value);
    const to = isDate ? toDateInput(lte?.value) : lte?.value === undefined ? "" : String(lte.value);
    const phFrom = facet?.kind === "range" ? (isDate ? toDateInput(facet.min) : String(facet.min)) : "";
    const phTo = facet?.kind === "range" ? (isDate ? toDateInput(facet.max) : String(facet.max)) : "";

    const apply = (nextFrom: string, nextTo: string): void => {
        const rest = filters.spec.clauses.filter(c => !clauses.includes(c));
        const added: FilterClause[] = [];
        if (nextFrom !== "") {
            const value = isDate ? nextFrom : Number(nextFrom);
            if (isDate || Number.isFinite(value)) added.push({ column: field.key, op: "gte", value });
        }
        if (nextTo !== "") {
            const value = isDate ? nextTo : Number(nextTo);
            if (isDate || Number.isFinite(value)) added.push({ column: field.key, op: "lte", value });
        }
        filters.setSpec({
            ...(filters.spec.conjunction !== undefined ? { conjunction: filters.spec.conjunction } : {}),
            clauses: [...rest, ...added],
        });
    };

    return (
        <FieldList>
            <ControlLabel>
                From
                <ControlInput
                    type={isDate ? "date" : "number"}
                    value={from}
                    placeholder={phFrom}
                    aria-label={`${field.title} from`}
                    onChange={e => apply(e.target.value, to)}
                />
            </ControlLabel>
            <ControlLabel>
                To
                <ControlInput
                    type={isDate ? "date" : "number"}
                    value={to}
                    placeholder={phTo}
                    aria-label={`${field.title} to`}
                    onChange={e => apply(from, e.target.value)}
                />
            </ControlLabel>
        </FieldList>
    );
}

const TEXT_OPS: readonly FilterOp[] = ["contains", "notContains", "startsWith", "endsWith", "eq", "empty", "notEmpty"];

function TextControl(props: { field: FilterField; filters: UseGridFiltersResult }): React.ReactElement {
    const { field, filters } = props;
    const clause = clausesForField(filters.spec.clauses, field)[0];
    const op: FilterOp = clause?.op !== undefined && TEXT_OPS.includes(clause.op) ? clause.op : "contains";
    const value = clause?.value === undefined ? "" : String(clause.value);
    const allowed = FILTER_OPS_BY_KIND[field.kind];
    const ops = TEXT_OPS.filter(o => allowed.includes(o));

    const apply = (nextOp: FilterOp, nextValue: string): void => {
        if (nextOp === "empty" || nextOp === "notEmpty") {
            filters.setClause(field.key, { column: field.key, op: nextOp });
            return;
        }
        if (nextValue === "") {
            filters.setClause(field.key, undefined);
            return;
        }
        filters.setClause(field.key, { column: field.key, op: nextOp, value: nextValue });
    };

    return (
        <FieldList>
            <ControlLabel>
                Operator
                <ControlSelect
                    value={op}
                    aria-label={`${field.title} operator`}
                    onChange={e => apply(e.target.value as FilterOp, value)}
                >
                    {ops.map(o => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </ControlSelect>
            </ControlLabel>
            {op !== "empty" && op !== "notEmpty" && (
                <ControlInput
                    type="text"
                    value={value}
                    aria-label={`${field.title} value`}
                    onChange={e => apply(op, e.target.value)}
                />
            )}
        </FieldList>
    );
}

function BooleanControl(props: { field: FilterField; filters: UseGridFiltersResult }): React.ReactElement {
    const { field, filters } = props;
    const clause = clausesForField(filters.spec.clauses, field)[0];
    const current =
        clause?.op === "eq" ? (clause.value === true ? "true" : clause.value === false ? "false" : "any") : "any";
    const facet = filters.facets.get(field.key);
    const counts = new Map(facet?.kind === "values" ? facet.values.map(v => [v.value, v.count] as const) : []);

    const set = (v: "true" | "false" | "any"): void => {
        if (v === "any") filters.setClause(field.key, undefined);
        else filters.setClause(field.key, { column: field.key, op: "eq", value: v === "true" });
    };

    return (
        <FieldList role="radiogroup" aria-label={field.title}>
            {(["any", "true", "false"] as const).map(v => (
                <OptionRow key={v}>
                    <input
                        type="radio"
                        name={`gdg-bool-${field.key}`}
                        checked={current === v}
                        onChange={() => set(v)}
                        data-testid={`filter-option-${field.key}-${v}`}
                    />
                    <span>{v}</span>
                    {v !== "any" && <Count>{counts.get(v) ?? 0}</Count>}
                </OptionRow>
            ))}
        </FieldList>
    );
}

function DefaultControl(props: { field: FilterField; filters: UseGridFiltersResult }): React.ReactElement {
    const { field, filters } = props;
    switch (field.kind) {
        case "enum":
            return <EnumControl field={field} filters={filters} />;
        case "number":
        case "date":
            return <RangeControl field={field} filters={filters} />;
        case "boolean":
            return <BooleanControl field={field} filters={filters} />;
        default:
            return <TextControl field={field} filters={filters} />;
    }
}

interface AnchoredPopoverProps {
    readonly anchor: HTMLElement;
    readonly labelledBy: string;
    readonly onClose: () => void;
    readonly children: React.ReactNode;
}

const AnchoredPopover: React.FC<AnchoredPopoverProps> = ({ anchor, labelledBy, onClose, children }) => {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const rect = anchor.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
    };

    React.useEffect(() => {
        const onDoc = (e: MouseEvent): void => {
            const t = e.target;
            if (!(t instanceof Node)) return;
            if (ref.current?.contains(t) === true) return;
            if (anchor.contains(t)) return;
            onClose();
        };
        const onKey = (e: KeyboardEvent): void => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, [anchor, onClose]);

    const node = (
        <Popover ref={ref} role="dialog" aria-labelledby={labelledBy} style={style}>
            {children}
        </Popover>
    );
    const portal = portalTarget();
    if (portal !== null) return createPortal(node, portal);
    return node;
};

export const FilterRail: React.FC<FilterRailProps> = ({ filters, renderField }) => {
    const rail = useFilterRailState(filters);
    const chipRefs = React.useRef(new Map<string, HTMLButtonElement>());
    const [ids] = React.useState(() => {
        const map = new Map<string, { chip: string; dialog: string }>();
        for (const f of filters.fields) {
            map.set(f.key, { chip: nextId("chip"), dialog: nextId("dialog") });
        }
        return map;
    });

    return (
        <RailRoot data-testid="filter-rail">
            {rail.fields.map(field => {
                const id = ids.get(field.key) ?? { chip: field.key, dialog: `${field.key}-dialog` };
                const active = rail.isActive(field.key);
                const summary = rail.summary(field.key);
                const open = rail.openKey === field.key;
                const custom = renderField?.(field, { close: rail.close, filters });
                return (
                    <React.Fragment key={field.key}>
                        <Chip
                            type="button"
                            id={id.chip}
                            data-testid={`filter-chip-${field.key}`}
                            data-active={active ? "true" : "false"}
                            aria-label={field.title}
                            aria-expanded={open}
                            aria-haspopup="dialog"
                            aria-controls={open ? id.dialog : undefined}
                            ref={el => {
                                if (el === null) chipRefs.current.delete(field.key);
                                else chipRefs.current.set(field.key, el);
                            }}
                            onClick={() => rail.toggle(field.key)}
                        >
                            <ChipLabel>{summary ?? field.title}</ChipLabel>
                            {active && (
                                <ChipClear
                                    type="button"
                                    aria-label={`Clear ${field.title}`}
                                    onClick={e => {
                                        e.stopPropagation();
                                        rail.clearField(field.key);
                                    }}
                                >
                                    ×
                                </ChipClear>
                            )}
                        </Chip>
                        {open && chipRefs.current.get(field.key) !== undefined && (
                            <AnchoredPopover
                                anchor={chipRefs.current.get(field.key) as HTMLButtonElement}
                                labelledBy={id.chip}
                                onClose={rail.close}
                            >
                                <div id={id.dialog}>
                                    {custom !== undefined && custom !== null ? (
                                        custom
                                    ) : (
                                        <DefaultControl field={field} filters={filters} />
                                    )}
                                </div>
                            </AnchoredPopover>
                        )}
                    </React.Fragment>
                );
            })}
            {rail.hasActive && (
                <ClearAll type="button" onClick={rail.clearAll} data-testid="filter-clear-all">
                    Clear all
                </ClearAll>
            )}
            {rail.truncated && <TruncatedNote>Showing counts for the first evaluated rows.</TruncatedNote>}
        </RailRoot>
    );
};
