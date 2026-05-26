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
import {
  ChevronDown, LogOut, Wallet, BarChart2,
  Trophy, Home, User, TrendingUp, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

function NavLink({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const [location] = useLocation();
  const active = exact
    ? location === href
    : location.startsWith(href) && href !== "/";
  const isHome = href === "/" && location === "/";
  const isActive = active || isHome;

  return (
    <Link href={href}>
      <span className={cn(
        "relative text-sm font-medium transition-colors duration-150 py-1 px-0.5",
        isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
      )}>
        {label}
        {isActive && (
          <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-indigo-400" />
        )}
      </span>
    </Link>
  );
}

function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: me } = useGetMe({ query: { enabled: !!user, queryKey: getGetMeQueryKey() } });

  const items = [
    { href: "/", icon: Home,       label: "Markets",   exact: true },
    { href: "/leaderboard", icon: Trophy, label: "Board" },
    ...(user
      ? [
          { href: "/portfolio", icon: TrendingUp, label: "Bets" },
          { href: "/wallet",    icon: Wallet,     label: "Wallet" },
          { href: "/settings",  icon: User,       label: "Profile" },
        ]
      : [{ href: "/auth", icon: User, label: "Sign In" }]),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200" style={{ boxShadow: "0 -2px 16px rgba(0,0,0,0.08)" }}>
      {user && me && (
        <div className="flex items-center justify-between px-5 py-2 bg-slate-50 border-b border-gray-100">
          <span className="text-sm text-slate-500 font-medium truncate max-w-[55%]">{me.displayName}</span>
          <span className="text-sm font-bold text-emerald-600 font-mono">{formatCurrency(me.walletBalance)}</span>
        </div>
      )}
      <div className="flex items-stretch safe-pb">
        {items.map((item) => {
          const isActive = "exact" in item && item.exact ? location === item.href : location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className={cn(
                "flex flex-col items-center gap-1 py-3 transition-all",
                isActive ? "text-indigo-600" : "text-slate-400"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", isActive ? "text-indigo-600" : "text-slate-400")}>
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
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.25)" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex h-16 items-center justify-between gap-6">

        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/">
            <div className="flex items-center gap-3 select-none">
              <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md">
                <PredicLogo size={16} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-[17px] text-white tracking-tight leading-none">Predic</span>
                <span className="font-black text-[17px] text-indigo-400 tracking-tight leading-none">HSM</span>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 h-16">
            <NavLink href="/" label="Markets" exact />
            <NavLink href="/leaderboard" label="Leaderboard" />
            {user && <NavLink href="/portfolio" label="Portfolio" />}
            {user && <NavLink href="/wallet" label="Wallet" />}
            <NavLink href="/about" label="About" />
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user && me ? (
            <>
              {/* Balance chip */}
              <div className="hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-bold font-mono tracking-tight">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                {formatCurrency(me.walletBalance)}
              </div>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 h-9 px-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors outline-none">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                      {me.displayName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-slate-200 max-w-[100px] truncate">
                      {me.displayName?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-100 rounded-2xl p-1.5 mt-1" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.14)" }}>
                  {/* Profile card */}
                  <div className="px-3 py-3 mb-1 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm font-bold text-gray-900 truncate">{me.displayName}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{me.email}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="text-xs text-gray-400">Balance</p>
                      <p className="text-base font-black text-emerald-600 font-mono mt-0.5">{formatCurrency(me.walletBalance)}</p>
                    </div>
                  </div>

                  {[
                    { href: "/wallet",    icon: Wallet,   label: "Wallet",      color: "text-emerald-500" },
                    { href: "/portfolio", icon: BarChart2, label: "Portfolio",   color: "text-indigo-500" },
                    { href: "/leaderboard", icon: Trophy, label: "Leaderboard", color: "text-amber-500" },
                  ].map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <item.icon className={cn("w-4 h-4", item.color)} />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator className="my-1 bg-gray-100" />

                  <DropdownMenuItem
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer text-sm font-medium text-red-600 hover:bg-red-50 focus:text-red-600"
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
            <div className="w-28 h-9 rounded-xl bg-slate-800 animate-pulse" />
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="h-9 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white text-sm font-bold transition-colors shadow-md shadow-indigo-500/20"
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
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center">
                <PredicLogo size={14} />
              </div>
              <span className="font-black text-[15px] text-gray-900">Predic HSM</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-[230px]">
              A prediction market for HSM college students. Virtual currency only — no real money involved.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Platform</p>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              {[
                { href: "/", label: "Markets" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/wallet", label: "Wallet" },
                { href: "/about", label: "About" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Legal</p>
            <div className="space-y-2.5">
              {[
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/about", label: "Rules & FAQ" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">{item.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            <strong className="text-gray-500">Note to HSM Administration:</strong> This is an independent student project — not affiliated with or endorsed by HSM. No real money is involved. We will immediately take down the site upon request.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-300">© {new Date().getFullYear()} Predic HSM · Virtual currency only</p>
            <p className="text-xs text-gray-300">Not officially affiliated with HSM</p>
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-8 pb-28 md:pb-10">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
