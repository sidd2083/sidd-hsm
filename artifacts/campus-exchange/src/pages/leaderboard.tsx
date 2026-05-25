import { useGetLeaderboard, GetLeaderboardPeriod, GetLeaderboardSort } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useState } from "react";
import { formatCurrency } from "@/lib/market-math";
import { cn } from "@/lib/utils";
import { Crown, TrendingUp, TrendingDown } from "lucide-react";

export default function Leaderboard() {
  const [period, setPeriod] = useState<GetLeaderboardPeriod>("all-time");
  const [sort, setSort] = useState<GetLeaderboardSort>("richest");

  const { data: leaderboard, isLoading } = useGetLeaderboard({ period, sort });

  const topThree = leaderboard?.slice(0, 3) ?? [];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-5 py-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Who has the sharpest instincts at HSM?</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {(["daily", "weekly", "all-time"] as GetLeaderboardPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize",
                  period === p
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {p === "all-time" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {[
              { value: "richest", label: "Richest" },
              { value: "profit", label: "Profit" },
              { value: "loss", label: "Loss" },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value as GetLeaderboardSort)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                  sort === s.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl shimmer" />
            ))}
          </div>
        ) : !leaderboard?.length ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl card-shadow">
            <p className="text-3xl mb-2">🏜️</p>
            <p className="text-sm font-semibold text-gray-700">No data yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Be the first to place a bet!</p>
          </div>
        ) : (
          <>
            {topThree.length >= 3 && (
              <div className="grid grid-cols-3 gap-2.5 pb-2">
                {[topThree[1], topThree[0], topThree[2]].map((entry, visualIdx) => {
                  const rank = visualIdx === 0 ? 2 : visualIdx === 1 ? 1 : 3;
                  const idx = rank - 1;
                  const podiumColors = [
                    "border-amber-200 bg-amber-50/50 ring-2 ring-amber-200/50",
                    "border-gray-200 bg-gray-50/50",
                    "border-orange-200 bg-orange-50/50",
                  ];
                  const avatarColors = [
                    "bg-amber-100 text-amber-700 border-amber-200",
                    "bg-gray-100 text-gray-600 border-gray-200",
                    "bg-orange-100 text-orange-700 border-orange-200",
                  ];
                  const rankColors = ["text-amber-500", "text-gray-400", "text-orange-500"];
                  return (
                    <div
                      key={entry.uid}
                      className={cn(
                        "flex flex-col items-center border rounded-2xl p-3.5 text-center card-shadow",
                        podiumColors[idx]
                      )}
                    >
                      {rank === 1 && <Crown className="w-4 h-4 text-amber-400 mb-1.5" />}
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm mb-1.5 border-2",
                        avatarColors[idx]
                      )}>
                        {entry.displayName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <p className="text-xs font-semibold text-gray-800 truncate max-w-full leading-tight">{entry.displayName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-full">{entry.academicStream}</p>
                      <p className={cn("font-mono font-bold text-xs mt-1.5", rankColors[idx])}>#{rank}</p>
                      <p className="font-mono text-[11px] mt-0.5 text-emerald-600 font-semibold">
                        {formatCurrency(entry.walletBalance)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden card-shadow">
              <div className="divide-y divide-gray-50">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.uid}
                    className="flex items-center gap-3.5 px-4 py-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <span className={cn(
                      "w-7 text-center font-bold font-mono text-xs shrink-0",
                      index === 0 ? "text-amber-500" :
                      index === 1 ? "text-gray-400" :
                      index === 2 ? "text-orange-400" :
                      "text-gray-400"
                    )}>
                      #{entry.rank || index + 1}
                    </span>

                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {entry.displayName?.[0]?.toUpperCase() ?? "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{entry.displayName}</p>
                      <p className="text-xs text-gray-400">{entry.academicStream}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-sm text-gray-800">{formatCurrency(entry.walletBalance)}</p>
                      <div className="flex items-center justify-end gap-2 text-[10px] mt-0.5">
                        <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                          <TrendingUp className="w-2.5 h-2.5" />
                          {formatCurrency(entry.totalProfit)}
                        </span>
                        <span className="flex items-center gap-0.5 text-rose-500 font-medium">
                          <TrendingDown className="w-2.5 h-2.5" />
                          {formatCurrency(entry.totalLoss)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
