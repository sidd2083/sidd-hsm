import { Layout } from "@/components/layout";
import {
  useGetMe,
  useListMyBets,
  useClaimDailyBonus,
  getGetMeQueryKey,
  getListMyBetsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/market-math";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Gift } from "lucide-react";

export default function Wallet() {
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: bets, isLoading: betsLoading } = useListMyBets({ query: { queryKey: getListMyBetsQueryKey() } });
  const claimBonus = useClaimDailyBonus();

  const totalStaked = bets?.reduce((s, b) => s + b.amountPaid, 0) ?? 0;
  const totalWon = bets?.filter((b) => b.status === "won").reduce((s, b) => s + (b.payout ?? 0), 0) ?? 0;

  const handleClaimBonus = () => {
    claimBonus.mutate(undefined, {
      onSuccess: (data) => {
        if (data.claimed) {
          toast.success(`+${formatCurrency(data.bonus ?? 100)} daily bonus! 🎉`);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        } else {
          toast.info("Already claimed today. Come back tomorrow!");
        }
      },
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold">Wallet</h1>
        </div>

        <div className="border border-border rounded-xl p-6 space-y-1">
          <p className="text-sm text-muted-foreground">Available balance</p>
          {isLoading ? (
            <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          ) : (
            <p className="text-4xl font-black font-mono">{formatCurrency(me?.walletBalance ?? 0)}</p>
          )}
          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={handleClaimBonus}
              disabled={claimBonus.isPending}
              className="flex items-center gap-1.5 text-sm font-semibold border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors disabled:opacity-60"
            >
              <Gift className="w-4 h-4" />
              {claimBonus.isPending ? "Claiming..." : "Claim Daily Rs. 100"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" /> Total staked
            </div>
            <p className="text-xl font-bold font-mono">{formatCurrency(totalStaked)}</p>
          </div>
          <div className="border border-border rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" /> Total won back
            </div>
            <p className="text-xl font-bold font-mono">{formatCurrency(totalWon)}</p>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Bet History</h2>
            <span className="text-xs text-muted-foreground">{bets?.length ?? 0} bets</span>
          </div>

          {betsLoading ? (
            <div className="space-y-0 divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 px-5 py-4 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : !bets?.length ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No bets yet. Head to Markets to start trading.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {bets.map((bet) => {
                const isWon = bet.status === "won";
                const isLost = bet.status === "lost";
                const profit = (bet.payout ?? 0) - bet.amountPaid;
                return (
                  <div key={bet.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn(
                        "shrink-0 text-xs font-bold px-2 py-0.5 rounded",
                        bet.type === "YES" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {bet.type}
                      </span>
                      <p className="text-sm text-muted-foreground truncate">{bet.marketQuestion ?? "Market"}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-mono font-semibold">-{formatCurrency(bet.amountPaid)}</p>
                      {isWon && <p className="text-xs text-emerald-600 font-mono">+{formatCurrency(profit)}</p>}
                      {isLost && <p className="text-xs text-rose-500 font-mono text-muted-foreground">lost</p>}
                      {!isWon && !isLost && <p className="text-xs text-muted-foreground capitalize">{bet.status}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
