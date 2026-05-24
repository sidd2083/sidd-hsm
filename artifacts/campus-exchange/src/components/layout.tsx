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
import { ChevronDown, Menu, X, LogOut, Wallet, BarChart2, Settings, Trophy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function NavLink({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const [location] = useLocation();
  const active = exact ? location === href : location.startsWith(href) && href !== "/";
  const isHome = href === "/" && location === "/";
  return (
    <Link href={href}>
      <span className={cn(
        "text-sm font-medium transition-colors duration-150 relative py-1",
        (active || isHome) ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
      )}>
        {label}
        {(active || isHome) && (
          <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
        )}
      </span>
    </Link>
  );
}

export function Header() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();

  const { data: me } = useGetMe({
    query: { enabled: !!user, queryKey: getGetMeQueryKey() },
  });

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8EAF0]" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-[60px] items-center justify-between gap-4">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/">
            <div className="flex items-center gap-2.5 select-none">
              <PredicLogo size={32} />
              <span className="font-black text-[17px] tracking-tight text-gray-900">Predic <span className="text-indigo-600">Hsm</span></span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/" label="Markets" exact />
            <NavLink href="/leaderboard" label="Leaderboard" />
            {user && <NavLink href="/portfolio" label="Portfolio" />}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {user && me ? (
            <>
              {/* Wallet chip */}
              <Link href="/wallet">
                <button className="hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors font-mono">
                  <Wallet className="w-3.5 h-3.5" />
                  {formatCurrency(me.walletBalance)}
                </button>
              </Link>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 h-9 px-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors outline-none">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold select-none">
                      {me.displayName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                      {me.displayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-white border border-[#E8EAF0] rounded-xl p-1.5" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)" }}>
                  <div className="px-3 py-2.5 mb-1 rounded-lg bg-slate-50">
                    <p className="text-sm font-bold text-gray-900 truncate">{me.displayName}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{me.email}</p>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link href="/wallet" className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-50 text-sm font-medium text-gray-700">
                      <Wallet className="w-4 h-4 text-emerald-500" />
                      <span>Wallet</span>
                      <span className="ml-auto text-xs font-bold text-emerald-600 font-mono">{formatCurrency(me.walletBalance)}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/portfolio" className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-50 text-sm font-medium text-gray-700">
                      <BarChart2 className="w-4 h-4 text-indigo-500" /> Portfolio
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/leaderboard" className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-50 text-sm font-medium text-gray-700">
                      <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-[#E8EAF0]" />

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-50 text-sm font-medium text-gray-700">
                      <Settings className="w-4 h-4 text-slate-400" /> Account Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-pointer text-sm font-medium text-red-600 hover:bg-red-50 focus:text-red-600"
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
            <div className="w-32 h-9 rounded-xl bg-slate-100 animate-pulse" />
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm"
            >
              Register
            </button>
          )}

          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8EAF0] bg-white px-4 py-3 space-y-1">
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
              <div className="px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => setMobileOpen(false)}>
                {item.label}
              </div>
            </Link>
          ))}
          {!user && (
            <button
              onClick={() => { navigate("/auth"); setMobileOpen(false); }}
              className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold"
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
    <div className="min-h-screen flex flex-col bg-[#F4F5F7]">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-[#E8EAF0] bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
            <PredicLogo size={18} />
            Predic Hsm
          </div>
          <p className="text-xs text-gray-400">Virtual currency only · No real money involved</p>
        </div>
      </footer>
    </div>
  );
}
