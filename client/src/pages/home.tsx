import { VaultyIcon } from "@/components/ui/vaulty-icon";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { useState, useEffect, useRef, useMemo } from "react";

import { 
    Search, Bell, Wallet, Loader2, Sparkles, Send, Image as ImageIcon, X, Plus,
    User, Video, Users, Bookmark, List, Mic2, Beaker, Globe, Settings, HelpCircle, Sun, Moon,
    LineChart, GraduationCap, TrendingUp, TrendingDown, Coins, Target, ChevronRight, Check,
    ArrowDownToLine, ArrowUpFromLine, Brain, Trophy, AreaChart as AreaChartIcon, BookOpen
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PostCard } from "@/components/post-card";
import { CompleteProfileWidget } from "@/components/complete-profile-widget";
import { isAdmin, isSuperAdmin } from "@/lib/admins";
import { motion, AnimatePresence } from "framer-motion";
import { getCoinsByIds, getTopCoins, searchCoins, type Coin } from "@/lib/coingecko";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/contexts/currency-context";
import { useDemoStore, INITIAL_DEMO_BALANCE } from "@/hooks/use-demo-store";

// Assets
import vaultyChristmasLogo from "@assets/IMG_1067_1775569221193.png";
import badgeProImage from "@assets/IMG_1085_1775581026902.png";
import humanStudioImage from "@assets/IMG_0974_1775320765483.jpeg";
import vaultyLogoImage from "@assets/IMG_1067_1775729849437.png";

const BANNERS = [
  {
    title: "Bring Your Dream To Reality",
    subtitle: "Set goals and track your progress",
    icon: Target,
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "Earn XP and Get Gifts",
    subtitle: "Complete quests to earn rewards",
    icon: Coins,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Learn Everything About Finance",
    subtitle: "Join our academy for exclusive courses",
    icon: GraduationCap,
    color: "from-emerald-400 to-teal-500"
  }
];

const HOME_SHORTCUTS = [
  {
    title: "Finance Analysis",
    description: "Overview of your portfolio",
    href: "/wallet",
    icon: LineChart,
  },
  {
    title: "Learning",
    description: "Academy and courses",
    href: "/academy",
    icon: GraduationCap,
  },
  {
    title: "Demo Trading",
    description: "Trade without risk",
    href: "/demo-trading",
    icon: TrendingUp,
  },
  {
    title: "Collect Points",
    description: "Complete tasks and earn",
    href: "/quests",
    icon: Coins,
  }
];

const FINANCE_NEWS = [
  {
    kicker: "Markets",
    title: "Stocks open mixed as traders wait for fresh inflation data",
    summary: "Investors are staying cautious as rate-cut expectations keep shifting across global markets."
  },
  {
    kicker: "Crypto",
    title: "Bitcoin holds key support while altcoins trade in a narrow range",
    summary: "Momentum is cooling, but traders still expect a breakout if volume returns later this week."
  },
  {
    kicker: "Forex",
    title: "Dollar steadies after central bank comments calm volatility",
    summary: "Currency desks are watching policy signals closely as risk appetite improves slightly."
  },
  {
    kicker: "Commodities",
    title: "Gold edges higher as investors look for safer positioning",
    summary: "A softer risk tone and uncertain macro signals are pushing defensive assets back in focus."
  }
];

const DAILY_MOTIVATIONS = [
  "Dream big, work hard, stay focused.",
  "Small steps every day build big results.",
  "Your future grows with every smart move you make.",
  "Discipline today creates freedom tomorrow.",
  "Stay patient, stay sharp, and keep building.",
  "Consistency beats intensity when you play the long game.",
  "Every saved euro is a vote for your future.",
  "Progress compounds when you refuse to quit.",
  "Keep showing up — that is where momentum starts.",
  "The version of you with results starts with today's choices."
];

const getDailyMotivation = () => {
  const today = new Date();
  const dayNumber = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000);
  return DAILY_MOTIVATIONS[dayNumber % DAILY_MOTIVATIONS.length];
};

