import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Bot, Sparkles, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const CHATBOT_TIERS = [
  {
    id: "free",
    name: "Simulated Bot",
    description: "Uses simulated pre-programmed responses. Does not consume Vaulty Credits.",
    type: "free",
    price: 0,
    features: ["Pre-programmed responses", "Basic customization", "Up to 5 intents", "Standard support"],
    badge: "Free"
  },
  {
    id: "rent-basic",
    name: "Customer Support AI",
    description: "Perfect for handling FAQs and general customer inquiries.",
    type: "rent",
    price: 9.99, // Monthly
    features: ["GPT-3.5 integration", "Custom knowledge base", "Email capture", "Priority support"],
  },
  {
    id: "rent-pro",
    name: "Sales Assistant AI",
    description: "Advanced AI trained to convert leads and book meetings.",
    type: "rent",
    price: 49.99, // Monthly
    features: ["GPT-4 integration", "CRM integration", "Meeting scheduling", "Advanced analytics"],
    badge: "Popular"
  },
  {
    id: "rent-enterprise",
    name: "Enterprise Multi-Agent",
    description: "Full suite of agents routing across different departments.",
    type: "rent",
    price: 149.99, // Monthly
    features: ["Multiple AI models", "Custom fine-tuning", "Dedicated account manager", "White-label"],
  },
  {
    id: "buy-standard",
    name: "Standard License",
    description: "Own the bot forever. Source code and models included.",
    type: "buy",
    price: 99.99, // One-time
    features: ["Lifetime access", "Self-hosted option", "Source code access", "Community support"],
  },
  {
    id: "buy-ultimate",
    name: "Ultimate License",
    description: "Full ownership with lifetime updates and custom implementation.",
    type: "buy",
    price: 1299.99, // One-time
    features: ["Done-for-you setup", "Lifetime updates", "Priority engineering support", "Unlimited custom intents"],
  }
];

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, userData } = useAuth();
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
    <div className="min-h-screen bg-[#050505] pb-24 text-white">
      <div className="sticky top-0 z-20 border-b border-white/5 bg-black/75 px-4 pb-4 pt-6 backdrop-blur-2xl">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500">Marketplace</p>
          <h1 className="text-2xl font-semibold tracking-tight">AI Chatbots</h1>
        </div>
        
        <div className="flex items-center gap-2 mt-4 bg-white/5 p-1 rounded-xl">
            <button onClick={() => setFilter('all')} className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>All</button>
            <button onClick={() => setFilter('rent')} className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${filter === 'rent' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>Rent</button>
            <button onClick={() => setFilter('buy')} className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${filter === 'buy' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>Buy</button>
        </div>
      </div>

      <div className="p-4 space-y-4 mt-4">
        {filteredBots.map(bot => (
            <div key={bot.id} className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-5 shadow-[0_24px_60px_rgba(0,0,0,0.15)] backdrop-blur-xl">
                {bot.badge && (
                    <div className="absolute top-4 right-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        {bot.badge}
                    </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold leading-tight">{bot.name}</h3>
                        <p className="text-xs uppercase tracking-wider text-white/50">{bot.type === 'free' ? 'Simulated' : bot.type === 'rent' ? 'Monthly Subscription' : 'One-Time Purchase'}</p>
                    </div>
                </div>
                
                <p className="text-sm text-white/60 mb-5 leading-relaxed">{bot.description}</p>
                
                <div className="space-y-2 mb-6">
                    {bot.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400 shrink-0" />
                            <span className="text-sm text-white/80">{feature}</span>
                        </div>
                    ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                        <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Price</p>
                        <p className="text-xl font-bold">
                            {bot.price === 0 ? "Free" : `$${bot.price}`}
                            {bot.type === 'rent' && <span className="text-sm font-normal text-white/50">/mo</span>}
                        </p>
                    </div>
                    
                    <Button onClick={() => handleAcquire(bot)} className="rounded-full h-10 px-6 font-bold bg-white text-black hover:bg-gray-200">
                        {bot.price === 0 ? "Add to Dashboard" : bot.type === 'buy' ? "Buy Now" : "Subscribe"}
                    </Button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}