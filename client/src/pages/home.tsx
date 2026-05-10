import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useLocation } from "wouter";
import { Sparkles, Bot, Settings, Power, CircleDot, History, MessagesSquare, AlertCircle, ChevronRight, MessageSquare, Menu, X, Compass, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import vaultyLogoImage from "@assets/1934AF6F-6D3D-49A5-A43E-F71984228AEC_1776900057983.png";

const MOCK_BOTS = [
  {
    id: "1",
    name: "Customer Support Pro",
    status: "online", // online, offline, error
    messagesUsed: 1240,
    type: "rent", // rent, buy, free
  },
  {
    id: "2",
    name: "Lead Gen Assistant",
    status: "offline",
    messagesUsed: 0,
    type: "buy",
  },
  {
    id: "3",
    name: "Basic Greeter (Free)",
    status: "error",
    messagesUsed: 50,
    type: "free",
  }
];

const RECENT_MESSAGES = [
  { id: 1, bot: "Customer Support Pro", user: "guest_8921", msg: "How do I reset my password?", time: "2 mins ago" },
  { id: 2, bot: "Customer Support Pro", user: "user_john", msg: "Pricing for enterprise?", time: "15 mins ago" },
  { id: 3, bot: "Lead Gen Assistant", user: "guest_112", msg: "I want to book a demo.", time: "1 hour ago" },
];

export default function Home() {
  const { user, userData, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <div className="min-h-screen bg-black" />;

  const userPoints = userData?.vaultyPoints || 0;

  return (
    <div className="min-h-screen pb-32 bg-black text-white selection:bg-gray-500/30 animate-in fade-in">
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
                <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors font-medium">
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
        <div className="w-full bg-black/60 backdrop-blur-xl border-b border-white/[0.05] pointer-events-auto">
          <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto p-4 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden shadow-2xl flex items-center justify-center bg-black/50">
                    <img
                        src={vaultyLogoImage}
                        alt="Logo"
                        className="w-6 h-6 object-contain"
                    />
                </div>
             </div>
             
             <Link href="/wallet">
                 <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors">
                     <Sparkles className="w-4 h-4 text-yellow-400" />
                     <span className="text-sm font-bold">{userPoints.toLocaleString()} VC</span>
                 </div>
             </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-5 max-w-[1600px] w-full mx-auto pt-24 space-y-8">
        
        {/* Active Bots Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold">Your Chatbots</h3>
             <Link href="/marketplace">
                <Button variant="ghost" size="sm" className="text-xs text-white/60 hover:text-white">
                  Add New <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
             </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_BOTS.map(bot => (
              <div key={bot.id} className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">{bot.name}</h4>
                            <div className="flex items-center gap-1 mt-0.5">
                                {bot.status === 'online' && <CircleDot className="w-3 h-3 text-green-400" />}
                                {bot.status === 'offline' && <CircleDot className="w-3 h-3 text-gray-500" />}
                                {bot.status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                                <span className="text-[10px] uppercase tracking-wider text-white/50">{bot.status}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setLocation(`/bot/${bot.id}/customize`)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
                        <Settings className="w-4 h-4 text-white/70" />
                    </button>
                </div>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Messages</p>
                        <p className="text-lg font-bold">{bot.messagesUsed.toLocaleString()}</p>
                    </div>
                    
                    <Button variant={bot.status === 'online' ? "outline" : "default"} size="sm" className="rounded-full h-8 text-xs font-semibold px-4 border-white/10">
                        {bot.status === 'online' ? 'Stop' : 'Start'}
                    </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Message History */}
        <section>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold">Recent Messages</h3>
             <Button variant="ghost" size="sm" className="text-xs text-white/60 hover:text-white">
               View All History
             </Button>
          </div>
          
          <div className="rounded-[24px] border border-white/10 bg-black/40 overflow-hidden backdrop-blur-xl">
             {RECENT_MESSAGES.map((msg, i) => (
                <div key={msg.id} className={`flex items-start gap-4 p-4 ${i !== RECENT_MESSAGES.length - 1 ? 'border-b border-white/5' : ''}`}>
                   <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                       <MessageSquare className="w-4 h-4 text-blue-400" />
                   </div>
                   <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between gap-2 mb-1">
                           <p className="text-sm font-bold truncate">{msg.bot}</p>
                           <span className="text-[10px] text-white/40 whitespace-nowrap">{msg.time}</span>
                       </div>
                       <div className="flex flex-col gap-1">
                           <span className="text-xs text-white/60">From: {msg.user}</span>
                           <p className="text-sm text-white/80 line-clamp-2">{msg.msg}</p>
                       </div>
                   </div>
                </div>
             ))}
          </div>
        </section>

      </div>
    </div>
  );
}