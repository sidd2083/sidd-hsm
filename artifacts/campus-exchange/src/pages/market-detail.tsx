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
import { ArrowLeft, Lock, CheckCircle, TrendingUp, Users, Clock, Wallet } from "lucide-react";
import { Link } from "wouter";

const QUICK = [100, 500, 1000, 5000];

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
          queryClient.invalidateQueries({ queryKey: getGetMarketBetsQueryKey(marketId) });
          setAmount("");
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to place bet"),
      }
    );
  };

  if (isLocked) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8EAF0] p-6 text-center space-y-2" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
        <p className="font-bold text-gray-700">Betting Closed</p>
        <p className="text-xs text-gray-400">This market is no longer accepting bets</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8EAF0] overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <div className="p-6 text-center space-y-4">
          <div>
            <p className="font-bold text-gray-800">Sign in to trade</p>
            <p className="text-xs text-gray-400 mt-1">Get Rs. 1,00,000 virtual balance to start</p>
          </div>
          <Link href="/auth">
            <button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-indigo-200">
              Sign In / Register
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8EAF0] overflow-hidden" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.07)" }}>
      {/* Balance */}
      <div className="px-5 py-4 border-b border-[#E8EAF0] bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Wallet className="w-4 h-4" />
          Balance
        </div>
        <span className="text-base font-black font-mono text-gray-900">
          {me ? formatCurrency(me.walletBalance) : "—"}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* YES / NO toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSide("YES")}
            className={cn(
              "h-12 rounded-xl text-sm font-black border-2 transition-all duration-150",
              side === "YES"
                ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100"
                : "border-[#E8EAF0] text-gray-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
            )}
          >
            YES <span className="font-mono opacity-80">{getMarketStats(yesPool, noPool).yesMultiplier.toFixed(2)}x</span>
          </button>
          <button
            onClick={() => setSide("NO")}
            className={cn(
              "h-12 rounded-xl text-sm font-black border-2 transition-all duration-150",
              side === "NO"
                ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-100"
                : "border-[#E8EAF0] text-gray-400 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50"
            )}
          >
            NO <span className="font-mono opacity-80">{getMarketStats(yesPool, noPool).noMultiplier.toFixed(2)}x</span>
          </button>
        </div>

        {/* Amount input */}
        <div className="space-y-2">
          <div className={cn(
            "flex items-center border-2 rounded-xl overflow-hidden transition-colors",
            side === "YES" ? "focus-within:border-emerald-400" : "focus-within:border-rose-400",
            "border-[#E8EAF0]"
          )}>
            <span className="px-3.5 text-sm font-semibold text-gray-400 border-r border-[#E8EAF0] py-3">₹</span>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 py-3 px-3 text-base font-bold font-mono outline-none bg-transparent text-gray-800 placeholder:text-gray-300"
              min="1"
            />
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className={cn(
                  "py-2 text-xs font-bold rounded-lg border transition-all",
                  numAmount === q
                    ? side === "YES"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-rose-500 text-white border-rose-500"
                    : "border-[#E8EAF0] text-gray-400 hover:border-gray-300 hover:text-gray-600 bg-slate-50"
                )}
              >
                {q >= 1000 ? `${q / 1000}k` : q}
              </button>
            ))}
          </div>
        </div>

        {/* Return calculator */}
        {numAmount > 0 && (
          <div className={cn(
            "rounded-xl p-3.5 space-y-2 text-sm border",
            side === "YES"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-rose-50 border-rose-200"
          )}>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Stake</span>
              <span className="font-mono font-semibold text-gray-700">{formatCurrency(numAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Multiplier</span>
              <span className="font-mono font-semibold text-gray-700">{multiplier.toFixed(2)}x</span>
            </div>
            <div className={cn(
              "border-t pt-2 flex justify-between font-bold",
              side === "YES" ? "border-emerald-200" : "border-rose-200"
            )}>
              <span className="text-xs text-gray-600">Potential payout</span>
              <span className={cn("font-mono text-base", side === "YES" ? "text-emerald-600" : "text-rose-600")}>
                {formatCurrency(potentialPayout)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Profit if {side}</span>
              <span className={cn("font-mono font-semibold", side === "YES" ? "text-emerald-600" : "text-rose-600")}>
                +{formatCurrency(profit)}
              </span>
            </div>
          </div>
        )}

        {/* CTA button */}
        <button
          onClick={handleBet}
          disabled={placeBet.isPending || numAmount <= 0}
          className={cn(
            "w-full h-12 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40 shadow-sm",
            side === "YES"
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100"
              : "bg-rose-500 hover:bg-rose-600 shadow-rose-100"
          )}
        >
          {placeBet.isPending
            ? "Placing bet..."
            : numAmount > 0
            ? `Place ${side} bet · ${formatCurrency(numAmount)}`
            : `Select amount to bet ${side}`}
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

const CATEGORY_EMOJI: Record<string, string> = {
  sports: "⚽", college: "🏫", social: "📱", national: "🌐",
};

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
          <div className="h-7 w-36 bg-white rounded-lg shimmer" />
          <div className="h-52 bg-white rounded-2xl shimmer" />
          <div className="h-72 bg-white rounded-2xl shimmer" />
        </div>
      </Layout>
    );
  }

  if (!market) {
    return (
      <Layout>
        <div className="text-center py-24 bg-white rounded-2xl border border-[#E8EAF0]">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-gray-500 font-medium">Market not found.</p>
          <Link href="/">
            <button className="mt-4 text-sm text-indigo-600 font-semibold hover:underline">← Back to markets</button>
          </Link>
        </div>
      </Layout>
    );
  }

  const { totalPool, yesMultiplier, noMultiplier, yesPercentage } = getMarketStats(
    market.yesPool,
    market.noPool
  );
  const noPercentage = 100 - yesPercentage;
  const isLocked = market.status !== "active" || Date.now() >= market.lockTimestamp;
  const isResolved = market.status === "resolved";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <Link href="/">
          <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Markets
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: market info */}
          <div className="lg:col-span-2 space-y-4">

            {/* Main market card */}
            <div className="bg-white rounded-2xl border border-[#E8EAF0] overflow-hidden" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.07)" }}>
              {/* Status strip */}
              {isResolved
                ? <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                : isLocked
                ? <div className="h-1 bg-slate-200" />
                : <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              }

              <div className="p-6 space-y-5">
                {/* Category + status */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-gray-400 capitalize">
                    {CATEGORY_EMOJI[market.category]} {market.category}
                  </span>
                  {isResolved ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : isLocked ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> {timeLeft(market.lockTimestamp)}
                    </span>
                  )}
                </div>

                {/* Question */}
                <h1 className="text-xl font-black text-gray-900 leading-snug tracking-tight">{market.question}</h1>

                {/* Resolved outcome */}
                {isResolved && market.winningOutcome && (
                  <div className={cn(
                    "flex items-center gap-2.5 p-4 rounded-xl font-bold",
                    market.winningOutcome === "YES"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  )}>
                    <CheckCircle className="w-5 h-5" />
                    Outcome: <span className="text-lg">{market.winningOutcome}</span>
                  </div>
                )}

                {/* Probability */}
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-4xl font-black text-emerald-600">{yesPercentage.toFixed(0)}%</span>
                      <span className="text-sm font-bold text-emerald-500 ml-2">YES</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-red-500 mr-2">NO</span>
                      <span className="text-4xl font-black text-red-600">{noPercentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="relative h-3 w-full bg-red-100 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${yesPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x divide-[#E8EAF0] bg-slate-50 rounded-xl border border-[#E8EAF0]">
                  <div className="text-center py-3 px-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Volume</p>
                    <p className="text-sm font-black font-mono text-gray-800">{formatCurrency(totalPool)}</p>
                  </div>
                  <div className="text-center py-3 px-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1">YES payout</p>
                    <p className="text-sm font-black font-mono text-emerald-600">{yesMultiplier.toFixed(2)}x</p>
                  </div>
                  <div className="text-center py-3 px-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">NO payout</p>
                    <p className="text-sm font-black font-mono text-red-600">{noMultiplier.toFixed(2)}x</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="bg-white rounded-2xl border border-[#E8EAF0] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">Recent Activity</h2>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-slate-50 border border-[#E8EAF0] px-2.5 py-1 rounded-full">
                  <Users className="w-3 h-3" /> {bets?.length ?? 0} bets
                </span>
              </div>
              {!bets || bets.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-2xl mb-2">🎯</p>
                  <p className="text-sm text-gray-400 font-medium">No bets yet — be the first!</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto -mx-1 px-1">
                  {bets.slice(0, 20).map((bet) => (
                    <div key={bet.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className={cn(
                          "text-xs font-black px-2.5 py-1 rounded-lg",
                          bet.type === "YES"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        )}>
                          {bet.type}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(bet.createdAt as number).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-bold text-gray-700">{formatCurrency(bet.amountPaid)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <BetPanel
              marketId={market.id}
              isLocked={isLocked || isResolved}
              yesPool={market.yesPool}
              noPool={market.noPool}
            />

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-[#E8EAF0] p-5 space-y-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <p className="font-bold text-sm text-gray-800">How payouts work</p>
              </div>
              <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
                <p>This is a <strong className="text-gray-600">parimutuel pool</strong>. When resolved, the total pool is split among winners proportional to their stake.</p>
                <div className="bg-slate-50 rounded-xl p-3 border border-[#E8EAF0] font-mono text-gray-500">
                  payout = (stake / winning_pool) × total_pool
                </div>
                <p>More bets on one side = lower multiplier for that side. <span className="font-semibold text-gray-500">Virtual money only</span> — no real cash involved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
