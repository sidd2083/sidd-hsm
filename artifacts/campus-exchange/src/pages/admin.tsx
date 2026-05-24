import { useState } from "react";
import { Layout } from "@/components/layout";
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
import { Users, PlusCircle, BarChart2, LogOut, CheckCircle, X } from "lucide-react";

type Tab = "markets" | "create" | "users";

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [tab, setTab] = useState<Tab>("markets");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "siddhant" && password === "siddhant2078") {
      setAdminCredentials(username, password);
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setAdminCredentials(null, null);
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">Predic Hsm management dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="border border-border rounded-xl p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setAuthError(false); }}
                className={cn(
                  "w-full h-11 px-3 rounded-lg border text-sm outline-none transition-colors bg-background",
                  authError ? "border-rose-400" : "border-border focus:border-foreground"
                )}
                placeholder="Username"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
                className={cn(
                  "w-full h-11 px-3 rounded-lg border text-sm outline-none transition-colors bg-background",
                  authError ? "border-rose-400" : "border-border focus:border-foreground"
                )}
                placeholder="Password"
                required
              />
            </div>
            {authError && (
              <p className="text-sm text-rose-600 flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" /> Invalid credentials
              </p>
            )}
            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "markets", label: "Manage Markets", icon: BarChart2 },
    { id: "create", label: "Create Market", icon: PlusCircle },
    { id: "users", label: "Manage Users", icon: Users },
  ];

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Logged in as <span className="font-semibold">{username}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="flex gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div>
          {tab === "markets" && <ManageMarkets />}
          {tab === "create" && <CreateMarket />}
          {tab === "users" && <ManageUsers />}
        </div>
      </div>
    </Layout>
  );
}

function ManageMarkets() {
  const { data: markets, isLoading } = useListMarkets();
  const resolveMarket = useAdminResolveMarket();
  const queryClient = useQueryClient();

  const handleResolve = (id: string, outcome: "YES" | "NO") => {
    if (!confirm(`Resolve as ${outcome}? This cannot be undone.`)) return;
    resolveMarket.mutate({ id, data: { outcome } }, {
      onSuccess: () => {
        toast.success(`Market resolved as ${outcome}`);
        queryClient.invalidateQueries({ queryKey: getListMarketsQueryKey() });
      },
      onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
    });
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading markets...</div>;

  const activeMarkets = markets?.filter(m => m.status === "active" || m.status === "locked") ?? [];
  const resolvedMarkets = markets?.filter(m => m.status === "resolved") ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active / Locked ({activeMarkets.length})</h2>
        {activeMarkets.length === 0 ? (
          <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-4 text-center">No active markets</p>
        ) : (
          <div className="space-y-2">
            {activeMarkets.map(market => (
              <div key={market.id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full border",
                      market.status === "active" ? "text-blue-600 border-blue-200 bg-blue-50" : "text-muted-foreground border-border"
                    )}>
                      {market.status}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">{market.category}</span>
                  </div>
                  <p className="text-sm font-medium">{market.question}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span>YES Pool: {formatCurrency(market.yesPool)}</span>
                    <span>NO Pool: {formatCurrency(market.noPool)}</span>
                    <span>Total: {formatCurrency(market.yesPool + market.noPool)}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleResolve(market.id, "YES")}
                    disabled={resolveMarket.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-60"
                  >
                    <CheckCircle className="w-3 h-3" /> YES wins
                  </button>
                  <button
                    onClick={() => handleResolve(market.id, "NO")}
                    disabled={resolveMarket.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-60"
                  >
                    <X className="w-3 h-3" /> NO wins
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {resolvedMarkets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resolved ({resolvedMarkets.length})</h2>
          <div className="space-y-2">
            {resolvedMarkets.map(market => (
              <div key={market.id} className="border border-border rounded-lg p-4 opacity-60">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {market.winningOutcome} won
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{market.category}</span>
                </div>
                <p className="text-sm font-medium">{market.question}</p>
                <p className="text-xs text-muted-foreground mt-1">Pool: {formatCurrency(market.yesPool + market.noPool)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateMarket() {
  const createMarket = useAdminCreateMarket();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ question: "", category: "college", hoursToLock: "48" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lockTimestamp = Date.now() + parseInt(form.hoursToLock) * 3600000;
    createMarket.mutate(
      { data: { question: form.question, category: form.category as never, lockTimestamp } },
      {
        onSuccess: () => {
          toast.success("Market created!");
          setForm({ ...form, question: "" });
          queryClient.invalidateQueries({ queryKey: getListMarketsQueryKey() });
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to create"),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Question</label>
        <textarea
          required
          rows={3}
          value={form.question}
          onChange={e => setForm({ ...form, question: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-border text-sm outline-none focus:border-foreground transition-colors bg-background resize-none"
          placeholder="Will the college football team win their next match?"
        />
        <p className="text-xs text-muted-foreground">Write a clear yes/no question about a future event.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Category</label>
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="w-full h-11 px-3 rounded-lg border border-border text-sm outline-none focus:border-foreground transition-colors bg-background"
        >
          <option value="sports">⚽ Sports</option>
          <option value="college">🏫 College</option>
          <option value="social">📱 Social</option>
          <option value="national">🌐 National</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Betting closes in (hours)</label>
        <input
          type="number"
          required
          min="1"
          max="720"
          value={form.hoursToLock}
          onChange={e => setForm({ ...form, hoursToLock: e.target.value })}
          className="w-full h-11 px-3 rounded-lg border border-border text-sm outline-none focus:border-foreground transition-colors bg-background"
        />
        <p className="text-xs text-muted-foreground">After this time, no new bets can be placed.</p>
      </div>

      <button
        type="submit"
        disabled={createMarket.isPending}
        className="w-full h-11 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {createMarket.isPending ? "Creating..." : "Create Market"}
      </button>
    </form>
  );
}

function ManageUsers() {
  const { data: users, isLoading } = useAdminListUsers({ query: { queryKey: getAdminListUsersQueryKey() } });
  const adjustWallet = useAdminAdjustWallet();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<{ uid: string; name: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("Admin adjustment");
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter(u =>
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
          queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
      }
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Users ({users?.length ?? 0})</h2>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-border text-sm outline-none focus:border-foreground transition-colors bg-background"
          placeholder="Search by name or email..."
        />
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto border border-border rounded-lg divide-y divide-border">
            {filteredUsers.map(user => (
              <button
                key={user.uid}
                onClick={() => setSelected({ uid: user.uid, name: user.displayName ?? user.email ?? user.uid })}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors text-sm",
                  selected?.uid === user.uid ? "bg-muted" : ""
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.displayName ?? "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <span className="font-mono text-xs text-muted-foreground ml-2 shrink-0">{formatCurrency(user.walletBalance)}</span>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No users found</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Adjust Wallet</h2>
        {selected ? (
          <div className="text-sm border border-border rounded-lg px-4 py-3 bg-muted/30">
            Selected: <span className="font-semibold">{selected.name}</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground border border-dashed rounded-lg px-4 py-3">
            Select a user from the list
          </div>
        )}
        <form onSubmit={handleAdjust} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Amount (positive to add, negative to subtract)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border text-sm outline-none focus:border-foreground transition-colors bg-background font-mono"
              placeholder="e.g. 5000 or -1000"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Reason</label>
            <input
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border text-sm outline-none focus:border-foreground transition-colors bg-background"
            />
          </div>
          <button
            type="submit"
            disabled={!selected || adjustWallet.isPending}
            className="w-full h-11 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {adjustWallet.isPending ? "Adjusting..." : "Apply Adjustment"}
          </button>
        </form>
      </div>
    </div>
  );
}
