import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/market-math";
import { PredicLogo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X, LogOut, Wallet, BarChart2, Settings, TrendingUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Markets", exact: true },
  { href: "/leaderboard", label: "Leaderboard" },
];

function NavLink({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const [location] = useLocation();
  const active = exact ? location === href : location.startsWith(href);
  return (
    <Link href={href}>
      <span className={cn(
        "text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}>
        {label}
      </span>
    </Link>
  );
}

export function Header() {
  const { user, signIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();

  const { data: me } = useGetMe({
    query: { enabled: !!user, queryKey: getGetMeQueryKey() },
  });

  const handleSignIn = () => navigate("/auth");

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-7">
          <Link href="/">
            <div className="flex items-center gap-2 font-bold text-base">
              <PredicLogo size={28} />
              <span>Predic Hsm</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            {NAV.map((n) => (
              <NavLink key={n.href} {...n} />
            ))}
            {user && <NavLink href="/portfolio" label="Portfolio" />}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user && me ? (
            <>
              <Link href="/wallet">
                <button className="hidden sm:flex items-center gap-1.5 text-sm font-mono font-semibold border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
                  <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatCurrency(me.walletBalance)}
                </button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-border hover:bg-muted transition-colors outline-none">
                    <div className="w-6 h-6 rounded-md bg-foreground text-background flex items-center justify-center text-xs font-bold">
                      {me.displayName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                      {me.displayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-semibold truncate">{me.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{me.email}</p>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link href="/wallet" className="cursor-pointer flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5" /> Wallet · {formatCurrency(me.walletBalance)}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portfolio" className="cursor-pointer flex items-center gap-2">
                      <BarChart2 className="w-3.5 h-3.5" /> Portfolio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/leaderboard" className="cursor-pointer flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" /> Leaderboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5" /> Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-rose-600 focus:text-rose-600 cursor-pointer flex items-center gap-2"
                    onClick={async () => {
                      const { signOut: firebaseSignOut } = await import("firebase/auth");
                      const { auth } = await import("@/lib/firebase");
                      await firebaseSignOut(auth);
                    }}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : user && !me ? (
            <div className="w-8 h-8 rounded-lg border border-border animate-pulse bg-muted" />
          ) : (
            <button
              onClick={handleSignIn}
              className="h-9 px-4 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Register
            </button>
          )}

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {[
            { href: "/", label: "Markets" },
            { href: "/leaderboard", label: "Leaderboard" },
            ...(user ? [
              { href: "/portfolio", label: "Portfolio" },
              { href: "/wallet", label: "Wallet" },
              { href: "/settings", label: "Account Settings" },
            ] : []),
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </div>
            </Link>
          ))}
          {!user && (
            <button
              onClick={() => { navigate("/auth"); setMobileOpen(false); }}
              className="w-full mt-2 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold"
            >
              Register
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <PredicLogo size={18} />
            Predic Hsm
          </div>
          <p className="text-xs text-muted-foreground">Virtual currency only · No real money</p>
        </div>
      </footer>
    </div>
  );
}
