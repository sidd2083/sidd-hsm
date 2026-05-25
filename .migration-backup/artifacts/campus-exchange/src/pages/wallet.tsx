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
import { ArrowDownLeft, ArrowUpRight, Gift, TrendingUp, TrendingDown } from "lucide-react";

export default function Wallet() {
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: bets, isLoading: betsLoading } = useListMyBets({ query: { queryKey: getListMyBetsQueryKey() } });
  const claimBonus = useClaimDailyBonus();

  type Bet = NonNullable<typeof bets>[number];
  const totalStaked = bets?.reduce((s: number, b: Bet) => s + b.amountPaid, 0) ?? 0;
  const totalWon = bets?.filter((b: Bet) => b.status === "won").reduce((s: number, b: Bet) => s + (b.payout ?? 0), 0) ?? 0;
  const netPnl = totalWon - totalStaked;

  const handleClaimBonus = () => {
    claimBonus.mutate(undefined, {
      onSuccess: (data) => {
        if (data.claimed) {
          toast.success(`+${formatCurrency(data.bonus ?? 100)} daily bonus claimed!`);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        } else {
          toast.info("Already claimed today. Come back tomorrow!");
        }
      },
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-5 py-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your virtual currency balance and history</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 card-shadow">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Available Balance</p>
          {isLoading ? (
            <div className="h-10 w-40 bg-gray-100 rounded-lg animate-pulse mt-1 mb-3" />
          ) : (
            <p className="text-4xl font-black font-mono text-gray-900 tracking-tight">
              {formatCurrency(me?.walletBalance ?? 0)}
            </p>
          )}
          <button
            onClick={handleClaimBonus}
            disabled={claimBonus.isPending}
            className="mt-4 flex items-center gap-2 h-9 px-4 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-60"
          >
            <Gift className="w-3.5 h-3.5" />
            {claimBonus.isPending ? "Claiming..." : "Claim Daily ₹100"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Staked", value: formatCurrency(totalStaked), icon: ArrowUpRight, color: "text-rose-500" },
            { label: "Total Won", value: formatCurrency(totalWon), icon: ArrowDownLeft, color: "text-emerald-500" },
            { label: "Net P&L", value: formatCurrency(Math.abs(netPnl)), icon: netPnl >= 0 ? TrendingUp : TrendingDown, color: netPnl >= 0 ? "text-emerald-500" : "text-rose-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 card-shadow">
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1.5">
                <stat.icon className={cn("w-3 h-3", stat.color)} />
                {stat.label}
              </div>
              <p className={cn("text-base font-bold font-mono", netPnl >= 0 && stat.label === "Net P&L" ? "text-emerald-600" : netPnl < 0 && stat.label === "Net P&L" ? "text-rose-500" : "text-gray-800")}>
                {stat.label === "Net P&L" && netPnl < 0 ? "-" : ""}{stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden card-shadow">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Bet History</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{bets?.length ?? 0} total</span>
          </div>

          {betsLoading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 px-5 py-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-5 bg-gray-100 rounded" />
                    <div className="flex-1 h-4 bg-gray-100 rounded w-2/3" />
                    <div className="w-16 h-4 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : !bets?.length ? (
            <div className="text-center py-14">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm font-medium text-gray-500">No bets yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Head to Markets to start trading</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
              {bets.map((bet) => {
                const isWon = bet.status === "won";
                const isLost = bet.status === "lost";
                const isPending = !isWon && !isLost;
                const profit = (bet.payout ?? 0) - bet.amountPaid;
                return (
                  <div key={bet.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={cn(
                        "shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        bet.type === "YES" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {bet.type}
                      </span>
                      <p className="text-sm text-gray-600 truncate">{bet.marketQuestion ?? "Market"}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-mono font-semibold text-gray-800">-{formatCurrency(bet.amountPaid)}</p>
                      {isWon && <p className="text-xs text-emerald-600 font-mono font-medium">+{formatCurrency(profit)}</p>}
                      {isLost && <p className="text-xs text-gray-400">lost</p>}
                      {isPending && <p className="text-xs text-amber-500 capitalize font-medium">{bet.status}</p>}
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
