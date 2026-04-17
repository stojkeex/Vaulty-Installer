import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Brain, Check, PlayCircle, Trophy, BookOpen, Music, Video, Store, Coffee, Laptop, Sparkles, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";

const BUSINESS_OPTIONS = [
  { id: "shop", title: "E-commerce Shop", icon: Store, desc: "Sell physical or digital products online" },
  { id: "bar", title: "Bar / Cafe", icon: Coffee, desc: "Local hospitality and community space" },
  { id: "singer", title: "Singer / Musician", icon: Music, desc: "Perform, record, and build an audience" },
  { id: "creator", title: "Content Creator", icon: Video, desc: "YouTube, TikTok, and brand deals" },
  { id: "cleaner", title: "Cleaning Agency", icon: Sparkles, desc: "B2B or B2C cleaning services" },
  { id: "developer", title: "Software Developer", icon: Laptop, desc: "Build apps, websites, and SaaS" },
];

const SKILL_MAP: Record<string, any> = {
  shop: {
    id: "shop-roadmap", title: "Launch Your First Online Store", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Choose a brand name & register domain", completed: false },
      { id: 2, title: "Design a professional logo & brand kit", completed: false },
      { id: 3, title: "Set up your social media profiles (IG/TikTok)", completed: false },
      { id: 4, title: "Find your first 3 winning products", completed: false },
      { id: 5, title: "Build your Shopify store skeleton", completed: false },
    ]
  },
  bar: {
    id: "bar-roadmap", title: "Open a Successful Cafe/Bar", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Define your concept & business name", completed: false },
      { id: 2, title: "Create your logo and visual identity", completed: false },
      { id: 3, title: "Set up business social media accounts", completed: false },
      { id: 4, title: "Draft a preliminary business plan & budget", completed: false },
      { id: 5, title: "Research local licensing requirements", completed: false },
    ]
  },
  singer: {
    id: "singer-roadmap", title: "Build a Career in Music", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Choose your stage name & claim handles", completed: false },
      { id: 2, title: "Create your artist logo and press photos", completed: false },
      { id: 3, title: "Set up your artist profiles (Spotify/Apple)", completed: false },
      { id: 4, title: "Build your social media presence (TikTok/IG)", completed: false },
      { id: 5, title: "Plan your first single release strategy", completed: false },
    ]
  },
  creator: {
    id: "creator-roadmap", title: "Become a Full-Time Content Creator", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Define your niche & channel name", completed: false },
      { id: 2, title: "Design your channel art & profile logo", completed: false },
      { id: 3, title: "Set up your creator social accounts", completed: false },
      { id: 4, title: "Plan your first 10 video ideas", completed: false },
      { id: 5, title: "Script your first highly engaging video", completed: false },
    ]
  },
  cleaner: {
    id: "cleaner-roadmap", title: "Start a Cleaning Agency", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Choose a trustworthy business name", completed: false },
      { id: 2, title: "Design a professional company logo", completed: false },
      { id: 3, title: "Set up your business social media & Google profile", completed: false },
      { id: 4, title: "Define your pricing structure and services", completed: false },
      { id: 5, title: "Draft your first local advertising flyer", completed: false },
    ]
  },
  developer: {
    id: "dev-roadmap", title: "Become a Freelance Developer", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Define your freelance brand name & niche", completed: false },
      { id: 2, title: "Design your personal logo & brand identity", completed: false },
      { id: 3, title: "Set up your professional social profiles (LinkedIn/Twitter)", completed: false },
      { id: 4, title: "Buy a domain for your portfolio website", completed: false },
      { id: 5, title: "Draft the copy for your portfolio homepage", completed: false },
    ]
  }
};

