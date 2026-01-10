import { useState, useMemo } from "react";
import useSWR from "swr";
import Navigation from "@/components/Navigation";
import CompanyDetail from "@/components/CompanyDetail";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Company, DashboardStats } from "@/types/company";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type SortColumn = "name" | "country" | "totalShipments" | "totalWeight";
type SortDirection = "asc" | "desc";

function SortIcon({ column, sortBy, sortDirection }: { column: SortColumn; sortBy: SortColumn; sortDirection: SortDirection }) {
  if (sortBy !== column) {
    return <span className="text-zinc-400 ml-1">↕</span>;
  }
  return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
}

export default function CompaniesPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortColumn>("totalShipments");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Fetch data using SWR
  const { data: stats, error: statsError, isLoading: statsLoading } = useSWR<DashboardStats>(
    "/api/companies/stats",
    fetcher
  );
  const { data: companies, error: companiesError, isLoading: companiesLoading } = useSWR<Company[]>(
    "/api/companies",
    fetcher
  );

  // Sort companies based on current sort settings
  const sortedCompanies = useMemo(() => {
    if (!companies) return [];

    return [...companies].sort((a, b) => {
      let aVal: string | number = a[sortBy];
      let bVal: string | number = b[sortBy];

      // For numeric columns, ensure values are numbers (defensive)
      if (sortBy === "totalWeight" || sortBy === "totalShipments") {
        aVal = typeof aVal === "string" ? parseFloat(aVal) : aVal;
        bVal = typeof bVal === "string" ? parseFloat(bVal) : bVal;
      } else if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [companies, sortBy, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  if (statsLoading || companiesLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-zinc-600 dark:text-zinc-400">Loading companies...</p>
          </div>
        </div>
      </>
    );
  }

  if (statsError || companiesError) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-red-600 dark:text-red-400">
              Error loading data: {statsError?.message || companiesError?.message}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
            Companies Overview
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Total Companies Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                Total Companies
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {stats?.companyStats.totalImporters.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Importers
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {stats?.companyStats.totalExporters.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Exporters
                  </p>
                </div>
              </div>
            </div>

            {/* Top Commodities Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                Top 5 Commodities by Weight
              </h2>
              <div className="space-y-3">
                {stats?.topCommodities.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-zinc-400 dark:text-zinc-600">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-zinc-900 dark:text-zinc-50">
                        {item.commodity}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {(item.kg / 1000).toFixed(0)}k kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly KG Chart */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 mb-8">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6">
              Total Weight Shipped per Month (kg)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="month"
                    stroke="#71717a"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#71717a"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "6px",
                      color: "#fafafa",
                    }}
                    formatter={(value) => [
                      `${Number(value).toLocaleString()} kg`,
                      "Weight",
                    ]}
                  />
                  <Bar dataKey="kg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Master-Detail: Company List + Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company List (Left/Main) */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-lg shadow flex flex-col h-[600px]">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Company List
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Click a company to view details
                </p>
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10">
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th
                        onClick={() => handleSort("name")}
                        className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-50"
                      >
                        Company Name <SortIcon column="name" sortBy={sortBy} sortDirection={sortDirection} />
                      </th>
                      <th
                        onClick={() => handleSort("country")}
                        className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-50"
                      >
                        Country <SortIcon column="country" sortBy={sortBy} sortDirection={sortDirection} />
                      </th>
                      <th
                        onClick={() => handleSort("totalShipments")}
                        className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-50"
                      >
                        Shipments <SortIcon column="totalShipments" sortBy={sortBy} sortDirection={sortDirection} />
                      </th>
                      <th
                        onClick={() => handleSort("totalWeight")}
                        className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-50"
                      >
                        Total Weight <SortIcon column="totalWeight" sortBy={sortBy} sortDirection={sortDirection} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCompanies.map((company, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedCompany(company.name)}
                        className={`border-b border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors ${
                          selectedCompany === company.name
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                          {company.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                          {company.country}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50 text-right">
                          {company.totalShipments.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 text-right">
                          {company.totalWeight.toLocaleString()} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Company Detail Panel (Right) */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow">
              <CompanyDetail companyName={selectedCompany} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
