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

    // If on onboarding: redirect to home if not logged in, or if already has profile
    if (location.startsWith("/onboarding")) {
      if (!user) { navigate("/"); return; }
      if (me) { navigate("/"); return; }
      return;
    }

    if (!user) return;
    if (isOnSkipPath) return;

    // Only redirect to onboarding for a definitive 404 (profile doesn't exist yet).
    // Do NOT redirect on network errors (API temporarily down).
    const errorStatus = error ? (error as { status?: number }).status : null;
    const isProfileNotFound = errorStatus === 404;

    if (isProfileNotFound) {
      navigate("/onboarding");
    }
  }, [user, loading, me, meLoading, error, location, isOnSkipPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
