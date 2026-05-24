import { useParams, useLocation } from "wouter";
import {
  useGetMarket,
  useGetMarketBets,
  usePlaceBet,
  useGetMe,
  getGetMeQueryKey,
  getListMyBetsQueryKey,
  getGetMarketQueryKey,
  getGetMarketBetsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Layout } from "@/components/layout";
import { getMarketStats, formatCurrency } from "@/lib/market-math";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Lock, CheckCircle, TrendingUp, Users, Clock } from "lucide-react";
import { Link } from "wouter";

const QUICK = [500, 1000, 5000, 10000];

function BetPanel({ marketId, isLocked, yesPool, noPool }: {
  marketId: string;
  isLocked: boolean;
  yesPool: number;
  noPool: number;
}) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey(), enabled: !!user } });
  const placeBet = usePlaceBet();
  const queryClient = useQueryClient();

  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState("");

  const { yesMultiplier, noMultiplier } = getMarketStats(yesPool, noPool);
  const multiplier = side === "YES" ? yesMultiplier : noMultiplier;
  const numAmount = parseFloat(amount) || 0;
  const potentialPayout = numAmount * multiplier;
  const profit = potentialPayout - numAmount;

  const handleBet = () => {
    if (!user) { navigate("/auth"); return; }
    if (numAmount <= 0) { toast.error("Enter an amount"); return; }
    if (me && numAmount > me.walletBalance) { toast.error("Insufficient balance"); return; }

    placeBet.mutate(
      { data: { marketId, type: side, amountPaid: numAmount } },
      {
        onSuccess: () => {
          toast.success(`Bet placed on ${side}!`);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListMyBetsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMarketQueryKey(marketId) });
          setAmount("");
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to place bet"),
      }
    );
  };

  if (isLocked) {
    return (
      <div className="border border-border rounded-xl p-5 text-center">
        <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium">Betting is closed</p>
        <p className="text-xs text-muted-foreground mt-1">This market is no longer accepting bets</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border border-border rounded-xl p-5 text-center space-y-3">
        <p className="text-sm font-semibold">Sign in to place a bet</p>
        <p className="text-xs text-muted-foreground">You get Rs. 1,00,000 virtual balance to start trading</p>
        <Link href="/auth">
          <button className="w-full py-2.5 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            Sign In / Register
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <p className="text-xs text-muted-foreground mb-2">Your balance</p>
        <p className="text-lg font-bold font-mono">{me ? formatCurrency(me.walletBalance) : "—"}</p>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSide("YES")}
            className={cn(
              "py-3 rounded-lg text-sm font-bold border transition-all",
              side === "YES"
                ? "bg-emerald-500 text-white border-emerald-500"
                : "border-border text-muted-foreground hover:border-emerald-400 hover:text-emerald-600"
            )}
          >
            YES · {getMarketStats(yesPool, noPool).yesMultiplier.toFixed(2)}x
          </button>
          <button
            onClick={() => setSide("NO")}
            className={cn(
              "py-3 rounded-lg text-sm font-bold border transition-all",
              side === "NO"
                ? "bg-rose-500 text-white border-rose-500"
                : "border-border text-muted-foreground hover:border-rose-400 hover:text-rose-600"
            )}
          >
            NO · {getMarketStats(yesPool, noPool).noMultiplier.toFixed(2)}x
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden focus-within:border-foreground transition-colors">
            <span className="px-3 text-sm text-muted-foreground font-medium">Rs.</span>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 py-2.5 pr-3 text-sm font-mono outline-none bg-transparent"
              min="1"
            />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className={cn(
                  "py-1 text-xs font-medium rounded-md border transition-all",
                  numAmount === q
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {q >= 1000 ? `${q / 1000}k` : q}
              </button>
            ))}
          </div>
        </div>

        {numAmount > 0 && (
          <div className="bg-muted/40 rounded-lg p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Stake</span>
              <span className="font-mono font-medium text-foreground">{formatCurrency(numAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Multiplier</span>
              <span className="font-mono font-medium text-foreground">{multiplier.toFixed(2)}x</span>
            </div>
            <div className="border-t border-border pt-1.5 flex justify-between font-semibold text-sm">
              <span>Potential payout</span>
              <span className="font-mono text-emerald-600">{formatCurrency(potentialPayout)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Profit if {side}</span>
              <span className="font-mono text-emerald-600">+{formatCurrency(profit)}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleBet}
          disabled={placeBet.isPending || numAmount <= 0}
          className={cn(
            "w-full py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50",
            side === "YES"
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-rose-500 hover:bg-rose-600"
          )}
        >
          {placeBet.isPending ? "Placing..." : `Bet ${side}${numAmount > 0 ? ` · ${formatCurrency(numAmount)}` : ""}`}
        </button>
      </div>
    </div>
  );
}

function timeLeft(lockTimestamp: number): string {
  const diff = lockTimestamp - Date.now();
  if (diff <= 0) return "Closed";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function MarketDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: market, isLoading } = useGetMarket(id!, {
    query: { queryKey: getGetMarketQueryKey(id!), enabled: !!id },
  });
  const { data: bets } = useGetMarketBets(id!, {
    query: { queryKey: getGetMarketBetsQueryKey(id!), enabled: !!id },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!market) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Market not found.</p>
          <Link href="/"><button className="mt-4 text-sm text-foreground underline">Back to markets</button></Link>
        </div>
      </Layout>
    );
  }

  const { totalPool, yesMultiplier, noMultiplier, yesPercentage } = getMarketStats(
    market.yesPool,
    market.noPool
  );
  const isLocked = market.status !== "active" || Date.now() >= market.lockTimestamp;
  const isResolved = market.status === "resolved";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Markets
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground capitalize">{market.category}</p>
                  <h1 className="text-xl font-bold leading-snug">{market.question}</h1>
                </div>
                <div className="shrink-0">
                  {isResolved ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 border border-emerald-200 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Resolved
                    </span>
                  ) : isLocked ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground border px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3" /> {timeLeft(market.lockTimestamp)}
                    </span>
                  )}
                </div>
              </div>

              {isResolved && market.winningOutcome && (
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-lg text-sm font-semibold",
                  market.winningOutcome === "YES"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                )}>
                  <CheckCircle className="w-4 h-4" />
                  Outcome: {market.winningOutcome}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-emerald-600">YES · {yesPercentage.toFixed(1)}%</span>
                  <span className="text-rose-600">NO · {(100 - yesPercentage).toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-rose-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${yesPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="text-sm font-bold font-mono mt-0.5">{formatCurrency(totalPool)}</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-xs text-muted-foreground">YES payout</p>
                  <p className="text-sm font-bold font-mono text-emerald-600 mt-0.5">{yesMultiplier.toFixed(2)}x</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">NO payout</p>
                  <p className="text-sm font-bold font-mono text-rose-600 mt-0.5">{noMultiplier.toFixed(2)}x</p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Recent Activity</h2>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> {bets?.length ?? 0} bets
                </span>
              </div>
              {!bets || bets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No bets placed yet. Be the first!</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {bets.slice(0, 20).map((bet) => (
                    <div key={bet.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded",
                          bet.type === "YES" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {bet.type}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(bet.createdAt as number).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-medium">{formatCurrency(bet.amountPaid)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <BetPanel
              marketId={market.id}
              isLocked={isLocked || isResolved}
              yesPool={market.yesPool}
              noPool={market.noPool}
            />

            <div className="border border-border rounded-xl p-4 space-y-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-sm">How payouts work</p>
              <p>This market uses a parimutuel pool. When the outcome is decided, the total pool is distributed among winners proportional to their stake.</p>
              <p>
                <span className="font-medium text-foreground">If you bet YES with Rs. 1,000</span> and YES wins,
                your payout = <span className="font-mono">(1,000 / YES pool) × total pool</span>.
              </p>
              <p>Higher bets on one side reduce returns for that side. No real money involved.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Prices update in real-time as bets are placed. Virtual money only.</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
