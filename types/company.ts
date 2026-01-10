/**
 * Represents a company with aggregated shipment data.
 * A company can be an importer, exporter, or both.
 */
export interface Company {
  name: string;
  country: string;
  website: string;
  role: 'importer' | 'exporter' | 'both';
  totalShipments: number;
  totalWeight: number; // in kg
}

/**
 * Extended company information including trading partners and commodities.
 */
export interface CompanyDetail extends Company {
  topTradingPartners: Array<{
    name: string;
    country: string;
    shipments: number;
  }>;
  topCommodities: Array<{
    name: string;
    weight: number; // in kg
  }>;
}

/**
 * Statistics about importers and exporters.
 */
export interface CompanyStats {
  totalImporters: number;
  totalExporters: number;
}

/**
 * Monthly shipment volume statistics.
 */
export interface MonthlyStat {
  month: string; // e.g., "May 2025"
  kg: number;
}

/**
 * Commodity statistics by weight.
 */
export interface CommodityStat {
  commodity: string;
  kg: number;
}

/**
 * Combined dashboard statistics.
 */
export interface DashboardStats {
  companyStats: CompanyStats;
  monthlyVolume: MonthlyStat[];
  topCommodities: CommodityStat[];
}
