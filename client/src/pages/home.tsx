import { Link } from "wouter";
import { 
  TrendingUp, TrendingDown, Target, Bell, HelpCircle, User, Award, Flame, Zap, CheckCircle2, ChevronRight, 
  Settings, Loader2, List, AreaChart as AreaChartIcon, Check, Wallet, Search, Coins, Sparkles, Brain, Lock, Target as GoalIcon, ShieldAlert,
  ArrowUpRight, BarChart2, BookOpen, Sun, Bookmark, ArrowDownToLine, ArrowUpFromLine, Send, Plus, X, Globe, Trophy
} from "lucide-react";
import { useState, useEffect } from "react";
import { BANNERS, FINANCE_NEWS } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { fetchHoldings, fetchCoins, subscribeToHoldingUpdates } from "@/lib/firebase";
import vaultyLogoImage from "@assets/IMG_1067_1775729849437.png";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_WIDGETS = [
  { id: 'overview', name: 'Finance Analysis', icon: AreaChartIcon },
  { id: 'shortcuts', name: 'Quick Links', icon: List },
  { id: 'ai', name: 'AI Analysis', icon: Brain },
  { id: 'goals', name: 'Goals', icon: Target },
  { id: 'news', name: 'Live News', icon: Globe },
  { id: 'premium', name: 'Vaulty+ Banner', icon: Sparkles },
  { id: 'motivation', name: 'Daily Motivation', icon: Sun },
  { id: 'picks', name: 'Vaulty Picks', icon: Bookmark },
  { id: 'shop', name: 'Point Shop', icon: Coins },
  { id: 'rank', name: 'Global Rank', icon: Trophy },
];

const OVERVIEW_CHART_DATA = [
  { time: "09:00", price: 10200 },
  { time: "10:00", price: 10350 },
  { time: "11:00", price: 10100 },
  { time: "12:00", price: 10600 },
  { time: "13:00", price: 10550 },
  { time: "14:00", price: 10800 },
  { time: "15:00", price: 10750 },
  { time: "16:00", price: 11200 }
];

const HOME_SHORTCUTS = [
  { title: "Demo Trading", icon: AreaChartIcon, href: "/demo-trading", description: "Practice trading" },
  { title: "AI Analysis", icon: Brain, href: "/ai", description: "Smart insights" },
  { title: "Goals", icon: Target, href: "/goals", description: "Track savings" },
  { title: "Learning", icon: BookOpen, href: "/learning", description: "Master finance" }
];

const BANNERS = [
  { title: "Unlock Vaulty+", subtitle: "Get AI insights and real-time signals", bg: "bg-indigo-500", href: "/premium" },
  { title: "Trading Basics", subtitle: "Learn how to read candlestick charts", bg: "bg-sky-500", href: "/learning" },
  { title: "Set Your Goals", subtitle: "Start planning your financial future", bg: "bg-emerald-500", href: "/goals" }
];

const FINANCE_NEWS = [
  { title: "Markets hit all time high", summary: "Tech stocks lead the rally as AI adoption continues to accelerate across sectors.", kicker: "MARKETS" },
  { title: "Bitcoin surges past $60k", summary: "Institutional investment drives major crypto rally this week.", kicker: "CRYPTO" },
  { title: "New inflation data released", summary: "Consumer prices cool down, signaling potential rate cuts.", kicker: "ECONOMY" }
];

const badges = [
  "https://cdn3d.iconscout.com/3d/premium/thumb/diamond-5431671-4541315.png",
  "https://cdn3d.iconscout.com/3d/premium/thumb/crown-5431669-4541313.png",
  "https://cdn3d.iconscout.com/3d/premium/thumb/star-5431670-4541314.png"
];
const badgeLabels = ["Diamond", "Crown", "Star"];

// Define convert here so it can be used inside Home
const convert = (usdValue: number, currency: "USD" | "VC" = "USD") => {
  return currency === "VC" ? usdValue * 10 : usdValue;
};

// Vaulty Icon Component
function VaultyIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}


