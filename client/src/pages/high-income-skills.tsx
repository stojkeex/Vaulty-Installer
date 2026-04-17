import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Brain, Check, PlayCircle, Trophy, BookOpen, Music, Video, Store, Coffee, Laptop, Sparkles, Loader2, Lock, ExternalLink, Upload, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
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
      { id: 1, title: "Choose a brand name & register domain", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Design a professional logo & brand kit", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up your social media profiles (IG/TikTok)", completed: false, type: "social", points: 100 },
      { id: 4, title: "Find your first 3 winning products", completed: false, type: "text", points: 200, isPremium: true },
      { id: 5, title: "Deep market & competitor analysis", completed: false, type: "text", points: 300, isPremium: true },
    ]
  },
  bar: {
    id: "bar-roadmap", title: "Open a Successful Cafe/Bar", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Define your concept & business name", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Create your logo and visual identity", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up business social media accounts", completed: false, type: "social", points: 100 },
      { id: 4, title: "Draft a preliminary business plan & budget", completed: false, type: "text", points: 200, isPremium: true },
      { id: 5, title: "Location scouting & foot traffic secrets", completed: false, type: "text", points: 300, isPremium: true },
    ]
  },
  singer: {
    id: "singer-roadmap", title: "Build a Career in Music", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Choose your stage name & claim handles", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Create your artist logo and press photos", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up your artist profiles (Spotify/Apple)", completed: false, type: "social", points: 100 },
      { id: 4, title: "Plan your first single release strategy", completed: false, type: "text", points: 200, isPremium: true },
      { id: 5, title: "Advanced label pitching & royalties", completed: false, type: "text", points: 300, isPremium: true },
    ]
  },
  creator: {
    id: "creator-roadmap", title: "Become a Full-Time Content Creator", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Define your niche & channel name", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Design your channel art & profile logo", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up your creator social accounts", completed: false, type: "social", points: 100 },
      { id: 4, title: "The anatomy of a highly engaging hook", completed: false, type: "text", points: 200, isPremium: true },
      { id: 5, title: "Brand outreach & sponsorship templates", completed: false, type: "text", points: 300, isPremium: true },
    ]
  },
  cleaner: {
    id: "cleaner-roadmap", title: "Start a Cleaning Agency", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Choose a trustworthy business name", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Design a professional company logo", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up your business Google profile", completed: false, type: "social", points: 100 },
      { id: 4, title: "Define your pricing structure and services", completed: false, type: "text", points: 200, isPremium: true },
      { id: 5, title: "B2B client acquisition strategies", completed: false, type: "text", points: 300, isPremium: true },
    ]
  },
  developer: {
    id: "dev-roadmap", title: "Become a Freelance Developer", duration: "5 days", xp: 500, progress: 0,
    lessons: [
      { id: 1, title: "Define your freelance brand name & niche", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Design your personal logo & brand identity", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up your professional social profiles", completed: false, type: "social", points: 100 },
      { id: 4, title: "Writing proposals that win $1k+ jobs", completed: false, type: "text", points: 200, isPremium: true },
      { id: 5, title: "Client retention & upselling retainers", completed: false, type: "text", points: 300, isPremium: true },
    ]
  }
};

