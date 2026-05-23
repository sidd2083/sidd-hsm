import { Market, usePlaceBet, getListMarketsQueryKey, getGetMeQueryKey, getListMyBetsQueryKey } from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { getMarketStats, formatCurrency } from "@/lib/market-math";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface BetModalProps {
  market: Market;
  side: "YES" | "NO";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BetModal({ market, side, open, onOpenChange }: BetModalProps) {
  const [amount, setAmount] = useState("");
  const placeBet = usePlaceBet();
  const queryClient = useQueryClient();

  const { yesMultiplier, noMultiplier } = getMarketStats(market.yesPool, market.noPool);
  const multiplier = side === "YES" ? yesMultiplier : noMultiplier;
  
  const numAmount = parseFloat(amount) || 0;
  const potentialPayout = numAmount * multiplier;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    placeBet.mutate({
      data: {
        marketId: market.id,
        type: side,
        amountPaid: numAmount
      }
    }, {
      onSuccess: () => {
        toast.success(`Bet placed successfully!`);
        queryClient.invalidateQueries({ queryKey: getListMarketsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListMyBetsQueryKey() });
        onOpenChange(false);
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to place bet");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Place Bet on {side}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm font-medium mb-4">{market.question}</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Bet Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">Rs.</span>
                <Input 
                  id="amount" 
                  type="number" 
                  className="pl-10 font-mono"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="1"
                />
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Multiplier</span>
                <span>{multiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Potential Payout</span>
                <span className="text-green-600">{formatCurrency(potentialPayout)}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className={`w-full ${side === "YES" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
              disabled={placeBet.isPending || numAmount <= 0}
            >
              {placeBet.isPending ? "Placing Bet..." : `Bet ${formatCurrency(numAmount)} on ${side}`}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
