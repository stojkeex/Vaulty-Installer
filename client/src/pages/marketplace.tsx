import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bot, Check, SlidersHorizontal, ChevronDown, Eye, ArrowRight, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import robotImg from "@/assets/floating-robot.png";
import simBotImg from "@/assets/simulated-bot-icon.png";

const CHATBOT_TIERS = [
  {
    id: "free",
    name: "Simulated Bot",
    subtitle: "SIMULATED",
    description: "Uses simulated pre-programmed responses. Does not consume Vaulty Credits.",
    type: "free",
    price: 0,
    features: ["Pre-programmed responses", "Up to 5 intents", "Basic customization", "Standard support"],
    badge: "FREE",
    theme: "purple",
    iconImg: simBotImg,
    stats: [
        { label: "Usage", value: "0 CREDITS" },
        { label: "Limit", value: "5 INTENTS" },
        { label: "Price", value: "FREE" }
    ]
  },
  {
    id: "rent-basic",
    name: "Customer Support AI",
    subtitle: "MONTHLY SUBSCRIPTION",
    description: "Perfect for handling customer inquiries and support tickets.",
    type: "rent",
    price: 20,
    features: ["GPT-3.5 integration", "Multi-language support", "Custom knowledge base", "Email & ticket forwarding"],
    badge: "RENT",
    theme: "green"
  },
  {
    id: "rent-pro",
    name: "Lead Generation Pro",
    subtitle: "PREMIUM",
    description: "Capture leads, qualify prospects and grow your business 24/7.",
    type: "rent",
    price: 49,
    features: ["GPT-4 integration", "CRM integrations", "Meeting scheduling", "Advanced analytics"],
    badge: "RENT",
    theme: "blue"
  }
];

