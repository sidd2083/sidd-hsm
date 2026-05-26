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

  const SKIP_PATHS = ["/auth", "/admin", "/terms", "/privacy", "/about"];
  const isOnSkipPath = SKIP_PATHS.some(p => location.startsWith(p));

  useEffect(() => {
    if (loading || meLoading) return;

    // On /onboarding: kick out if not logged in, or profile already exists
    if (location.startsWith("/onboarding")) {
      if (!user) { navigate("/"); return; }
      if (me) {
        if (user) localStorage.removeItem(`needs_onboarding_${user.uid}`);
        navigate("/");
      }
      return;
    }

    if (!user) return;
    if (isOnSkipPath) return;

    // Method 1: API returned definitive 404 — no profile exists
    const errorStatus = error ? (error as { status?: number }).status : null;
    const isProfileNotFound = errorStatus === 404;

    // Method 2: localStorage flag set at sign-in time when Google reports isNewUser
    const localFlagSet = localStorage.getItem(`needs_onboarding_${user.uid}`) === "true";

    // Method 3: Firebase user was created very recently (within 60 seconds) — reliable new-user signal
    const createdAt = user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
    const isVeryNewUser = createdAt > 0 && Date.now() - createdAt < 60_000;

    if (isProfileNotFound || localFlagSet || isVeryNewUser) {
      navigate("/onboarding");
    }
  }, [user, loading, me, meLoading, error, location, isOnSkipPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-400 font-medium">Loading Predic HSM…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
