import {
  Market,
  usePlaceBet,
  getListMarketsQueryKey,
  getGetMeQueryKey,
  getListMyBetsQueryKey,
} from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { getMarketStats, formatCurrency } from "@/lib/market-math";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BetModalProps {
  market: Market;
  side: "YES" | "NO";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_AMOUNTS = [500, 1000, 5000, 10000];

export function BetModal({ market, side, open, onOpenChange }: BetModalProps) {
  const [amount, setAmount] = useState("");
  const placeBet = usePlaceBet();
  const queryClient = useQueryClient();

  const { yesMultiplier, noMultiplier } = getMarketStats(market.yesPool, market.noPool);
  const multiplier = side === "YES" ? yesMultiplier : noMultiplier;

  const numAmount = parseFloat(amount) || 0;
  const potentialPayout = numAmount * multiplier;
  const profit = potentialPayout - numAmount;

  const isYes = side === "YES";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    placeBet.mutate(
      { id: market.id, data: { side, amount: numAmount } },
      {
        onSuccess: () => {
          toast.success(`Bet of ${formatCurrency(numAmount)} placed on ${side}! 🎉`);
          queryClient.invalidateQueries({ queryKey: getListMarketsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListMyBetsQueryKey() });
          onOpenChange(false);
          setAmount("");
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to place bet";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden border-border/60">
        <div className={cn(
          "px-6 py-5",
          isYes
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
            : "bg-gradient-to-br from-rose-500 to-rose-600"
        )}>
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold">
              Betting {isYes ? "YES" : "NO"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 text-sm mt-1 leading-snug line-clamp-2">{market.title}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-white/70 text-xs">Multiplier</p>
              <p className="text-white font-bold text-lg font-mono">{multiplier.toFixed(2)}x</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Bet Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">₹</span>
              <Input
                type="number"
                className="pl-8 h-12 text-lg font-mono rounded-xl border-border/60 focus:border-violet-400"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={cn(
                    "text-xs font-semibold py-1.5 rounded-lg border transition-all",
                    numAmount === q
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-border/60 text-muted-foreground hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50"
                  )}
                >
                  +{q >= 1000 ? `${q / 1000}k` : q}
                </button>
              ))}
            </div>
          </div>

          {numAmount > 0 && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Stake</span>
                <span className="font-mono font-medium text-foreground">{formatCurrency(numAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Multiplier</span>
                <span className="font-mono font-medium text-foreground">{multiplier.toFixed(2)}x</span>
              </div>
              <div className="border-t border-border/60 pt-2.5 flex justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Potential Payout
                </span>
                <span className="font-mono text-emerald-600">{formatCurrency(potentialPayout)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Net Profit</span>
                <span className="font-mono text-emerald-600">+{formatCurrency(profit)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={placeBet.isPending || numAmount <= 0}
            className={cn(
              "w-full h-12 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
              isYes
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30"
                : "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/30"
            )}
          >
            <Zap className="w-4 h-4" />
            {placeBet.isPending
              ? "Placing Bet..."
              : numAmount > 0
              ? `Bet ${formatCurrency(numAmount)} on ${side}`
              : "Enter an amount"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
