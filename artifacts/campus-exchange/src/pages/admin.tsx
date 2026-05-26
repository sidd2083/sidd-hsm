import { useState, useEffect, useCallback } from "react";
import {
  useAdminCreateMarket,
  useListMarkets,
  useAdminResolveMarket,
  useAdminAdjustWallet,
  useAdminListUsers,
  getListMarketsQueryKey,
  getAdminListUsersQueryKey,
  setAdminCredentials,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/market-math";
import { cn } from "@/lib/utils";
import {
  Users, PlusCircle, BarChart2, LogOut, CheckCircle, X, Search,
  Trash2, Lock, TrendingUp, Tag, RefreshCw,
} from "lucide-react";

type Tab = "overview" | "markets" | "create" | "users" | "categories";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

class AdminFetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function adminFetch(path: string, creds: { username: string; password: string }, options: RequestInit = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-username": creds.username,
      "x-admin-password": creds.password,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new AdminFetchError(body, res.status);
  }
  return res.json();
}

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [tab, setTab] = useState<Tab>("overview");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const c = { username: username.trim(), password };
      // Verify against the server — if 503 Firebase isn't configured, if 403 wrong password
      await adminFetch("/admin/stats", c);
      setAdminCredentials(username.trim(), password);
      setCreds(c);
      setIsAuthenticated(true);
    } catch (err) {
      const status = err instanceof AdminFetchError ? err.status : 0;
      if (status === 503) {
        setAuthError("Firebase is not configured yet. Ask the admin to add FIREBASE_SERVICE_ACCOUNT to the server.");
      } else if (status === 403 || status === 401) {
        setAuthError("Invalid username or password.");
      } else if (status === 0) {
        setAuthError("Could not reach the API server. Check that it is running.");
      } else {
        setAuthError(`Server error (${status}). Please try again.`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminCredentials(null, null);
    setCreds({ username: "", password: "" });
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-[#E8EAF0] overflow-hidden" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="p-8 space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-extrabold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-400 mt-1">Predic HSM Management</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setAuthError(null); }}
                    className={cn(
                      "w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition-colors bg-white font-medium",
                      authError ? "border-red-400 focus:border-red-500" : "border-[#E8EAF0] focus:border-indigo-400"
                    )}
                    placeholder="Admin username"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
                    className={cn(
                      "w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition-colors bg-white font-medium",
                      authError ? "border-red-400 focus:border-red-500" : "border-[#E8EAF0] focus:border-indigo-400"
                    )}
                    placeholder="Admin password"
                    required
                  />
                </div>
                {authError && (
                  <p className="text-sm text-red-600 flex items-start gap-1.5 font-medium leading-snug">
                    <X className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {authError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {authLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {authLoading ? "Verifying..." : "Login to Admin"}
                </button>
              </form>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Credentials are set via ADMIN_USERNAME / ADMIN_PASSWORD server env vars.
          </p>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview",   label: "Overview",    icon: TrendingUp },
    { id: "markets",    label: "Markets",     icon: BarChart2 },
    { id: "create",     label: "Create",      icon: PlusCircle },
    { id: "users",      label: "Users",       icon: Users },
    { id: "categories", label: "Categories",  icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* Admin header */}
      <div className="bg-white border-b border-[#E8EAF0] sticky top-0 z-40" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[60px]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-gray-900 text-sm">Admin Panel</span>
            <span className="text-xs text-gray-400 font-medium hidden sm:block">· Predic HSM</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-600 border border-[#E8EAF0] rounded-xl px-3 py-1.5 hover:border-red-200 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-2xl border border-[#E8EAF0] card-shadow overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all",
                tab === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-slate-50"
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {tab === "overview"   && <OverviewTab creds={creds} />}
          {tab === "markets"    && <ManageMarkets creds={creds} />}
          {tab === "create"     && <CreateMarket creds={creds} />}
          {tab === "users"      && <ManageUsers creds={creds} />}
          {tab === "categories" && <ManageCategories creds={creds} />}
        </div>
      </div>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────
function OverviewTab({ creds }: { creds: { username: string; password: string } }) {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/admin/stats", creds);
      setStats(data);
    } catch {
      toast.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, [creds]);

  useEffect(() => { load(); }, [load]);

  const items = stats ? [
    { label: "Total Markets",  value: stats["totalMarkets"]    ?? 0, colorClass: "text-indigo-600",  fmt: String },
    { label: "Active Markets", value: stats["activeMarkets"]   ?? 0, colorClass: "text-blue-600",    fmt: String },
    { label: "Resolved",       value: stats["resolvedMarkets"] ?? 0, colorClass: "text-emerald-600", fmt: String },
    { label: "Total Users",    value: stats["totalUsers"]      ?? 0, colorClass: "text-purple-600",  fmt: String },
    { label: "Total Bets",     value: stats["totalBets"]       ?? 0, colorClass: "text-amber-600",   fmt: String },
    { label: "Total Volume",   value: stats["totalVolume"]     ?? 0, colorClass: "text-rose-600",    fmt: (v: number) => formatCurrency(v) },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-gray-900">Platform Overview</h2>
        <button onClick={load} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-indigo-600 transition-colors">
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl shimmer" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map(({ label, value, colorClass, fmt }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#E8EAF0] p-5 card-shadow space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className={cn("text-2xl font-extrabold", colorClass)}>
                {fmt(value as number)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Manage Markets ─────────────────────────────────────────────────────────────
function ManageMarkets({ creds }: { creds: { username: string; password: string } }) {
  const { data: markets, isLoading, refetch } = useListMarkets();
  const resolveMarket = useAdminResolveMarket();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "locked" | "resolved">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lockingId, setLockingId] = useState<string | null>(null);

  const filtered = markets?.filter(m => {
    const closesAtMs = m.closesAt ? new Date(m.closesAt).getTime() : Infinity;
    const matchSearch = search.trim() === "" || m.title.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter || (statusFilter === "locked" && Date.now() >= closesAtMs && m.status === "open");
    return matchSearch && matchStatus;
  }) ?? [];

  const handleResolve = (id: string, outcome: "YES" | "NO") => {
    if (!confirm(`Resolve this market as ${outcome}? This cannot be undone and payouts will be distributed immediately.`)) return;
    resolveMarket.mutate({ id, data: { outcome } }, {
      onSuccess: () => {
        toast.success(`Market resolved as ${outcome} — payouts distributed`);
        queryClient.invalidateQueries({ queryKey: getListMarketsQueryKey() });
      },
      onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete market:\n"${title}"\n\nThis permanently removes the market. Bets are NOT refunded.`)) return;
    setDeletingId(id);
    try {
      await adminFetch(`/admin/markets/${id}`, creds, { method: "DELETE" });
      toast.success("Market deleted");
      queryClient.invalidateQueries({ queryKey: getListMarketsQueryKey() });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLock = async (id: string) => {
    if (!confirm("Lock this market immediately? No new bets will be accepted.")) return;
    setLockingId(id);
    try {
      await adminFetch(`/admin/markets/${id}`, creds, {
        method: "PATCH",
        body: JSON.stringify({ status: "locked" }),
      });
      toast.success("Market locked");
      queryClient.invalidateQueries({ queryKey: getListMarketsQueryKey() });
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lock failed");
    } finally {
      setLockingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 transition-colors bg-white font-medium placeholder:text-gray-300"
            placeholder="Search by question or category..."
          />
        </div>
        <div className="flex gap-1 bg-white border border-[#E8EAF0] rounded-xl p-1">
          {(["all", "open", "locked", "resolved"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                statusFilter === s ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 font-medium">{filtered.length} markets</p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E8EAF0]">
          <p className="text-gray-400 font-medium">No markets match your filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(market => {
            const closesAtMs = market.closesAt ? new Date(market.closesAt).getTime() : Infinity;
            const isEffectivelyLocked = market.status !== "open" || Date.now() >= closesAtMs;
            const isResolved = market.status === "resolved";
            const totalPool = market.yesPool + market.noPool;
            return (
              <div key={market.id} className="bg-white rounded-2xl border border-[#E8EAF0] p-4 card-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                        isResolved ? "bg-emerald-100 text-emerald-700"
                          : isEffectivelyLocked ? "bg-slate-100 text-slate-500"
                          : "bg-blue-100 text-blue-600"
                      )}>
                        {isResolved ? "Resolved" : isEffectivelyLocked ? "Locked" : "Open"}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 capitalize px-2 py-0.5 rounded-full bg-slate-50 border border-[#E8EAF0]">
                        {market.category}
                      </span>
                      {isResolved && market.outcome && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {market.outcome} Won
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{market.title}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-mono">
                      <span>YES: {formatCurrency(market.yesPool)}</span>
                      <span>NO: {formatCurrency(market.noPool)}</span>
                      <span className="font-semibold text-gray-600">Total: {formatCurrency(totalPool)}</span>
                      {market.closesAt && (
                        <span className="font-sans">Closes: {new Date(market.closesAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {!isResolved && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleResolve(market.id, "YES")}
                          disabled={resolveMarket.isPending}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" /> YES
                        </button>
                        <button
                          onClick={() => handleResolve(market.id, "NO")}
                          disabled={resolveMarket.isPending}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          <X className="w-3 h-3" /> NO
                        </button>
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      {!isResolved && !isEffectivelyLocked && (
                        <button
                          onClick={() => handleLock(market.id)}
                          disabled={lockingId === market.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                          <Lock className="w-3 h-3" /> {lockingId === market.id ? "..." : "Lock"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(market.id, market.title)}
                        disabled={deletingId === market.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" /> {deletingId === market.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Create Market ──────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = ["sports", "college", "social", "national"];

function CreateMarket({ creds }: { creds: { username: string; password: string } }) {
  const createMarket = useAdminCreateMarket();
  const queryClient = useQueryClient();
  const [customCats, setCustomCats] = useState<string[]>([]);
  const [form, setForm] = useState({
    question: "",
    description: "",
    category: "college",
    customCategory: "",
    useCustom: false,
    lockMode: "hours" as "hours" | "datetime",
    hours: "48",
    lockDatetime: "",
  });

  useEffect(() => {
    adminFetch("/admin/categories", creds)
      .then(d => setCustomCats(d.categories ?? []))
      .catch(() => {});
  }, [creds]);

  const allCategories = [...DEFAULT_CATEGORIES, ...customCats.filter(c => !DEFAULT_CATEGORIES.includes(c))];

  const getLockTimestamp = () => {
    if (form.lockMode === "datetime" && form.lockDatetime) {
      return new Date(form.lockDatetime).getTime();
    }
    return Date.now() + parseInt(form.hours || "48") * 3600000;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = form.useCustom && form.customCategory.trim()
      ? form.customCategory.trim().toLowerCase()
      : form.category;
    const lockTimestamp = getLockTimestamp();
    if (lockTimestamp <= Date.now()) { toast.error("Lock time must be in the future"); return; }
    createMarket.mutate(
      { data: { title: form.question, description: form.description || "", category: category as never, closesAt: new Date(lockTimestamp).toISOString() } },
      {
        onSuccess: () => {
          toast.success("Market created!");
          setForm({ ...form, question: "", description: "", customCategory: "" });
          queryClient.invalidateQueries({ queryKey: getListMarketsQueryKey() });
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to create"),
      }
    );
  };

  const preview = getLockTimestamp();

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-[#E8EAF0] overflow-hidden card-shadow">
        <div className="px-6 py-4 border-b border-[#E8EAF0]">
          <h2 className="text-base font-extrabold text-gray-900">Create New Market</h2>
          <p className="text-xs text-gray-400 mt-0.5">All fields are required</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</label>
            <textarea
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
              className="w-full px-3.5 py-3 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 resize-none bg-white font-medium placeholder:text-gray-300"
              placeholder="Will HSM win the inter-college football final?"
              rows={3}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, category: c, useCustom: false })}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-sm font-semibold border capitalize transition-all",
                    form.category === c && !form.useCustom
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-500 border-[#E8EAF0] hover:border-indigo-300"
                  )}
                >
                  {c}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setForm({ ...form, useCustom: true })}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all",
                  form.useCustom
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-400 border-dashed border-[#E8EAF0] hover:border-indigo-300"
                )}
              >
                + Custom
              </button>
            </div>
            {form.useCustom && (
              <input
                value={form.customCategory}
                onChange={e => setForm({ ...form, customCategory: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 bg-white font-medium placeholder:text-gray-300"
                placeholder="e.g. exams, canteen, events"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lock Time</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, lockMode: "hours" })}
                className={cn("flex-1 py-2 text-sm font-semibold rounded-xl border transition-all", form.lockMode === "hours" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-500 border-[#E8EAF0]")}
              >
                Hours from now
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, lockMode: "datetime" })}
                className={cn("flex-1 py-2 text-sm font-semibold rounded-xl border transition-all", form.lockMode === "datetime" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-500 border-[#E8EAF0]")}
              >
                Specific date & time
              </button>
            </div>
            {form.lockMode === "hours" ? (
              <input
                type="number"
                min="1"
                value={form.hours}
                onChange={e => setForm({ ...form, hours: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 bg-white font-medium"
                placeholder="48"
              />
            ) : (
              <input
                type="datetime-local"
                value={form.lockDatetime}
                onChange={e => setForm({ ...form, lockDatetime: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 bg-white font-medium"
              />
            )}
            <p className="text-xs text-gray-400">
              Preview: {new Date(preview).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          <button
            type="submit"
            disabled={createMarket.isPending}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {createMarket.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {createMarket.isPending ? "Creating..." : "Create Market"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Manage Users ───────────────────────────────────────────────────────────────
function ManageUsers({ creds }: { creds: { username: string; password: string } }) {
  const { data: users, isLoading } = useAdminListUsers({ query: { queryKey: getAdminListUsersQueryKey() } });
  const adjustWallet = useAdminAdjustWallet();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [adjustUid, setAdjustUid] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");

  const filtered = users?.filter(u =>
    search.trim() === "" ||
    (u.displayName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleAdjust = (uid: string) => {
    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount === 0) { toast.error("Enter a valid amount"); return; }
    adjustWallet.mutate(
      { id: uid, data: { amount } },
      {
        onSuccess: () => {
          toast.success(`Wallet adjusted by ${formatCurrency(amount)}`);
          queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
          setAdjustUid(null);
          setAdjustAmount("");
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 bg-white font-medium placeholder:text-gray-300"
          placeholder="Search by name or email..."
        />
      </div>
      <p className="text-xs text-gray-400 font-medium">{filtered.length} users</p>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl shimmer" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(user => (
            <div key={user.uid} className="bg-white rounded-2xl border border-[#E8EAF0] p-4 card-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-sm truncate">{user.displayName ?? "Unknown"}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email ?? user.uid}</p>
                  {user.academicStream && <p className="text-xs text-indigo-600 font-medium mt-0.5">{user.academicStream}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-extrabold text-emerald-600 font-mono">{formatCurrency(user.walletBalance ?? 0)}</p>
                  <button
                    onClick={() => { setAdjustUid(adjustUid === user.uid ? null : user.uid); setAdjustAmount(""); }}
                    className="text-xs font-semibold text-indigo-600 hover:underline mt-0.5"
                  >
                    Adjust wallet
                  </button>
                </div>
              </div>
              {adjustUid === user.uid && (
                <div className="mt-3 pt-3 border-t border-[#E8EAF0] flex gap-2">
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(e.target.value)}
                    placeholder="e.g. 5000 or -1000"
                    className="flex-1 h-9 px-3 rounded-lg border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 bg-white font-medium"
                  />
                  <button
                    onClick={() => handleAdjust(user.uid)}
                    disabled={adjustWallet.isPending}
                    className="px-4 h-9 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setAdjustUid(null)}
                    className="px-3 h-9 rounded-lg bg-gray-50 text-gray-500 text-sm font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Manage Categories ──────────────────────────────────────────────────────────
function ManageCategories({ creds }: { creds: { username: string; password: string } }) {
  const [cats, setCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingCat, setRemovingCat] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminFetch("/admin/categories", creds);
      setCats(d.categories ?? []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [creds]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setAdding(true);
    try {
      await adminFetch("/admin/categories", creds, { method: "POST", body: JSON.stringify({ name: newCat.trim() }) });
      setNewCat("");
      load();
      toast.success("Category added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (name: string) => {
    if (!confirm(`Remove category "${name}"?`)) return;
    setRemovingCat(name);
    try {
      await adminFetch(`/admin/categories/${name}`, creds, { method: "DELETE" });
      load();
      toast.success("Category removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setRemovingCat(null);
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-white rounded-2xl border border-[#E8EAF0] overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-[#E8EAF0]">
          <h2 className="text-base font-extrabold text-gray-900">Market Categories</h2>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Default categories (cannot be removed)</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {DEFAULT_CATEGORIES.map(c => (
              <span key={c} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-[#E8EAF0] text-sm font-semibold text-gray-500 capitalize">{c}</span>
            ))}
          </div>
          {loading ? (
            <div className="h-12 bg-slate-50 rounded-xl shimmer" />
          ) : cats.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Custom categories</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {cats.map(c => (
                  <div key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="text-sm font-semibold text-indigo-700 capitalize">{c}</span>
                    <button
                      onClick={() => handleRemove(c)}
                      disabled={removingCat === c}
                      className="text-indigo-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 bg-white font-medium placeholder:text-gray-300"
              placeholder="New category name..."
            />
            <button
              type="submit"
              disabled={adding || !newCat.trim()}
              className="px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