export default function HighIncomeSkills() {
  const { user } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [budget, setBudget] = useState(500);
  const [age, setAge] = useState(25);
  
  const [activeSkill, setActiveSkill] = useState<any>(null);

  // Load saved progress from local storage simulating DB
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`vaulty_skills_${user.uid}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setHasCompletedOnboarding(true);
        setSelectedBusiness(parsed.business);
        setActiveSkill(SKILL_MAP[parsed.business]);
      }
    }
  }, [user]);

  const handleCompleteOnboarding = () => {
    if (!selectedBusiness) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation time
    setTimeout(() => {
      setIsGenerating(false);
      setIsOnboarding(false);
      setHasCompletedOnboarding(true);
      setActiveSkill(SKILL_MAP[selectedBusiness]);
      
      if (user) {
        localStorage.setItem(`vaulty_skills_${user.uid}`, JSON.stringify({
          business: selectedBusiness,
          budget,
          age
        }));
      }
    }, 3000);
  };

  // If loading generation screen
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-sky-500/20 border border-sky-500/30 rounded-2xl flex items-center justify-center mb-8 relative">
           <Brain className="w-10 h-10 text-sky-400 animate-pulse" />
           <div className="absolute inset-0 border border-sky-500/50 rounded-2xl animate-ping"></div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Vaulty Customization</h2>
        <p className="text-sky-400 font-medium text-center flex items-center gap-2">
           <Loader2 className="w-4 h-4 animate-spin" />
           Generating your custom {BUSINESS_OPTIONS.find(b => b.id === selectedBusiness)?.title} roadmap...
        </p>
        
        <div className="mt-12 w-full max-w-xs space-y-4">
           <div className="h-2 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 3, ease: "easeInOut" }}
             />
           </div>
           <div className="flex justify-between text-xs text-gray-500">
             <span>Analyzing budget (€{budget.toLocaleString()})</span>
             <span>100%</span>
           </div>
        </div>
      </div>
    );
  }

  // If in onboarding form
  if (isOnboarding && !hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-black text-white pb-24">
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOnboarding(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Your Custom Path</h1>
              <p className="text-xs text-gray-400 font-medium">Step 1 of 1</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-8 mt-4">
           <div className="space-y-4">
             <h2 className="text-2xl font-bold">What business do you want to build?</h2>
             <div className="grid grid-cols-2 gap-3">
               {BUSINESS_OPTIONS.map((biz) => {
                 const Icon = biz.icon;
                 const isSelected = selectedBusiness === biz.id;
                 return (
                   <button
                     key={biz.id}
                     onClick={() => setSelectedBusiness(biz.id)}
                     className={`p-4 rounded-2xl border text-left flex flex-col items-start gap-3 transition-all ${
                       isSelected 
                         ? 'bg-sky-500/10 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)]' 
                         : 'bg-white/5 border-white/10 hover:bg-white/10'
                     }`}
                   >
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-sky-500 text-black' : 'bg-white/10 text-white'}`}>
                       <Icon size={20} />
                     </div>
                     <div>
                       <h3 className="font-bold text-sm">{biz.title}</h3>
                     </div>
                   </button>
                 )
               })}
             </div>
           </div>

           <div className="space-y-6 pt-6 border-t border-white/10">
             <h2 className="text-xl font-bold">Tell us about your resources</h2>
             
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-gray-300">Starting Budget</label>
                   <span className="text-lg font-bold text-sky-400">
                     {budget === 10000 ? "€10,000+" : `€${budget.toLocaleString()}`}
                   </span>
                 </div>
                 <input 
                   type="range" 
                   min="0" max="10000" step="100"
                   value={budget}
                   onChange={(e) => setBudget(Number(e.target.value))}
                   className="w-full accent-sky-500"
                 />
               </div>

               <div>
                 <div className="flex justify-between mb-2 mt-6">
                   <label className="text-sm font-medium text-gray-300">Your Age</label>
                   <span className="text-lg font-bold text-sky-400">{age}</span>
                 </div>
                 <input 
                   type="range" 
                   min="18" max="70" step="1"
                   value={age}
                   onChange={(e) => setAge(Number(e.target.value))}
                   className="w-full accent-sky-500"
                 />
                 <p className="text-xs text-gray-500 mt-2">Minimum age is 18 to participate in business ventures.</p>
               </div>
             </div>
           </div>

           <div className="pt-8">
             <button 
               onClick={handleCompleteOnboarding}
               disabled={!selectedBusiness}
               className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
                 selectedBusiness 
                   ? 'bg-sky-500 text-black hover:bg-sky-400' 
                   : 'bg-white/10 text-gray-500 cursor-not-allowed'
               }`}
             >
               Generate Roadmap
             </button>
           </div>
        </div>
      </div>
    )
  }

  // If haven't started onboarding yet
  if (!hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-black text-white pb-24 flex flex-col">
        <div className="sticky top-0 z-50 px-4 py-4">
          <Link href="/home">
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto mt-12">
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-sky-500/20 to-sky-900/20 border border-sky-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
             <Brain className="w-12 h-12 text-sky-400" />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">Unlock Your Next Income Stream</h1>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Before we begin, Vaulty needs to understand your goals. We'll generate a custom 5-day roadmap based on the business you want to build and the resources you have.
          </p>
          
          <button 
            onClick={() => setIsOnboarding(true)}
            className="w-full bg-white text-black font-bold text-lg py-4 rounded-full hover:bg-gray-200 transition-colors"
          >
            Start Questionnaire
          </button>
        </div>
      </div>
    )
  }

  // Active Skill View (After Onboarding)
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/home">
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Your Custom Roadmap</h1>
            <p className="text-xs text-sky-400 font-medium">Wealth Builder Phase</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Intro */}
        <div className="bg-gradient-to-br from-sky-900/40 to-black border border-sky-500/20 rounded-[32px] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full" />
          <div className="relative z-10 flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              {(() => {
                 const biz = BUSINESS_OPTIONS.find(b => b.id === selectedBusiness);
                 if (biz) {
                   const Icon = biz.icon;
                   return <Icon className="w-6 h-6 text-sky-400" />;
                 }
                 return <Brain className="w-6 h-6 text-sky-400" />;
              })()}
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2">
                 {BUSINESS_OPTIONS.find(b => b.id === selectedBusiness)?.title || "Your Business"}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your roadmap has been generated based on your budget of €{budget.toLocaleString()} and your goals. Follow the daily quests to launch.
              </p>
            </div>
          </div>
        </div>

        {/* Active Quest */}
        {activeSkill && (
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
               <h3 className="font-bold text-lg">Current Quest</h3>
               <button 
                 onClick={() => {
                   localStorage.removeItem(`vaulty_skills_${user?.uid}`);
                   setHasCompletedOnboarding(false);
                   setIsOnboarding(false);
                 }}
                 className="text-xs text-gray-500 underline"
               >
                 Reset choices
               </button>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">{activeSkill.title}</h4>
                  <div className="flex gap-3 mt-2 text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1"><BookOpen size={14} /> {activeSkill.duration}</span>
                    <span className="flex items-center gap-1 text-sky-400"><Trophy size={14} /> {activeSkill.xp} XP</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                   <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-sky-500"
                        strokeDasharray={`${activeSkill.progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                   </svg>
                   <span className="text-[10px] font-bold">{activeSkill.progress}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {activeSkill.lessons.map((lesson: any, idx: number) => (
                  <div 
                    key={lesson.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      lesson.completed 
                        ? 'bg-sky-500/10 border-sky-500/20' 
                        : idx === 0 
                          ? 'bg-white/10 border-white/20' 
                          : 'bg-black/40 border-white/5 opacity-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      lesson.completed 
                        ? 'bg-sky-500 text-black' 
                        : idx === 0 
                          ? 'bg-white text-black' 
                          : 'bg-white/10 text-gray-500'
                    }`}>
                      {lesson.completed ? <Check size={16} /> : idx === 0 ? <PlayCircle size={16} /> : idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${lesson.completed ? 'text-sky-400' : 'text-white'}`}>
                        {lesson.title}
                      </p>
                    </div>
                    {idx === 0 && (
                      <button className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full">
                        Start
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}