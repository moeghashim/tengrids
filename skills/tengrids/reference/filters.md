# Filters (`tengrids-schema`)

Faceted filters share a serializable `FilterSpec` with the AI natural-language filter.

```tsx
import { useGridFilters, memoryStore, urlStore, FilterRail } from "tengrids-schema";
import "tengrids-schema/dist/index.css";

const filters = useGridFilters({
    fields: schema.filterFields(),
    columns: grid.columns,
    rows: grid.rows,
    getCellContent: grid.getCellContent,
    store: urlStore({ param: "f" }),
});

<FilterRail filters={filters} />
<DataEditor {...grid} rows={filters.rows} getCellContent={filters.getCellContent} />
```

- Default store: `memoryStore()`. `urlStore` writes `?f=status:in:draft,active&f=cost:gte:100`.
- Facet counts exclude the field's own clause.
- `useNaturalLanguageFilter({ onSpec: filters.setSpec })` makes AI results appear as chips.
- Styling is only `--gdg-*`. Popovers portal into `#portal`.