const OVERVIEW_CHART_DATA = [
  { price: 4000 },
  { price: 4200 },
  { price: 3900 },
  { price: 4600 },
  { price: 4500 },
  { price: 5000 },
  { price: 5200 },
  { price: 5800 },
];


const AVAILABLE_WIDGETS = [
  { id: 'demo', title: "Demo Trading", icon: AreaChartIcon, href: "/demo-trading", description: "Practice trading" },
  { id: 'ai', title: "AI Analysis", icon: Brain, href: "/ai", description: "Smart insights" },
  { id: 'goals', title: "Goals", icon: Target, href: "/goals", description: "Track savings" },
  { id: 'learning', title: "Learning", icon: BookOpen, href: "/learning", description: "Master finance" },
  { id: 'shop', title: "Point Shop", icon: Coins, href: "/shop", description: "Get Cash & Credits" },
  { id: 'rank', title: "Global Rank", icon: Trophy, href: "/rank", description: "See leaderboard" },
  { id: 'motivation', title: "Motivation", icon: Sun, href: "#", description: "Daily quotes" },
  { id: 'picks', title: "Vaulty Picks", icon: Bookmark, href: "#", description: "Curated assets" },
  { id: 'news', title: "Market News", icon: Globe, href: "#", description: "Live updates" },
  { id: 'premium', title: "Vaulty+", icon: Sparkles, href: "/premium", description: "Premium features" }
];

