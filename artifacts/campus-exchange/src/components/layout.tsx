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
import { ChevronDown, LogOut, Wallet, BarChart2, Settings, Trophy, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

function NavLink({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const [location] = useLocation();
  const active = exact ? location === href : location.startsWith(href) && href !== "/";
  const isHome = href === "/" && location === "/";
  return (
    <Link href={href}>
      <span className={cn(
        "text-[13px] font-medium transition-colors duration-150 pb-0.5",
        active || isHome
          ? "text-gray-900 border-b-2 border-indigo-600"
          : "text-gray-500 hover:text-gray-800"
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
          { href: "/portfolio", icon: BarChart2, label: "Portfolio" },
          { href: "/wallet", icon: Wallet, label: "Wallet" },
          { href: "/settings", icon: User, label: "Profile" },
        ]
      : [{ href: "/auth", icon: User, label: "Sign In" }]),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100" style={{ boxShadow: "0 -1px 8px rgba(0,0,0,0.06)" }}>
      {user && me && (
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-50 bg-gray-50/60">
          <span className="text-[11px] text-gray-500 font-medium truncate max-w-[55%]">{me.displayName}</span>
          <span className="text-[11px] font-semibold text-emerald-600 font-mono">{formatCurrency(me.walletBalance)}</span>
        </div>
      )}
      <div className="flex items-stretch pb-safe">
        {items.map((item) => {
          const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 transition-colors",
                active ? "text-indigo-600" : "text-gray-400 active:text-gray-600"
              )}>
                <item.icon className={cn("w-[18px] h-[18px]", active && "stroke-[2.2px]")} />
                <span className={cn("text-[9px] font-semibold uppercase tracking-wide", active ? "text-indigo-600" : "text-gray-400")}>
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100" style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-[52px] items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-2 select-none">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
                <PredicLogo size={14} />
              </div>
              <span className="font-bold text-[14px] tracking-tight text-gray-900">
                Predic <span className="text-indigo-600">HSM</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            <NavLink href="/" label="Markets" exact />
            <NavLink href="/leaderboard" label="Leaderboard" />
            {user && <NavLink href="/portfolio" label="Portfolio" />}
            {user && <NavLink href="/wallet" label="Wallet" />}
            <NavLink href="/about" label="About" />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user && me ? (
            <>
              <span className="hidden sm:flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold font-mono">
                {formatCurrency(me.walletBalance)}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 h-7 px-2 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors outline-none">
                    <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {me.displayName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden sm:block text-xs font-semibold text-gray-700 max-w-[80px] truncate">
                      {me.displayName?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-100 rounded-xl p-1" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}>
                  <div className="px-3 py-2 mb-0.5 rounded-lg bg-gray-50">
                    <p className="text-[12px] font-semibold text-gray-900 truncate">{me.displayName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{me.email}</p>
                    <p className="text-[10px] font-semibold text-emerald-600 font-mono mt-0.5">{formatCurrency(me.walletBalance)}</p>
                  </div>

                  {[
                    { href: "/wallet", icon: Wallet, label: "Wallet", color: "text-emerald-500" },
                    { href: "/portfolio", icon: BarChart2, label: "Portfolio", color: "text-indigo-500" },
                    { href: "/leaderboard", icon: Trophy, label: "Leaderboard", color: "text-amber-500" },
                  ].map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50">
                        <item.icon className={cn("w-3.5 h-3.5", item.color)} />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator className="my-0.5 bg-gray-100" />

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50">
                      <Settings className="w-3.5 h-3.5 text-gray-400" /> Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 cursor-pointer text-[12px] font-medium text-red-600 hover:bg-red-50 focus:text-red-600"
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
            <div className="w-20 h-7 rounded-lg bg-gray-100 animate-pulse" />
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="h-7 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
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
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-7">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center">
                <PredicLogo size={11} />
              </div>
              <span className="font-bold text-[13px] text-gray-900">Predic HSM</span>
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              A prediction market for HSM college students. Virtual currency only — no real money involved.
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Platform</p>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
              {[
                { href: "/", label: "Markets" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/wallet", label: "Wallet" },
                { href: "/about", label: "About" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Legal</p>
            <div className="space-y-1.5">
              {[
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/about", label: "Rules & FAQ" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">{item.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-50 pt-5">
          <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
            <strong className="text-gray-500">Note to HSM Administration:</strong> This is an independent student project — not affiliated with or endorsed by HSM. No real money is involved. If administration has any concerns, we will immediately take down the site upon request.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <p className="text-[11px] text-gray-300">© {new Date().getFullYear()} Predic HSM · Virtual currency only</p>
            <p className="text-[11px] text-gray-300">Not officially affiliated with HSM</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 pb-28 md:pb-6">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
