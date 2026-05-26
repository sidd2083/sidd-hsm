import { Layout } from "@/components/layout";
import { useListMyBets, getListMyBetsQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/market-math";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Lock, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

export default function Portfolio() {
  const { data: rawBets, isLoading } = useListMyBets({ query: { queryKey: getListMyBetsQueryKey() } });
  const bets = Array.isArray(rawBets) ? rawBets : [];

  const totalBets = bets.length;
  const wonBets = bets.filter((b) => b.status === "won").length;
  const lostBets = bets.filter((b) => b.status === "lost").length;
  const activeBets = bets.filter((b) => b.status === "active" || b.status === "locked").length;
  const totalStaked = bets.reduce((s, b) => s + (b.amountPaid ?? 0), 0);
  const totalWon = bets.filter((b) => b.status === "won").reduce((s, b) => s + (b.payout ?? 0), 0);
  const netPnl = totalWon - bets.filter((b) => b.status === "won" || b.status === "lost").reduce((s, b) => s + (b.amountPaid ?? 0), 0);
  const winRate = (wonBets + lostBets) > 0 ? Math.round((wonBets / (wonBets + lostBets)) * 100) : 0;

  const STATS = [
    { label: "Total bets", value: totalBets.toString(), icon: BarChart2 },
    { label: "Win rate", value: `${winRate}%`, icon: TrendingUp },
    { label: "Total staked", value: formatCurrency(totalStaked), icon: TrendingDown },
    { label: "Total won back", value: formatCurrency(totalWon), icon: CheckCircle },
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b border-border pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your prediction history and performance</p>
          </div>
          <div className={cn(
            "text-right",
            netPnl >= 0 ? "text-emerald-600" : "text-rose-600"
          )}>
            <p className="text-xs text-muted-foreground">Net P&L</p>
            <p className="text-xl font-bold font-mono">
              {netPnl >= 0 ? "+" : ""}{formatCurrency(netPnl)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="border border-border rounded-xl p-4 space-y-2">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold font-mono">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border grid grid-cols-3 text-xs font-semibold text-muted-foreground">
            <span>Market</span>
            <span className="text-center">Outcome</span>
            <span className="text-right">P&L</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-muted/20" />
              ))}
            </div>
          ) : !bets?.length ? (
            <div className="text-center py-16 text-sm text-muted-foreground">
              <p>No bets yet.</p>
              <p className="mt-1 text-xs">Go to Markets to place your first prediction.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {bets.map((bet) => {
                const isWon = bet.status === "won";
                const isLost = bet.status === "lost";
                const profit = isWon ? (bet.payout ?? 0) - bet.amountPaid : isLost ? -bet.amountPaid : 0;
                return (
                  <div key={bet.id} className="grid grid-cols-3 items-center px-5 py-4 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-medium leading-snug line-clamp-2">{bet.marketQuestion ?? "Market"}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={cn(
                          "text-xs font-bold px-1.5 py-0.5 rounded",
                          bet.type === "YES" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {bet.type}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{formatCurrency(bet.amountPaid)}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      {isWon && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle className="w-3 h-3" /> Won
                        </span>
                      )}
                      {isLost && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                          <TrendingDown className="w-3 h-3" /> Lost
                        </span>
                      )}
                      {bet.status === "active" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                          <Clock className="w-3 h-3" /> Active
                        </span>
                      )}
                      {bet.status === "locked" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      {isWon && (
                        <div>
                          <p className="text-sm font-mono font-semibold text-emerald-600">+{formatCurrency(profit)}</p>
                          <p className="text-xs text-muted-foreground font-mono">{formatCurrency(bet.payout ?? 0)}</p>
                        </div>
                      )}
                      {isLost && (
                        <p className="text-sm font-mono font-semibold text-rose-500">-{formatCurrency(bet.amountPaid)}</p>
                      )}
                      {!isWon && !isLost && (
                        <p className="text-sm font-mono text-muted-foreground">{formatCurrency(bet.amountPaid)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalBets > 0 && (
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="border border-border rounded-lg p-3">
              <p className="text-muted-foreground">Won</p>
              <p className="text-lg font-bold text-emerald-600">{wonBets}</p>
            </div>
            <div className="border border-border rounded-lg p-3">
              <p className="text-muted-foreground">Lost</p>
              <p className="text-lg font-bold text-rose-500">{lostBets}</p>
            </div>
            <div className="border border-border rounded-lg p-3">
              <p className="text-muted-foreground">Active</p>
              <p className="text-lg font-bold text-blue-600">{activeBets}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
