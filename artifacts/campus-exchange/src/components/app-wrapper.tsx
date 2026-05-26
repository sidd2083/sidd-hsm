import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGetMe, getGetMeQueryKey, setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Point API calls at the external backend when VITE_API_URL is set
    // (required on Vercel — the Express server runs separately)
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) setBaseUrl(apiUrl.replace(/\/+$/, ""));

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

  const SKIP_PATHS = ["/auth", "/admin", "/terms", "/privacy", "/about"];
  const isOnSkipPath = SKIP_PATHS.some(p => location.startsWith(p));

  useEffect(() => {
    if (loading || meLoading) return;

    // ── On /onboarding ─────────────────────────────────────────
    if (location.startsWith("/onboarding")) {
      if (!user) { navigate("/"); return; }
      // Profile already exists → kick back to home
      if (me) {
        localStorage.removeItem(`needs_onboarding_${user.uid}`);
        navigate("/");
      }
      return;
    }

    if (!user) return;
    if (isOnSkipPath) return;

    // If we already have a profile, never redirect to onboarding
    if (me) return;

    const errorStatus = error ? (error as { status?: number }).status : null;

    // Method 1: API returned 404 — profile definitely doesn't exist
    const isProfileNotFound = errorStatus === 404;

    // Method 2: localStorage flag set at sign-in when Google reported isNewUser
    const localFlagSet = localStorage.getItem(`needs_onboarding_${user.uid}`) === "true";

    // Method 3: Firebase account created very recently (≤ 90 s)
    const createdAt = user.metadata.creationTime
      ? new Date(user.metadata.creationTime).getTime()
      : 0;
    const isVeryNewUser = createdAt > 0 && Date.now() - createdAt < 90_000;

    // Even if the server is down (503), still redirect new users to onboarding
    // so they can see the form (profile creation from onboarding will also fail gracefully)
    if (errorStatus === 503 && !localFlagSet && !isVeryNewUser) return;

    if (isProfileNotFound || localFlagSet || isVeryNewUser) {
      navigate("/onboarding");
    }
  }, [user, loading, me, meLoading, error, location, isOnSkipPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-400 font-medium">Loading Predic HSM…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
