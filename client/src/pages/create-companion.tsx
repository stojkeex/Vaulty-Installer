import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Check, Lock, ChevronRight, GraduationCap, Brain, Zap, MessageCircle, TrendingUp, Wallet, Receipt, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const EXPERTS = [
  { 
    id: "exp_jack", 
    name: "Jack Harrison", 
    role: "Crypto Trading Expert", 
    bio: "Expert in technical analysis, on-chain data, and crypto market cycles.",
    avatar: "src/assets/IMG_8643_1766917974028.jpeg",
    icon: TrendingUp,
    color: "from-[#00CCFF] to-[#FF00BB]",
    objectPos: "object-[center_20%]"
  },
  { 
    id: "exp_marcus", 
    name: "Marcus Sterling", 
    role: "Financial Advisor", 
    bio: "Specialist in wealth management, investing, and personal finance strategies.",
    avatar: "src/assets/IMG_8646_1766917974028.jpeg",
    icon: Wallet,
    color: "from-green-500 to-[#00CCFF]",
    objectPos: "object-center"
  },
  { 
    id: "exp_sarah", 
    name: "Sarah Jenkins", 
    role: "Tax Specialist", 
    bio: "Helping you navigate complex tax laws and optimize your tax returns.",
    avatar: "src/assets/IMG_8642_1766917974028.jpeg",
    icon: Receipt,
    color: "from-[#00CCFF] to-[#FF00BB]",
    objectPos: "object-center"
  },
  { 
    id: "exp_robert", 
    name: "Robert Vance", 
    role: "Business Strategist", 
    bio: "Startup growth, operations, and scaling expert with 15 years experience.",
    avatar: "src/assets/IMG_8644_1766917974028.jpeg",
    icon: Brain,
    color: "from-[#FF00BB] to-[#FF00BB]",
    objectPos: "object-center"
  },
  { 
    id: "exp_eleanor", 
    name: "Eleanor Wright", 
    role: "Economics Professor", 
    bio: "Expert in macroeconomics, global markets, and monetary policy.",
    avatar: "src/assets/IMG_8645_1766917974028.jpeg",
    icon: GraduationCap,
    color: "from-[#00CCFF] to-[#FF00BB]",
    objectPos: "object-center"
  }
];

const CUSTOM_ROLES = [
  { id: "expert", name: "Expert", icon: Brain, description: "Deep knowledge in specific fields." },
  { id: "mentor", name: "Mentor", icon: GraduationCap, description: "Guidance and wisdom." },
  { id: "motivator", name: "Motivator", icon: Zap, description: "High energy motivation." }
];

const NATIONALITIES = ["Slovenia", "Germany", "USA", "UK", "Croatia", "Italy", "France"];

