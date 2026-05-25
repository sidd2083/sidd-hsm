import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useGetMe,
  useUpdateProfile,
  useListMyBets,
  useClaimDailyBonus,
  getGetMeQueryKey,
  getListMyBetsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/market-math";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Trophy,
  CheckCircle,
  Clock,
  Lock,
  Pencil,
  Gift,
  LogOut,
  User,
  BarChart2,
  Save,
  X,
} from "lucide-react";

const STREAMS = [
  "Class 11 - Science",
  "Class 11 - Management",
  "Class 12 - Science",
  "Class 12 - Management",
  "Bachelor",
];

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-bold font-mono mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function BetRow({ bet }: { bet: { id: string; marketQuestion?: string | null; type: string; amountPaid: number; status: string; payout?: number | null } }) {
  const isWon = bet.status === "won";
  const isLost = bet.status === "lost";
  const profit = (bet.payout ?? 0) - bet.amountPaid;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all",
      isWon ? "border-emerald-200/60 bg-emerald-50/30" :
      isLost ? "border-rose-200/40 bg-rose-50/20" :
      "border-border/40 hover:border-violet-200/60"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
        bet.type === "YES" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      )}>
        {bet.type}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{bet.marketQuestion ?? "Unknown market"}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {bet.status === "won" && <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-semibold"><CheckCircle className="w-3 h-3" /> Won</span>}
          {bet.status === "lost" && <span className="flex items-center gap-0.5 text-xs text-rose-500 font-semibold"><X className="w-3 h-3" /> Lost</span>}
          {bet.status === "active" && <span className="flex items-center gap-0.5 text-xs text-violet-600 font-semibold"><Clock className="w-3 h-3" /> Active</span>}
          {bet.status === "locked" && <span className="flex items-center gap-0.5 text-xs text-slate-500 font-semibold"><Lock className="w-3 h-3" /> Locked</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono text-sm font-semibold">{formatCurrency(bet.amountPaid)}</p>
        {isWon && <p className="text-xs text-emerald-600 font-semibold font-mono">+{formatCurrency(profit)}</p>}
        {isLost && <p className="text-xs text-rose-500 font-semibold font-mono">-{formatCurrency(bet.amountPaid)}</p>}
      </div>
    </div>
  );
}

export default function Profile() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: bets, isLoading: betsLoading } = useListMyBets({ query: { queryKey: getListMyBetsQueryKey() } });
  const updateProfile = useUpdateProfile();
  const claimBonus = useClaimDailyBonus();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: "", section: "", academicStream: "" });

  const startEdit = () => {
    setForm({
      displayName: me?.displayName ?? "",
      section: me?.section ?? "",
      academicStream: me?.academicStream ?? "",
    });
    setEditing(true);
  };

  const saveEdit = () => {
    updateProfile.mutate(
      { data: { displayName: form.displayName, section: form.section, academicStream: form.academicStream as never } },
      {
        onSuccess: () => {
          toast.success("Profile updated!");
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setEditing(false);
        },
        onError: () => toast.error("Failed to update profile"),
      }
    );
  };

  const handleClaimBonus = () => {
    claimBonus.mutate(undefined, {
      onSuccess: (data) => {
        if (data.claimed) {
          toast.success(`+${formatCurrency(data.bonus ?? 100)} daily bonus claimed! 🎉`);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        } else {
          toast.info("Already claimed today. Come back tomorrow!");
        }
      },
    });
  };

  const totalBets = bets?.length ?? 0;
  const wonBets = bets?.filter((b) => b.status === "won").length ?? 0;
  const lostBets = bets?.filter((b) => b.status === "lost").length ?? 0;
  const totalStaked = bets?.reduce((s, b) => s + b.amountPaid, 0) ?? 0;
  const totalWon = bets?.filter((b) => b.status === "won").reduce((s, b) => s + (b.payout ?? 0), 0) ?? 0;
  const netPnl = totalWon - totalStaked;
  const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl shimmer" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!me) return <Layout><div className="text-center py-20 text-muted-foreground">Not signed in</div></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-violet-600 font-semibold text-sm">
          <User className="w-4 h-4" />
          Account
        </div>

        <div className="bg-card border border-border/60 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 pt-8 pb-16 relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white blur-3xl" />
            </div>
          </div>
          <div className="px-6 pb-6 -mt-10 relative">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-violet-600 bg-gradient-to-br from-violet-50 to-indigo-100">
                  {me.displayName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="pb-1">
                  {editing ? (
                    <input
                      value={form.displayName}
                      onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                      className="text-2xl font-bold bg-transparent border-b-2 border-violet-400 outline-none w-48"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold">{me.displayName}</h1>
                  )}
                  <p className="text-muted-foreground text-sm">{me.email}</p>
                </div>
              </div>
              {!editing ? (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-2 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={updateProfile.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-all disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {updateProfile.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Academic Stream</label>
                {editing ? (
                  <select
                    value={form.academicStream}
                    onChange={(e) => setForm((f) => ({ ...f, academicStream: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-border/60 text-sm bg-background outline-none focus:border-violet-400"
                  >
                    {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <p className="font-semibold text-sm">{me.academicStream}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Section</label>
                {editing ? (
                  <input
                    value={form.section}
                    onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-border/60 text-sm bg-background outline-none focus:border-violet-400 uppercase"
                    placeholder="A"
                  />
                ) : (
                  <p className="font-semibold text-sm">{me.section}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">Wallet Balance</p>
              <p className="text-3xl font-black font-mono">{formatCurrency(me.walletBalance)}</p>
            </div>
          </div>
          <button
            onClick={handleClaimBonus}
            disabled={claimBonus.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
          >
            <Gift className="w-4 h-4" />
            Claim ₹100
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={BarChart2} label="Total Bets" value={totalBets.toString()} color="bg-violet-50 text-violet-600" />
          <StatCard icon={Trophy} label="Win Rate" value={`${winRate}%`} color="bg-amber-50 text-amber-600" />
          <StatCard icon={TrendingUp} label="Won" value={wonBets.toString()} color="bg-emerald-50 text-emerald-600" />
          <StatCard icon={TrendingDown} label="Lost" value={lostBets.toString()} color="bg-rose-50 text-rose-600" />
        </div>

        <div className="bg-card border border-border/60 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Trade History</h2>
            <span className="text-xs text-muted-foreground font-medium">{totalBets} total</span>
          </div>

          {betsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)}
            </div>
          ) : !bets?.length ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm font-medium">No trades yet</p>
              <p className="text-xs text-muted-foreground mt-1">Head to Markets to place your first bet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {bets.map((bet) => <BetRow key={bet.id} bet={{ ...bet, status: bet.status ?? "active", marketQuestion: bet.marketQuestion ?? null }} />)}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </Layout>
  );
}
