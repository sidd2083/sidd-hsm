import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/lib/auth-context";
import { AppWrapper } from "@/components/app-wrapper";

import Home from "@/pages/home";
import Leaderboard from "@/pages/leaderboard";
import MarketDetail from "@/pages/market-detail";
import Portfolio from "@/pages/portfolio";
import Wallet from "@/pages/wallet";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import Auth from "@/pages/auth";
import Onboarding from "@/pages/onboarding";
import About from "@/pages/about";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";

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

function Router() {
  return (
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
