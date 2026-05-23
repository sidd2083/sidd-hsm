import { Market, getGetMarketQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrency, getMarketStats } from "@/lib/market-math";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { BetModal } from "./bet-modal";
import { Clock, Lock } from "lucide-react";

export function MarketCard({ market }: { market: Market }) {
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [betSide, setBetSide] = useState<"YES" | "NO" | null>(null);
  const { user } = useAuth();

  const { totalPool, yesMultiplier, noMultiplier, yesPercentage } = getMarketStats(market.yesPool, market.noPool);

  const isLocked = market.status !== "active" || Date.now() >= market.lockTimestamp;

  const handleBetClick = (side: "YES" | "NO") => {
    setBetSide(side);
    setBetModalOpen(true);
  };

  const categoryEmojis: Record<string, string> = {
    "sports": "⚽ Sports",
    "college": "🏫 College",
    "social": "📱 Social",
    "national": "🌐 National"
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md border-border/50 bg-card">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="text-xs uppercase font-medium bg-muted/50">
              {categoryEmojis[market.category] || market.category}
            </Badge>
            {isLocked ? (
              <Badge variant="destructive" className="flex items-center gap-1 font-mono text-xs">
                <Lock className="w-3 h-3" /> Locked
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1 font-mono text-xs bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-500/20">
                <Clock className="w-3 h-3" /> Active
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg leading-tight tracking-tight line-clamp-3">
            {market.question}
          </h3>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span className="text-green-600 font-semibold">YES {yesPercentage.toFixed(1)}%</span>
                <span className="text-red-600 font-semibold">NO {(100 - yesPercentage).toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-red-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-green-500 transition-all duration-500 ease-in-out" 
                  style={{ width: `${yesPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Vol: {formatCurrency(totalPool)}</span>
              {market.status === "resolved" && market.winningOutcome && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  Won: {market.winningOutcome}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 gap-2">
          <Button 
            className="w-full bg-green-500/10 text-green-700 hover:bg-green-500/20 border border-green-500/20 font-mono"
            variant="outline"
            disabled={isLocked || !user}
            onClick={() => handleBetClick("YES")}
          >
            YES {yesMultiplier.toFixed(2)}x
          </Button>
          <Button 
            className="w-full bg-red-500/10 text-red-700 hover:bg-red-500/20 border border-red-500/20 font-mono"
            variant="outline"
            disabled={isLocked || !user}
            onClick={() => handleBetClick("NO")}
          >
            NO {noMultiplier.toFixed(2)}x
          </Button>
        </CardFooter>
      </Card>
      
      {betModalOpen && betSide && (
        <BetModal 
          market={market} 
          side={betSide} 
          open={betModalOpen} 
          onOpenChange={setBetModalOpen} 
        />
      )}
    </>
  );
}
