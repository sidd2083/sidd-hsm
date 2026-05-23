import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/market-math";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const { user, signIn, signOut } = useAuth();
  
  const { data: me, isLoading } = useGetMe({
    query: {
      enabled: !!user,
      queryKey: getGetMeQueryKey(),
    }
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight">Campus Exchange</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
              Markets
            </Link>
            <Link href="/leaderboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Leaderboard
            </Link>
            {user && (
              <Link href="/my-bets" className="transition-colors hover:text-foreground/80 text-foreground/60">
                My Bets
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoading && user ? (
            <Skeleton className="h-9 w-[200px]" />
          ) : user && me ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-sm font-medium">{me.displayName}</span>
                <span className="text-xs text-muted-foreground">{me.academicStream} • Sec {me.section}</span>
              </div>
              <Badge variant="secondary" className="px-3 py-1 text-sm font-mono bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20">
                🪙 {formatCurrency(me.walletBalance)}
              </Badge>
              <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
            </div>
          ) : (
            <Button onClick={signIn}>Sign In with Google</Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col font-sans">
      <Header />
      <main className="flex-1 container py-8">
        {children}
      </main>
    </div>
  );
}
