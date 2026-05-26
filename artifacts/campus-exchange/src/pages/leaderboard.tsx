import { useGetLeaderboard, GetLeaderboardPeriod, GetLeaderboardSort } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useState } from "react";
import { formatCurrency } from "@/lib/market-math";
import { cn } from "@/lib/utils";
import { Crown, TrendingUp, TrendingDown, Trophy, AlertTriangle } from "lucide-react";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [period, setPeriod] = useState<GetLeaderboardPeriod>("all-time");
  const [sort,   setSort]   = useState<GetLeaderboardSort>("richest");

  const { data: leaderboard, isLoading, isError } = useGetLeaderboard({ period, sort });

  const topThree = leaderboard?.slice(0, 3) ?? [];
  const rest     = leaderboard?.slice(3) ?? [];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 py-2">

        {/* Heading */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Leaderboard</h1>
            <p className="text-base text-gray-400 mt-1.5">Who has the sharpest instincts at HSM?</p>
          </div>
          <Trophy className="w-10 h-10 text-amber-400 shrink-0 mb-1" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 card-shadow">
            {(["daily", "weekly", "all-time"] as GetLeaderboardPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all capitalize",
                  period === p
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                {p === "all-time" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 card-shadow">
            {[
              { value: "richest", label: "💰 Richest" },
              { value: "profit",  label: "📈 Profit"  },
              { value: "loss",    label: "📉 Loss"    },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value as GetLeaderboardSort)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
                  sort === s.value
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl shimmer" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl card-shadow">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-700">Leaderboard unavailable</p>
            <p className="text-base text-gray-400 mt-2">
              The database is being set up. Check back soon.
            </p>
          </div>
        ) : !leaderboard?.length ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl card-shadow">
            <div className="text-5xl mb-4">🏜️</div>
            <p className="text-xl font-bold text-gray-700">No rankings yet</p>
            <p className="text-base text-gray-400 mt-2">Be the first to place a bet!</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {topThree.length >= 3 && (
              <div className="grid grid-cols-3 gap-4">
                {[1, 0, 2].map((dataIdx, podiumIdx) => {
                  const entry = topThree[dataIdx];
                  const rank = dataIdx + 1;
                  const isFirst = rank === 1;
                  return (
                    <div
                      key={entry.uid}
                      className={cn(
                        "flex flex-col items-center rounded-2xl px-3 py-5 text-center border transition-all card-shadow",
                        isFirst
                          ? "bg-gradient-to-b from-amber-50 to-white border-amber-200 ring-2 ring-amber-200/50 -mt-3"
                          : "bg-white border-gray-200"
                      )}
                    >
                      {isFirst && <Crown className="w-5 h-5 text-amber-400 mb-2" />}
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg mb-3 border-2",
                        isFirst  ? "bg-amber-100 text-amber-700 border-amber-200" :
                        rank === 2 ? "bg-slate-100 text-slate-600 border-slate-200" :
                        "bg-orange-100 text-orange-700 border-orange-200"
                      )}>
                        {entry.displayName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate w-full leading-tight">{entry.displayName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate w-full">{entry.academicStream}</p>
                      <p className="text-xl mt-1">{MEDAL[dataIdx]}</p>
                      <p className="font-mono font-black text-sm mt-1.5 text-emerald-600">
                        {formatCurrency(entry.walletBalance)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden card-shadow">
              <div className="divide-y divide-gray-50">
                {leaderboard.map((entry, index) => {
                  const rankColor =
                    index === 0 ? "text-amber-500" :
                    index === 1 ? "text-gray-400"  :
                    index === 2 ? "text-orange-400" : "text-gray-300";
                  return (
                    <div key={entry.uid} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors">
                      <span className={cn("w-7 text-center font-black text-sm font-mono shrink-0", rankColor)}>
                        #{entry.rank || index + 1}
                      </span>

                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {entry.displayName?.[0]?.toUpperCase() ?? "?"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base text-gray-900 truncate">{entry.displayName}</p>
                        <p className="text-sm text-gray-400">{entry.academicStream}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-mono font-black text-base text-gray-900">{formatCurrency(entry.walletBalance)}</p>
                        <div className="flex items-center justify-end gap-3 text-xs mt-0.5">
                          <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                            <TrendingUp className="w-3 h-3" />
                            {formatCurrency(entry.totalProfit)}
                          </span>
                          <span className="flex items-center gap-0.5 text-rose-500 font-semibold">
                            <TrendingDown className="w-3 h-3" />
                            {formatCurrency(entry.totalLoss)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
