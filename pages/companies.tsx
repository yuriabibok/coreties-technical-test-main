import { useState } from "react";
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

// TODO: Replace with real data from API
const FAKE_STATS = {
  totalImporters: 150,
  totalExporters: 100,
};

// TODO: Replace with real data from API
const FAKE_MONTHLY_KG = [
  { month: "May 2025", kg: 125000 },
  { month: "Jun 2025", kg: 142000 },
  { month: "Jul 2025", kg: 138000 },
  { month: "Aug 2025", kg: 156000 },
  { month: "Sep 2025", kg: 149000 },
  { month: "Oct 2025", kg: 162000 },
];

// TODO: Replace with real data from API
const FAKE_TOP_COMMODITIES = [
  { commodity: "Electronics", kg: 523000 },
  { commodity: "Textiles", kg: 487000 },
  { commodity: "Machinery", kg: 412000 },
  { commodity: "Chemicals", kg: 389000 },
  { commodity: "Furniture", kg: 267000 },
];

// TODO: Replace with real data from API
const FAKE_COMPANIES = [
  {
    name: "Acme Electronics Ltd",
    country: "United States",
    totalShipments: 127,
    totalWeight: 45230,
  },
  {
    name: "Global Imports Co",
    country: "Germany",
    totalShipments: 98,
    totalWeight: 38100,
  },
  {
    name: "Pacific Trading Inc",
    country: "Japan",
    totalShipments: 84,
    totalWeight: 31500,
  },
  {
    name: "Euro Logistics GmbH",
    country: "Germany",
    totalShipments: 76,
    totalWeight: 28900,
  },
  {
    name: "Atlas Freight Corp",
    country: "United Kingdom",
    totalShipments: 65,
    totalWeight: 24100,
  },
];

export default function CompaniesPage() {
  // TODO: Replace with actual selected company state
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

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
                    {FAKE_STATS.totalImporters.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Importers
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {FAKE_STATS.totalExporters.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Exporters
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  TODO: Wire up with SQL query
                </p>
              </div>
            </div>

            {/* Top Commodities Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                Top 5 Commodities by Weight
              </h2>
              <div className="space-y-3">
                {FAKE_TOP_COMMODITIES.map((item, idx) => (
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
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  TODO: Wire up with SQL query
                </p>
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
                <BarChart data={FAKE_MONTHLY_KG}>
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
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                TODO: Wire up with SQL query
              </p>
            </div>
          </div>

          {/* Master-Detail: Company List + Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company List (Left/Main) */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-lg shadow">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Company List
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Click a company to view details
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Company Name
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Country
                      </th>
                      <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Shipments
                      </th>
                      <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Total Weight
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FAKE_COMPANIES.map((company, idx) => (
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
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  TODO: Fetch from API
                </p>
              </div>
            </div>

            {/* Company Detail Panel (Right) */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow">
              <CompanyDetail />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
