import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/market-math";
import { Skeleton } from "@/components/ui/skeleton";
import { PredicLogo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, BarChart2, Wallet, Menu, X, User, Gift, Trophy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = [
  { label: "⚽ Sports", value: "sports" },
  { label: "🏫 College", value: "college" },
  { label: "📱 Social", value: "social" },
  { label: "🌐 National", value: "national" },
];

function NavLink({ href, children, exact = false }: { href: string; children: React.ReactNode; exact?: boolean }) {
  const [location] = useLocation();
  const active = exact ? location === href : location.startsWith(href) && href !== "/";
  const isHome = href === "/" && location === "/";
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors px-1 py-0.5",
        (active || isHome) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { user, signIn, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: me, isLoading } = useGetMe({
    query: {
      enabled: !!user,
      queryKey: getGetMeQueryKey(),
    },
  });

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <PredicLogo size={34} />
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Predic Hsm
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5">
              <NavLink href="/" exact>Markets</NavLink>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
                  Categories <ChevronDown className="w-3.5 h-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44 rounded-xl shadow-xl border-border/60">
                  {categories.map((c) => (
                    <DropdownMenuItem key={c.value} asChild>
                      <Link href={`/?category=${c.value}`} className="cursor-pointer rounded-lg">
                        {c.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <NavLink href="/leaderboard">Leaderboard</NavLink>
              {user && <NavLink href="/my-bets">My Bets</NavLink>}
              <NavLink href="/about">About</NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isLoading && user ? (
              <Skeleton className="h-9 w-48 rounded-xl" />
            ) : user && me ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-xl font-mono">
                  <Wallet className="w-3.5 h-3.5" />
                  {formatCurrency(me.walletBalance)}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 bg-muted hover:bg-muted/80 rounded-xl px-2.5 py-1.5 transition-colors outline-none border border-border/40 hover:border-border/80">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {me.displayName?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <span className="hidden sm:block text-sm font-semibold max-w-[100px] truncate">
                        {me.displayName}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-border/60 p-1.5">
                    <div className="px-3 py-3 mb-1 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {me.displayName?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{me.displayName}</p>
                          <p className="text-xs text-violet-600 font-semibold font-mono">{formatCurrency(me.walletBalance)}</p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer rounded-xl flex items-center gap-2.5 py-2.5 font-medium">
                        <User className="w-4 h-4 text-muted-foreground" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-bets" className="cursor-pointer rounded-xl flex items-center gap-2.5 py-2.5 font-medium">
                        <BarChart2 className="w-4 h-4 text-muted-foreground" /> Trade History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/leaderboard" className="cursor-pointer rounded-xl flex items-center gap-2.5 py-2.5 font-medium">
                        <Trophy className="w-4 h-4 text-muted-foreground" /> Leaderboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer rounded-xl flex items-center gap-2.5 py-2.5 font-medium">
                        <Gift className="w-4 h-4 text-muted-foreground" /> Claim Daily Bonus
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer rounded-xl flex items-center gap-2.5 py-2.5 font-medium"
                      onClick={signOut}
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20 rounded-xl font-semibold text-sm px-5 py-2 transition-all"
              >
                Register Now
              </button>
            )}

            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 px-4 py-4 space-y-1">
            {[
              { href: "/", label: "Markets" },
              { href: "/leaderboard", label: "Leaderboard" },
              { href: "/about", label: "About" },
              ...(user ? [{ href: "/my-bets", label: "My Bets" }, { href: "/profile", label: "My Profile" }] : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border/50 mt-2 grid grid-cols-2 gap-1">
              {categories.map((c) => (
                <Link
                  key={c.value}
                  href={`/?category=${c.value}`}
                  className="block px-3 py-2 text-sm rounded-xl hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PredicLogo size={22} />
            <span className="text-sm font-semibold text-muted-foreground">Predic Hsm</span>
          </div>
          <p className="text-xs text-muted-foreground">Virtual prediction markets · No real money · For campus fun only</p>
        </div>
      </footer>
    </div>
  );
}
