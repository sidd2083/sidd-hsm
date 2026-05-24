import { Market } from "@workspace/api-client-react";
import { getMarketStats, formatCurrency } from "@/lib/market-math";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  sports: "⚽ Sports",
  college: "🏫 College",
  social: "📱 Social",
  national: "🌐 National",
};

export function MarketCard({ market }: { market: Market }) {
  const { totalPool, yesMultiplier, noMultiplier, yesPercentage } = getMarketStats(
    market.yesPool,
    market.noPool
  );

  const isLocked = market.status !== "active" || Date.now() >= market.lockTimestamp;
  const isResolved = market.status === "resolved";

  return (
    <Link href={`/market/${market.id}`}>
      <div className="group block border border-border rounded-xl bg-background hover:border-foreground/30 hover:shadow-sm transition-all cursor-pointer h-full">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {CATEGORY_LABELS[market.category] ?? market.category}
            </span>
            {isResolved ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle className="w-3 h-3" />
                Resolved
              </span>
            ) : isLocked ? (
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            ) : (
              <span className="text-xs font-medium text-blue-600">Live</span>
            )}
          </div>

          <p className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-foreground">
            {market.question}
          </p>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-600">YES {yesPercentage.toFixed(0)}%</span>
              <span className="text-rose-600">NO {(100 - yesPercentage).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-rose-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${yesPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              Vol {formatCurrency(totalPool)}
            </span>
            <div className="flex items-center gap-2 text-xs">
              {!isResolved && !isLocked && (
                <>
                  <span className="text-emerald-600 font-mono font-medium">{yesMultiplier.toFixed(2)}x</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-rose-600 font-mono font-medium">{noMultiplier.toFixed(2)}x</span>
                </>
              )}
              {isResolved && market.winningOutcome && (
                <span className={cn(
                  "font-semibold text-xs",
                  market.winningOutcome === "YES" ? "text-emerald-600" : "text-rose-600"
                )}>
                  {market.winningOutcome} won
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
