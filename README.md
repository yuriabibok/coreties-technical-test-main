# Full-Stack Technical Assessment

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deliverables

This implementation transforms shipment customs data into company-level analytics using SQL aggregation with DuckDB. The solution includes:

### Core Features

**Data Transformation & Aggregation**
- SQL-based company aggregation combining importers and exporters into unified company records
- Advanced GROUP BY queries with FULL OUTER JOIN to handle companies operating in both roles
- Efficient use of CTEs (Common Table Expressions) for complex multi-step aggregations
- Date-based aggregations using DuckDB's `strftime()` function for monthly volume tracking

**API Layer**
- RESTful endpoints following Next.js API routes pattern:
  - `GET /api/companies` - Paginated company list with aggregated metrics
  - `GET /api/companies/stats` - Dashboard statistics (importers/exporters count, top commodities, monthly volume)
  - `GET /api/companies/[name]` - Detailed company view with trading partners and commodities

**Frontend Implementation**
- Real-time data fetching using SWR with automatic caching and revalidation
- Interactive master-detail UI pattern with sortable company table
- Data visualization using Recharts for monthly volume trends
- Responsive design with dark mode support using TailwindCSS v4

### Implementation Checklist

- [x] Define `Company` interface in [`types/company.ts`](types/company.ts)
- [x] Implement `transformShipmentsToCompanies()` in [`lib/data/shipments.ts`](lib/data/shipments.ts) using SQL
- [x] Create API endpoint(s) in `pages/api/`
- [x] Wire up "Total Companies" card (count importers/exporters)
- [x] Wire up "Top 5 Commodities" card (aggregate by weight)
- [x] Wire up "Monthly Volume" chart (kg per month)
- [x] Display company list table with real aggregated data
- [x] Implement company detail panel (loads when clicking a company)

---

## What We're Evaluating

- **SQL** - aggregations, GROUP BY, filtering, date functions
- **Full-stack integration** - API design, data flow, frontend state
- **Domain modeling** - how you structure the Company type
- **Code clarity** - readable, maintainable code

---

## Development Notes

### Architecture Decisions

**1. Domain Modeling**
- Created comprehensive type definitions in [`types/company.ts`](types/company.ts):
  - `Company` - Base company with role differentiation (importer/exporter/both)
  - `CompanyDetail` - Extended view with trading partners and commodities
  - `CompanyStats`, `MonthlyStat`, `CommodityStat` - Specialized statistics types
  - `DashboardStats` - Aggregated dashboard data combining multiple metrics

**2. SQL Strategy**
- Used CTEs for readable multi-step aggregations
- FULL OUTER JOIN pattern to merge importer and exporter data into single company records
- Weight conversion from metric tonnes to kg at query level (multiplied by 1000)
- SQL injection protection via proper string escaping

**3. API Design**
- Separated concerns with dedicated endpoints:
  - `/api/companies` for listing (enables future pagination)
  - `/api/companies/stats` for dashboard aggregations (optimized with Promise.all)
  - `/api/companies/[name]` for detail view (dynamic routing)
- Consistent error handling with appropriate HTTP status codes

**4. Frontend Patterns**
- SWR for data fetching provides automatic caching, revalidation, and loading states
- Master-detail pattern with local state management for selected company
- Sortable table with client-side sorting (useMemo optimization)
- Conditional data fetching - detail panel only loads when company selected

### Key Implementation Details

**Data Aggregation** ([lib/data/shipments.ts:52-97](lib/data/shipments.ts#L52-L97))
```sql
WITH importer_stats AS (
  -- Aggregate all shipments where company is the importer
),
exporter_stats AS (
  -- Aggregate all shipments where company is the exporter
)
SELECT ... FROM importer_stats
FULL OUTER JOIN exporter_stats
-- Merge records, calculate totals, determine role
```

**Trading Partners Logic** ([lib/data/shipments.ts:176-235](lib/data/shipments.ts#L176-L235))
- Queries different tables based on company role
- For "both" role: fetches from both perspectives, aggregates, and re-sorts
- Limited to top 3 partners by shipment count

**Monthly Volume Query** ([lib/data/shipments.ts:126-137](lib/data/shipments.ts#L126-L137))
- Uses DuckDB's `strftime()` for date formatting
- Groups by both formatted month ("May 2025") and sortable date ("2025-05")
- Converts metric tonnes to kg in the query

### Technical Highlights

- **Type Safety**: Full TypeScript coverage with generic query helper `query<T>()`
- **Performance**: Parallel data fetching with `Promise.all()` for dashboard stats
- **DX**: Auto-initialization of DuckDB table using singleton pattern
- **UX**: Loading states, error handling, and empty states throughout
- **Numeric Precision**: All weight aggregations use `CAST(SUM(...) AS DOUBLE)` to ensure DuckDB returns JavaScript numbers instead of HUGEINT strings, enabling proper numeric sorting in the UI

---

## Preview Demo

Screenshots and video demo you can find in **demo** folder.

---

## Supplemental Material

### About the Data

~5,000 shipment records in [`data/shipments.json`](data/shipments.json):

```ts
interface Shipment {
  id: string;
  importer_name: string;
  importer_country: string;
  importer_website: string;
  exporter_name: string;
  exporter_country: string;
  exporter_website: string;
  shipment_date: string;        // ISO-8601
  commodity_name: string;
  industry_sector: string;
  weight_metric_tonnes: number;
}
```

### SQL Reference

Data is pre-loaded into a `shipments` table. Use the `query()` helper:

```ts
import { query } from "@/lib/data/shipments";

const results = await query<{ name: string; total: number }>(`
  SELECT importer_name as name, COUNT(*) as total
  FROM shipments
  GROUP BY importer_name
`);
```

DuckDB date functions: [duckdb.org/docs/sql/functions/date](https://duckdb.org/docs/sql/functions/date)

### Context

[Coreties](https://www.coreties.com/) analyzes shipment customs data. A "shipment" = goods moving from an exporter (seller) to an importer (buyer) across countries.
