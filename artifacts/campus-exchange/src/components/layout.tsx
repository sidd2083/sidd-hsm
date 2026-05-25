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
import { ChevronDown, LogOut, Wallet, BarChart2, Settings, Trophy, Home, User, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

function NavLink({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const [location] = useLocation();
  const active = exact ? location === href : location.startsWith(href) && href !== "/";
  const isHome = href === "/" && location === "/";
  return (
    <Link href={href}>
      <span className={cn(
        "text-[13.5px] font-medium transition-colors duration-150 py-1",
        active || isHome
          ? "text-white font-semibold border-b-2 border-indigo-400"
          : "text-slate-300 hover:text-white"
      )}>
        {label}
      </span>
    </Link>
  );
}

function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: me } = useGetMe({ query: { enabled: !!user, queryKey: getGetMeQueryKey() } });

  const items = [
    { href: "/", icon: Home, label: "Markets", exact: true },
    { href: "/leaderboard", icon: Trophy, label: "Board" },
    ...(user
      ? [
          { href: "/portfolio", icon: TrendingUp, label: "Portfolio" },
          { href: "/wallet", icon: Wallet, label: "Wallet" },
          { href: "/settings", icon: User, label: "Profile" },
        ]
      : [{ href: "/auth", icon: User, label: "Sign In" }]),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200/80" style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
      {user && me && (
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-100 bg-slate-50">
          <span className="text-[11px] text-slate-500 font-medium truncate max-w-[60%]">{me.displayName}</span>
          <span className="text-[11px] font-bold text-emerald-600 font-mono tracking-tight">{formatCurrency(me.walletBalance)}</span>
        </div>
      )}
      <div className="flex items-stretch safe-pb">
        {items.map((item) => {
          const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className={cn(
                "flex flex-col items-center gap-0.5 py-3 transition-all",
                active ? "text-indigo-600" : "text-slate-400"
              )}>
                <item.icon className={cn("w-5 h-5", active && "stroke-[2.5px]")} />
                <span className={cn(
                  "text-[9.5px] font-semibold uppercase tracking-widest",
                  active ? "text-indigo-600" : "text-slate-400"
                )}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Header() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: me } = useGetMe({ query: { enabled: !!user, queryKey: getGetMeQueryKey() } });

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800/80" style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.15)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between gap-4">
        {/* Logo + Nav */}
        <div className="flex items-center gap-7">
          <Link href="/">
            <div className="flex items-center gap-2.5 select-none">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                <PredicLogo size={15} />
              </div>
              <span className="font-bold text-[15px] tracking-tight text-white">
                Predic <span className="text-indigo-400">HSM</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/" label="Markets" exact />
            <NavLink href="/leaderboard" label="Leaderboard" />
            {user && <NavLink href="/portfolio" label="Portfolio" />}
            {user && <NavLink href="/wallet" label="Wallet" />}
            <NavLink href="/about" label="About" />
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {user && me ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[13px] font-bold font-mono tracking-tight">
                {formatCurrency(me.walletBalance)}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 h-8 px-2.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors outline-none">
                    <div className="w-5 h-5 rounded-md bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {me.displayName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden sm:block text-[13px] font-medium text-slate-200 max-w-[80px] truncate">
                      {me.displayName?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52 bg-white border border-gray-100 rounded-xl p-1.5" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                  <div className="px-3 py-2.5 mb-1 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{me.displayName}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{me.email}</p>
                    <p className="text-[12px] font-bold text-emerald-600 font-mono mt-1">{formatCurrency(me.walletBalance)}</p>
                  </div>

                  {[
                    { href: "/wallet", icon: Wallet, label: "Wallet", color: "text-emerald-500" },
                    { href: "/portfolio", icon: BarChart2, label: "Portfolio", color: "text-indigo-500" },
                    { href: "/leaderboard", icon: Trophy, label: "Leaderboard", color: "text-amber-500" },
                  ].map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50">
                        <item.icon className={cn("w-4 h-4", item.color)} />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator className="my-1 bg-gray-100" />

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50">
                      <Settings className="w-4 h-4 text-gray-400" /> Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-pointer text-[13px] font-medium text-red-600 hover:bg-red-50 focus:text-red-600 mt-0.5"
                    onClick={async () => {
                      const { signOut: firebaseSignOut } = await import("firebase/auth");
                      const { auth } = await import("@/lib/firebase");
                      await firebaseSignOut(auth);
                    }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : user && !me ? (
            <div className="w-24 h-8 rounded-lg bg-slate-800 animate-pulse" />
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="h-8 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[13px] font-semibold transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center">
                <PredicLogo size={13} />
              </div>
              <span className="font-bold text-[14px] text-gray-900">Predic HSM</span>
            </div>
            <p className="text-[13px] text-gray-400 leading-relaxed max-w-[220px]">
              A prediction market for HSM college students. Virtual currency only — no real money involved.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Platform</p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {[
                { href: "/", label: "Markets" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/wallet", label: "Wallet" },
                { href: "/about", label: "About" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Legal</p>
            <div className="space-y-2">
              {[
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/about", label: "Rules & FAQ" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">{item.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-[12px] text-gray-400 leading-relaxed mb-3">
            <strong className="text-gray-500">Note to HSM Administration:</strong> This is an independent student project — not affiliated with or endorsed by HSM. No real money is involved. We will immediately take down the site upon request.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] text-gray-300">© {new Date().getFullYear()} Predic HSM · Virtual currency only</p>
            <p className="text-[12px] text-gray-300">Not officially affiliated with HSM</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 md:pb-8">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
