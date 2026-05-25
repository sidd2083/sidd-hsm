import { Market } from "@workspace/api-client-react";
import { getMarketStats, formatCurrency } from "@/lib/market-math";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  sports:   { bg: "bg-orange-50",  text: "text-orange-600" },
  college:  { bg: "bg-blue-50",    text: "text-blue-600" },
  social:   { bg: "bg-pink-50",    text: "text-pink-600" },
  national: { bg: "bg-emerald-50", text: "text-emerald-600" },
};

function categoryStyle(cat: string) {
  return CATEGORY_STYLES[cat] ?? { bg: "bg-slate-50", text: "text-slate-600" };
}

export function MarketCard({ market }: { market: Market }) {
  const { totalPool, yesMultiplier, noMultiplier, yesPercentage } = getMarketStats(
    market.yesPool,
    market.noPool
  );

  const noPercentage = 100 - yesPercentage;
  const isLocked = market.status !== "active" || Date.now() >= market.lockTimestamp;
  const isResolved = market.status === "resolved";
  const cat = categoryStyle(market.category);
  const catLabel = market.category.charAt(0).toUpperCase() + market.category.slice(1);

  return (
    <Link href={`/market/${market.id}`}>
      <div className="group bg-white rounded-2xl card-shadow card-shadow-hover cursor-pointer border border-[#E8EAF0] overflow-hidden h-full flex flex-col">
        {/* Status accent bar */}
        {isResolved
          ? <div className="h-0.5 bg-emerald-400" />
          : isLocked
          ? <div className="h-0.5 bg-slate-200" />
          : <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        }

        <div className="p-5 flex flex-col gap-4 flex-1">
          {/* Category + Status */}
          <div className="flex items-center justify-between gap-2">
            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", cat.bg, cat.text)}>
              {catLabel}
            </span>

            {isResolved ? (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Resolved
              </span>
            ) : isLocked ? (
              <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                Locked
              </span>
            ) : (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Live
              </span>
            )}
          </div>

          {/* Question */}
          <p className="text-[15px] font-semibold leading-snug text-gray-800 line-clamp-3 flex-1 group-hover:text-indigo-700 transition-colors duration-150">
            {market.question}
          </p>

          {/* Probability */}
          {isResolved && market.winningOutcome ? (
            <div className={cn(
              "rounded-xl px-4 py-3 text-center",
              market.winningOutcome === "YES" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
            )}>
              <p className={cn("text-2xl font-black", market.winningOutcome === "YES" ? "text-emerald-600" : "text-red-600")}>
                {market.winningOutcome} Won
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Vol {formatCurrency(totalPool)}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-black text-emerald-600">{yesPercentage.toFixed(0)}%</span>
                  <span className="text-xs font-semibold text-emerald-500 ml-1.5">YES</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-red-500 mr-1.5">NO</span>
                  <span className="text-3xl font-black text-red-600">{noPercentage.toFixed(0)}%</span>
                </div>
              </div>

              <div className="relative h-2.5 w-full bg-red-100 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${yesPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-mono border border-emerald-100">
                    {yesMultiplier.toFixed(2)}x
                  </span>
                  <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-mono border border-red-100">
                    {noMultiplier.toFixed(2)}x
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{formatCurrency(totalPool)}</span>
              </div>
            </div>
          )}
        </div>

        {!isResolved && !isLocked && (
          <div className="px-5 py-3 bg-slate-50 border-t border-[#E8EAF0] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Min. Rs. 100</span>
            <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
              Trade now →
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
