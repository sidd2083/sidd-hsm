import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGetMe, getGetMeQueryKey, setAuthTokenGetter } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    setAuthTokenGetter(async () => {
      if (!auth.currentUser) return null;
      return auth.currentUser.getIdToken();
    });
  }, []);

  const { data: me, isLoading: meLoading, error } = useGetMe({
    query: {
      enabled: !!user,
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  const skipRedirectPaths = ["/auth", "/admin", "/terms", "/privacy", "/about"];
  const isOnSkipPath = skipRedirectPaths.some(p => location.startsWith(p));

  useEffect(() => {
    if (loading || meLoading) return;

    // On /onboarding: kick out if not logged in or already has profile
    if (location.startsWith("/onboarding")) {
      if (!user) { navigate("/"); return; }
      if (me) {
        // Profile exists — clear flag and go home
        if (user) localStorage.removeItem(`needs_onboarding_${user.uid}`);
        navigate("/");
      }
      return;
    }

    if (!user) return;
    if (isOnSkipPath) return;

    // API returned a definitive 404 → profile doesn't exist
    const errorStatus = error ? (error as { status?: number }).status : null;
    const isProfileNotFound = errorStatus === 404;

    // localStorage flag: set when Google reports isNewUser at sign-in time
    const localFlagSet = localStorage.getItem(`needs_onboarding_${user.uid}`) === "true";

    if (isProfileNotFound || localFlagSet) {
      navigate("/onboarding");
    }
  }, [user, loading, me, meLoading, error, location, isOnSkipPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-[13px] text-slate-400 font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