export default function HighIncomeSkills() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [budget, setBudget] = useState(500);
  const [age, setAge] = useState(25);
  
  const [activeSkill, setActiveSkill] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  // Form states for lessons
  const [brandName, setBrandName] = useState("");
  const [uploadedLogo, setUploadedLogo] = useState(false);

  // Load saved progress from local storage simulating DB
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`vaulty_skills_${user.uid}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setHasCompletedOnboarding(true);
        setSelectedBusiness(parsed.business);
        setActiveSkill(parsed.skillData || SKILL_MAP[parsed.business]);
      }
    }
  }, [user]);

  const saveProgress = (updatedSkill: any) => {
    setActiveSkill(updatedSkill);
    if (user && selectedBusiness) {
      localStorage.setItem(`vaulty_skills_${user.uid}`, JSON.stringify({
        business: selectedBusiness,
        budget,
        age,
        skillData: updatedSkill
      }));
    }
  };

  const handleCompleteOnboarding = () => {
    if (!selectedBusiness) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation time
    setTimeout(() => {
      setIsGenerating(false);
      setIsOnboarding(false);
      setHasCompletedOnboarding(true);
      const initialSkillData = JSON.parse(JSON.stringify(SKILL_MAP[selectedBusiness])); // deep copy
      saveProgress(initialSkillData);
    }, 3000);
  };

  const handleCompleteLesson = () => {
    if (!activeLesson || !activeSkill) return;

    const updatedLessons = activeSkill.lessons.map((l: any) => 
      l.id === activeLesson.id ? { ...l, completed: true } : l
    );
    
    const completedCount = updatedLessons.filter((l: any) => l.completed).length;
    const newProgress = Math.round((completedCount / updatedLessons.length) * 100);

    const updatedSkill = {
      ...activeSkill,
      progress: newProgress,
      lessons: updatedLessons
    };

    saveProgress(updatedSkill);
    setActiveLesson(null);
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

  // Lesson Detail View
  if (activeLesson) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveLesson(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold truncate max-w-[250px]">{activeLesson.title}</h1>
              <p className="text-xs text-sky-400 font-medium">Day {activeLesson.id} Quest</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
           {/* PREMIUM LOCKED SCREEN */}
           {activeLesson.isPremium ? (
             <div className="flex flex-col items-center justify-center h-full text-center mt-12">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-indigo-500/30">
                  <Lock className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Premium Quest</h2>
                <p className="text-gray-400 mb-8 max-w-[280px]">
                  This advanced quest contains high-level strategies, analysis templates, and secrets to accelerate your success. Unlock it with Vaulty+.
                </p>
                <Link href="/premium" className="w-full">
                  <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    Unlock Vaulty+
                  </button>
                </Link>
             </div>
           ) : (
             <div className="space-y-8">
               {/* BRAND NAME SCREEN */}
               {activeLesson.type === 'brand_name' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                   <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/30">
                     <BookOpen className="text-sky-400" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-bold mb-2">What is the name of your new venture?</h2>
                     <p className="text-gray-400 text-sm">Choose something memorable, easy to spell, and relevant to your niche. This will be the foundation of your brand.</p>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-300 ml-1">Brand Name</label>
                     <input 
                       type="text" 
                       placeholder="e.g. Vaulty Studios"
                       value={brandName}
                       onChange={(e) => setBrandName(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-sky-500 transition-colors"
                     />
                   </div>
                 </motion.div>
               )}

               {/* LOGO UPLOAD SCREEN */}
               {activeLesson.type === 'logo' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                   <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                     <Sparkles className="text-purple-400" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-bold mb-2">Create your visual identity</h2>
                     <p className="text-gray-400 text-sm">A professional logo builds trust. You can easily create one for free using tools like Canva.</p>
                   </div>
                   
                   <a href="https://www.canva.com/create/logos/" target="_blank" rel="noopener noreferrer" className="block">
                     <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-5 flex items-center justify-between group hover:border-purple-500/60 transition-colors">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-black text-xl">C</div>
                         <div>
                           <h4 className="font-bold text-white">Create with Canva</h4>
                           <p className="text-xs text-purple-200">Opens in new tab</p>
                         </div>
                       </div>
                       <ExternalLink className="text-purple-400 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </div>
                   </a>

                   <div className="mt-6">
                     <label className="text-sm font-bold text-gray-300 ml-1 block mb-2">Upload Your Logo</label>
                     <button 
                       onClick={() => setUploadedLogo(true)}
                       className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${uploadedLogo ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                     >
                       {uploadedLogo ? (
                         <>
                           <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                             <Check size={24} />
                           </div>
                           <span className="font-bold text-emerald-400">Logo uploaded successfully!</span>
                         </>
                       ) : (
                         <>
                           <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/50">
                             <Upload size={24} />
                           </div>
                           <span className="font-bold text-gray-400">Tap to select image</span>
                         </>
                       )}
                     </button>
                   </div>
                 </motion.div>
               )}

               {/* SOCIAL LINKS SCREEN */}
               {activeLesson.type === 'social' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                   <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30">
                     <Check className="text-pink-400" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-bold mb-2">Secure your social handles</h2>
                     <p className="text-gray-400 text-sm">Make sure you own your brand name on the major platforms where your audience hangs out.</p>
                   </div>
                   
                   <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-300 ml-1">Instagram Handle</label>
                       <div className="relative">
                         <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                         <input type="text" placeholder="yourbrand" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500 transition-colors" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-300 ml-1">TikTok Handle</label>
                       <div className="relative">
                         <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                         <input type="text" placeholder="yourbrand" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500 transition-colors" />
                       </div>
                     </div>
                   </div>
                 </motion.div>
               )}
             </div>
           )}
        </div>

        {/* Footer Action */}
        {!activeLesson.isPremium && (
          <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-xl">
             <button 
               onClick={handleCompleteLesson}
               disabled={(activeLesson.type === 'brand_name' && !brandName) || (activeLesson.type === 'logo' && !uploadedLogo)}
               className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
                 (activeLesson.type === 'brand_name' && !brandName) || (activeLesson.type === 'logo' && !uploadedLogo)
                   ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                   : 'bg-sky-500 text-black hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]'
               }`}
             >
               Complete Quest (+{activeLesson.points} XP)
             </button>
          </div>
        )}
      </div>
    );
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
                Your roadmap has been generated based on your budget of €{budget.toLocaleString()} and your goals. Complete tasks to launch.
              </p>
            </div>
          </div>
        </div>

        {/* Active Quest */}
        {activeSkill && (
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
               <h3 className="font-bold text-lg">Quest Timeline</h3>
               <button 
                 onClick={() => {
                   localStorage.removeItem(`vaulty_skills_${user?.uid}`);
                   setHasCompletedOnboarding(false);
                   setIsOnboarding(false);
                   setBrandName("");
                   setUploadedLogo(false);
                 }}
                 className="text-xs text-gray-500 underline"
               >
                 Reset choices
               </button>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-lg">{activeSkill.title}</h4>
                  <div className="flex gap-3 mt-2 text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1"><BookOpen size={14} /> {activeSkill.duration}</span>
                    <span className="flex items-center gap-1 text-sky-400"><Trophy size={14} /> {activeSkill.xp} XP total</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-black border-[5px] border-white/5 flex items-center justify-center relative overflow-hidden">
                   <div 
                     className="absolute bottom-0 left-0 right-0 bg-sky-500 transition-all duration-1000 ease-out" 
                     style={{ height: `${activeSkill.progress}%` }}
                   />
                   <span className="text-[12px] font-bold relative z-10">{activeSkill.progress}%</span>
                </div>
              </div>

              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {activeSkill.lessons.map((lesson: any, idx: number) => {
                  
                  // Find if this is the first uncompleted lesson
                  const isNextUp = !lesson.completed && (idx === 0 || activeSkill.lessons[idx - 1].completed);
                  const isLocked = !lesson.completed && !isNextUp;

                  return (
                    <div 
                      key={lesson.id}
                      onClick={() => {
                        if (!isLocked && !lesson.completed) {
                          setActiveLesson(lesson);
                        }
                      }}
                      className={`relative flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                        lesson.completed 
                          ? 'bg-sky-500/10 border-sky-500/20' 
                          : isNextUp 
                            ? 'bg-white/10 border-white/20 cursor-pointer hover:bg-white/15 hover:scale-[1.02]' 
                            : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm relative z-10 ${
                        lesson.completed 
                          ? 'bg-sky-500 text-black' 
                          : isNextUp 
                            ? 'bg-white text-black' 
                            : 'bg-zinc-800 text-zinc-500 border border-white/5'
                      }`}>
                        {lesson.completed ? <Check size={18} /> : lesson.isPremium ? <Lock size={16} /> : idx + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm font-bold truncate ${lesson.completed ? 'text-sky-400' : 'text-white'}`}>
                            {lesson.title}
                          </p>
                          {lesson.isPremium && (
                            <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                              Vaulty+
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{lesson.points} XP</p>
                      </div>
                      
                      {isNextUp && (
                        <div className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                           <ArrowRight size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}