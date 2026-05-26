import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { PredicLogo } from "@/components/logo";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const STATS = [
  { num: "₹1,00,000", sub: "Starting balance" },
  { num: "₹100", sub: "Daily bonus" },
  { num: "0", sub: "Real money" },
];

const FEATURES = [
  { label: "Predict sports, college & national events" },
  { label: "Compete on the leaderboard with classmates" },
  { label: "Track your P&L and win rate" },
  { label: "Markets created by HSM administrators only" },
];

export default function Auth() {
  const { user, loading, signIn } = useAuth();
  const [, navigate] = useLocation();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [user, loading]);

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signIn();
    } catch {
      setError("Sign-in failed. Allow popups for this site and try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Left branding panel (desktop) ─────────────────────── */}
      <div className="hidden lg:flex flex-col w-[460px] shrink-0 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950" />
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-indigo-600/8" />
        <div className="absolute top-24 -left-20 w-72 h-72 rounded-full bg-indigo-500/5" />
        <div className="absolute top-1/2 right-8 w-40 h-40 rounded-full bg-indigo-400/4" />

        <div className="relative z-10 flex flex-col flex-1 p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <PredicLogo size={18} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-[17px] text-white tracking-tight">Predic</span>
              <span className="font-black text-[17px] text-indigo-400 tracking-tight">HSM</span>
            </div>
          </div>

          {/* Headline */}
          <div className="flex-1">
            <p className="text-indigo-400 text-[11px] font-bold uppercase tracking-[0.18em] mb-5">
              Campus Prediction Markets
            </p>
            <h1 className="text-[40px] font-black text-white leading-[1.1] tracking-tight mb-6">
              Predict.<br />Compete.<br />
              <span className="text-indigo-400">Win.</span>
            </h1>
            <p className="text-slate-400 text-[14px] leading-relaxed max-w-[280px] mb-10">
              Trade virtual currency on college events, sports, and national outcomes. Pure strategy — zero real money.
            </p>

            {/* Feature checklist */}
            <div className="space-y-3">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-[13px]">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="border-t border-slate-800 pt-6 grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.sub}>
                <p className="text-white font-black text-[17px] tracking-tight leading-none mb-1">{s.num}</p>
                <p className="text-slate-500 text-[12px] font-medium">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right sign-in panel ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 mb-4 shadow-xl shadow-slate-900/20">
              <PredicLogo size={28} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Predic HSM</h1>
            <p className="text-[14px] text-gray-400 mt-1 font-medium">Campus prediction markets</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)" }}>

            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500" />

            <div className="p-8">
              <div className="mb-7">
                <h2 className="text-[22px] font-black text-gray-900 tracking-tight">Sign in to continue</h2>
                <p className="text-[14px] text-gray-400 mt-1 font-medium">Use your college Google account to get started</p>
              </div>

              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[14px] font-semibold text-gray-700 transition-all disabled:opacity-60 active:scale-[0.98] select-none"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 0 transparent" }}
              >
                {signingIn ? (
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {signingIn ? "Signing in…" : "Continue with Google"}
              </button>

              {error && (
                <div className="mt-3 text-[13px] text-red-600 bg-red-50 rounded-xl px-4 py-3 text-center border border-red-100 leading-snug">
                  {error}
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider text-center mb-4">What you get</p>
                <div className="grid grid-cols-3 gap-2">
                  {STATS.map((s) => (
                    <div key={s.sub} className="text-center bg-slate-50 rounded-xl py-3 px-2 border border-gray-100">
                      <p className="text-[15px] font-black text-indigo-600 leading-none mb-1">{s.num}</p>
                      <p className="text-[10px] text-gray-400 font-medium leading-tight">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-[12px] text-gray-400 mt-5 leading-relaxed px-2">
            By signing in you agree to our{" "}
            <Link href="/terms"><span className="text-indigo-500 hover:underline cursor-pointer font-medium">Terms</span></Link>
            {" & "}
            <Link href="/privacy"><span className="text-indigo-500 hover:underline cursor-pointer font-medium">Privacy Policy</span></Link>.
            {" "}Virtual currency only — no real money.
          </p>
        </div>
      </div>
    </div>
  );
}
