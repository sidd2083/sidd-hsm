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
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[400px] shrink-0 bg-indigo-600 p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-800" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-20 -left-10 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="text-white font-bold tracking-tight">Predic HSM</span>
          </div>

          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Predict.<br />Compete.<br />Win.
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed max-w-[260px]">
            Trade virtual currency on college events, sports, and national outcomes. Pure strategy, zero real money.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            { label: "Starting balance", value: "₹1,00,000" },
            { label: "Daily login bonus", value: "₹100" },
            { label: "Real money involved", value: "Zero" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
              <span className="text-indigo-300 text-sm">{item.label}</span>
              <span className="text-white font-semibold text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — sign in */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F7F8FA] px-6 py-12">
        <div className="w-full max-w-[340px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-3">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Predic HSM</h1>
            <p className="text-sm text-gray-500 mt-1">College prediction markets</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-7" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Sign in to continue</h2>
              <p className="text-sm text-gray-400 mt-0.5">Use your college Google account</p>
            </div>

            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all disabled:opacity-60"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              {signingIn ? (
                <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {signingIn ? "Signing in…" : "Continue with Google"}
            </button>

            {error && (
              <div className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center border border-red-100">
                {error}
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-gray-50 grid grid-cols-3 gap-2 text-center">
              {[
                { num: "₹1L", sub: "Start balance" },
                { num: "₹100", sub: "Daily bonus" },
                { num: "0%", sub: "Real money" },
              ].map((s) => (
                <div key={s.sub}>
                  <p className="text-sm font-bold text-indigo-600">{s.num}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed px-2">
            By signing in you agree to our{" "}
            <Link href="/terms"><span className="text-indigo-500 hover:underline cursor-pointer">Terms</span></Link>
            {" & "}
            <Link href="/privacy"><span className="text-indigo-500 hover:underline cursor-pointer">Privacy Policy</span></Link>.
            <br />Virtual currency only — no real money involved.
          </p>
        </div>
      </div>
    </div>
  );
}
