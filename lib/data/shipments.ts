import path from "path";
import { DuckDBInstance } from "@duckdb/node-api";
import { Shipment } from "@/types/shipment";
import {
  Company,
  CompanyDetail,
  CompanyStats,
  MonthlyStat,
  CommodityStat,
  DashboardStats
} from "@/types/company";

let instance: DuckDBInstance | null = null;
let tableInitialized = false;

async function getInstance(): Promise<DuckDBInstance> {
  if (!instance) {
    instance = await DuckDBInstance.create(":memory:");
  }
  return instance;
}

/**
 * Loads shipment data with pagination.
 */
export async function loadShipments(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: Shipment[]; total: number }> {
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  const countResult = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM shipments`
  );
  const total = countResult[0]?.total ?? 0;

  const data = await query<Shipment>(`
    SELECT * FROM shipments
    ORDER BY shipment_date DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return { data, total };
}

/**
 * Transform shipment data into company-level aggregates.
 * Combines importers and exporters into single entries where applicable.
 * @param companyName - Optional company name to filter by
 */
export async function transformShipmentsToCompanies(companyName?: string): Promise<Company[]> {
  const escapedCompanyName = companyName ? companyName.replace(/'/g, "''") : null;
  const whereClause = escapedCompanyName ? `WHERE importer_name = '${escapedCompanyName}'` : '';
  const exporterWhereClause = escapedCompanyName ? `WHERE exporter_name = '${escapedCompanyName}'` : '';

  const results = await query<Company>(`
    WITH importer_stats AS (
      SELECT
        importer_name as name,
        importer_country as country,
        importer_website as website,
        COUNT(*) as importer_shipments,
        CAST(SUM(weight_metric_tonnes * 1000) AS DOUBLE) as importer_weight
      FROM shipments
      ${whereClause}
      GROUP BY importer_name, importer_country, importer_website
    ),
    exporter_stats AS (
      SELECT
        exporter_name as name,
        exporter_country as country,
        exporter_website as website,
        COUNT(*) as exporter_shipments,
        CAST(SUM(weight_metric_tonnes * 1000) AS DOUBLE) as exporter_weight
      FROM shipments
      ${exporterWhereClause}
      GROUP BY exporter_name, exporter_country, exporter_website
    )
    SELECT
      COALESCE(i.name, e.name) as name,
      COALESCE(i.country, e.country) as country,
      COALESCE(i.website, e.website) as website,
      CASE
        WHEN i.name IS NOT NULL AND e.name IS NOT NULL THEN 'both'
        WHEN i.name IS NOT NULL THEN 'importer'
        ELSE 'exporter'
      END as role,
      COALESCE(i.importer_shipments, 0) + COALESCE(e.exporter_shipments, 0) as totalShipments,
      COALESCE(i.importer_weight, 0) + COALESCE(e.exporter_weight, 0) as totalWeight
    FROM importer_stats i
    FULL OUTER JOIN exporter_stats e ON i.name = e.name AND i.country = e.country AND i.website = e.website
    ORDER BY totalShipments DESC
  `);

  return results;
}

/**
 * Get a single company by name.
 * @param companyName - The name of the company to retrieve
 * @returns The company object or null if not found
 */
export async function getOneCompany(companyName: string): Promise<Company | null> {
  const companies = await transformShipmentsToCompanies(companyName);
  return companies.length > 0 ? companies[0] : null;
}

/**
 * Get counts of distinct importers and exporters.
 */
export async function getCompanyStats(): Promise<CompanyStats> {
  const results = await query<CompanyStats>(`
    SELECT
      COUNT(DISTINCT importer_name) as totalImporters,
      COUNT(DISTINCT exporter_name) as totalExporters
    FROM shipments
  `);

  return results[0];
}

/**
 * Get monthly shipment volume aggregated by month.
 */
export async function getMonthlyVolume(): Promise<MonthlyStat[]> {
  const results = await query<MonthlyStat>(`
    SELECT
      strftime(shipment_date, '%b %Y') as month,
      CAST(SUM(weight_metric_tonnes * 1000) AS DOUBLE) as kg
    FROM shipments
    GROUP BY strftime(shipment_date, '%b %Y'), strftime(shipment_date, '%Y-%m')
    ORDER BY strftime(shipment_date, '%Y-%m')
  `);

  return results;
}

/**
 * Get top commodities by total weight.
 */
export async function getTopCommodities(limit: number = 5): Promise<CommodityStat[]> {
  const results = await query<CommodityStat>(`
    SELECT
      commodity_name as commodity,
      CAST(SUM(weight_metric_tonnes * 1000) AS DOUBLE) as kg
    FROM shipments
    GROUP BY commodity_name
    ORDER BY kg DESC
    LIMIT ${limit}
  `);

  return results;
}

/**
 * Get combined dashboard statistics.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [companyStats, monthlyVolume, topCommodities] = await Promise.all([
    getCompanyStats(),
    getMonthlyVolume(),
    getTopCommodities(5)
  ]);

  return {
    companyStats,
    monthlyVolume,
    topCommodities
  };
}

/**
 * Get detailed information for a specific company.
 */
export async function getCompanyDetail(companyName: string): Promise<CompanyDetail | null> {
  // First, check if company exists and get basic info
  const company = await getOneCompany(companyName);

  if (!company) {
    return null;
  }

  // Get top trading partners based on company role
  let topTradingPartners: Array<{ name: string; country: string; shipments: number }> = [];

  if (company.role === 'importer' || company.role === 'both') {
    const importerPartners = await query<{ name: string; country: string; shipments: number }>(`
      SELECT
        exporter_name as name,
        exporter_country as country,
        COUNT(*) as shipments
      FROM shipments
      WHERE importer_name = '${companyName.replace(/'/g, "''")}'
      GROUP BY exporter_name, exporter_country
      ORDER BY shipments DESC
      LIMIT 3
    `);
    topTradingPartners = [...importerPartners];
  }

  if (company.role === 'exporter' || company.role === 'both') {
    const exporterPartners = await query<{ name: string; country: string; shipments: number }>(`
      SELECT
        importer_name as name,
        importer_country as country,
        COUNT(*) as shipments
      FROM shipments
      WHERE exporter_name = '${companyName.replace(/'/g, "''")}'
      GROUP BY importer_name, importer_country
      ORDER BY shipments DESC
      LIMIT 3
    `);

    if (company.role === 'both') {
      // Combine and re-sort if company is both importer and exporter
      const combined = [...topTradingPartners, ...exporterPartners];
      const aggregated = new Map<string, { name: string; country: string; shipments: number }>();

      combined.forEach(partner => {
        const existing = aggregated.get(partner.name);
        if (existing) {
          existing.shipments += partner.shipments;
        } else {
          aggregated.set(partner.name, { ...partner });
        }
      });

      topTradingPartners = Array.from(aggregated.values())
        .sort((a, b) => b.shipments - a.shipments)
        .slice(0, 3);
    } else {
      topTradingPartners = exporterPartners;
    }
  }

  // Get top commodities for this company
  const topCommodities = await query<{ name: string; weight: number }>(`
    SELECT
      commodity_name as name,
      CAST(SUM(weight_metric_tonnes * 1000) AS DOUBLE) as weight
    FROM shipments
    WHERE importer_name = '${companyName.replace(/'/g, "''")}'
       OR exporter_name = '${companyName.replace(/'/g, "''")}'
    GROUP BY commodity_name
    ORDER BY weight DESC
    LIMIT 3
  `);

  return {
    ...company,
    topTradingPartners,
    topCommodities
  };
}

/**
 * Initializes the `shipments` table from JSON data.
 * This is called automatically before queries, so you can simply write:
 *
 * ```sql
 * SELECT * FROM shipments
 * ```
 */
async function ensureTableInitialized(): Promise<void> {
  if (tableInitialized) return;

  const db = await getInstance();
  const connection = await db.connect();
  const filePath = path.join(process.cwd(), "data", "shipments.json");

  await connection.run(`
    CREATE TABLE IF NOT EXISTS shipments AS
    SELECT * FROM read_json_auto('${filePath}')
  `);

  connection.closeSync();
  tableInitialized = true;
}

/**
 * Execute a SQL query and return the results as an array of objects.
 * The `shipments` table is automatically available — no need for read_json_auto.
 *
 * Example usage:
 * ```ts
 * const results = await query<{ name: string; total: number }>(`
 *   SELECT importer_name as name, COUNT(*) as total
 *   FROM shipments
 *   GROUP BY importer_name
 * `);
 * ```
 */
export async function query<T>(sql: string): Promise<T[]> {
  await ensureTableInitialized();

  const db = await getInstance();
  const connection = await db.connect();

  const reader = await connection.runAndReadAll(sql);
  const rows = reader.getRowObjectsJson();
  connection.closeSync();

  return rows as unknown as T[];
}
