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
  Trash2, Lock, TrendingUp, Tag, Eye, RefreshCw, ChevronDown,
} from "lucide-react";

type Tab = "overview" | "markets" | "create" | "users" | "categories";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function adminFetch(path: string, options: RequestInit = {}) {
  const creds = (window as unknown as Record<string, Record<string, string>>).__adminCreds ?? {};
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-username": creds["username"] ?? "siddhant",
      "x-admin-password": creds["password"] ?? "siddhant2078",
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "siddhant" && password === "siddhant2078") {
      setAdminCredentials(username, password);
      (window as unknown as Record<string, unknown>).__adminCreds = { username, password };
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setAdminCredentials(null, null);
    (window as unknown as Record<string, unknown>).__adminCreds = {};
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
                <p className="text-xs text-gray-400 mt-1">Predic Hsm · HSM Management</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setAuthError(false); }}
                    className={cn(
                      "w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition-colors bg-white font-medium",
                      authError ? "border-red-400 focus:border-red-500" : "border-[#E8EAF0] focus:border-indigo-400"
                    )}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
                    className={cn(
                      "w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition-colors bg-white font-medium",
                      authError ? "border-red-400 focus:border-red-500" : "border-[#E8EAF0] focus:border-indigo-400"
                    )}
                    placeholder="Enter password"
                    required
                  />
                </div>
                {authError && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5 font-medium">
                    <X className="w-3.5 h-3.5" /> Invalid credentials
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm"
                >
                  Login to Admin
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview",    label: "Overview",    icon: TrendingUp },
    { id: "markets",     label: "Markets",     icon: BarChart2 },
    { id: "create",      label: "Create",      icon: PlusCircle },
    { id: "users",       label: "Users",       icon: Users },
    { id: "categories",  label: "Categories",  icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* Admin header */}
      <div className="bg-white border-b border-[#E8EAF0] sticky top-0 z-40" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[60px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-gray-900 text-sm">Admin Panel</span>
              <span className="text-xs text-gray-400 font-medium hidden sm:block">· Predic Hsm</span>
            </div>
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
          {tab === "overview"   && <OverviewTab />}
          {tab === "markets"    && <ManageMarkets />}
          {tab === "create"     && <CreateMarket />}
          {tab === "users"      && <ManageUsers />}
          {tab === "categories" && <ManageCategories />}
        </div>
      </div>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/admin/stats");
      setStats(data);
    } catch {
      toast.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const items = stats ? [
    { label: "Total Markets",   value: stats["totalMarkets"]   ?? 0, color: "text-indigo-600 bg-indigo-50", fmt: String },
    { label: "Active Markets",  value: stats["activeMarkets"]  ?? 0, color: "text-blue-600 bg-blue-50",    fmt: String },
    { label: "Resolved",        value: stats["resolvedMarkets"]?? 0, color: "text-emerald-600 bg-emerald-50", fmt: String },
    { label: "Total Users",     value: stats["totalUsers"]     ?? 0, color: "text-purple-600 bg-purple-50", fmt: String },
    { label: "Total Bets",      value: stats["totalBets"]      ?? 0, color: "text-amber-600 bg-amber-50",  fmt: String },
    { label: "Total Volume",    value: stats["totalVolume"]    ?? 0, color: "text-rose-600 bg-rose-50",    fmt: (v: number) => formatCurrency(v) },
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
          {items.map(({ label, value, color, fmt }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#E8EAF0] p-5 card-shadow space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className={cn("text-2xl font-extrabold", color.split(" ")[0])}>
                {fmt(value as number)}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white rounded-2xl border border-[#E8EAF0] p-5 card-shadow">
        <h3 className="font-bold text-gray-800 mb-3 text-sm">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Create New Market", color: "bg-indigo-600 text-white hover:bg-indigo-700", tab: "create" as Tab },
            { label: "Manage Markets",    color: "bg-white border border-[#E8EAF0] text-gray-700 hover:bg-slate-50", tab: "markets" as Tab },
            { label: "View Users",        color: "bg-white border border-[#E8EAF0] text-gray-700 hover:bg-slate-50", tab: "users" as Tab },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => document.dispatchEvent(new CustomEvent("admin-tab", { detail: action.tab }))}
              className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-colors", action.color)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Manage Markets ─────────────────────────────────────────────────────────────
function ManageMarkets() {
  const { data: markets, isLoading, refetch } = useListMarkets();
  const resolveMarket = useAdminResolveMarket();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked" | "resolved">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lockingId, setLockingId] = useState<string | null>(null);

  const filtered = markets?.filter(m => {
    const matchSearch = search.trim() === "" || m.question.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter || (statusFilter === "locked" && Date.now() >= m.lockTimestamp && m.status === "active");
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

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Delete market:\n"${question}"\n\nThis permanently removes the market. Bets are NOT refunded.`)) return;
    setDeletingId(id);
    try {
      await adminFetch(`/admin/markets/${id}`, { method: "DELETE" });
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
      await adminFetch(`/admin/markets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ lockTimestamp: Date.now() - 1 }),
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
          {(["all", "active", "locked", "resolved"] as const).map(s => (
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
            const isEffectivelyLocked = market.status !== "active" || Date.now() >= market.lockTimestamp;
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
                        {isResolved ? "Resolved" : isEffectivelyLocked ? "Locked" : "Active"}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 capitalize px-2 py-0.5 rounded-full bg-slate-50 border border-[#E8EAF0]">
                        {market.category}
                      </span>
                      {isResolved && market.winningOutcome && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {market.winningOutcome} Won
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{market.question}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-mono">
                      <span>YES: {formatCurrency(market.yesPool)}</span>
                      <span>NO: {formatCurrency(market.noPool)}</span>
                      <span className="font-semibold text-gray-600">Total: {formatCurrency(totalPool)}</span>
                      <span className="font-sans">Locks: {new Date(market.lockTimestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
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
                        onClick={() => handleDelete(market.id, market.question)}
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

function CreateMarket() {
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
    adminFetch("/admin/categories")
      .then(d => setCustomCats(d.categories ?? []))
      .catch(() => {});
  }, []);

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

    if (lockTimestamp <= Date.now()) {
      toast.error("Lock time must be in the future");
      return;
    }

    createMarket.mutate(
      { data: { question: form.question, category: category as never, lockTimestamp } },
      {
        onSuccess: () => {
          toast.success("Market created successfully!");
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
        <div className="px-6 py-4 border-b border-[#E8EAF0] bg-slate-50">
          <h2 className="font-extrabold text-gray-900">Create New Market</h2>
          <p className="text-xs text-gray-400 mt-0.5">Fill in all details before publishing</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Question */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Question *</label>
            <textarea
              required
              rows={3}
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 transition-colors bg-white resize-none font-medium placeholder:text-gray-300"
              placeholder="e.g. Will the HSM football team win the inter-college tournament?"
            />
            <p className="text-xs text-gray-400">Write a clear yes/no question about a future event.</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description (optional)</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 transition-colors bg-white resize-none font-medium placeholder:text-gray-300"
              placeholder="Additional context about this market..."
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category *</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="radio" checked={!form.useCustom} onChange={() => setForm({ ...form, useCustom: false })} className="accent-indigo-600" />
                Existing
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="radio" checked={form.useCustom} onChange={() => setForm({ ...form, useCustom: true })} className="accent-indigo-600" />
                New category
              </label>
            </div>

            {form.useCustom ? (
              <input
                required
                value={form.customCategory}
                onChange={e => setForm({ ...form, customCategory: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 transition-colors bg-white font-medium placeholder:text-gray-300"
                placeholder="e.g. campus-events, technology, arts..."
              />
            ) : (
              <div className="relative">
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full h-11 px-3.5 pr-9 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 transition-colors bg-white font-medium appearance-none"
                >
                  {allCategories.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Lock time */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Betting Closes *</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="radio" checked={form.lockMode === "hours"} onChange={() => setForm({ ...form, lockMode: "hours" })} className="accent-indigo-600" />
                Hours from now
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="radio" checked={form.lockMode === "datetime"} onChange={() => setForm({ ...form, lockMode: "datetime" })} className="accent-indigo-600" />
                Exact date & time
              </label>
            </div>

            {form.lockMode === "hours" ? (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  required
                  min="1"
                  max="8760"
                  value={form.hours}
                  onChange={e => setForm({ ...form, hours: e.target.value })}
                  className="w-32 h-11 px-3.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 font-mono font-semibold bg-white"
                />
                <span className="text-sm text-gray-500 font-medium">hours</span>
                {form.hours && (
                  <span className="text-xs text-gray-400 ml-1">
                    = {new Date(Date.now() + parseInt(form.hours) * 3600000).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            ) : (
              <input
                type="datetime-local"
                required
                value={form.lockDatetime}
                onChange={e => setForm({ ...form, lockDatetime: e.target.value })}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 transition-colors bg-white font-medium"
              />
            )}
          </div>

          {/* Preview */}
          {form.question && (
            <div className="bg-slate-50 rounded-xl border border-[#E8EAF0] p-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preview</p>
              <p className="text-sm font-semibold text-gray-800">{form.question}</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-400 font-medium">
                <span className="bg-white border border-[#E8EAF0] px-2 py-0.5 rounded-lg capitalize">
                  {form.useCustom ? form.customCategory || "custom" : form.category}
                </span>
                <span className="bg-white border border-[#E8EAF0] px-2 py-0.5 rounded-lg">
                  Closes: {new Date(preview).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={createMarket.isPending || !form.question.trim()}
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors disabled:opacity-40 shadow-sm"
          >
            {createMarket.isPending ? "Publishing Market..." : "Publish Market"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Manage Users ───────────────────────────────────────────────────────────────
function ManageUsers() {
  const { data: users, isLoading } = useAdminListUsers({ query: { queryKey: getAdminListUsersQueryKey() } });
  const adjustWallet = useAdminAdjustWallet();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<{ uid: string; name: string; balance: number } | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("Admin adjustment");
  const [search, setSearch] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);

  const filtered = users?.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !amount) return;
    adjustWallet.mutate(
      { uid: selected.uid, data: { amount: parseFloat(amount), reason } },
      {
        onSuccess: () => {
          toast.success(`Wallet adjusted for ${selected.name}`);
          setAmount("");
          setShowAdjust(false);
          queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
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
          placeholder="Search users by name or email..."
        />
      </div>

      <p className="text-xs text-gray-400 font-medium">{filtered.length} users</p>

      {/* Adjust panel */}
      {showAdjust && selected && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-5 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 text-sm">{selected.name}</p>
              <p className="text-xs text-gray-400">Current balance: <strong className="font-mono text-gray-700">{formatCurrency(selected.balance)}</strong></p>
            </div>
            <button onClick={() => setShowAdjust(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleAdjust} className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</label>
              <input
                type="number"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 bg-white font-mono font-semibold"
                placeholder="+5000 or -1000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reason</label>
              <input
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 bg-white font-medium"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={!amount || adjustWallet.isPending}
                className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors disabled:opacity-40"
              >
                {adjustWallet.isPending ? "..." : "Apply"}
              </button>
            </div>
          </form>
          {amount && (
            <p className="text-xs text-gray-400">
              New balance: <strong className="font-mono text-gray-700">{formatCurrency(selected.balance + parseFloat(amount || "0"))}</strong>
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-white rounded-2xl shimmer" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8EAF0] overflow-hidden card-shadow divide-y divide-[#E8EAF0]">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8 font-medium">No users found</p>
          ) : filtered.map((user, idx) => (
            <div
              key={user.uid}
              className={cn(
                "flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors",
                selected?.uid === user.uid && "bg-indigo-50"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.displayName ?? "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-sm font-bold text-gray-700">{formatCurrency(user.walletBalance)}</span>
                <button
                  onClick={() => {
                    setSelected({ uid: user.uid, name: user.displayName ?? user.email ?? user.uid, balance: user.walletBalance });
                    setShowAdjust(true);
                    setAmount("");
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Eye className="w-3 h-3" /> Adjust
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Manage Categories ──────────────────────────────────────────────────────────
const DEFAULT_CATS = ["sports", "college", "social", "national"];

function ManageCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/admin/categories");
      setCategories(data.categories ?? []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    const slug = newCat.trim().toLowerCase().replace(/\s+/g, "-");
    if (DEFAULT_CATS.includes(slug) || categories.includes(slug)) {
      toast.error("Category already exists");
      return;
    }
    setSaving(true);
    try {
      await adminFetch("/admin/categories", { method: "POST", body: JSON.stringify({ name: slug }) });
      setNewCat("");
      toast.success(`Category "${slug}" added`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Remove category "${name}"? Markets using it won't be affected.`)) return;
    setDeleting(name);
    try {
      await adminFetch(`/admin/categories/${name}`, { method: "DELETE" });
      toast.success(`Category "${name}" removed`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setDeleting(null);
    }
  };

  const allCats = [
    ...DEFAULT_CATS.map(c => ({ name: c, isDefault: true })),
    ...categories.filter(c => !DEFAULT_CATS.includes(c)).map(c => ({ name: c, isDefault: false })),
  ];

  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-white rounded-2xl border border-[#E8EAF0] overflow-hidden card-shadow">
        <div className="px-6 py-4 border-b border-[#E8EAF0] bg-slate-50">
          <h2 className="font-extrabold text-gray-900">Market Categories</h2>
          <p className="text-xs text-gray-400 mt-0.5">Add custom categories for new types of markets</p>
        </div>
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl shimmer" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {allCats.map(({ name, isDefault }) => (
                <div key={name} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-[#E8EAF0]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 capitalize">{name}</span>
                    {isDefault && (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md uppercase">Built-in</span>
                    )}
                  </div>
                  {!isDefault && (
                    <button
                      onClick={() => handleDelete(name)}
                      disabled={deleting === name}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" /> {deleting === name ? "..." : "Remove"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAdd} className="flex gap-2 pt-2">
            <input
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl border border-[#E8EAF0] text-sm outline-none focus:border-indigo-400 bg-white font-medium placeholder:text-gray-300"
              placeholder="e.g. technology, arts, events..."
            />
            <button
              type="submit"
              disabled={saving || !newCat.trim()}
              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors disabled:opacity-40"
            >
              {saving ? "..." : "Add"}
            </button>
          </form>
          <p className="text-xs text-gray-400">Spaces become hyphens. e.g. "campus events" → "campus-events"</p>
        </div>
      </div>
    </div>
  );
}
