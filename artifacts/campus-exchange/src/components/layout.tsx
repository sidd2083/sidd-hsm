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
  ChevronDown,
  LogOut,
  Wallet,
  BarChart2,
  Settings,
  Trophy,
  Home,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

function NavLink({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const [location] = useLocation();
  const active = exact ? location === href : location.startsWith(href) && href !== "/";
  const isHome = href === "/" && location === "/";
  return (
    <Link href={href}>
      <span
        className={cn(
          "text-sm font-medium transition-colors duration-150",
          active || isHome ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: me } = useGetMe({
    query: { enabled: !!user, queryKey: getGetMeQueryKey() },
  });

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
      style={{ boxShadow: "0 -1px 12px rgba(0,0,0,0.06)" }}>
      {user && me && (
        <div className="px-4 pt-1.5 pb-0.5 border-b border-gray-50 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-medium truncate max-w-[60%]">{me.displayName}</span>
          <span className="text-[11px] font-semibold text-emerald-600 font-mono">{formatCurrency(me.walletBalance)}</span>
        </div>
      )}
      <div className="flex items-stretch">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? location === "/"
              : location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 px-1 transition-colors",
                  active ? "text-indigo-600" : "text-gray-400"
                )}
              >
                <item.icon className={cn("w-5 h-5", active && "stroke-[2.2px]")} />
                <span className={cn("text-[10px] font-semibold tracking-wide", active ? "text-indigo-600" : "text-gray-400")}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}

export function Header() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: me } = useGetMe({
    query: { enabled: !!user, queryKey: getGetMeQueryKey() },
  });

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-100"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.05)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-[56px] items-center justify-between gap-4">
        <div className="flex items-center gap-7">
          <Link href="/">
            <div className="flex items-center gap-2 select-none">
              <PredicLogo size={26} />
              <span className="font-bold text-[15px] tracking-tight text-gray-900">
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
              <Link href="/wallet">
                <button className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors font-mono">
                  <Wallet className="w-3 h-3" />
                  {formatCurrency(me.walletBalance)}
                </button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 h-8 px-2 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors outline-none">
                    <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold select-none">
                      {me.displayName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden sm:block text-xs font-semibold text-gray-700 max-w-[90px] truncate">
                      {me.displayName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-52 bg-white border border-gray-100 rounded-xl p-1"
                  style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
                >
                  <div className="px-3 py-2 mb-0.5 rounded-lg bg-gray-50">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{me.displayName}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{me.email}</p>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/wallet"
                      className="cursor-pointer flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-[13px] font-medium text-gray-700"
                    >
                      <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Wallet</span>
                      <span className="ml-auto text-[11px] font-semibold text-emerald-600 font-mono">
                        {formatCurrency(me.walletBalance)}
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/portfolio"
                      className="cursor-pointer flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-[13px] font-medium text-gray-700"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-indigo-500" /> Portfolio
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/leaderboard"
                      className="cursor-pointer flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-[13px] font-medium text-gray-700"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-500" /> Leaderboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-0.5 bg-gray-100" />

                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="cursor-pointer flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-[13px] font-medium text-gray-700"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-400" /> Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 cursor-pointer text-[13px] font-medium text-red-600 hover:bg-red-50 focus:text-red-600"
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
            <div className="w-24 h-8 rounded-lg bg-gray-100 animate-pulse" />
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="h-8 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PredicLogo size={20} />
              <span className="font-bold text-sm text-gray-900 tracking-tight">
                Predic <span className="text-indigo-600">HSM</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              A campus prediction market for students of Hetauda School of Management. Virtual currency only — no real money involved.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</p>
            <div className="space-y-2">
              {[
                { href: "/", label: "Markets" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/wallet", label: "Wallet" },
                { href: "/about", label: "About" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Legal</p>
            <div className="space-y-2">
              {[
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/about", label: "Rules & FAQ" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 space-y-3">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <strong className="text-gray-500">Disclaimer for School Administration:</strong> Predic HSM is an independent student project built for educational and entertainment purposes. It uses only virtual currency — no real money is involved at any stage. This platform does not promote gambling or any form of financial betting. If school administration or any concerned authority has questions or objections regarding this site, please contact us and{" "}
            <strong className="text-gray-500">we will immediately remove the site from the internet.</strong> We have full respect for the institution and its policies.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-gray-300">
              © {new Date().getFullYear()} Predic HSM · Hetauda School of Management · Virtual currency only
            </p>
            <p className="text-[11px] text-gray-300">Not affiliated with HSM administration</p>
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 md:pb-8">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
