import { useListMarkets } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { MarketCard } from "@/components/market-card";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all",      label: "All Markets",  emoji: "🔥" },
  { value: "sports",   label: "Sports",       emoji: "⚽" },
  { value: "college",  label: "College",      emoji: "🏫" },
  { value: "social",   label: "Social",       emoji: "📱" },
  { value: "national", label: "National",     emoji: "🌐" },
];

export default function Home() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const urlCategory = params.get("category") ?? "all";
  const [category, setCategory] = useState(urlCategory);

  useEffect(() => { setCategory(urlCategory); }, [urlCategory]);

  const { data: markets, isLoading } = useListMarkets(
    category === "all" ? undefined : { category }
  );

  const activeCount   = markets?.filter((m) => m.status === "active").length ?? 0;
  const resolvedCount = markets?.filter((m) => m.status === "resolved").length ?? 0;

  return (
    <Layout>
      <div className="space-y-7">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Markets</h1>
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

        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap transition-all duration-150",
                category === cat.value
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                  : "bg-white text-gray-500 border-[#E8EAF0] hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 card-shadow"
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Market grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white shimmer" />
            ))}
          </div>
        ) : markets?.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#E8EAF0] card-shadow">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-medium">No markets in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {markets?.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
