// TODO: Replace with real data from API (filtered by selected company)
const FAKE_COMPANY_DETAIL = {
  name: "Acme Electronics Ltd",
  country: "United States",
  website: "https://acme-electronics.example.com",
  totalShipments: 127,
  totalWeight: 45230,
  topTradingPartners: [
    { name: "Shanghai Electronics Co", country: "China", shipments: 34 },
    { name: "Tokyo Components Ltd", country: "Japan", shipments: 28 },
    { name: "Shenzhen Tech Inc", country: "China", shipments: 22 },
  ],
  topCommodities: [
    { name: "Semiconductors", weight: 18500 },
    { name: "Circuit Boards", weight: 12300 },
    { name: "Display Panels", weight: 8400 },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CompanyDetailProps {
  // TODO: pass parameters as suitable
}

export default function CompanyDetail({ }: CompanyDetailProps) {

  // TODO: Fetch real data based on companyName
  const detail = FAKE_COMPANY_DETAIL;

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        {detail.name}
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        {detail.country}
      </p>
      <a
        href={detail.website}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6 block"
      >
        {detail.website}
      </a>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {detail.totalShipments}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Shipments</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {(detail.totalWeight / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">kg Total</p>
        </div>
      </div>

      {/* Top Trading Partners */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
          Top Trading Partners
        </h3>
        <div className="space-y-2">
          {detail.topTradingPartners.map((partner, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <span className="text-zinc-900 dark:text-zinc-50">
                  {partner.name}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 ml-2">
                  {partner.country}
                </span>
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">
                {partner.shipments}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Commodities */}
      <div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
          Top Commodities
        </h3>
        <div className="space-y-2">
          {detail.topCommodities.map((commodity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-900 dark:text-zinc-50">
                {commodity.name}
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {(commodity.weight / 1000).toFixed(1)}k kg
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          TODO: Fetch real data for selected company
        </p>
      </div>
    </div>
  );
}
