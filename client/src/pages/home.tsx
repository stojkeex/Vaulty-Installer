import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useLocation } from "wouter";
import { Sparkles, Settings, MessageSquare, Activity, Send, CircleDot, Plus, Bot, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import vaultyTextLogo from "@/assets/vaulty-text-logo.png";
import astronautImage from "@/assets/astronaut_no_bg.png";

const MOCK_BOTS = [
  {
    id: "1",
    name: "Customer Support Pro",
    status: "ONLINE",
    statusColor: "text-green-500",
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
                     <Sparkles className="w-4 h-4 text-white" />
                     <span className="text-[13px] font-bold text-white tracking-wide">{userPoints.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} VC</span>
                 </div>
             </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-4 max-w-[1200px] w-full mx-auto pt-24 space-y-4">
        
        {/* Hero Section */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c14] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[220px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c0f3a]/40 via-[#0a0a0f] to-[#0a0f1c]/40 opacity-80"></div>
            <div className="absolute top-0 right-0 w-[80%] h-full bg-gradient-to-l from-purple-600/10 to-transparent blur-3xl"></div>
            
            <div className="relative z-20 w-[65%]">
                <p className="text-white/80 text-[13px] mb-2 font-medium">Welcome back, {userData?.displayName || 'Alex'} 👋</p>
                <h1 className="text-3xl font-bold tracking-tight mb-3 leading-[1.15]">
                    Your AI empire<br/>
                    <span className="text-white">is </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9b66ff] to-[#3b82f6]">growing.</span>
                </h1>
                <p className="text-xs text-white/50 font-medium mb-6 leading-relaxed max-w-[180px]">
                    Manage, monitor and grow<br/>your AI assistants.
                </p>
                
                <Link href="/marketplace">
                    <Button className="rounded-full h-10 px-6 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white font-semibold border-0 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                        Add New <Plus className="w-4 h-4 ml-1" />
                    </Button>
                </Link>
            </div>
            
            <div className="absolute right-0 bottom-0 top-0 w-[55%] flex items-end justify-end z-10 pointer-events-none">
               <img src={astronautImage} alt="Astronaut" className="h-[125%] max-w-none object-cover object-bottom absolute -right-[5%] drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
            </div>
        </div>

        {/* Summary Banner */}
        <div className="flex flex-col rounded-[24px] border border-white/[0.08] bg-[#0c0c14] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
            {/* Total Messages */}
            <div className="flex items-center justify-between border-b border-white/[0.08] p-5 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 shrink-0 rounded-[20px] bg-[#1a1128] border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                        <Send className="w-6 h-6 text-[#a855f7] -ml-1" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1 font-semibold">TOTAL MESSAGES</p>
                        <p className="text-[22px] font-bold leading-none mb-1.5 text-white">1,290</p>
                        <div className="flex items-center gap-1.5 text-[11px]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a855f7]"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                            <span className="text-white font-semibold">18.6%</span>
                            <span className="text-white/40">vs last 7 days</span>
                        </div>
                    </div>
                </div>
                <div className="w-[120px] h-12 flex-shrink-0 relative">
                    <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none overflow-visible">
                        <path d="M0 25 Q 15 20, 25 22 T 45 15 T 65 18 T 85 8 T 100 5" fill="none" stroke="#a855f7" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                        <circle cx="100" cy="5" r="2.5" fill="#a855f7" className="drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent"></div>
                </div>
            </div>

            {/* Credits Left */}
            <div className="flex items-center justify-between border-b border-white/[0.08] p-5 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 shrink-0 rounded-[20px] bg-[#0d1628] border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <MessageSquare className="w-6 h-6 text-[#3b82f6]" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1 font-semibold">CREDITS LEFT</p>
                        <p className="text-[22px] font-bold leading-none mb-1.5 text-white">543,474</p>
                        <p className="text-[11px] text-white/40 font-medium">≈ 1.3M messages</p>
                    </div>
                </div>
                <div className="w-[120px] h-12 flex-shrink-0 relative">
                    <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none overflow-visible">
                        <path d="M0 25 Q 15 28, 30 20 T 55 22 T 75 12 T 100 8" fill="none" stroke="#3b82f6" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <circle cx="100" cy="8" r="2.5" fill="#3b82f6" className="drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent"></div>
                </div>
            </div>

            {/* Active Bots */}
            <div className="flex items-center justify-between p-5 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 shrink-0 rounded-[20px] bg-[#0a1f16] border border-green-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        <Activity className="w-6 h-6 text-[#22c55e]" />
                    </div>
                    <div className="flex flex-col w-full max-w-[150px]">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1 font-semibold">ACTIVE BOTS</p>
                        <p className="text-[22px] font-bold leading-none mb-1.5 text-white">2 <span className="text-white/30 text-lg font-normal">/ 3</span></p>
                        <p className="text-[11px] text-white/40 font-medium">66% of your limit</p>
                    </div>
                </div>
                <div className="w-32 h-2.5 bg-white/5 rounded-full overflow-hidden flex-shrink-0 ml-4 shadow-inner">
                    <div className="h-full bg-[#22c55e] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" style={{ width: '66%' }}></div>
                </div>
            </div>
        </div>
        
        {/* Chatbots List */}
        <div className="space-y-4">
          {MOCK_BOTS.map(bot => (
            <div key={bot.id} className="rounded-[24px] border border-white/[0.08] bg-[#0c0c14] p-5 shadow-2xl flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                            <Bot className="w-6 h-6 text-[#3b82f6]" />
                        </div>
                        <div>
                            <h3 className="text-[17px] font-bold text-white leading-tight mb-1">{bot.name}</h3>
                            <div className="flex items-center gap-1.5">
                                <CircleDot className={`w-2.5 h-2.5 fill-[#22c55e] text-[#22c55e]`} />
                                <span className={`text-[10px] uppercase tracking-[0.1em] font-bold text-white/50`}>
                                    {bot.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setLocation(`/bot/${bot.id}/customize`)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5 shadow-sm">
                        <Settings className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3 relative z-10">
                    {/* Messages */}
                    <div className="bg-[#14141d] rounded-[20px] p-4 flex flex-col relative overflow-hidden border border-white/[0.04]">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 mb-2 font-semibold">MESSAGES</p>
                        <p className="text-[20px] font-bold leading-none mb-2 text-white">{bot.messages}</p>
                        <div className="flex items-center gap-1 text-[9px] mb-4">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                            <span className="text-white font-medium">{bot.messagesGrowth}</span>
                            <span className="text-white/40 ml-0.5">vs last 7 days</span>
                        </div>
                        <div className="h-8 w-[120%] -ml-[10%] opacity-60 mt-auto">
                            <svg viewBox="0 0 100 20" className="w-full h-full preserve-aspect-ratio-none">
                                <path d="M0 18 Q 10 5, 20 12 T 40 8 T 60 14 T 80 5 T 100 8" fill="none" stroke="#a855f7" strokeWidth="1.5" className="drop-shadow-[0_0_3px_rgba(168,85,247,0.5)]" />
                            </svg>
                        </div>
                    </div>

                    {/* Credits Used */}
                    <div className="bg-[#14141d] rounded-[20px] p-4 flex flex-col relative overflow-hidden border border-white/[0.04]">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 mb-2 font-semibold">CREDITS USED</p>
                        <p className="text-[20px] font-bold leading-none mb-2 text-white">{bot.creditsUsed}</p>
                        <div className="flex items-center gap-1 text-[9px] mb-4">
                            <span className="text-white/40">≈ {bot.creditsPercent} of your credits</span>
                        </div>
                        <div className="h-8 w-[120%] -ml-[10%] opacity-60 mt-auto">
                            <svg viewBox="0 0 100 20" className="w-full h-full preserve-aspect-ratio-none">
                                <path d="M0 8 Q 10 18, 20 10 T 40 18 T 60 8 T 80 14 T 100 5" fill="none" stroke="#3b82f6" strokeWidth="1.5" className="drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]" />
                            </svg>
                        </div>
                    </div>

                    {/* Uptime */}
                    <div className="bg-[#14141d] rounded-[20px] p-4 flex flex-col relative overflow-hidden border border-white/[0.04]">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 mb-2 font-semibold">UPTIME</p>
                        <p className="text-[20px] font-bold leading-none mb-2 text-white">{bot.uptime}</p>
                        <div className="flex items-center gap-1 text-[9px] mb-4">
                            <span className="text-white/40">Last 7 days</span>
                        </div>
                        <div className="h-8 w-[120%] -ml-[10%] opacity-60 mt-auto">
                            <svg viewBox="0 0 100 20" className="w-full h-full preserve-aspect-ratio-none">
                                <path d="M0 12 Q 10 2, 20 8 T 40 12 T 60 5 T 80 10 T 100 15" fill="none" stroke="#22c55e" strokeWidth="1.5" className="drop-shadow-[0_0_3px_rgba(34,197,94,0.5)]" />
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
