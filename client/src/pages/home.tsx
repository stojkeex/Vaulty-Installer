import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useLocation } from "wouter";
import { Sparkles, Settings, ChevronRight, MessageSquare, TrendingUp, Play, Square, Activity, Send, CircleDot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import vaultyLogoImage from "@/assets/vaulty-logo-v.png";
import vaultyTextLogo from "@/assets/vaulty-text-logo.png";
import astronautImage from "@/assets/astronaut_no_bg.png";

const MOCK_BOTS = [
  {
    id: "1",
    name: "Customer Support Pro",
    status: "ONLINE",
    statusColor: "text-green-400",
    iconColor: "text-blue-400",
    iconBg: "bg-black border-blue-500/30",
    messages: "1,240",
    messagesGrowth: "24.5%",
    isPositiveGrowth: true,
    creditsUsed: "12,400",
    creditsPercent: "2%",
    uptime: "100%",
    hasActivity: true,
    theme: "purple",
    chartPathMessages: "M0 80 Q 20 40, 40 50 T 80 30 T 120 40 T 160 70 T 200 70 T 240 40 T 280 50 T 320 80",
    chartPathCredits: "M0 50 Q 20 70, 40 60 T 80 40 T 120 50 T 160 30 T 200 60 T 240 70 T 280 40 T 320 30",
    chartPathUptime: "M0 20 Q 20 40, 40 30 T 80 50 T 120 40 T 160 70 T 200 40 T 240 30 T 280 50 T 320 20",
  }
];

export default function Home() {
  const { user, userData } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return <div className="min-h-screen bg-[#050505]" />;

  const userPoints = userData?.vaultyPoints || 543474.47;

  return (
    <div className="min-h-screen pb-32 bg-[#050505] text-white selection:bg-gray-500/30 animate-in fade-in font-sans">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
        <div className="w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.02] pointer-events-auto">
          <div className="w-full px-4 md:px-6 py-4 flex items-center justify-between">
             <div className="flex items-center -ml-2">
                <img
                    src={vaultyTextLogo}
                    alt="Vaulty"
                    className="h-6 md:h-8 object-contain"
                />
             </div>
             
             <Link href="/wallet">
                 <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#121218] backdrop-blur-xl px-4 py-2 cursor-pointer hover:bg-white/10 transition-all shadow-lg">
                     <Sparkles className="w-4 h-4 text-purple-400" />
                     <span className="text-[13px] font-bold text-white tracking-wide">{userPoints.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} VC</span>
                 </div>
             </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-5 max-w-[1200px] w-full mx-auto pt-24 space-y-4">
        
        {/* Hero Section */}
        <div className="rounded-[24px] border border-white/5 bg-gradient-to-br from-[#0a0a0f] to-[#12121a] p-6 shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[220px]">
            <div className="relative z-10 w-[60%]">
                <p className="text-white/70 mb-2 font-medium">Welcome back, {userData?.displayName || 'Alex'} 👋</p>
                <h1 className="text-3xl font-bold tracking-tight mb-2 leading-tight">
                    Your AI empire<br/>is <span className="text-purple-500">growing.</span>
                </h1>
                <p className="text-sm text-white/50 font-light mb-6">Manage, monitor and grow<br/>your AI assistants.</p>
                
                <Link href="/marketplace">
                    <Button className="rounded-full h-10 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold border-0 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                        Add New <Plus className="w-4 h-4 ml-1" />
                    </Button>
                </Link>
            </div>
            
            <div className="absolute right-0 bottom-0 top-0 w-[50%] flex items-center justify-end">
               <img src={astronautImage} alt="Astronaut" className="h-[120%] max-w-none object-cover object-left-bottom absolute -right-[10%] drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]" />
            </div>
        </div>

        {/* Summary Banner */}
        <div className="flex flex-col gap-4 rounded-[24px] border border-white/5 bg-[#0a0a0f] p-5 shadow-lg">
            {/* Total Messages */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-[14px] bg-[#1a0f2e] border border-purple-500/20 flex items-center justify-center">
                        <Send className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1 font-medium">TOTAL MESSAGES</p>
                        <p className="text-xl font-bold leading-none mb-1">1,290</p>
                        <div className="flex items-center gap-1 text-[10px]">
                            <TrendingUp className="w-3 h-3 text-purple-400" />
                            <span className="text-purple-400 font-medium">18.6%</span>
                            <span className="text-white/40">vs last 7 days</span>
                        </div>
                    </div>
                </div>
                <div className="w-24 h-8 opacity-60">
                    <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
                        <path d="M0 25 Q 10 15, 20 20 T 40 10 T 60 15 T 80 5 T 100 10" fill="none" stroke="#a855f7" strokeWidth="2" />
                        <circle cx="100" cy="10" r="2" fill="#a855f7" />
                    </svg>
                </div>
            </div>

            {/* Credits Left */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-[14px] bg-[#0d1b2a] border border-blue-500/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1 font-medium">CREDITS LEFT</p>
                        <p className="text-xl font-bold leading-none mb-1">543,474</p>
                        <p className="text-[10px] text-white/40 font-medium">≈ 1.3M messages</p>
                    </div>
                </div>
                <div className="w-24 h-8 opacity-60">
                    <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
                        <path d="M0 20 Q 10 25, 20 15 T 40 20 T 60 10 T 80 15 T 100 5" fill="none" stroke="#3b82f6" strokeWidth="2" />
                        <circle cx="100" cy="5" r="2" fill="#3b82f6" />
                    </svg>
                </div>
            </div>

            {/* Active Bots */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-[14px] bg-[#0f291e] border border-green-500/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1 font-medium">ACTIVE BOTS</p>
                        <p className="text-xl font-bold leading-none mb-1">2 <span className="text-white/30 text-sm">/ 3</span></p>
                        <p className="text-[10px] text-white/40 font-medium">66% of your limit</p>
                    </div>
                </div>
                <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '66%' }}></div>
                </div>
            </div>
        </div>
        
        {/* Chatbots List */}
        <div className="space-y-4">
          {MOCK_BOTS.map(bot => (
            <div key={bot.id} className="rounded-[24px] border border-white/5 bg-[#0a0a0f] p-5 shadow-lg flex flex-col relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden border border-white/10">
                            <Bot className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-white leading-tight">{bot.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <CircleDot className={`w-2 h-2 ${bot.statusColor}`} />
                                <span className={`text-[10px] uppercase tracking-wider font-bold ${bot.statusColor}`}>
                                    {bot.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setLocation(`/bot/${bot.id}/customize`)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <Settings className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {/* Messages */}
                    <div className="bg-white/5 rounded-[16px] p-3 flex flex-col justify-between relative overflow-hidden">
                        <p className="text-[9px] uppercase tracking-wider text-white/50 mb-1 font-medium">MESSAGES</p>
                        <p className="text-lg font-bold leading-none mb-1">{bot.messages}</p>
                        <div className="flex items-center gap-1 text-[9px]">
                            <TrendingUp className="w-2.5 h-2.5 text-white/50" />
                            <span className="text-white/50">{bot.messagesGrowth} vs last 7 days</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 pointer-events-none">
                            <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
                                <path d={bot.chartPathMessages} fill="none" stroke="#a855f7" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* Credits Used */}
                    <div className="bg-white/5 rounded-[16px] p-3 flex flex-col justify-between relative overflow-hidden">
                        <p className="text-[9px] uppercase tracking-wider text-white/50 mb-1 font-medium">CREDITS USED</p>
                        <p className="text-lg font-bold leading-none mb-1">{bot.creditsUsed}</p>
                        <div className="flex items-center gap-1 text-[9px]">
                            <span className="text-white/50">≈ {bot.creditsPercent} of your credits</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 pointer-events-none">
                            <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
                                <path d={bot.chartPathCredits} fill="none" stroke="#3b82f6" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* Uptime */}
                    <div className="bg-white/5 rounded-[16px] p-3 flex flex-col justify-between relative overflow-hidden">
                        <p className="text-[9px] uppercase tracking-wider text-white/50 mb-1 font-medium">UPTIME</p>
                        <p className="text-lg font-bold leading-none mb-1">{bot.uptime}</p>
                        <div className="flex items-center gap-1 text-[9px]">
                            <span className="text-white/50">Last 7 days</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 pointer-events-none">
                            <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
                                <path d={bot.chartPathUptime} fill="none" stroke="#22c55e" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
