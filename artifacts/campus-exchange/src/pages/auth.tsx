import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";

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
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-slate-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/10" />
        <div className="absolute top-32 -left-16 w-64 h-64 rounded-full bg-indigo-500/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-black text-base">P</span>
            </div>
            <span className="text-white font-bold text-[16px] tracking-tight">Predic HSM</span>
          </div>

          <div className="mb-8">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">Campus Prediction Markets</p>
            <h1 className="text-4xl font-black text-white leading-tight">
              Predict.<br />Compete.<br />
              <span className="text-indigo-400">Win.</span>
            </h1>
          </div>
          <p className="text-slate-400 text-[14px] leading-relaxed max-w-[280px]">
            Trade virtual currency on college events, sports, and national outcomes. Pure strategy — zero real money.
          </p>
        </div>

        <div className="relative z-10 space-y-0 divide-y divide-slate-800">
          {[
            { label: "Starting balance", value: "₹10,000" },
            { label: "Daily login bonus", value: "₹100" },
            { label: "Real money involved", value: "None" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-4">
              <span className="text-slate-400 text-[14px]">{item.label}</span>
              <span className="text-white font-bold text-[14px]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 mb-4">
              <span className="text-white font-black text-2xl">P</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Predic HSM</h1>
            <p className="text-[14px] text-gray-500 mt-1">Campus prediction markets</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}>
            <div className="mb-7">
              <h2 className="text-[20px] font-black text-gray-900">Sign in to continue</h2>
              <p className="text-[14px] text-gray-400 mt-1">Use your college Google account</p>
            </div>

            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[14px] font-semibold text-gray-700 transition-all disabled:opacity-60 active:scale-[0.98]"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              {signingIn ? (
                <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {signingIn ? "Signing in…" : "Continue with Google"}
            </button>

            {error && (
              <div className="mt-3 text-[13px] text-red-600 bg-red-50 rounded-xl px-4 py-3 text-center border border-red-100">
                {error}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
              {[
                { num: "₹10K", sub: "Start balance" },
                { num: "₹100", sub: "Daily bonus" },
                { num: "0%", sub: "Real money" },
              ].map((s) => (
                <div key={s.sub} className="bg-slate-50 rounded-xl py-3 px-2">
                  <p className="text-[15px] font-black text-indigo-600">{s.num}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[12px] text-gray-400 mt-5 leading-relaxed px-2">
            By signing in you agree to our{" "}
            <Link href="/terms"><span className="text-indigo-500 hover:underline cursor-pointer font-medium">Terms</span></Link>
            {" & "}
            <Link href="/privacy"><span className="text-indigo-500 hover:underline cursor-pointer font-medium">Privacy Policy</span></Link>.
            <br />Virtual currency only — no real money involved.
          </p>
        </div>
      </div>
    </div>
  );
}
