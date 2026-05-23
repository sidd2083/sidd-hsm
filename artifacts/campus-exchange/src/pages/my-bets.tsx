import { useListMyBets } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { formatCurrency } from "@/lib/market-math";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function MyBets() {
  const { data: bets, isLoading } = useListMyBets();

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bets</h1>
          <p className="text-muted-foreground mt-1">Your trading history and active positions.</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : bets?.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-card border-dashed">
            <h3 className="text-lg font-medium text-foreground">No bets yet</h3>
            <p className="text-muted-foreground mt-1">Go to the markets page to place your first bet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bets?.map(bet => {
              const isResolved = bet.marketStatus === "resolved";
              const isWinner = isResolved && bet.winningOutcome === bet.type;
              const isLoser = isResolved && bet.winningOutcome !== bet.type && bet.winningOutcome !== null;
              
              // Note: actual payout calculation logic should match backend.
              // Here we just display what we have or a placeholder message if won.
              return (
                <Card key={bet.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={bet.type === "YES" ? "default" : "destructive"} className={bet.type === "YES" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                            {bet.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(bet.createdAt), "MMM d, yyyy h:mm a")}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">{bet.marketQuestion || "Unknown Market"}</h3>
                      </div>
                      
                      <div className="flex flex-row md:flex-col justify-between items-end gap-2 min-w-[120px]">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Amount Paid</div>
                          <div className="font-mono font-medium">{formatCurrency(bet.amountPaid)}</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Status</div>
                          {isWinner ? (
                            <Badge className="bg-green-500 font-mono">WON</Badge>
                          ) : isLoser ? (
                            <Badge variant="destructive" className="font-mono">LOST</Badge>
                          ) : (
                            <Badge variant="secondary" className="font-mono">ACTIVE</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
