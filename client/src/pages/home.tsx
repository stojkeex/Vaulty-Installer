import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useLocation } from "wouter";
import { Sparkles, Bell, Plus, MessageSquare, Wallet, Activity, ChevronRight, BarChart2, Blocks, ShieldCheck, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import astronautImage from "@/assets/astronaut_no_bg.png";

const MOCK_BOTS = [
  {
    id: "1",
    name: "Customer Support Pro",
    status: "Online",
    statusColor: "bg-green-500",
    messages: "1,240",
  },
  {
    id: "2",
    name: "Sales Assistant",
    status: "Online",
    statusColor: "bg-green-500",
    messages: "896",
  },
  {
    id: "3",
    name: "FAQ Bot",
    status: "Offline",
    statusColor: "bg-gray-500",
    messages: "354",
  }
];

export default function Home() {
  const { user, userData } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return <div className="min-h-screen bg-black" />;

  const userPoints = userData?.vaultyPoints || 543474.47;

  return (
    <div className="min-h-screen pb-32 bg-black text-white font-sans selection:bg-white/20 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
         <div className="flex items-center tracking-[0.2em] font-medium text-lg">
            V A U L T Y
         </div>
         
         <div className="flex items-center gap-3">
             <Link href="/wallet">
                 <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-2 cursor-pointer hover:bg-white/5 transition-all">
                     <Sparkles className="w-4 h-4 text-white" />
                     <span className="text-sm font-medium text-white tracking-wide">{userPoints.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} VC</span>
                 </div>
             </Link>
             <button className="w-10 h-10 rounded-xl border border-white/10 bg-[#0a0a0a] flex items-center justify-center hover:bg-white/5 transition-all">
                 <Bell className="w-5 h-5 text-white" />
             </button>
         </div>
      </div>

      <div className="px-5 space-y-6">
        
        {/* Hero Section */}
        <div className="rounded-[32px] bg-[#0a0a0a] border border-white/5 p-8 relative overflow-hidden flex flex-col justify-center min-h-[340px]">
            <div className="relative z-20 w-[65%] mt-4">
                <p className="text-white/60 text-[15px] mb-4 flex items-center gap-2">
                    Welcome back, {userData?.displayName || 'Alex'} <span>👋</span>
                </p>
                <h1 className="text-[34px] sm:text-4xl font-semibold tracking-tight mb-4 leading-[1.1]">
                    Your AI agents.<br/>
                    Your business.<br/>
                    Simplified.
                </h1>
                <p className="text-[15px] text-white/50 mb-8 leading-relaxed max-w-[200px]">
                    Manage, monitor and grow your AI assistants in one place.
                </p>
                
                <Link href="/marketplace">
                    <Button className="rounded-2xl h-12 px-6 bg-white hover:bg-gray-200 text-black font-semibold text-[15px]">
                        <Plus className="w-4 h-4 mr-2" /> Add New Agent
                    </Button>
                </Link>
            </div>
            
            <div className="absolute right-0 bottom-0 w-[55%] flex items-end justify-end z-10 pointer-events-none overflow-hidden h-full">
               <img src={astronautImage} alt="Astronaut" className="h-[120%] max-w-none object-cover object-bottom absolute -right-[15%] filter contrast-125 brightness-75" />
            </div>
        </div>

        {/* Summary Row */}
        <div className="flex items-stretch rounded-[24px] border border-white/5 bg-[#0a0a0a] overflow-hidden divide-x divide-white/5">
            {/* Total Messages */}
            <div className="flex-1 p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white/70" />
                    </div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">TOTAL MESSAGES</p>
                </div>
                <p className="text-[26px] font-semibold leading-none mb-2 text-white">1,290</p>
                <div className="flex items-center gap-1.5 text-[11px]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                    <span className="text-blue-500 font-medium">18.6%</span>
                    <span className="text-white/40">vs last 7 days</span>
                </div>
                <div className="mt-4 h-8 w-full opacity-50">
                    <svg viewBox="0 0 100 20" className="w-full h-full preserve-aspect-ratio-none">
                        <path d="M0 15 L 20 10 L 40 18 L 60 5 L 80 12 L 100 8" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                    </svg>
                </div>
            </div>

            {/* Credits Left */}
            <div className="flex-1 p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-white/70" />
                    </div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">CREDITS LEFT</p>
                </div>
                <p className="text-[26px] font-semibold leading-none mb-2 text-white">543,474</p>
                <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-white/40">≈ 1.3M messages</span>
                </div>
                <div className="mt-4 h-8 w-full opacity-50">
                    <svg viewBox="0 0 100 20" className="w-full h-full preserve-aspect-ratio-none">
                        <path d="M0 10 L 20 15 L 40 5 L 60 12 L 80 8 L 100 12" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                    </svg>
                </div>
            </div>

            {/* Active Bots */}
            <div className="flex-1 p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white/70" />
                    </div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">ACTIVE BOTS</p>
                </div>
                <p className="text-[26px] font-semibold leading-none mb-2 text-white">2 <span className="text-white/40 text-lg">/ 3</span></p>
                <div className="flex items-center gap-1.5 text-[11px] mb-6">
                    <span className="text-white/40">66% of your limit</span>
                </div>
                <div className="mt-auto h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '66%' }}></div>
                </div>
            </div>
        </div>
        
        {/* Your Agents Section */}
        <div>
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[19px] font-medium text-white">Your Agents</h2>
                <button className="text-[13px] text-white/50 flex items-center hover:text-white transition-colors">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
            
            <div className="rounded-[24px] border border-white/5 bg-[#0a0a0a] flex flex-col overflow-hidden">
                {MOCK_BOTS.map((bot, i) => (
                    <div key={bot.id} onClick={() => setLocation(`/bot/${bot.id}/customize`)} className={`flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition-colors ${i !== MOCK_BOTS.length - 1 ? 'border-b border-white/5' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                                <img src={astronautImage} alt="Avatar" className="w-full h-full object-cover filter contrast-125 grayscale" />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-medium text-white mb-1">{bot.name}</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${bot.statusColor}`} />
                                    <span className={`text-[12px] text-white/50`}>
                                        {bot.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[16px] font-medium text-white">{bot.messages}</p>
                                <p className="text-[12px] text-white/40">Messages</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/30" />
                        </div>
                    </div>
                ))}
                
                <div onClick={() => setLocation("/marketplace")} className="flex items-center p-5 cursor-pointer hover:bg-white/[0.02] transition-colors border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl border border-dashed border-white/20 flex items-center justify-center text-white/50">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-[16px] font-medium text-white mb-0.5">Add New Agent</h3>
                            <p className="text-[13px] text-white/50">Create a new AI assistant</p>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <ChevronRight className="w-5 h-5 text-white/30" />
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-[20px] bg-[#0a0a0a] border border-white/5 p-5 flex flex-col items-start cursor-pointer hover:bg-white/[0.02] transition-colors">
                <BarChart2 className="w-6 h-6 text-white/80 mb-4" />
                <h3 className="text-[15px] font-medium text-white mb-1">Analytics</h3>
                <p className="text-[12px] text-white/40 mb-4">Track performance and insights</p>
                <ChevronRight className="w-4 h-4 text-white/30 mt-auto" />
            </div>
            
            <div className="rounded-[20px] bg-[#0a0a0a] border border-white/5 p-5 flex flex-col items-start cursor-pointer hover:bg-white/[0.02] transition-colors">
                <Blocks className="w-6 h-6 text-white/80 mb-4" />
                <h3 className="text-[15px] font-medium text-white mb-1">Integrations</h3>
                <p className="text-[12px] text-white/40 mb-4">Connect your favorite tools</p>
                <ChevronRight className="w-4 h-4 text-white/30 mt-auto" />
            </div>

            <div className="rounded-[20px] bg-[#0a0a0a] border border-white/5 p-5 flex flex-col items-start cursor-pointer hover:bg-white/[0.02] transition-colors">
                <ShieldCheck className="w-6 h-6 text-white/80 mb-4" />
                <h3 className="text-[15px] font-medium text-white mb-1">Security</h3>
                <p className="text-[12px] text-white/40 mb-4">Enterprise-grade protection</p>
                <ChevronRight className="w-4 h-4 text-white/30 mt-auto" />
            </div>

            <div className="rounded-[20px] bg-[#0a0a0a] border border-white/5 p-5 flex flex-col items-start cursor-pointer hover:bg-white/[0.02] transition-colors">
                <CreditCard className="w-6 h-6 text-white/80 mb-4" />
                <h3 className="text-[15px] font-medium text-white mb-1">Billing</h3>
                <p className="text-[12px] text-white/40 mb-4">Manage your plan and payments</p>
                <ChevronRight className="w-4 h-4 text-white/30 mt-auto" />
            </div>
        </div>
      </div>
    </div>
  );
}