export default function CreateCompanion() {
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    nationality: "Slovenia",
    avatar: "",
    role: "expert"
  });

  const isPremium = userData?.premiumPlan && userData.premiumPlan !== "none";

  const handleSelectExpert = (expert: typeof EXPERTS[0]) => {
    if (!isPremium) {
      toast.error("Premium required to chat with experts", {
        description: "Upgrade to PRO or higher to access specialized AI assistants."
      });
      setLocation("/premium");
      return;
    }
    
    const companion = {
      id: expert.id,
      name: expert.name,
      role: "expert",
      roleTitle: expert.role,
      avatar: expert.avatar,
      objectPos: (expert as any).objectPos || "object-center",
      isExpert: true,
      createdAt: new Date().toISOString(),
      type: "companion"
    };

    const existing = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
    if (existing.some((c: any) => c.id === expert.id)) {
      toast.info(`${expert.name} is already in your chats.`);
      setLocation("/messages");
      return;
    }
    
    localStorage.setItem("vaulty_companions", JSON.stringify([...existing, companion]));
    toast.success(`${expert.name} added to your companions!`);
    setLocation("/messages");
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => step === 1 ? setLocation("/messages") : setStep(1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">AI Companions</h1>
          <p className="text-zinc-500 text-sm font-medium">Chat with elite specialized experts</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  Elite Experts
                </h2>
                {!isPremium && (
                  <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/20 font-bold uppercase tracking-wider">
                    Premium Only
                  </span>
                )}
              </div>
              
              {EXPERTS.map((expert) => {
                const Icon = expert.icon;
                return (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={expert.id}
                    onClick={() => handleSelectExpert(expert)}
                    className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl p-4 flex items-center gap-4 hover:border-white/10 hover:bg-zinc-900/60 transition-all cursor-pointer overflow-hidden backdrop-blur-sm"
                  >
                    {!isPremium && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="bg-black/60 p-2 rounded-full border border-white/10">
                          <Lock className="text-white/80 w-5 h-5" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${expert.color} p-0.5 shrink-0 shadow-lg`}>
                      <Avatar className="w-full h-full border-2 border-black rounded-[14px]">
                        <AvatarImage src={expert.avatar} className="object-cover" />
                        <AvatarFallback className="bg-zinc-800">{expert.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-white truncate text-base">{expert.name}</h3>
                        <div className="p-1 bg-white/5 rounded-md">
                          <Icon className="w-3 h-3 text-zinc-400" />
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.1em] mb-1.5">{expert.role}</p>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-tight font-medium">{expert.bio}</p>
                    </div>
                    <ChevronRight className="text-zinc-800 group-hover:text-zinc-600 transition-colors shrink-0" size={20} />
                  </motion.div>
                );
              })}
            </div>

            <div className="pt-6">
              <div className="bg-gradient-to-br from-zinc-900/80 to-black border border-white/5 rounded-[2.5rem] p-8 text-center space-y-6 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                 <div className="space-y-2 relative z-10">
                    <h3 className="text-xl font-extrabold tracking-tight">Need someone specific?</h3>
                    <p className="text-sm text-zinc-500 font-medium">Create a custom AI expert tailored to your needs</p>
                 </div>
                 <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl shadow-white/5 relative z-10"
                >
                  <MessageCircle size={20} fill="currentColor" />
                  CREATE CUSTOM EXPERT
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="custom"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest ml-1">Expert Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Mentor Joe"
                  className="bg-zinc-900/50 border-white/5 h-14 rounded-2xl focus:ring-1 focus:ring-white/20 transition-all text-base font-medium px-5"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest ml-1">Age</Label>
                  <Input 
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="35"
                    className="bg-zinc-900/50 border-white/5 h-14 rounded-2xl focus:ring-1 focus:ring-white/20 transition-all text-base font-medium px-5"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest ml-1">Nationality</Label>
                  <Select onValueChange={(v) => setFormData({...formData, nationality: v})} defaultValue="Slovenia">
                    <SelectTrigger className="bg-zinc-900/50 border-white/5 h-14 rounded-2xl focus:ring-1 focus:ring-white/20 text-base font-medium px-5">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-2xl">
                      {NATIONALITIES.map(n => <SelectItem key={n} value={n} className="rounded-xl my-1">{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest ml-1">Specialization Role</Label>
                <div className="grid grid-cols-1 gap-3">
                  {CUSTOM_ROLES.map((role) => {
                    const Icon = role.icon;
                    const selected = formData.role === role.id;
                    return (
                      <motion.div 
                        whileTap={{ scale: 0.98 }}
                        key={role.id}
                        onClick={() => setFormData({...formData, role: role.id})}
                        className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center gap-5 ${
                          selected ? 'border-white bg-white/5 shadow-lg shadow-white/5' : 'border-white/5 bg-zinc-900/30 hover:border-white/10'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selected ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                          <Icon size={22} />
                        </div>
                        <div className="flex-1">
                          <p className="font-extrabold text-base">{role.name}</p>
                          <p className="text-xs text-zinc-500 font-medium">{role.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-white bg-white' : 'border-white/10'}`}>
                          {selected && <Check size={14} className="text-black stroke-[4]" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={() => {
                    if (!formData.name || !formData.age) {
                      toast.error("Please fill in basic details");
                      return;
                    }
                    const newCompanion = {
                      id: `custom_${Date.now()}`,
                      ...formData,
                      createdAt: new Date().toISOString(),
                      type: "companion"
                    };
                    const existing = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
                    localStorage.setItem("vaulty_companions", JSON.stringify([...existing, newCompanion]));
                    toast.success("Custom companion created!");
                    setLocation("/messages");
                  }} 
                  className="w-full h-16 bg-white text-black font-black rounded-2xl text-lg shadow-2xl shadow-white/5 active:scale-[0.98] transition-transform"
                >
                  START CONVERSATION
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
