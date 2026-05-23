import { useListMarkets } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { MarketCard } from "@/components/market-card";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { cn } from "@/lib/utils";
import { Flame, Trophy, Clock, Sparkles } from "lucide-react";

const categories = [
  { value: "all", label: "All Markets", icon: Sparkles },
  { value: "sports", label: "Sports", emoji: "⚽" },
  { value: "college", label: "College", emoji: "🏫" },
  { value: "social", label: "Social", emoji: "📱" },
  { value: "national", label: "National", emoji: "🌐" },
];

function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
        active
          ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
          : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-violet-300 hover:bg-violet-50"
      )}
    >
      {children}
    </button>
  );
}

function StatBadge({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-5 py-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

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
      <div className="space-y-10">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-violet-600 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            Virtual Prediction Markets
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            What will happen{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              next?
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Trade on campus events, sports, and trending topics. Start with ₹1,00,000 — no real money, all the excitement.
          </p>
        </section>

        <div className="grid grid-cols-3 gap-3 max-w-lg">
          <StatBadge icon={Flame} label="Active" value={`${activeCount} markets`} color="bg-amber-50 text-amber-600" />
          <StatBadge icon={Trophy} label="Resolved" value={`${resolvedCount} done`} color="bg-emerald-50 text-emerald-600" />
          <StatBadge icon={Clock} label="Daily Bonus" value="₹100 free" color="bg-violet-50 text-violet-600" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <CategoryPill
              key={cat.value}
              active={category === cat.value}
              onClick={() => setCategory(cat.value)}
            >
              {"emoji" in cat ? cat.emoji : <cat.icon className="w-3.5 h-3.5" />}
              {cat.label}
            </CategoryPill>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl shimmer" />
            ))}
          </div>
        ) : markets?.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border/60 rounded-3xl bg-card/50">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold">No markets in this category</h3>
            <p className="text-muted-foreground mt-1 text-sm">Check back soon or explore another category.</p>
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
