import { Market, getListMarketsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, getMarketStats } from "@/lib/market-math";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { BetModal } from "./bet-modal";
import { Lock, Clock, CheckCircle, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  sports: { emoji: "⚽", label: "Sports", color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
  college: { emoji: "🏫", label: "College", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  social: { emoji: "📱", label: "Social", color: "text-pink-600", bg: "bg-pink-50 border-pink-100" },
  national: { emoji: "🌐", label: "National", color: "text-green-600", bg: "bg-green-50 border-green-100" },
};

function StatusBadge({ status, isLocked }: { status: string; isLocked: boolean }) {
  if (status === "resolved") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
        <CheckCircle className="w-3 h-3" /> Resolved
      </span>
    );
  }
  if (isLocked) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
        <Lock className="w-3 h-3" /> Locked
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-1 rounded-full">
      <Clock className="w-3 h-3" /> Live
    </span>
  );
}

export function MarketCard({ market }: { market: Market }) {
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [betSide, setBetSide] = useState<"YES" | "NO" | null>(null);
  const { user, signIn } = useAuth();

  const { totalPool, yesMultiplier, noMultiplier, yesPercentage } = getMarketStats(
    market.yesPool,
    market.noPool
  );

  const isLocked = market.status !== "active" || Date.now() >= market.lockTimestamp;
  const isResolved = market.status === "resolved";
  const cat = categoryConfig[market.category] ?? { emoji: "❓", label: market.category, color: "text-gray-600", bg: "bg-gray-50 border-gray-100" };

  const handleBetClick = (side: "YES" | "NO") => {
    if (!user) {
      signIn();
      return;
    }
    setBetSide(side);
    setBetModalOpen(true);
  };

  return (
    <>
      <div className={cn(
        "group flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden card-hover",
        isResolved && "opacity-80"
      )}>
        <div className="p-5 flex-1 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", cat.bg, cat.color)}>
              {cat.emoji} {cat.label}
            </span>
            <StatusBadge status={market.status} isLocked={isLocked} />
          </div>

          <h3 className="font-semibold text-[15px] leading-snug line-clamp-3 text-foreground group-hover:text-violet-700 transition-colors">
            {market.question}
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-600">YES · {yesPercentage.toFixed(1)}%</span>
              <span className="text-rose-600">NO · {(100 - yesPercentage).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-rose-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${yesPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Vol {formatCurrency(totalPool)}
            </span>
            {isResolved && market.winningOutcome && (
              <span className={cn(
                "flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-full",
                market.winningOutcome === "YES"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              )}>
                <CheckCircle className="w-3 h-3" /> Won: {market.winningOutcome}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => handleBetClick("YES")}
            disabled={isLocked}
            className={cn(
              "flex flex-col items-center py-2.5 rounded-xl border text-sm font-bold transition-all",
              isLocked
                ? "bg-muted/50 text-muted-foreground border-border/40 cursor-not-allowed"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25"
            )}
          >
            <span>YES</span>
            <span className="text-xs font-mono opacity-80">{yesMultiplier.toFixed(2)}x</span>
          </button>
          <button
            onClick={() => handleBetClick("NO")}
            disabled={isLocked}
            className={cn(
              "flex flex-col items-center py-2.5 rounded-xl border text-sm font-bold transition-all",
              isLocked
                ? "bg-muted/50 text-muted-foreground border-border/40 cursor-not-allowed"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/25"
            )}
          >
            <span>NO</span>
            <span className="text-xs font-mono opacity-80">{noMultiplier.toFixed(2)}x</span>
          </button>
        </div>

        {!user && !isLocked && (
          <div className="px-5 pb-4 -mt-2">
            <p className="text-center text-xs text-muted-foreground">
              <button onClick={signIn} className="text-violet-600 font-semibold hover:underline">
                Sign in
              </button>{" "}
              to place a bet
            </p>
          </div>
        )}
      </div>

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