export default function Home() {
  const [activeWidgets, setActiveWidgets] = useState<string[]>(['demo', 'ai', 'goals', 'learning']);
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);

  const { toast } = useToast();
  const { user, userData } = useAuth();
  const { unreadCount } = useNotifications();
  const [location, setLocation] = useLocation();
  const dailyMotivation = getDailyMotivation();
  const { currency, convert } = useCurrency();
  const { balance, holdings } = useDemoStore();
  const [coins, setCoins] = useState<Coin[]>([]);
  
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const badges = [badgeProImage];
  const badgeLabels = ["Vaulty+"];

  // Action Menu State
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionType, setActionType] = useState<"buy" | "sell" | "send" | null>(null);

  const holdingIds = useMemo(() => holdings.map((holding) => holding.coinId), [holdings]);

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const missingHoldingIds = holdingIds;
        const holdingCoins = missingHoldingIds.length ? await getCoinsByIds(missingHoldingIds, "usd") : [];
        setCoins(holdingCoins);
      } catch (error) {
        console.error("Failed to load coins for overview", error);
      }
    };
    
    if (holdingIds.length > 0) {
      loadCoins();
    }
  }, [holdingIds.join(",")]);

  const portfolioValueUsd = useMemo(() => {
    return holdings.reduce((total, holding) => {
      const coin = coins.find((c) => c.id === holding.coinId);
      const currentPriceUsd = coin?.current_price ?? holding.averageBuyPrice;
      return total + (holding.amount * currentPriceUsd);
    }, 0);
  }, [holdings, coins]);

  const totalBalanceUsd = balance + portfolioValueUsd;
  const totalBalanceDisplay = convert(totalBalanceUsd);
  
  const totalProfitUsd = totalBalanceUsd - INITIAL_DEMO_BALANCE;
  const totalProfitPercent = (totalProfitUsd / INITIAL_DEMO_BALANCE) * 100;
  const isPositiveProfit = totalProfitUsd >= 0;

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % BANNERS.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate premium badges
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBadgeIndex(prev => (prev + 1) % badges.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [badges.length]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentNewsIndex(prev => (prev + 1) % FINANCE_NEWS.length);
    }, 30000 + Math.floor(Math.random() * 30000));

    return () => clearTimeout(timeout);
  }, [currentNewsIndex]);

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Redirecting...</div>;

  return (
    <div className="min-h-screen pb-32 bg-black text-white selection:bg-gray-500/30">
      <CompleteProfileWidget />
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center">
        <div className="w-full bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto p-4 flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-left outline-none cursor-pointer">
                <span className="text-gray-400 text-sm">Hello, </span>
                <span className="text-white font-bold">{userData?.username || "vaultycreator"}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-black border-r border-white/10 p-0 text-white">
              <div className="flex flex-col h-full">
                {/* User Info Section - Fixed at top */}
                <div className="p-6 space-y-4 text-center flex flex-col items-center shrink-0 border-b border-white/5">
                  <div className="flex justify-center w-full">
                    <div className="w-20 h-20 rounded-full border border-white/20 overflow-hidden shadow-2xl">
                      <img src={user.photoURL || "https://github.com/shadcn.png"} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-bold text-xl">{userData?.displayName || "Vaulty Support"}</h2>
                    <p className="text-sm text-gray-500">@{userData?.username || "vaultycreator"}</p>
                  </div>
                  <div className="flex justify-center gap-6 text-sm">
                    <p><span className="font-bold">0</span> <span className="text-gray-500 ml-1">Following</span></p>
                    <p><span className="font-bold">0</span> <span className="text-gray-500 ml-1">Followers</span></p>
                  </div>
                </div>

                {/* Middle Navigation Items - Scrollable */}
                <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1 flex flex-col items-center custom-scrollbar">
                  <Link href="/profile" className="w-full">
                    <div className="flex items-center justify-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <span className="font-bold text-lg">Profile</span>
                    </div>
                  </Link>
                  <Link href="/premium" className="w-full">
                    <div className="flex items-center justify-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <span className="font-bold text-lg">Premium</span>
                    </div>
                  </Link>
                  <div className="flex items-center justify-center w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <span className="font-bold text-lg">Communities</span>
                  </div>
                  <div className="flex items-center justify-center w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <span className="font-bold text-lg">Creator Studio</span>
                  </div>
                  
                  <Link href="/academy" className="w-full">
                    <div className="flex items-center justify-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <span className="font-bold text-lg">Academy</span>
                    </div>
                  </Link>

                  <Link href="/tools" className="w-full">
                    <div className="flex items-center justify-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <span className="font-bold text-lg">Tools</span>
                    </div>
                  </Link>
                </div>

                {/* Bottom Navigation Items - Fixed at bottom */}
                <div className="p-4 space-y-1 flex flex-col items-center shrink-0 border-t border-white/5 bg-black">
                  <Link href="/ai" className="w-full">
                    <div className="flex items-center justify-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <span className="text-md font-medium">Vaulty AI</span>
                    </div>
                  </Link>
                  <Link href="/settings" className="w-full">
                    <div className="flex items-center justify-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <span className="text-md font-medium">Settings and privacy</span>
                    </div>
                  </Link>
                  <Link href="/support" className="w-full">
                    <div className="flex items-center justify-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <span className="text-md font-medium">Help Center</span>
                    </div>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex justify-center">
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <button className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group text-gray-400 group-hover:text-white" data-testid="button-home-notifications">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-slate-500 rounded-full ring-2 ring-black" />
                )}
              </button>
            </Link>
            <Link href="/wallet">
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-gray-400 hover:text-white" data-testid="button-home-wallet">
                <Wallet className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Content Spacer */}
      <div className={cn("relative z-10 p-6 max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-28")}>
          
            <div className="space-y-6">
              {/* Your Overview */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold tracking-tight text-white px-1">Your Overview</h2>
                <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Total Balance</p>
                      <h3 className="text-3xl font-black tracking-tight text-white">
                        {currency === "VC" ? <VaultyIcon size={24} className="inline mr-1 -mt-1" /> : ""}
                        {currency === "VC" 
                          ? totalBalanceDisplay.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                          : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(totalBalanceDisplay)}
                      </h3>
                      <div className={cn("mt-2 flex items-center gap-1.5 text-sm font-black", isPositiveProfit ? "text-[#06b6d4]" : "text-rose-400")}>
                        {isPositiveProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span>{isPositiveProfit ? "+" : ""}{totalProfitPercent.toFixed(2)}%</span>
                        <span className="text-zinc-500 font-medium ml-1">Profit</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[90px] w-full mt-2 -mx-2 relative z-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={OVERVIEW_CHART_DATA}>
                        <defs>
                          <linearGradient id="overviewChartColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#06b6d4" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#overviewChartColor)" 
                          isAnimationActive={true}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Quick Actions */}
                  <div className="relative z-10 flex gap-3 mt-4 pt-4 border-t border-white/10">
                    <button 
                      onClick={() => { setActionType("buy"); setIsActionMenuOpen(true); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-2.5 px-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                      <ArrowDownToLine size={16} />
                      Buy
                    </button>
                    <button 
                      onClick={() => { setActionType("sell"); setIsActionMenuOpen(true); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
                    >
                      <ArrowUpFromLine size={16} />
                      Sell
                    </button>
                    <button 
                      onClick={() => { setActionType("send"); setIsActionMenuOpen(true); }}
                      className="w-12 flex items-center justify-center shrink-0 bg-white/10 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
                    >
                      <Send size={16} className="ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Premium Banner */}
              <div className="w-full bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-2xl border border-white/10 rounded-3xl p-4 relative shadow-[0_22px_60px_rgba(0,0,0,0.4)] hover:bg-white/10 transition-colors">
                   <Link href="/premium">
                       <div className="flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center gap-4 flex-1">
                              <div className="relative">
                                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                                <motion.img 
                                  key={currentBadgeIndex}
                                  src={badges[currentBadgeIndex]} 
                                  alt={badgeLabels[currentBadgeIndex]}
                                  className="w-12 h-12 shrink-0 group-hover:scale-110 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold tracking-tight text-white">
                                    Unlock Vaulty+
                                </p>
                                <p className="text-xs font-medium text-gray-400">
                                    All premium features in one plan
                                </p>
                              </div>
                          </div>
                          <div className="px-4 py-2 rounded-full bg-white text-black text-xs font-black uppercase tracking-tighter group-hover:bg-gray-300 transition-colors shadow-lg">
                              Upgrade
                          </div>
                       </div>
                   </Link>
              </div>

              <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_22px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl" data-testid="card-home-daily-motivation">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-slate-900/20 opacity-50" />
                <div className="relative z-10 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2 text-slate-400">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold tracking-wider uppercase">Daily Motivation</span>
                  </div>
                  <p className="text-lg font-medium text-white italic" data-testid="text-home-daily-motivation">“{dailyMotivation}”</p>
                </div>
              </div>
              
              {/* Rotating Banner */}
              <div className="relative h-[176px] overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-2xl border border-white/10 px-5 py-6 cursor-pointer group shadow-[0_22px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(255,255,255,0.1)] transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative z-10 h-full">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentBannerIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="flex h-full w-full items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0 text-left pl-0">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Vaulty Picks</p>
                        <h3 className="text-[1.7rem] leading-[1.05] font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">{BANNERS[currentBannerIndex].title}</h3>
                        <p className="text-sm text-gray-400 font-medium max-w-[240px]">{BANNERS[currentBannerIndex].subtitle}</p>
                      </div>
                      <div className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors border border-white/10">
                        <ChevronRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Glass Cards Carousel */}
              
              <div className="flex items-center justify-between px-1 mt-8 mb-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-500">WIDGETS</h2>
                <button 
                  onClick={() => setIsWidgetMenuOpen(true)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors"
                >
                  <Plus size={14} className="text-white" />
                </button>
              </div>
              <div className="-mx-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex snap-x snap-mandatory gap-4">
                  <AnimatePresence>
                    {activeWidgets.map((id) => {
                      const item = AVAILABLE_WIDGETS.find(s => s.id === id);
                      if (!item) return null;
                      const Icon = item.icon;

                      return (
                        <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="block w-[calc(50%-8px)] min-w-[calc(50%-8px)] snap-start">
                          <Link href={item.href} className="block h-full">
                            <div className="relative h-full overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 text-center backdrop-blur-2xl border border-white/10 group cursor-pointer hover:bg-white/10 transition-all duration-500 shadow-[0_22px_60px_rgba(0,0,0,0.4)]">
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/10 to-white/5 shadow-inner transition-transform duration-500 group-hover:scale-110">
                                  <Icon className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="mb-1 text-base font-bold tracking-tight text-white sm:text-lg">{item.title}</h3>
                                <p className="text-[10px] text-gray-400 sm:text-xs">{item.description}</p>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>


              <Link href="/ai" className="block" data-testid="link-home-vaulty-ai">
                <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-2xl p-5 shadow-[0_22px_60px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_18px_48px_rgba(37,99,235,0.22)]">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-400/10 blur-3xl" />
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="max-w-[220px] text-[1.65rem] font-black leading-[1.02] tracking-tight text-white">
                        Ask smarter finance questions anytime
                      </h3>
                      <p className="mt-3 max-w-[250px] text-sm leading-relaxed text-slate-300">
                        Get instant market explanations, plan ideas, and simple breakdowns in one polished chat space.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-300">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Market insights</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Portfolio ideas</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Quick answers</span>
                      </div>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden p-2">
                      <img src={vaultyLogoImage} alt="Vaulty Logo" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="relative z-10 mt-5 flex items-center justify-between rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Your AI widget</p>
                      <p className="mt-1 text-sm font-semibold text-white">Open Vaulty AI</p>
                    </div>
                    <div className="rounded-full bg-sky-400 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-950">
                      Chat now
                    </div>
                  </div>
                </div>
              </Link>

              {/* Goals Card (Full Width) */}
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 group cursor-pointer hover:bg-white/10 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)]">
                <div className="w-16 h-16 shrink-0 bg-white/10 border border-white/10 group-hover:border-white/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="text-white w-8 h-8" />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">Reach your goal</h3>
                  <p className="text-sm text-gray-400 mb-4">Save and plan for buying a car, real estate, or traveling.</p>
                  <div className="w-full bg-black/50 rounded-full h-3 mb-2 overflow-hidden border border-white/10">
                    <div className="bg-white h-full rounded-full w-[45%] relative">
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-gray-400">
                    <span>4,500€</span>
                    <span>Goal: 10,000€</span>
                  </div>
                </div>
              </div>

              {/* Finance News Card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-black p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%)]" />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-gray-500">Live finance news</p>
                      <h3 className="mt-1 text-lg font-bold tracking-tight text-white">Market Pulse</h3>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      Simulated
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentNewsIndex}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="rounded-[20px] border border-white/10 bg-black/40 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                          {FINANCE_NEWS[currentNewsIndex].kicker}
                        </span>
                        <span className="text-[11px] text-gray-500">Updates every 30–60s</span>
                      </div>
                      <h4 className="text-lg font-bold leading-tight text-white">
                        {FINANCE_NEWS[currentNewsIndex].title}
                      </h4>
                      <p className="mt-3 text-sm leading-relaxed text-gray-400">
                        {FINANCE_NEWS[currentNewsIndex].summary}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
      </div>


      {/* Shortcut Menu Bottom Sheet */}
      <Sheet open={isWidgetMenuOpen} onOpenChange={setIsWidgetMenuOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-black border-t border-white/10 p-0 text-white rounded-t-[32px] sm:max-w-md sm:mx-auto flex flex-col z-[100]">
            <div className="p-6 pb-4 border-b border-white/10 shrink-0">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Widgets</h2>
                  <p className="text-sm text-gray-400 mt-1">Customize widgets ({activeWidgets.length}/6)</p>
                </div>
                <button onClick={() => setIsWidgetMenuOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
              {AVAILABLE_WIDGETS.map(widget => {
                const isActive = activeWidgets.includes(widget.id);
                const Icon = widget.icon;
                return (
                  <div key={widget.id} className="flex items-center justify-between p-4 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] border border-white/10 backdrop-blur-xl mb-2">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", isActive ? "bg-white/10 border-white/20 text-white" : "bg-black/40 border-white/5 text-white/40")}>
                        <Icon size={22} />
                      </div>
                      <div>
                         <span className={cn("font-bold text-lg", isActive ? "text-white" : "text-white/60")}>{widget.title}</span>
                         <p className="text-xs text-gray-500 mt-0.5">{widget.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (isActive && activeWidgets.length <= 2) {
                          toast({ title: "Cannot remove widget", description: "Minimum 2 widgets required", variant: "destructive" });
                          return;
                        }
                        if (!isActive && activeWidgets.length >= 6) {
                          toast({ title: "Cannot add widget", description: "Maximum 6 widgets allowed", variant: "destructive" });
                          return;
                        }
                        setActiveWidgets(prev => isActive ? prev.filter(id => id !== widget.id) : [...prev, widget.id]);
                      }}
                      className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all w-[80px] text-center", isActive ? "bg-white/10 text-white hover:bg-white/20 border border-white/20" : "bg-white text-black hover:bg-gray-200")}
                    >
                      {isActive ? "Remove" : "Add"}
                    </button>
                  </div>
                )
              })}
            </div>
        </SheetContent>
      </Sheet>

      {/* Action Menu Bottom Sheet */}
      <Sheet open={isActionMenuOpen} onOpenChange={setIsActionMenuOpen}>
        <SheetContent side="bottom" className="h-[80vh] bg-black border-t border-white/10 p-0 text-white rounded-t-[32px] sm:max-w-md sm:mx-auto flex flex-col">
            <div className="p-6 pb-4 border-b border-white/10 shrink-0">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              <h2 className="text-2xl font-bold">
                {actionType === "buy" ? "Buy Crypto" : 
                 actionType === "sell" ? "Sell Crypto" : 
                 "Send Crypto"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {actionType === "buy" ? "Select a coin to purchase" : 
                 actionType === "sell" ? "Select from your holdings to sell" : 
                 "Select from your holdings to send"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-2">
                {actionType === "buy" ? (
                  // Show all loaded coins for Buy
                  coins.length > 0 ? (
                    coins.map((coin) => (
                      <Link key={`buy-${coin.id}`} href={`/demo-trading/${coin.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] border border-white/10 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-xl mb-2">
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                            <div>
                              <p className="font-bold text-white">{coin.name}</p>
                              <p className="text-xs text-gray-500 uppercase">{coin.symbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(coin.current_price)}
                            </p>
                            <p className={cn("text-xs font-semibold", coin.price_change_percentage_24h >= 0 ? "text-[#06b6d4]" : "text-rose-400")}>
                              {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-50" />
                      <p>Loading market data...</p>
                    </div>
                  )
                ) : (
                  // Show only holdings for Sell and Send
                  holdings.length > 0 ? (
                    holdings.map((holding) => {
                      const coin = coins.find(c => c.id === holding.coinId);
                      if (!coin) return null;
                      
                      const holdingValueUsd = holding.amount * (coin.current_price || 0);
                      const displayValue = convert(holdingValueUsd);
                      
                      return (
                        <Link key={`hold-${coin.id}`} href={`/demo-trading/${coin.id}`}>
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] border border-white/10 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-xl mb-2">
                            <div className="flex items-center gap-3">
                              <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                              <div>
                                <p className="font-bold text-white">{coin.name}</p>
                                <p className="text-xs text-gray-500 uppercase">{coin.symbol}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">
                                {currency === "VC" ? <VaultyIcon size={12} className="inline mr-1" /> : ""}
                                {currency === "VC" 
                                  ? displayValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                                  : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(displayValue)}
                              </p>
                              <p className="text-xs text-gray-400 font-medium">
                                {holding.amount} {coin.symbol.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center">
                      <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>You don't have any holdings to {actionType}.</p>
                      <button 
                        onClick={() => setActionType("buy")}
                        className="mt-6 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                      >
                        Buy Crypto First
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
