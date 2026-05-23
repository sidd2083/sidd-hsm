import { useGetLeaderboard, GetLeaderboardPeriod, GetLeaderboardSort } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useState } from "react";
import { formatCurrency } from "@/lib/market-math";
import { cn } from "@/lib/utils";
import { Crown, TrendingUp, TrendingDown, Trophy } from "lucide-react";

const medalColors = ["text-amber-400", "text-slate-400", "text-amber-600"];
const medalBg = ["bg-amber-50 border-amber-200", "bg-slate-50 border-slate-200", "bg-amber-50/60 border-amber-100"];

function PeriodTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-semibold rounded-full transition-all",
        active
          ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function SortTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border",
        active
          ? "bg-foreground text-background border-foreground"
          : "border-border/60 text-muted-foreground hover:border-foreground/30"
      )}
    >
      {children}
    </button>
  );
}

export default function Leaderboard() {
  const [period, setPeriod] = useState<GetLeaderboardPeriod>("all-time");
  const [sort, setSort] = useState<GetLeaderboardSort>("richest");

  const { data: leaderboard, isLoading } = useGetLeaderboard({ period, sort });

  const topThree = leaderboard?.slice(0, 3) ?? [];
  const rest = leaderboard?.slice(3) ?? [];

  return (
    <Layout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-violet-600 font-semibold text-sm">
            <Trophy className="w-4 h-4" />
            Rankings
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">Who has the sharpest instincts on campus?</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-1 bg-muted rounded-full p-1">
            <PeriodTab active={period === "daily"} onClick={() => setPeriod("daily")}>Daily</PeriodTab>
            <PeriodTab active={period === "weekly"} onClick={() => setPeriod("weekly")}>Weekly</PeriodTab>
            <PeriodTab active={period === "all-time"} onClick={() => setPeriod("all-time")}>All Time</PeriodTab>
          </div>

          <div className="flex items-center gap-1.5">
            <SortTab active={sort === "richest"} onClick={() => setSort("richest")}>💰 Richest</SortTab>
            <SortTab active={sort === "profit"} onClick={() => setSort("profit")}>📈 Profit</SortTab>
            <SortTab active={sort === "loss"} onClick={() => setSort("loss")}>📉 Loss</SortTab>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl shimmer" />
            ))}
          </div>
        ) : !leaderboard?.length ? (
          <div className="text-center py-20 border border-dashed border-border/60 rounded-3xl">
            <div className="text-4xl mb-3">🏜️</div>
            <h3 className="font-semibold">No data yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Be the first to place a bet!</p>
          </div>
        ) : (
          <>
            {topThree.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[topThree[1], topThree[0], topThree[2]].map((entry, visualIdx) => {
                  const rank = visualIdx === 0 ? 2 : visualIdx === 1 ? 1 : 3;
                  const idx = rank - 1;
                  return (
                    <div
                      key={entry.uid}
                      className={cn(
                        "flex flex-col items-center border rounded-2xl p-4 text-center",
                        rank === 1 ? "ring-2 ring-amber-400/40 bg-amber-50/30" : "bg-card",
                        medalBg[idx]
                      )}
                    >
                      {rank === 1 && <Crown className="w-5 h-5 text-amber-400 mb-1" />}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 border-2",
                        rank === 1 ? "border-amber-400 bg-amber-100 text-amber-700" :
                        rank === 2 ? "border-slate-300 bg-slate-100 text-slate-600" :
                        "border-amber-300 bg-amber-50 text-amber-600"
                      )}>
                        {entry.displayName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <p className="text-sm font-bold truncate max-w-full">{entry.displayName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.academicStream}</p>
                      <p className={cn("font-mono font-bold text-sm mt-2", medalColors[idx])}>
                        #{rank}
                      </p>
                      <p className="font-mono text-xs mt-1 text-emerald-600 font-semibold">
                        {formatCurrency(entry.walletBalance)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.uid}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3.5 bg-card border rounded-2xl transition-all hover:border-violet-200 hover:bg-violet-50/30",
                    index < 3 ? "border-border/40" : "border-border/40"
                  )}
                >
                  <span className={cn(
                    "w-8 text-center font-bold font-mono text-sm shrink-0",
                    index === 0 ? "text-amber-500" :
                    index === 1 ? "text-slate-400" :
                    index === 2 ? "text-amber-600" :
                    "text-muted-foreground"
                  )}>
                    #{entry.rank || index + 1}
                  </span>

                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {entry.displayName?.[0]?.toUpperCase() ?? "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{entry.displayName}</p>
                    <p className="text-xs text-muted-foreground">{entry.academicStream} · Sec {entry.section}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-sm">{formatCurrency(entry.walletBalance)}</p>
                    <div className="flex items-center justify-end gap-2 text-xs mt-0.5">
                      <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {formatCurrency(entry.totalProfit)}
                      </span>
                      <span className="flex items-center gap-0.5 text-rose-500 font-medium">
                        <TrendingDown className="w-3 h-3" />
                        {formatCurrency(entry.totalLoss)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
