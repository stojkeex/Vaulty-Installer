import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Ai from "@/pages/ai";
import Premium from "@/pages/premium";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Posts from "@/pages/posts";
import PostDetail from "@/pages/post-detail";
import Profile from "@/pages/profile";
import PublicProfile from "@/pages/public-profile";
import Search from "@/pages/search";
import EditProfile from "@/pages/edit-profile";
import Settings from "@/pages/settings";
import Shop from "@/pages/shop";
import CoinDetail from "@/pages/coin-detail";
import DemoTrading from "@/pages/demo-trading";
import DemoCoinDetail from "@/pages/demo-coin-detail";
import FollowList from "@/pages/follow-list";
import Support from "@/pages/support"; 
import Quests from "@/pages/quests"; 
import Academy from "@/pages/academy"; 
import Article from "@/pages/article"; 
import Notifications from "@/pages/notifications"; 
import CardCustomization from "@/pages/card-customization";
import WalletPage from "@/pages/wallet";
import WalletSettingsPage from "@/pages/wallet-settings";
import Discover from "@/pages/discover";
import GoalsPage from "@/pages/goals";
import ImageSave from "@/pages/image-save";
import CreatePost from "@/pages/create-post";
import CreateNews from "@/pages/create-news";
import ToolsPage from "@/pages/tools";
import CourseDetailPage from "@/pages/course-detail";
import VaultyCoinInfoPage from "@/pages/vaulty-coin-info";
import Landing from "@/pages/landing";
import FeatureDetailPage from "@/pages/feature-detail";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { CurrencyProvider } from "@/contexts/currency-context";
import { PremiumProvider } from "@/contexts/premium-context";
import { GlobalNotificationProvider } from "@/contexts/global-notification-context";
import { FeedProvider } from "@/contexts/feed-context";
import { CallProvider } from "@/contexts/call-context";
import { BottomNav } from "@/components/bottom-nav";
import { IncomingCallModal } from "@/components/incoming-call-modal";
import { ActiveCallModal } from "@/components/active-call-modal";

import { LoadingScreen } from "@/components/loading-screen";
import { GlobalNotificationDisplay } from "@/components/global-notification-display";
import { Component, useState, useEffect, type ErrorInfo, type ReactNode } from "react";
import { RatingProvider } from "@/components/rating-provider";

import EarnPage from "@/pages/earn";
import CourseDetail from "@/pages/course-detail";
import TOSPage from "@/pages/tos";
import Comments from "@/pages/comments";

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
        <Route path="/feature/:id" component={FeatureDetailPage} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={() => <Redirect to="/landing" />} />
        
        {/* Home is now just Feed, no tabs param needed, but we keep /home for compatibility */}
        <Route path="/home" component={() => <ProtectedRoute component={Home} />} />
        <Route path="/goals" component={() => <ProtectedRoute component={GoalsPage} hideNav={true} />} />
        {/* Support old route but redirect to home */}
        <Route path="/home/:tab" component={() => <Redirect to="/home" />} />
        <Route path="/create-post" component={() => <ProtectedRoute component={CreatePost} />} />

        <Route path="/discover" component={() => <ProtectedRoute component={Discover} />} />
        <Route path="/create-news" component={() => <ProtectedRoute component={CreateNews} />} />
        <Route path="/news" component={() => <ProtectedRoute component={NewsPage} />} />
        <Route path="/news/:slug" component={() => <ProtectedRoute component={NewsDetail} />} />
        
        <Route path="/earn" component={() => <ProtectedRoute component={EarnPage} />} />
        <Route path="/course/:id" component={() => <ProtectedRoute component={CourseDetail} hideNav={true} />} />
        <Route path="/tos" component={() => <ProtectedRoute component={TOSPage} hideNav={true} />} />

        {/* Hide Nav for AI page as requested */}
        <Route path="/tools" component={() => <ProtectedRoute component={Ai} hideNav={true} />} />
        <Route path="/ai" component={() => <ProtectedRoute component={Ai} hideNav={true} />} />
        <Route path="/image-save" component={() => <ProtectedRoute component={ImageSave} hideNav={true} />} />
        
        <Route path="/info/vaulty-coin" component={() => <ProtectedRoute component={VaultyCoinInfoPage} hideNav={true} />} />
        <Route path="/premium" component={() => <ProtectedRoute component={Premium} />} />
        <Route path="/posts" component={() => <ProtectedRoute component={Posts} />} />
        <Route path="/post/:id" component={() => <ProtectedRoute component={PostDetail} />} />
        <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
        <Route path="/user/:id" component={() => <ProtectedRoute component={PublicProfile} />} />
        
        <Route path="/users/:id/:type" component={() => <ProtectedRoute component={FollowList} />} />
        <Route path="/search" component={() => <ProtectedRoute component={Search} />} />
        <Route path="/edit-profile" component={() => <ProtectedRoute component={EditProfile} />} />
        <Route path="/customization" component={() => <ProtectedRoute component={CardCustomization} />} />
        <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
        <Route path="/shop" component={() => <ProtectedRoute component={Shop} />} />
        <Route path="/coin/:id" component={() => <ProtectedRoute component={CoinDetail} hideNav={true} />} />
        <Route path="/demo-trading" component={() => <ProtectedRoute component={DemoTrading} />} />
        <Route path="/demo-trading/:id" component={() => <ProtectedRoute component={DemoCoinDetail} />} />
        <Route path="/support" component={() => <ProtectedRoute component={Support} />} />
        <Route path="/quests" component={() => <ProtectedRoute component={Quests} />} />
        <Route path="/academy" component={() => <ProtectedRoute component={Academy} />} /> 
        <Route path="/academy/:slug" component={() => <ProtectedRoute component={Article} />} /> 
        <Route path="/notifications" component={() => <ProtectedRoute component={Notifications} />} /> 
        <Route path="/wallet" component={() => <ProtectedRoute component={WalletPage} hideNav={true} />} />
        <Route path="/wallet/settings" component={() => <ProtectedRoute component={WalletSettingsPage} hideNav={true} />} />
        <Route path="/comments/:id" component={() => <ProtectedRoute component={Comments} hideNav={true} />} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

import { PremiumThanksProvider } from "@/components/premium-thanks-modal";

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
          <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-white/5 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
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
        <PremiumProvider>
          <PremiumThanksProvider>
            <CurrencyProvider>
              <NotificationProvider>
                <GlobalNotificationProvider>
                  <FeedProvider>
                    <TooltipProvider>
                      <RatingProvider>
                        {showSplash && (
                          <LoadingScreen onComplete={() => setShowSplash(false)} />
                        )}
                        {!showSplash && (
                          <>
                            <GlobalNotificationDisplay />
                            <RouteErrorBoundary>
                              <Router />
                            </RouteErrorBoundary>
                            <BottomNav />
                            <Toaster />
                          </>
                        )}
                      </RatingProvider>
                    </TooltipProvider>
                  </FeedProvider>
                </GlobalNotificationProvider>
              </NotificationProvider>
            </CurrencyProvider>
          </PremiumThanksProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
