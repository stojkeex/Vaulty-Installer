import { Switch, Route, Redirect, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Marketplace from "@/pages/marketplace";
import ChatbotCustomization from "@/pages/chatbot-customization";
import WalletPage from "@/pages/wallet";
import Landing from "@/pages/landing";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { BottomNav } from "@/components/bottom-nav";

import { LoadingScreen } from "@/components/loading-screen";
import { Component, useState, useEffect, type ErrorInfo, type ReactNode } from "react";

// Protected Route Component
function ProtectedRoute({ component: Component, hideNav = false }: { component: React.ComponentType, hideNav?: boolean }) {
  const { user, loading } = useAuth();
  
  if (loading) return null; 
  if (!user) return <Redirect to="/login" />;
  
  return <Component />;
}

function Router() {
  return (
    <div className="relative min-h-screen bg-[#000000] text-white">
      <Switch>
        <Route path="/landing" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={() => <Redirect to="/landing" />} />
        
        <Route path="/home" component={() => <ProtectedRoute component={Home} />} />
        <Route path="/marketplace" component={() => <ProtectedRoute component={Marketplace} />} />
        <Route path="/wallet" component={() => <ProtectedRoute component={WalletPage} hideNav={true} />} />
        <Route path="/bot/:id/customize" component={() => <ProtectedRoute component={ChatbotCustomization} hideNav={true} />} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

class RouteErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Route render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#000000] px-6 text-white">
          <div className="w-full max-w-sm rounded-[32px] border-vaulty-gradient bg-white/5 p-6 text-center shadow-[0_20px_60px_rgba(0,204,255,0.15)] backdrop-blur-2xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Vaulty</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">Something on this page broke.</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              I kept the app alive, but this screen needs a refresh.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full rounded-full bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
                data-testid="button-route-error-reload"
              >
                Reload page
              </button>
              <Link
                href="/home"
                className="w-full rounded-full border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                data-testid="link-route-error-home"
              >
                Go to home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Protect all images from being saved/downloaded
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('dragstart', handleDragStart, true);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('dragstart', handleDragStart, true);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {showSplash && (
            <LoadingScreen onComplete={() => setShowSplash(false)} />
          )}
          {!showSplash && (
            <>
              <RouteErrorBoundary>
                <Router />
              </RouteErrorBoundary>
              <BottomNav />
              <Toaster />
            </>
          )}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
