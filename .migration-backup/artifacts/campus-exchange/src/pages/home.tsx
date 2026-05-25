import { useListMarkets } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { MarketCard } from "@/components/market-card";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all",      label: "All" },
  { value: "sports",   label: "Sports" },
  { value: "college",  label: "College" },
  { value: "social",   label: "Social" },
  { value: "national", label: "National" },
];

export default function Home() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const urlCategory = params.get("category") ?? "all";
  const [category, setCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { setCategory(urlCategory); }, [urlCategory]);

  const { data: rawMarkets, isLoading, isError } = useListMarkets(
    category === "all" ? undefined : { category }
  );

  const markets = Array.isArray(rawMarkets) ? rawMarkets : [];

  const filtered = markets.filter(m =>
    searchQuery.trim() === "" ||
    m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount   = markets.filter((m) => m.status === "active").length;
  const resolvedCount = markets.filter((m) => m.status === "resolved").length;

  return (
    <Layout>
      <div className="space-y-7">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Markets</h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              {activeCount} active · {resolvedCount} resolved · Virtual money only
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-[#E8EAF0] text-xs font-semibold text-gray-500 card-shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live now
            </div>
          </div>
        </div>

        {/* Search + Category filters */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 text-sm bg-white border border-[#E8EAF0] rounded-xl outline-none focus:border-indigo-400 transition-colors card-shadow placeholder:text-gray-300 font-medium"
          />
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap transition-all duration-150",
                  category === cat.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-gray-500 border-[#E8EAF0] hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 card-shadow"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Market grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white shimmer" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E8EAF0] card-shadow">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="font-semibold text-gray-700">Markets unavailable right now</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">The database is being set up. Check back soon or contact the admin.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#E8EAF0] card-shadow">
            <p className="text-gray-400 font-semibold">No markets found.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-sm text-indigo-600 font-semibold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered?.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
