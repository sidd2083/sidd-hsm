import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { PredicLogo } from "@/components/logo";
import { Link } from "wouter";

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
      setError("Sign-in failed. Please try again or allow popups for this site.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <PredicLogo size={26} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Predic HSM
          </h1>
          <p className="text-sm text-gray-500">
            College prediction markets for HSM students
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Sign in to continue</p>
          </div>

          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
          >
            {signingIn ? (
              <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {signingIn ? "Signing in..." : "Continue with Google"}
          </button>

          {error && (
            <p className="text-xs text-red-500 text-center bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {[
              { value: "₹1L", label: "Starting credits", color: "text-emerald-600" },
              { value: "₹100", label: "Daily bonus", color: "text-indigo-600" },
              { value: "0%", label: "Real money", color: "text-gray-500" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-gray-50 px-2 py-2.5 text-center border border-gray-100">
                <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 leading-relaxed px-2">
          By signing in you agree to our{" "}
          <Link href="/terms"><span className="text-indigo-500 hover:underline cursor-pointer">Terms</span></Link>
          {" & "}
          <Link href="/privacy"><span className="text-indigo-500 hover:underline cursor-pointer">Privacy Policy</span></Link>.
          Virtual currency only — no real money.
        </p>
      </div>
    </div>
  );
}
