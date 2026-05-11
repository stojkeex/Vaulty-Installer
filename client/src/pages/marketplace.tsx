import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bot, Check, SlidersHorizontal, ChevronDown, Eye, ArrowRight, Plus, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import astroPortraitImg from "@/assets/astro-portrait.png";

const CHATBOT_TIERS = [
  {
    id: "free-demo",
    name: "Demo Vaulty Bot",
    subtitle: "SIMULATED",
    description: "Uses simulated pre-programmed responses. Does not consume Vaulty Credits.",
    type: "free",
    price: 0,
    features: ["Pre-programmed responses", "Up to 5 intents", "Basic customization", "Standard support"],
    badge: "FREE",
    iconImg: astroPortraitImg,
    stats: [
        { label: "Usage", value: "0 CREDITS" },
        { label: "Limit", value: "5 INTENTS" },
        { label: "Price", value: "FREE" }
    ]
  },
  {
    id: "starter",
    name: "Starter Chatbot",
    subtitle: "MONTHLY / LIFETIME",
    description: "Floating widget ideal for handling customer inquiries and support tickets.",
    type: "rent",
    price: 9.99,
    features: ["1/4 Screen UI", "Embed Script or Source", "Vaulty API", "100 Free Credits/mo"],
    badge: "STARTER"
  },
  {
    id: "premium",
    name: "Premium Chatbot",
    subtitle: "FULL SCREEN",
    description: "Luxurious UI, FAQ tabs, human typing animations, and memory.",
    type: "buy",
    price: 49.99,
    features: ["Full Screen UI", "FAQ Customization", "Advanced Animations", "1000 Free Credits/mo"],
    badge: "PREMIUM"
  }
];

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const [filter, setFilter] = useState<'all' | 'rent' | 'buy'>('all');

  const userPoints = userData?.vaultyPoints || 543474.47;

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
    <div className="min-h-screen bg-black pb-32 text-white font-sans selection:bg-white/20 animate-in fade-in">
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
        <div className="w-full bg-black/80 backdrop-blur-xl border-b border-white/5 pointer-events-auto">
          <div className="w-full px-4 md:px-6 py-4 flex items-center justify-between">
             <div className="flex items-center tracking-[0.2em] font-medium text-lg">
                V A U L T Y
             </div>
             
             <Link href="/wallet">
                 <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-2 cursor-pointer hover:bg-white/5 transition-all">
                     <Sparkles className="w-4 h-4 text-white" />
                     <span className="text-sm font-medium text-white tracking-wide">{userPoints.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} VC</span>
                 </div>
             </Link>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="pt-24 px-5 flex justify-between items-start max-w-[1200px] mx-auto w-full">
        <div className="z-10">
            <h1 className="text-[28px] font-semibold mb-2 tracking-tight">AI Agents</h1>
            <p className="text-[15px] text-white/50 max-w-[240px] leading-relaxed">Discover, rent or buy powerful AI chatbots built for your business.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-8 max-w-[1200px] mx-auto w-full">
        <div className="flex bg-[#0a0a0a] p-1 rounded-[16px] border border-white/5">
            <button onClick={() => setFilter('all')} className={`flex-1 py-2.5 text-[13px] font-medium rounded-xl transition-all ${filter === 'all' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}>All</button>
            <button onClick={() => setFilter('rent')} className={`flex-1 py-2.5 text-[13px] font-medium rounded-xl transition-all ${filter === 'rent' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}>Rent</button>
            <button onClick={() => setFilter('buy')} className={`flex-1 py-2.5 text-[13px] font-medium rounded-xl transition-all ${filter === 'buy' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}>Buy</button>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex justify-between items-center px-5 mt-6 mb-4 max-w-[1200px] mx-auto w-full">
        <button className="flex items-center gap-2 text-[13px] font-medium text-white/70 hover:text-white transition-colors bg-[#0a0a0a] px-3 py-1.5 rounded-lg border border-white/5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
        </button>
        <button className="flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white transition-colors">
            <TrendingUp className="w-3.5 h-3.5 text-white/70" /> Sort by: Popular <ChevronDown className="w-3 h-3 text-white/40" />
        </button>
      </div>

      {/* Bots List */}
      <div className="px-5 space-y-4 max-w-[1200px] mx-auto w-full">
        {filteredBots.map(bot => (
            <div key={bot.id} className={`relative rounded-[24px] p-5 border border-white/5 bg-[#0a0a0a] overflow-hidden`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                    <div className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/5 border border-white/5 overflow-hidden p-2`}>
                            {bot.iconImg ? (
                                <img src={bot.iconImg} alt={bot.name} className="w-full h-full object-contain filter grayscale" />
                            ) : (
                                <Bot className={`w-5 h-5 text-white`} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-[16px] font-medium mb-0.5 tracking-tight text-white">{bot.name}</h3>
                            <p className={`text-[11px] font-medium text-white/50`}>{bot.subtitle}</p>
                        </div>
                    </div>
                    
                    {bot.price === 0 ? (
                        <div className={`px-2 py-1 rounded-md bg-white/10 text-white text-[10px] font-semibold uppercase tracking-wider`}>
                            {bot.badge}
                        </div>
                    ) : (
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-[20px] font-semibold leading-none tracking-tight text-white">
                                <span>${bot.price}</span> 
                                <span className="text-[12px] font-medium text-white/40 ml-1">/ mo</span>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Description */}
                <p className="text-[13px] text-white/60 mb-6 leading-relaxed pr-6">{bot.description}</p>
                
                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6">
                    {bot.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 shrink-0 rounded-full border border-white/20 flex items-center justify-center`}>
                                <Check className={`w-2 h-2 text-white`} strokeWidth={2} />
                            </div>
                            <span className="text-[12px] text-white/70 font-medium truncate">{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Optional Stats for Free tier */}
                {bot.stats && (
                    <div className="grid grid-cols-3 border-t border-white/5 pt-4 pb-2 mb-4">
                        {bot.stats.map((s, i) => (
                            <div key={i} className="text-center">
                                <p className={`text-[12px] font-semibold text-white mb-0.5 tracking-wider`}>{s.value}</p>
                                <p className="text-[10px] text-white/40">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-auto">
                    <Link href={`/marketplace/bot/${bot.id}`} className="flex-1">
                        <Button variant="outline" className="w-full rounded-xl h-11 border-white/10 bg-white/5 hover:bg-white/10 text-white text-[13px] font-semibold shadow-none">
                            Preview
                        </Button>
                    </Link>
                    <button onClick={() => handleAcquire(bot)} className={`flex-1 w-full rounded-xl h-11 text-[13px] font-semibold shadow-none bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center`}>
                        {bot.price === 0 ? (
                            <>Add to Dashboard <Plus className="w-4 h-4 ml-1.5 opacity-80" /></>
                        ) : (
                            <>Rent / Buy <ArrowRight className="w-4 h-4 ml-1.5 opacity-80" /></>
                        )}
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
