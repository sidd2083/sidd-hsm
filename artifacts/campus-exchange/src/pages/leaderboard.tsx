import { useGetLeaderboard, GetLeaderboardPeriod, GetLeaderboardSort } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/market-math";
import { Badge } from "@/components/ui/badge";

export default function Leaderboard() {
  const [period, setPeriod] = useState<GetLeaderboardPeriod>("all-time");
  const [sort, setSort] = useState<GetLeaderboardSort>("richest");

  const { data: leaderboard, isLoading } = useGetLeaderboard({ period, sort });

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">Top traders on Predic Hsm.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as GetLeaderboardPeriod)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="all-time">All-Time</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={sort} onValueChange={(v) => setSort(v as GetLeaderboardSort)}>
            <TabsList>
              <TabsTrigger value="richest">Most Riches</TabsTrigger>
              <TabsTrigger value="profit">Top Profit</TabsTrigger>
              <TabsTrigger value="loss">Loss Wall</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-16 text-center font-mono">Rank</TableHead>
                <TableHead>Trader</TableHead>
                <TableHead className="text-right">Net Worth</TableHead>
                <TableHead className="text-right">Wallet Balance</TableHead>
                <TableHead className="text-right hidden sm:table-cell">P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                </TableRow>
              ) : leaderboard?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No data available for this period.</TableCell>
                </TableRow>
              ) : (
                leaderboard?.map((entry, index) => (
                  <TableRow key={entry.uid}>
                    <TableCell className="text-center font-mono font-bold text-muted-foreground">
                      #{entry.rank || index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.displayName}</div>
                      <div className="text-xs text-muted-foreground">{entry.academicStream} • Sec {entry.section}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(entry.netWorth)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(entry.walletBalance)}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-mono">
                      <div className="flex flex-col items-end text-xs">
                        <span className="text-green-600">+{formatCurrency(entry.totalProfit)}</span>
                        <span className="text-red-600">-{formatCurrency(entry.totalLoss)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
