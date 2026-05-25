import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { AppWrapper } from "@/components/app-wrapper";

const Home = lazy(() => import("@/pages/home"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
const MarketDetail = lazy(() => import("@/pages/market-detail"));
const Portfolio = lazy(() => import("@/pages/portfolio"));
const Wallet = lazy(() => import("@/pages/wallet"));
const Settings = lazy(() => import("@/pages/settings"));
const Admin = lazy(() => import("@/pages/admin"));
const Auth = lazy(() => import("@/pages/auth"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const About = lazy(() => import("@/pages/about"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/market/:id" component={MarketDetail} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/settings" component={Settings} />
        <Route path="/auth" component={Auth} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/admin" component={Admin} />
        <Route path="/about" component={About} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppWrapper>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </AppWrapper>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
