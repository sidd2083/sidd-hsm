import { useListMyBets, useClaimDailyBonus, getGetMeQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { formatCurrency } from "@/lib/market-math";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Lock, Gift, TrendingUp, TrendingDown, Minus } from "lucide-react";

function BetStatusBadge({ status }: { status: string }) {
  if (status === "won") return (
    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
      <CheckCircle className="w-3 h-3" /> Won
    </span>
  );
  if (status === "lost") return (
    <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
      <Minus className="w-3 h-3" /> Lost
    </span>
  );
  if (status === "locked") return (
    <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
      <Lock className="w-3 h-3" /> Locked
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full">
      <Clock className="w-3 h-3" /> Active
    </span>
  );
}

export default function MyBets() {
  const { data: bets, isLoading } = useListMyBets();
  const claimBonus = useClaimDailyBonus();
  const queryClient = useQueryClient();

  const totalStaked = bets?.reduce((sum, b) => sum + b.amountPaid, 0) ?? 0;
  const totalWon = bets?.filter((b) => b.status === "won").reduce((sum, b) => sum + (b.payout ?? 0), 0) ?? 0;
  const wonCount = bets?.filter((b) => b.status === "won").length ?? 0;
  const totalBets = bets?.length ?? 0;

  const handleClaimBonus = () => {
    claimBonus.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`Daily bonus claimed! +${formatCurrency((data as { bonus: number }).bonus ?? 100)} 🎉`);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Already claimed today";
        toast.error(msg);
      },
    });
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-violet-600 font-semibold text-sm">
              <TrendingUp className="w-4 h-4" />
              Your Activity
            </div>
            <h1 className="text-4xl font-bold tracking-tight">My Bets</h1>
          </div>
          <button
            onClick={handleClaimBonus}
            disabled={claimBonus.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-60"
          >
            <Gift className="w-4 h-4" />
            {claimBonus.isPending ? "Claiming..." : "Claim Daily ₹100"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Bets", value: totalBets.toString(), icon: TrendingUp, color: "bg-violet-50 text-violet-600" },
            { label: "Bets Won", value: wonCount.toString(), icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
            { label: "Total Staked", value: formatCurrency(totalStaked), icon: Minus, color: "bg-blue-50 text-blue-600" },
            { label: "Total Won", value: formatCurrency(totalWon), icon: TrendingDown, color: "bg-amber-50 text-amber-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              <p className="font-bold text-sm font-mono">{stat.value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl shimmer" />
            ))}
          </div>
        ) : !bets?.length ? (
          <div className="text-center py-24 border border-dashed border-border/60 rounded-3xl bg-card/50">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-semibold text-lg">No bets yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Head to Markets and place your first prediction!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bets.map((bet) => {
              const profit = (bet.payout ?? 0) - bet.amountPaid;
              const isWon = bet.status === "won";
              const isLost = bet.status === "lost";

              return (
                <div
                  key={bet.id}
                  className={cn(
                    "bg-card border rounded-2xl p-5 transition-all",
                    isWon ? "border-emerald-200 bg-emerald-50/30" :
                    isLost ? "border-rose-200/60 bg-rose-50/20" :
                    "border-border/60 hover:border-violet-200"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm font-semibold leading-snug line-clamp-2">{bet.marketTitle ?? ""}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-full",
                          bet.side === "YES"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        )}>
                          {bet.side}
                        </span>
                        <BetStatusBadge status={bet.status ?? "active"} />
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-xs text-muted-foreground">Staked</p>
                      <p className="font-mono font-bold text-sm">{formatCurrency(bet.amountPaid)}</p>
                      {isWon && bet.payout && (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold justify-end">
                          <TrendingUp className="w-3 h-3" />
                          +{formatCurrency(profit)}
                        </div>
                      )}
                      {isLost && (
                        <div className="flex items-center gap-1 text-rose-500 text-xs font-semibold justify-end">
                          <TrendingDown className="w-3 h-3" />
                          -{formatCurrency(bet.amountPaid)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
