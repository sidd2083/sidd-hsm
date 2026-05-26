import { Market } from "@workspace/api-client-react";
import { getMarketStats, formatCurrency } from "@/lib/market-math";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  sports:   { bg: "bg-orange-50",  text: "text-orange-600",  dot: "bg-orange-400" },
  college:  { bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-400" },
  social:   { bg: "bg-pink-50",    text: "text-pink-600",    dot: "bg-pink-400" },
  national: { bg: "bg-violet-50",  text: "text-violet-600",  dot: "bg-violet-400" },
};

function categoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
}

export function MarketCard({ market }: { market: Market }) {
  const { totalPool, yesMultiplier, noMultiplier, yesPercentage } = getMarketStats(
    market.yesPool,
    market.noPool
  );

  const noPercentage = 100 - yesPercentage;
  const closesAtMs = market.closesAt ? new Date(market.closesAt).getTime() : Infinity;
  const isLocked = market.status !== "open" || Date.now() >= closesAtMs;
  const isResolved = market.status === "resolved";
  const config = categoryConfig(market.category);
  const catLabel = market.category.charAt(0).toUpperCase() + market.category.slice(1);

  return (
    <Link href={`/market/${market.id}`}>
      <div className="group bg-white rounded-2xl cursor-pointer border border-gray-200/80 overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/8 hover:-translate-y-0.5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        {/* Top accent */}
        <div className={cn("h-[3px]",
          isResolved ? "bg-emerald-400" :
          isLocked   ? "bg-gray-200" :
          "bg-gradient-to-r from-indigo-500 to-purple-500"
        )} />

        <div className="p-5 flex flex-col gap-4 flex-1">
          {/* Category + Status */}
          <div className="flex items-center justify-between gap-2">
            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide", config.bg, config.text)}>
              {catLabel}
            </span>

            {isResolved ? (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Resolved ✓
              </span>
            ) : isLocked ? (
              <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                Locked
              </span>
            ) : (
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Live
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-[15px] font-semibold leading-snug text-gray-800 line-clamp-3 flex-1 group-hover:text-indigo-700 transition-colors duration-150">
            {market.title}
          </p>

          {/* Probability / Result */}
          {isResolved && market.outcome ? (
            <div className={cn(
              "rounded-xl px-4 py-3.5 text-center",
              market.outcome === "YES" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
            )}>
              <p className={cn("text-2xl font-black tracking-tight", market.outcome === "YES" ? "text-emerald-600" : "text-red-500")}>
                {market.outcome === "YES" ? "YES Won" : "NO Won"}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">Volume {formatCurrency(totalPool)}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* YES/NO percentages */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[28px] font-black text-emerald-500 leading-none">{yesPercentage.toFixed(0)}%</span>
                  <span className="text-[11px] font-bold text-emerald-500 ml-1.5 uppercase tracking-wide">Yes</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-red-400 mr-1.5 uppercase tracking-wide">No</span>
                  <span className="text-[28px] font-black text-red-400 leading-none">{noPercentage.toFixed(0)}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 w-full bg-red-100 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${yesPercentage}%` }}
                />
              </div>

              {/* Multipliers + Volume */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg font-mono border border-emerald-100">
                    {yesMultiplier.toFixed(2)}x
                  </span>
                  <span className="text-[12px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg font-mono border border-red-100">
                    {noMultiplier.toFixed(2)}x
                  </span>
                </div>
                <span className="text-[12px] text-gray-400 font-medium">{formatCurrency(totalPool)}</span>
              </div>
            </div>
          )}
        </div>

        {!isResolved && !isLocked && (
          <div className="px-5 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[12px] text-gray-400 font-medium">Min. ₹100</span>
            <span className="text-[12px] font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
              Trade now →
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
