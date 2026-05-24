import { useListMarkets } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { MarketCard } from "@/components/market-card";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "sports", label: "⚽ Sports" },
  { value: "college", label: "🏫 College" },
  { value: "social", label: "📱 Social" },
  { value: "national", label: "🌐 National" },
];

export default function Home() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const urlCategory = params.get("category") ?? "all";
  const [category, setCategory] = useState(urlCategory);

  useEffect(() => {
    setCategory(urlCategory);
  }, [urlCategory]);

  const { data: markets, isLoading } = useListMarkets(
    category === "all" ? undefined : { category }
  );

  const activeCount = markets?.filter((m) => m.status === "active").length ?? 0;
  const resolvedCount = markets?.filter((m) => m.status === "resolved").length ?? 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Markets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} active · {resolvedCount} resolved
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap",
                category === cat.value
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground bg-background"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : markets?.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-xl">
            <p className="text-muted-foreground">No markets in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {markets?.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
