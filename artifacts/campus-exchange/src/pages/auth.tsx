import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { PredicLogo } from "@/components/logo";

export default function Auth() {
  const { user, loading, signIn } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#E8EAF0] overflow-hidden" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)" }}>
          {/* Top color strip */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="p-8 space-y-8">
            {/* Logo + title */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <PredicLogo size={34} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  Welcome to <span className="text-indigo-600">Predic Hsm</span>
                </h1>
                <p className="text-sm text-gray-400 mt-1.5 font-medium">
                  Campus prediction markets · Start with Rs. 1,00,000
                </p>
              </div>
            </div>

            {/* Sign in box */}
            <div className="space-y-3">
              <p className="text-xs text-center font-semibold text-gray-400 uppercase tracking-wider">Sign in or create account</p>

              <button
                onClick={signIn}
                className="group w-full flex items-center justify-center gap-3 h-12 px-5 bg-white border-2 border-[#E8EAF0] rounded-2xl text-sm font-bold text-gray-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-150 shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "₹1L", label: "Starting balance", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
                { value: "₹100", label: "Daily bonus", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
                { value: "0%", label: "Real money", color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
              ].map((item) => (
                <div key={item.label} className={`rounded-2xl border px-3 py-3.5 text-center ${item.bg}`}>
                  <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] font-semibold text-gray-400 mt-0.5 leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer disclaimer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-[#E8EAF0] text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              By signing in you agree this is <strong className="text-gray-500">virtual currency only</strong>. No real money is involved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