export default function Home() {
  const { user, currency, setCurrency } = useAuth();
  const { toast } = useToast();
  
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  
  const [activeWidgets, setActiveWidgets] = useState<string[]>(['overview', 'shortcuts', 'ai', 'goals', 'shop']);
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);

  const [holdings, setHoldings] = useState<any[]>([]);
  const [coins, setCoins] = useState<any[]>([]);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionType, setActionType] = useState<"buy" | "sell" | "send">("buy");
  const [totalHoldingsUsd, setTotalHoldingsUsd] = useState(0);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const loadedCoins = await fetchCoins();
        setCoins(loadedCoins);
        
        if (user) {
          const userHoldings = await fetchHoldings(user.uid);
          setHoldings(userHoldings);
          
          // Calculate total holdings USD
          let totalUsd = 0;
          userHoldings.forEach(holding => {
             const coin = loadedCoins.find(c => c.id === holding.coinId);
             if (coin) {
               totalUsd += holding.amount * (coin.current_price || 0);
             }
          });
          setTotalHoldingsUsd(totalUsd);
        }
      } catch (err) {
        console.error("Error loading home data", err);
      }
    };
    
    fetchInitialData();
  }, [user]);

  // Subscribe to holdings
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToHoldingUpdates(user.uid, (updatedHoldings) => {
      setHoldings(updatedHoldings);
      if (coins.length > 0) {
        let totalUsd = 0;
        updatedHoldings.forEach(holding => {
           const coin = coins.find(c => c.id === holding.coinId);
           if (coin) {
             totalUsd += holding.amount * (coin.current_price || 0);
           }
        });
        setTotalHoldingsUsd(totalUsd);
      }
    });
    return () => unsubscribe();
  }, [user, coins]);


  useEffect(() => {
    const newsInterval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % FINANCE_NEWS.length);
    }, 6000);
    return () => clearInterval(newsInterval);
  }, []);

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, []);

  useEffect(() => {
    const badgeInterval = setInterval(() => {
      setCurrentBadgeIndex((prev) => (prev + 1) % badges.length);
    }, 3000);
    return () => clearInterval(badgeInterval);
  }, []);

  const totalBalanceUsd = (user?.balance || 10000) + totalHoldingsUsd;
  const totalBalanceDisplay = convert(totalBalanceUsd, currency);
  
  const totalProfitPercent = 12.5; 
  const isPositiveProfit = totalProfitPercent >= 0;

  const dailyMotivations = [
    "Small steps every day lead to big results.",
    "Your financial future is created by what you do today.",
    "Consistency is the key to mastering your money.",
    "Don't wait for the right opportunity, create it."
  ];
  const dailyMotivation = dailyMotivations[new Date().getDay() % dailyMotivations.length];

  return (
    <div className="min-h-screen bg-black pb-24 font-sans selection:bg-white/20">
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/60 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
                <div className="w-11 h-11 rounded-full bg-zinc-900 border-2 border-white/10 flex items-center justify-center relative overflow-hidden">
                  <User className="text-white/80 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-black">
                    <Check size={8} className="text-black font-bold" />
                  </div>
                </div>
              </div>
            </Link>
            <div className="flex flex-col">
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Welcome back</span>
              <span className="text-white font-bold text-base leading-none tracking-tight">{user?.displayName || "Trader"}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setCurrency(currency === "USD" ? "VC" : "USD")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-all text-xs font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {currency === "VC" ? (
                  <>
                    <VaultyIcon size={14} className="text-white" />
                    <span>VC</span>
                  </>
                ) : (
                  <>
                    <span className="text-white">$</span>
                    <span>USD</span>
                  </>
                )}
              </button>
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative group">
              <Bell className="text-white/80 w-5 h-5 group-hover:text-white transition-colors" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-black"></span>
            </button>
          </div>
        </div>
      </div>

      <div className={cn("relative z-10 p-6 max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-28")}>
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-500">WIDGETS</h2>
          <button 
            onClick={() => setIsWidgetMenuOpen(true)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors shadow-lg"
          >
            <Plus size={16} className="text-white" />
          </button>
        </div>
        
        <div className="space-y-6">
          <AnimatePresence>
            {activeWidgets.map(widgetId => {
              if (widgetId === 'overview') return (
                <motion.div key="overview" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  {/* Your Overview */}
                  <div className="space-y-3">
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
                </motion.div>
              );

              if (widgetId === 'premium') return (
                <motion.div key="premium" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="w-full bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-2xl border border-white/10 rounded-[32px] p-4 relative shadow-[0_22px_60px_rgba(0,0,0,0.4)] hover:bg-white/10 transition-colors">
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
                </motion.div>
              );

              if (widgetId === 'motivation') return (
                <motion.div key="motivation" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="glass-card rounded-[32px] p-6 relative overflow-hidden group border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_22px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-slate-900/20 opacity-50" />
                    <div className="relative z-10 text-center">
                      <div className="mb-2 flex items-center justify-center gap-2 text-slate-400">
                        <TrendingUp size={16} />
                        <span className="text-xs font-bold tracking-wider uppercase">Daily Motivation</span>
                      </div>
                      <p className="text-lg font-medium text-white italic">"{dailyMotivation}"</p>
                    </div>
                  </div>
                </motion.div>
              );

              if (widgetId === 'picks') return (
                <motion.div key="picks" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
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
                </motion.div>
              );

              if (widgetId === 'shortcuts') return (
                <motion.div key="shortcuts" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="-mx-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex snap-x snap-mandatory gap-4">
                      {HOME_SHORTCUTS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.title} href={item.href} className="block w-[calc(50%-8px)] min-w-[calc(50%-8px)] snap-start">
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
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );

              if (widgetId === 'ai') return (
                <motion.div key="ai" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <Link href="/ai" className="block">
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
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Your AI shortcut</p>
                          <p className="mt-1 text-sm font-semibold text-white">Open Vaulty AI</p>
                        </div>
                        <div className="rounded-full bg-sky-400 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-950">
                          Chat now
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );

              if (widgetId === 'goals') return (
                <motion.div key="goals" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-2xl border border-white/10 p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 group cursor-pointer hover:bg-white/10 transition-all duration-300 shadow-[0_22px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)]">
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
                </motion.div>
              );

              if (widgetId === 'news') return (
                <motion.div key="news" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-2xl p-5 shadow-[0_22px_60px_rgba(0,0,0,0.4)]">
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
                </motion.div>
              );

              if (widgetId === 'shop') return (
                <motion.div key="shop" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <Link href="/shop" className="block">
                    <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 backdrop-blur-2xl border border-white/10 shadow-[0_22px_60px_rgba(0,0,0,0.4)] hover:bg-white/10 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-[linear-gradient(180deg,rgba(234,179,8,0.2),rgba(234,179,8,0.05))] flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-transform">
                            <Coins className="w-7 h-7 text-yellow-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">Point Shop</h3>
                            <p className="text-xs text-gray-400 mt-1">Get Demo Cash & AI Credits</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors border border-white/10">
                          <ChevronRight className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );

              if (widgetId === 'rank') return (
                <motion.div key="rank" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 backdrop-blur-2xl border border-white/10 shadow-[0_22px_60px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[linear-gradient(180deg,rgba(168,85,247,0.2),rgba(168,85,247,0.05))] flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                          <Trophy className="w-7 h-7 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">Global Rank</h3>
                          <p className="text-xs text-gray-400 mt-1">You are in top 5%</p>
                        </div>
                      </div>
                      <div className="text-right px-2">
                        <div className="text-2xl font-black text-white">#42</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Rank</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );

              return null;
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Widget Menu Bottom Sheet */}
      <Sheet open={isWidgetMenuOpen} onOpenChange={setIsWidgetMenuOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-black border-t border-white/10 p-0 text-white rounded-t-[32px] sm:max-w-md sm:mx-auto flex flex-col z-[100]">
            <div className="p-6 pb-4 border-b border-white/10 shrink-0">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Widgets</h2>
                  <p className="text-sm text-gray-400 mt-1">Customize your home page ({activeWidgets.length}/6)</p>
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
                         <span className={cn("font-bold text-lg", isActive ? "text-white" : "text-white/60")}>{widget.name}</span>
                         <p className="text-xs text-gray-500 mt-0.5">{isActive ? "Active on home page" : "Not displayed"}</p>
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
        <SheetContent side="bottom" className="h-[80vh] bg-black border-t border-white/10 p-0 text-white rounded-t-[32px] sm:max-w-md sm:mx-auto flex flex-col z-[100]">
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
