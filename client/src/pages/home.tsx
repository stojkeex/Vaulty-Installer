import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useLocation } from "wouter";
import { Sparkles, Bot, Settings, Power, ChevronRight, MessageSquare, Menu, X, Compass, Wallet, LogOut, Plus, TrendingUp, Play, Square, Activity, Send, MessageCircle, LineChart, Hexagon, Box, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import vaultyLogoImage from "@assets/1934AF6F-6D3D-49A5-A43E-F71984228AEC_1776900057983.png";

const MOCK_BOTS = [
  {
    id: "1",
    name: "Customer Support Pro",
    status: "ONLINE",
    statusColor: "text-green-400",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/20 border-purple-500/30",
    messages: "1,240",
    messagesGrowth: "24.5%",
    isPositiveGrowth: true,
    creditsUsed: "12,400",
    creditsPercent: "2%",
    uptime: "100%",
    hasActivity: true,
    todayValue: "312",
    theme: "purple",
    chartPath: "M0 100 Q 20 70, 40 80 T 80 50 T 120 40 T 160 60 T 200 40 T 240 40 T 280 20 T 320 30"
  },
  {
    id: "2",
    name: "Lead Gen Assistant",
    status: "OFFLINE",
    statusColor: "text-gray-400",
    iconColor: "text-green-400",
    iconBg: "bg-green-500/20 border-green-500/30",
    messages: "0",
    messagesGrowth: null,
    creditsUsed: "0",
    creditsPercent: "0%",
    uptime: "—",
    hasActivity: false,
    theme: "green"
  },
  {
    id: "3",
    name: "Basic Greeter (Free)",
    status: "ERROR",
    statusColor: "text-blue-400",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/20 border-blue-500/30",
    messages: "50",
    messagesGrowth: "12.3%",
    isPositiveGrowth: true,
    creditsUsed: "500",
    creditsPercent: "0.09%",
    uptime: "99.2%",
    hasActivity: true,
    todayValue: "14",
    theme: "blue",
    chartPath: "M0 80 Q 20 40, 40 50 T 80 30 T 120 40 T 160 70 T 200 70 T 240 40 T 280 50 T 320 80"
  }
];

export default function Home() {
  const { user, userData, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <div className="min-h-screen bg-black" />;

  const userPoints = userData?.vaultyPoints || 543474.47;

  return (
    <div className="min-h-screen pb-32 bg-[#050505] text-white selection:bg-gray-500/30 animate-in fade-in font-sans">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0a0a0f] border-r border-white/10 z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={vaultyLogoImage} alt="Vaulty" className="w-8 h-8 object-contain" />
                  <span className="font-bold tracking-widest uppercase text-sm">Vaulty</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <button onClick={() => { setLocation('/home'); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  Dashboard
                </button>
                <button onClick={() => { setLocation('/marketplace'); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors font-medium">
                  <Compass className="w-5 h-5" />
                  Store
                </button>
                <button onClick={() => { setLocation('/wallet'); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors font-medium">
                  <Wallet className="w-5 h-5" />
                  Wallet
                </button>
              </div>

              <div className="p-6 border-t border-white/5">
                <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors font-medium">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
        <div className="w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.02] pointer-events-auto">
          <div className="max-w-[1200px] w-full mx-auto px-4 py-3 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-xl border border-white/5 bg-transparent flex items-center justify-center hover:bg-white/5 transition-colors">
                  <Menu className="w-5 h-5 text-white/80" />
                </button>
             </div>
             
             <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                 <img
                     src={vaultyLogoImage}
                     alt="Logo"
                     className="w-7 h-7 object-contain"
                 />
             </div>
             
             <Link href="/wallet">
                 <div className="flex items-center gap-2 rounded-full border border-[#2a1b4d] bg-[#140b2e] px-4 py-2 cursor-pointer hover:bg-[#1a0f3d] transition-colors shadow-[0_0_15px_rgba(107,33,168,0.3)]">
                     <Sparkles className="w-4 h-4 text-white" />
                     <span className="text-[13px] font-bold text-white tracking-wide">{userPoints.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} VC</span>
                 </div>
             </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-5 max-w-[1200px] w-full mx-auto pt-24 space-y-6">
        
        {/* Title Section */}
        <div className="flex items-start justify-between mb-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Your Chatbots</h1>
                <p className="text-sm text-white/50 font-light">Manage, monitor and grow your AI assistants.</p>
            </div>
            <Link href="/marketplace">
                <Button variant="outline" size="sm" className="rounded-full h-9 text-xs font-semibold px-4 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 bg-transparent">
                  Add New <Plus className="w-3 h-3 ml-1" />
                </Button>
            </Link>
        </div>

        {/* Summary Banner */}
        <div className="grid grid-cols-3 gap-4 rounded-[24px] border border-white/5 bg-[#0a0a0f] p-5 shadow-lg">
            {/* Total Messages */}
            <div className="flex items-center gap-4 border-r border-white/5 pr-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#1a0f2e] border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(107,33,168,0.2)]">
                    <Send className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1 font-medium">Total Messages</p>
                    <p className="text-xl font-bold leading-none mb-1">1,290</p>
                    <div className="flex items-center gap-1 text-[10px]">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 font-medium">18.6%</span>
                        <span className="text-white/40">vs last 7 days</span>
                    </div>
                </div>
            </div>

            {/* Credits Left */}
            <div className="flex items-center gap-4 border-r border-white/5 px-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#0d1b2a] border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1 font-medium">Credits Left</p>
                    <p className="text-xl font-bold leading-none mb-1">543,474</p>
                    <p className="text-[10px] text-white/40 font-medium">≈ 1.3M messages</p>
                </div>
            </div>

            {/* Active Bots */}
            <div className="flex items-center gap-4 pl-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#0f291e] border border-green-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <LineChart className="w-5 h-5 text-green-400" />
                </div>
                <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1 font-medium">Active Bots</p>
                    <p className="text-xl font-bold leading-none mb-1">2 <span className="text-white/30 text-sm">/ 3</span></p>
                    <p className="text-[10px] text-green-400 font-medium">66% of your limit</p>
                </div>
            </div>
        </div>
        
        {/* Chatbots List */}
        <div className="space-y-4">
          {MOCK_BOTS.map(bot => (
            <div key={bot.id} className="rounded-[24px] border border-white/5 bg-[#0a0a0f] p-5 shadow-lg flex flex-col relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[14px] ${bot.iconBg} border flex items-center justify-center`}>
                            <Bot className={`w-6 h-6 ${bot.iconColor}`} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white mb-1">{bot.name}</h3>
                            <div className="flex items-center gap-1.5">
                                <CircleDot className={`w-2.5 h-2.5 ${bot.statusColor}`} />
                                <span className={`text-[10px] uppercase tracking-wider font-semibold ${bot.statusColor}`}>
                                    {bot.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setLocation(`/bot/${bot.id}/customize`)} className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-white/5 transition-colors">
                        <Settings className="w-5 h-5 text-white/50" />
                    </button>
                </div>

                <div className="flex gap-6">
                    {/* Left Stats Column */}
                    <div className="w-[200px] flex flex-col gap-5 shrink-0">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">Messages</p>
                            <p className="text-2xl font-bold leading-none mb-1">{bot.messages}</p>
                            {bot.messagesGrowth && (
                                <div className="flex items-center gap-1 text-[10px]">
                                    <TrendingUp className={`w-3 h-3 ${bot.theme === 'purple' ? 'text-purple-400' : 'text-blue-400'}`} />
                                    <span className={bot.theme === 'purple' ? 'text-purple-400' : 'text-blue-400'}>{bot.messagesGrowth}</span>
                                    <span className="text-white/40">vs last 7 days</span>
                                </div>
                            )}
                            {!bot.messagesGrowth && (
                                <p className="text-[10px] text-white/40">No activity yet</p>
                            )}
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">Credits Used</p>
                            <p className="text-lg font-bold leading-none mb-1">{bot.creditsUsed}</p>
                            <p className="text-[10px] text-white/40">≈ {bot.creditsPercent} of your credits</p>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">Uptime</p>
                                <p className="text-base font-bold leading-none mb-1">{bot.uptime}</p>
                                <p className="text-[10px] text-white/40">{bot.uptime === '—' ? 'Not started yet' : 'Last 7 days'}</p>
                            </div>
                            <div className="mb-2">
                                <Activity className="w-5 h-5 text-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Right Chart/Action Area */}
                    <div className="flex-1 bg-[#121218] rounded-[20px] border border-white/[0.03] p-4 flex flex-col relative overflow-hidden">
                        {bot.hasActivity ? (
                            <>
                                <div className="flex items-center justify-between mb-4 z-10 relative">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-3 py-1 rounded-md text-[10px] font-bold ${bot.theme === 'purple' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>7D</div>
                                        <div className="px-3 py-1 rounded-md text-[10px] font-bold text-white/40 hover:text-white/70 cursor-pointer">30D</div>
                                        <div className="px-3 py-1 rounded-md text-[10px] font-bold text-white/40 hover:text-white/70 cursor-pointer">90D</div>
                                    </div>
                                    <div className="text-[10px] text-white/50 hover:text-white cursor-pointer flex items-center gap-1">
                                        View Analytics <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                                
                                {/* Fake Chart Area */}
                                <div className="flex-1 relative mt-2 z-10">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-6 opacity-20">
                                        <div className="border-b border-white/10 w-full" />
                                        <div className="border-b border-white/10 w-full" />
                                        <div className="border-b border-white/10 w-full" />
                                        <div className="border-b border-white/10 w-full" />
                                    </div>
                                    
                                    {/* Y Axis Labels */}
                                    <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between pt-1 pb-1 text-[9px] text-white/30 z-0">
                                        <span>400</span>
                                        <span>300</span>
                                        <span>200</span>
                                        <span>100</span>
                                        <span>0</span>
                                    </div>

                                    {/* X Axis Labels */}
                                    <div className="absolute bottom-0 left-8 right-4 flex justify-between text-[9px] text-white/30 z-0">
                                        <span>May 14</span>
                                        <span>May 15</span>
                                        <span>May 16</span>
                                        <span>May 17</span>
                                        <span>May 18</span>
                                        <span>May 19</span>
                                        <span>Today</span>
                                    </div>

                                    {/* SVG Chart line */}
                                    <div className="absolute inset-y-0 bottom-6 left-8 right-4">
                                        <svg viewBox="0 0 320 100" className="w-full h-full preserve-aspect-ratio-none overflow-visible">
                                            <path 
                                                d={bot.chartPath} 
                                                fill="none" 
                                                stroke={bot.theme === 'purple' ? '#a855f7' : '#3b82f6'} 
                                                strokeWidth="2"
                                                className="drop-shadow-md"
                                            />
                                            {/* Data point dot */}
                                            <circle cx="320" cy={bot.theme === 'purple' ? "30" : "80"} r="4" fill={bot.theme === 'purple' ? '#a855f7' : '#3b82f6'} className="shadow-lg" />
                                        </svg>
                                        
                                        {/* Value Tooltip */}
                                        <div className="absolute right-0 flex flex-col items-center" style={{ top: bot.theme === 'purple' ? '5px' : '55px', transform: 'translate(50%, -100%)' }}>
                                            <div className="text-[10px] font-bold text-white mb-0.5">{bot.todayValue}</div>
                                            <div className="text-[8px] text-white/50">Today</div>
                                            <div className={`w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent mt-1 ${bot.theme === 'purple' ? 'border-t-purple-500' : 'border-t-blue-500'}`}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button overlay at bottom right */}
                                <div className="absolute bottom-4 right-4 z-20">
                                    {bot.status === 'ONLINE' ? (
                                        <Button variant="outline" className="h-9 px-5 rounded-full border-purple-500/30 bg-[#1a0f2e]/80 hover:bg-[#1a0f2e] text-white backdrop-blur-md shadow-[0_0_15px_rgba(107,33,168,0.2)]">
                                            <Square className="w-3 h-3 mr-2 fill-purple-400 text-purple-400" /> Stop
                                        </Button>
                                    ) : (
                                        <Button variant="outline" className="h-9 px-5 rounded-full border-blue-500/30 bg-[#0d1b2a]/80 hover:bg-[#0d1b2a] text-white backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                            <Play className="w-3 h-3 mr-2 fill-blue-400 text-blue-400" /> Start
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-between px-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 relative flex items-center justify-center">
                                        <Hexagon className="w-10 h-10 text-green-500/40 absolute -top-1 -left-2 rotate-12" />
                                        <Box className="w-12 h-12 text-green-500/60 relative z-10" />
                                        <Hexagon className="w-8 h-8 text-green-500/30 absolute -bottom-2 -right-1 -rotate-12" />
                                        <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">This chatbot is offline</h4>
                                        <p className="text-xs text-white/50 leading-snug">Start your chatbot to begin<br/>receiving messages.</p>
                                    </div>
                                </div>
                                <Button className="h-10 px-6 rounded-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-white shadow-[0_0_15px_rgba(34,197,94,0.15)] font-semibold">
                                    <Play className="w-4 h-4 mr-2 fill-green-400 text-green-400" /> Start
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}