const THEMES = {
    purple: {
        bg: "bg-[#0a0614] bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-purple-900/10 via-[#0a0614] to-[#0a0614]",
        border: "border-purple-500/20",
        iconBg: "bg-[#180e2b]",
        iconColor: "text-purple-400",
        badgeBg: "bg-purple-600",
        badgeText: "text-white",
        primaryBtn: "bg-purple-600 hover:bg-purple-700 text-white",
        textColor: "text-purple-400",
        checkBorder: "border-purple-500/50",
        checkColor: "text-purple-400"
    },
    green: {
        bg: "bg-[#07110a] bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-green-900/10 via-[#07110a] to-[#07110a]",
        border: "border-green-500/20",
        iconBg: "bg-[#0a1c12]",
        iconColor: "text-green-400",
        badgeBg: "bg-transparent border border-green-500/30",
        badgeText: "text-green-400",
        primaryBtn: "bg-green-400 hover:bg-green-500 text-black",
        textColor: "text-green-400",
        checkBorder: "border-green-500/50",
        checkColor: "text-green-400"
    },
    blue: {
        bg: "bg-[#060c14] bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#060c14] to-[#060c14]",
        border: "border-blue-500/20",
        iconBg: "bg-[#0a1424]",
        iconColor: "text-blue-400",
        badgeBg: "bg-transparent border border-blue-500/30",
        badgeText: "text-blue-400",
        primaryBtn: "bg-[#1a2333] hover:bg-[#202b3d] text-white",
        textColor: "text-blue-400",
        checkBorder: "border-blue-500/50",
        checkColor: "text-blue-400"
    }
};

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'rent' | 'buy'>('all');

  const handleAcquire = (bot: any) => {
    toast({
      title: bot.type === 'free' ? "Bot Added" : "Purchase Initiated",
      description: bot.type === 'free' ? `${bot.name} has been added to your dashboard.` : `Redirecting to payment for ${bot.name}.`,
    });
    if (bot.type === 'free') {
        setLocation('/home');
    }
  };

  const filteredBots = CHATBOT_TIERS.filter(b => filter === 'all' || b.type === filter || b.type === 'free');

  return (
    <div className="min-h-screen bg-[#050505] pb-32 text-white font-sans">
      
      {/* Header Section */}
      <div className="pt-10 px-5 flex justify-between items-start">
        <div className="z-10">
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1 font-medium">Marketplace</p>
            <h1 className="text-[28px] font-bold mb-2 tracking-tight">AI Chatbots</h1>
            <p className="text-xs text-white/60 max-w-[200px] leading-relaxed">Discover, rent or buy powerful AI chatbots built for your business.</p>
        </div>
        <div className="w-28 h-28 -mt-8 relative z-0 mix-blend-screen opacity-90">
            <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"></div>
            <img src={robotImg} alt="AI Robot" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] relative z-10" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-4">
        <div className="flex bg-[#0f0f13] p-1 rounded-2xl border border-white/5 shadow-inner">
            <button onClick={() => setFilter('all')} className={`flex-1 py-3 text-xs font-semibold rounded-xl transition-all ${filter === 'all' ? 'bg-[#1a102f] shadow-[0_0_20px_rgba(168,85,247,0.15)] text-white border border-purple-500/20' : 'text-white/50 hover:text-white/80'}`}>All</button>
            <button onClick={() => setFilter('rent')} className={`flex-1 py-3 text-xs font-semibold rounded-xl transition-all ${filter === 'rent' ? 'bg-[#1a102f] shadow-[0_0_20px_rgba(168,85,247,0.15)] text-white border border-purple-500/20' : 'text-white/50 hover:text-white/80'}`}>Rent</button>
            <button onClick={() => setFilter('buy')} className={`flex-1 py-3 text-xs font-semibold rounded-xl transition-all ${filter === 'buy' ? 'bg-[#1a102f] shadow-[0_0_20px_rgba(168,85,247,0.15)] text-white border border-purple-500/20' : 'text-white/50 hover:text-white/80'}`}>Buy</button>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex justify-between items-center px-5 mt-6 mb-4">
        <button className="flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors bg-[#0f0f13] px-3 py-1.5 rounded-lg border border-white/5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Sort by: Popular <ChevronDown className="w-3 h-3 text-white/40" />
        </button>
      </div>

      {/* Bots List */}
      <div className="px-5 space-y-4">
        {filteredBots.map(bot => {
            const theme = THEMES[bot.theme as keyof typeof THEMES];
            return (
                <div key={bot.id} className={`relative rounded-3xl p-5 border ${theme.border} ${theme.bg} shadow-xl overflow-hidden`}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex gap-4 items-center">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${theme.iconBg} border border-white/5 shadow-inner overflow-hidden p-2`}>
                                {bot.iconImg ? (
                                    <img src={bot.iconImg} alt={bot.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Bot className={`w-6 h-6 ${theme.iconColor}`} />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-0.5 tracking-tight">{bot.name}</h3>
                                <p className={`text-[9px] uppercase tracking-[0.15em] font-bold ${theme.textColor}`}>{bot.subtitle}</p>
                            </div>
                        </div>
                        
                        {bot.price === 0 ? (
                            <div className={`px-2.5 py-1 rounded-md ${theme.badgeBg} ${theme.badgeText} text-[9px] font-black uppercase tracking-wider`}>
                                {bot.badge}
                            </div>
                        ) : (
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-2xl font-bold leading-none tracking-tight">
                                    <span className={theme.textColor}>{bot.price}</span> 
                                    <span className="text-xs font-medium text-white/40 ml-1">$ / month</span>
                                </div>
                                <div className={`px-2.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} text-[8px] font-bold uppercase tracking-wider`}>
                                    {bot.badge}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-xs text-white/60 mb-6 leading-relaxed pr-6">{bot.description}</p>
                    
                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6">
                        {bot.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-3.5 h-3.5 shrink-0 rounded-full border ${theme.checkBorder} flex items-center justify-center`}>
                                    <Check className={`w-2 h-2 ${theme.checkColor}`} strokeWidth={3} />
                                </div>
                                <span className="text-[11px] text-white/70 font-medium truncate">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Optional Stats for Free tier */}
                    {bot.stats && (
                        <div className="grid grid-cols-3 border-t border-white/5 pt-4 pb-2 mb-4">
                            {bot.stats.map((s, i) => (
                                <div key={i} className="text-center">
                                    <p className={`text-[10px] font-bold ${theme.textColor} mb-0.5 tracking-wider`}>{s.value}</p>
                                    <p className="text-[9px] text-white/40">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 mt-auto">
                        <Button variant="outline" className="flex-1 rounded-xl h-11 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold shadow-none">
                            <Eye className="w-4 h-4 mr-2 text-white/50" /> Preview Bot
                        </Button>
                        <Button className={`flex-1 rounded-xl h-11 text-xs font-bold shadow-none ${theme.primaryBtn}`}>
                            {bot.price === 0 ? (
                                <>Add to Dashboard <Plus className="w-4 h-4 ml-1.5 opacity-80" /></>
                            ) : (
                                <>Rent Now <ArrowRight className="w-4 h-4 ml-1.5 opacity-80" /></>
                            )}
                        </Button>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}