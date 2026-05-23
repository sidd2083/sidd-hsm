import { useListMarkets } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { MarketCard } from "@/components/market-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [category, setCategory] = useState<string>("all");
  
  const { data: markets, isLoading } = useListMarkets(
    category === "all" ? undefined : { category }
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-sans">Markets</h1>
            <p className="text-muted-foreground mt-1">Bet on campus and real-world events.</p>
          </div>
          <Tabs value={category} onValueChange={setCategory} className="w-full md:w-auto overflow-x-auto pb-2">
            <TabsList className="h-10 inline-flex w-max">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sports">⚽ Sports</TabsTrigger>
              <TabsTrigger value="college">🏫 College</TabsTrigger>
              <TabsTrigger value="social">📱 Social</TabsTrigger>
              <TabsTrigger value="national">🌐 National</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[200px] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : markets?.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-card border-dashed">
            <h3 className="text-lg font-medium text-foreground">No markets found</h3>
            <p className="text-muted-foreground mt-1">Check back later for new events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets?.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
