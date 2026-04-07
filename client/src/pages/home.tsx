import { VaultyIcon } from "@/components/ui/vaulty-icon";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { useState, useEffect, useRef } from "react";
import { 
    Search, Bell, Wallet, Loader2, Sparkles, Send, Image as ImageIcon, X, Plus,
    User, Video, Users, Bookmark, List, Mic2, Beaker, Globe, Settings, HelpCircle, Sun, Moon,
    LineChart, GraduationCap, TrendingUp, Coins, Target, ChevronRight, Check
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PostCard } from "@/components/post-card";
import { isAdmin, isSuperAdmin } from "@/lib/admins";
import { motion, AnimatePresence } from "framer-motion";

// Assets
import vaultyChristmasLogo from "@assets/IMG_1036_1775418773775.png";
import badgeProImage from "@assets/image_1766097473552.png";
import badgeUltraImage from "@assets/image_1766097497589.png";
import badgeMaxImage from "@assets/image_1766097506015.png";
import humanStudioImage from "@assets/IMG_0974_1775320765483.jpeg";

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

export default function Home() {
  const { user, userData } = useAuth();
  const { unreadCount } = useNotifications();
  const [location, setLocation] = useLocation();
  
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const badges = [badgeProImage, badgeMaxImage];
  const badgeLabels = ["PRO", "MAX"];

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

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Redirecting...</div>;

  return (
    <div className="min-h-screen pb-32 bg-black text-white selection:bg-gray-500/30">
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center">
        <div className="w-full bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto p-4 flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <img 
                  src={user.photoURL || "https://github.com/shadcn.png"} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
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
            <div className="w-10 h-10 relative">
              <img src={vaultyChristmasLogo} alt="Vaulty" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <div className="flex items-center">
            <Link href="/notifications">
              <button className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group text-gray-400 group-hover:text-white">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-slate-500 rounded-full ring-2 ring-black" />
                  )}
              </button>
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Content Spacer */}
      <div className={cn("relative z-10 p-6 max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-28")}>
          
            <div className="space-y-6">
              
              {/* Rotating Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 flex items-center justify-between cursor-pointer group shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_48px_rgba(255,255,255,0.1)] transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentBannerIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex items-center gap-5 w-full relative z-10"
                  >
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${BANNERS[currentBannerIndex].color} flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500`}>
                      {(() => {
                        const Icon = BANNERS[currentBannerIndex].icon;
                        return <Icon className="text-white w-7 h-7" />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white mb-1 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">{BANNERS[currentBannerIndex].title}</h3>
                      <p className="text-sm text-gray-400 font-medium">{BANNERS[currentBannerIndex].subtitle}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors border border-white/10">
                      <ChevronRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Profile Completion Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-tight">Complete your profile</h3>
                  <span className="text-xs text-gray-400 font-medium">1/5 completed</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                  {/* Task 1 - Completed */}
                  <div className="shrink-0 w-[140px] snap-start bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center gap-2 opacity-50 relative">
                    <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Create Account</p>
                    </div>
                  </div>

                  {/* Task 2 */}
                  <div className="shrink-0 w-[140px] snap-start bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Upload Profile</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Add your photo</p>
                    </div>
                  </div>

                  {/* Task 3 */}
                  <div className="shrink-0 w-[140px] snap-start bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Customization</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Set preferences</p>
                    </div>
                  </div>

                  {/* Task 4 */}
                  <div className="shrink-0 w-[140px] snap-start bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wallet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Connect Wallet</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Link your funds</p>
                    </div>
                  </div>

                  {/* Task 5 */}
                  <div className="shrink-0 w-[140px] snap-start bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Set First Goal</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Start planning</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glass Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Finance Analysis Card */}
                <Link href="/wallet" className="w-full">
                  <div className="relative overflow-hidden rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center text-center group cursor-pointer hover:bg-white/10 transition-all duration-500 h-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 border border-white/20 shadow-inner">
                      <LineChart className="text-white w-7 h-7" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 tracking-tight">Finance Analysis</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">Overview of your portfolio</p>
                  </div>
                </Link>

                {/* Academy/Learning Card */}
                <Link href="/academy" className="w-full">
                  <div className="relative overflow-hidden rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center text-center group cursor-pointer hover:bg-white/10 transition-all duration-500 h-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 border border-white/20 shadow-inner">
                      <GraduationCap className="text-white w-7 h-7" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 tracking-tight">Learning</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">Academy and courses</p>
                  </div>
                </Link>

                {/* Demo Trading Card */}
                <Link href="/demo-trading" className="w-full">
                  <div className="relative overflow-hidden rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center text-center group cursor-pointer hover:bg-white/10 transition-all duration-500 h-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 border border-white/20 shadow-inner">
                      <TrendingUp className="text-white w-7 h-7" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 tracking-tight">Demo Trading</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">Trade without risk</p>
                  </div>
                </Link>

                {/* Points Collection Card */}
                <Link href="/quests" className="w-full">
                  <div className="relative overflow-hidden rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center text-center group cursor-pointer hover:bg-white/10 transition-all duration-500 h-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 border border-white/20 shadow-inner">
                      <Coins className="text-white w-7 h-7" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 tracking-tight">Collect Points</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">Complete tasks and earn</p>
                  </div>
                </Link>
              </div>

              {/* Inline Premium Banner */}
              <div className="w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 relative shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors">
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
                                <p className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                                    Unlock Premium <Sparkles size={14} className="text-gray-400" />
                                </p>
                                <p className="text-xs font-medium text-gray-400">
                                    Get {badgeLabels[currentBadgeIndex]} plan access
                                </p>
                              </div>
                          </div>
                          <div className="px-4 py-2 rounded-full bg-white text-black text-xs font-black uppercase tracking-tighter group-hover:bg-gray-300 transition-colors shadow-lg">
                              Upgrade
                          </div>
                       </div>
                   </Link>
              </div>

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
            </div>
      </div>
    </div>
  );
}
