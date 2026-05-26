import { useListMarkets } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { MarketCard } from "@/components/market-card";
import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Search, TrendingUp, AlertTriangle } from "lucide-react";

const CATEGORIES = [
  { value: "all",      label: "All" },
  { value: "sports",   label: "⚽ Sports" },
  { value: "college",  label: "🎓 College" },
  { value: "social",   label: "💬 Social" },
  { value: "national", label: "🇮🇳 National" },
];

function SetupBanner() {
  return (
    <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-bold text-amber-800">Database not connected</p>
        <p className="text-sm text-amber-700 mt-0.5">
          The server needs a Firebase service account to load markets. Contact the admin to set it up.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const search = useSearch();
  const [, navigate] = useLocation();
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
      <div className="space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Markets</h1>
            <p className="text-base text-gray-400 mt-1.5 font-medium">
              {isError ? "Database unavailable" : `${activeCount} active · ${resolvedCount} resolved · Virtual money only`}
            </p>
          </div>
          {!isError && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 card-shadow">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Live now
            </div>
          )}
        </div>

        {isError && <SetupBanner />}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
          <input
            type="text"
            placeholder="Search markets…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 text-sm bg-white border border-gray-200 rounded-2xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all card-shadow placeholder:text-gray-300 font-medium"
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap transition-all duration-150",
                category === cat.value
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/60 card-shadow"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Market grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-white shimmer" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 card-shadow">
            <div className="text-5xl mb-4">📡</div>
            <p className="text-xl font-bold text-gray-700">Markets unavailable</p>
            <p className="text-base text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
              The database is being set up. Markets will appear here once the admin connects the server.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              <TrendingUp className="w-4 h-4" /> Sign in to get ready
            </button>
          </div>
        ) : filtered.length === 0 && markets.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 card-shadow">
            <div className="text-5xl mb-4">🏜️</div>
            <p className="text-xl font-bold text-gray-700">No markets yet</p>
            <p className="text-base text-gray-400 mt-2">Markets created by the admin will appear here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 card-shadow">
            <p className="text-xl font-bold text-gray-600">No markets match your search</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-sm text-indigo-600 font-semibold hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
