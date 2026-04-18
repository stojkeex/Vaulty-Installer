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
    id: "shop-roadmap", title: "Launch Your First Online Store", duration: "8 days", xp: 800, progress: 0,
    lessons: [
      { id: 1, title: "Choose a brand name & register domain", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Design a professional logo & brand kit", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up your social media profiles (IG/TikTok)", completed: false, type: "social", points: 100 },
      { id: 4, title: "Find your first 3 winning products", completed: false, type: "text", points: 200 },
      { id: 5, title: "Basic store setup (Shopify/WooCommerce)", completed: false, type: "text", points: 250 },
      { id: 6, title: "Deep market & competitor analysis", completed: false, type: "text", points: 300, isPremium: true },
      { id: 7, title: "Advanced Facebook/TikTok Ads setup", completed: false, type: "text", points: 400, isPremium: true },
      { id: 8, title: "Build your custom eCommerce website", completed: false, type: "text", points: 500, isPremium: true },
    ]
  },
  bar: {
    id: "bar-roadmap", title: "Open a Successful Cafe/Bar", duration: "8 days", xp: 800, progress: 0,
    lessons: [
      { id: 1, title: "Define your concept & business name", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Create your logo and visual identity", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up business social media accounts", completed: false, type: "social", points: 100 },
      { id: 4, title: "Draft a preliminary business plan & budget", completed: false, type: "text", points: 200 },
      { id: 5, title: "Basic menu creation & pricing strategy", completed: false, type: "text", points: 250 },
      { id: 6, title: "Location scouting & foot traffic secrets", completed: false, type: "text", points: 300, isPremium: true },
      { id: 7, title: "Supplier negotiation tactics & inventory management", completed: false, type: "text", points: 400, isPremium: true },
      { id: 8, title: "Build your cafe's professional website", completed: false, type: "text", points: 500, isPremium: true },
    ]
  },
  singer: {
    id: "singer-roadmap", title: "Build a Career in Music", duration: "8 days", xp: 800, progress: 0,
    lessons: [
      { id: 1, title: "Choose your stage name & claim handles", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Create your artist logo and press photos", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up your artist profiles (Spotify/Apple)", completed: false, type: "social", points: 100 },
      { id: 4, title: "Plan your first single release strategy", completed: false, type: "text", points: 200 },
      { id: 5, title: "Basic home studio setup & recording techniques", completed: false, type: "text", points: 250 },
      { id: 6, title: "Advanced label pitching & royalties", completed: false, type: "text", points: 300, isPremium: true },
      { id: 7, title: "PR strategies & getting featured on blogs", completed: false, type: "text", points: 400, isPremium: true },
      { id: 8, title: "Build your artist portfolio website", completed: false, type: "text", points: 500, isPremium: true },
    ]
  },
  creator: {
    id: "creator-roadmap", title: "Become a Full-Time Content Creator", duration: "8 days", xp: 800, progress: 0,
    lessons: [
      { id: 1, title: "Define your niche & channel name", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Design your channel art & profile logo", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up your creator social accounts", completed: false, type: "social", points: 100 },
      { id: 4, title: "The anatomy of a highly engaging hook", completed: false, type: "text", points: 200 },
      { id: 5, title: "Basic video editing & storytelling flow", completed: false, type: "text", points: 250 },
      { id: 6, title: "Brand outreach & sponsorship templates", completed: false, type: "text", points: 300, isPremium: true },
      { id: 7, title: "Monetization strategies beyond Adsense", completed: false, type: "text", points: 400, isPremium: true },
      { id: 8, title: "Build your personal brand website", completed: false, type: "text", points: 500, isPremium: true },
    ]
  },
  cleaner: {
    id: "cleaner-roadmap", title: "Start a Cleaning Agency", duration: "8 days", xp: 800, progress: 0,
    lessons: [
      { id: 1, title: "Choose a trustworthy business name", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Design a professional company logo", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up your business Google profile", completed: false, type: "social", points: 100 },
      { id: 4, title: "Define your pricing structure and services", completed: false, type: "text", points: 200 },
      { id: 5, title: "Basic local marketing & flyer distribution", completed: false, type: "text", points: 250 },
      { id: 6, title: "B2B client acquisition strategies", completed: false, type: "text", points: 300, isPremium: true },
      { id: 7, title: "Hiring, managing & scaling your workforce", completed: false, type: "text", points: 400, isPremium: true },
      { id: 8, title: "Build your agency's booking website", completed: false, type: "text", points: 500, isPremium: true },
    ]
  },
  developer: {
    id: "dev-roadmap", title: "Become a Freelance Developer", duration: "8 days", xp: 800, progress: 0,
    lessons: [
      { id: 1, title: "Define your freelance brand name & niche", completed: false, type: "brand_name", points: 100 },
      { id: 2, title: "Design your personal logo & brand identity", completed: false, type: "logo", points: 150 },
      { id: 3, title: "Set up your professional social profiles", completed: false, type: "social", points: 100 },
      { id: 4, title: "Writing proposals that win $1k+ jobs", completed: false, type: "text", points: 200 },
      { id: 5, title: "Setting up your freelance contract & invoices", completed: false, type: "text", points: 250 },
      { id: 6, title: "Client retention & upselling retainers", completed: false, type: "text", points: 300, isPremium: true },
      { id: 7, title: "Advanced portfolio strategies & case studies", completed: false, type: "text", points: 400, isPremium: true },
      { id: 8, title: "Build your freelance developer website", completed: false, type: "text", points: 500, isPremium: true },
    ]
  }
};

export default function HighIncomeSkills() {
  const { user, userData } = useAuth();
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
  const [lessonChecked, setLessonChecked] = useState(false);

  // Reset checked state when changing lessons
  useEffect(() => {
    setLessonChecked(false);
  }, [activeLesson?.id]);

  const hasPremium = userData?.badges?.some((b: string) => b.includes("premium")) || userData?.premiumPlan || userData?.subscription === "pro" || userData?.subscription === "ultra" || userData?.subscription === "max" || false;

  // Load saved progress from local storage simulating DB
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`vaulty_skills_${user.uid}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setHasCompletedOnboarding(true);
        setSelectedBusiness(parsed.business);
        
        // Merge saved progress with current SKILL_MAP to ensure we have the latest quests (e.g. 8 quests instead of 5)
        const baseSkill = SKILL_MAP[parsed.business];
        if (baseSkill) {
          const mergedLessons = baseSkill.lessons.map((baseLesson: any) => {
            const savedLesson = parsed.skillData?.lessons?.find((l: any) => l.id === baseLesson.id);
            return {
              ...baseLesson,
              completed: savedLesson ? savedLesson.completed : false
            };
          });
          
          const completedCount = mergedLessons.filter((l: any) => l.completed).length;
          const newProgress = Math.round((completedCount / mergedLessons.length) * 100);

          setActiveSkill({
            ...baseSkill,
            progress: newProgress,
            lessons: mergedLessons
          });
        } else {
          setActiveSkill(parsed.skillData);
        }

        if (parsed.brandName) setBrandName(parsed.brandName);
        if (parsed.hasLogo) setUploadedLogo(parsed.hasLogo);
      }
    }
  }, [user]);

  const saveProgress = (updatedSkill: any, currentBrandName?: string, currentLogoState?: boolean) => {
    setActiveSkill(updatedSkill);
    if (user && selectedBusiness) {
      const existingData = JSON.parse(localStorage.getItem(`vaulty_skills_${user.uid}`) || "{}");
      localStorage.setItem(`vaulty_skills_${user.uid}`, JSON.stringify({
        ...existingData,
        business: selectedBusiness,
        budget,
        age,
        skillData: updatedSkill,
        brandName: currentBrandName !== undefined ? currentBrandName : existingData.brandName,
        hasLogo: currentLogoState !== undefined ? currentLogoState : existingData.hasLogo
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
      saveProgress(initialSkillData, brandName, uploadedLogo);
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

    saveProgress(updatedSkill, brandName, uploadedLogo);
    setActiveLesson(null);
  };

  const handleFinishRoadmap = () => {
    // Generate booklet and finish
    setLocation(`/booklet/${selectedBusiness}`);
  };

  // Check if all required (free) lessons are completed
  const requiredLessonsCompleted = activeSkill?.lessons.filter((l: any) => !l.isPremium).every((l: any) => l.completed) || false;

  // If loading generation screen
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-white/10 border border-white/30 rounded-2xl flex items-center justify-center mb-8 relative">
           <Brain className="w-10 h-10 text-white animate-pulse" />
           <div className="absolute inset-0 border border-white/50 rounded-2xl animate-ping"></div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Vaulty Customization</h2>
        <p className="text-white font-medium text-center flex items-center gap-2">
           <Loader2 className="w-4 h-4 animate-spin" />
           Generating your custom {BUSINESS_OPTIONS.find(b => b.id === selectedBusiness)?.title} roadmap...
        </p>
        
        <div className="mt-12 w-full max-w-xs space-y-4">
           <div className="h-2 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-bg-white/10 rounded-full"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 3, ease: "easeInOut" }}
             />
           </div>
           <div className="flex justify-between text-xs text-white/40">
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
              <p className="text-xs text-white/60 font-medium">Step 1 of 1</p>
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
                         ? 'bg-white/10 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                         : 'bg-white/5 border-white/10 hover:bg-white/10'
                     }`}
                   >
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white text-black' : 'bg-white text-black'}`}>
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
                   <label className="text-sm font-medium text-white/80">Starting Budget</label>
                   <span className="text-lg font-bold text-white">
                     {budget === 10000 ? "€10,000+" : `€${budget.toLocaleString()}`}
                   </span>
                 </div>
                 <input 
                   type="range" 
                   min="0" max="10000" step="100"
                   value={budget}
                   onChange={(e) => setBudget(Number(e.target.value))}
                   className="w-full accent-white"
                 />
               </div>

               <div>
                 <div className="flex justify-between mb-2 mt-6">
                   <label className="text-sm font-medium text-white/80">Your Age</label>
                   <span className="text-lg font-bold text-white">{age}</span>
                 </div>
                 <input 
                   type="range" 
                   min="18" max="70" step="1"
                   value={age}
                   onChange={(e) => setAge(Number(e.target.value))}
                   className="w-full accent-white"
                 />
                 <p className="text-xs text-white/40 mt-2">Minimum age is 18 to participate in business ventures.</p>
               </div>
             </div>
           </div>

           <div className="pt-8">
             <button 
               onClick={handleCompleteOnboarding}
               disabled={!selectedBusiness}
               className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
                 selectedBusiness 
                   ? 'bg-white text-black hover:bg-white' 
                   : 'bg-white/10 text-white/40 cursor-not-allowed'
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
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-white/10 to-white/5 border border-white/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
             <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">Unlock Your Next Income Stream</h1>
          <p className="text-white/60 mb-10 leading-relaxed">
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
      <div className="h-[100dvh] bg-black text-white flex flex-col overflow-hidden">
        <div className="shrink-0 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveLesson(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold truncate max-w-[250px]">{activeLesson.title}</h1>
              <p className="text-xs text-white font-medium">Day {activeLesson.id} Quest</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
           {/* PREMIUM LOCKED SCREEN */}
           {activeLesson.isPremium && !hasPremium ? (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5/20 rounded-full flex items-center justify-center mb-6 border border-white/30">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Premium Quest</h2>
                <p className="text-white/60 mb-8 max-w-[280px]">
                  This advanced quest contains high-level strategies, analysis templates, and secrets to accelerate your success. Unlock it with Vaulty+.
                </p>
                <Link href="/premium" className="w-full">
                  <button className="w-full bg-bg-white text-black font-bold py-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Unlock Vaulty+
                  </button>
                </Link>
             </div>
           ) : (
             <div className="space-y-8 pb-8">
               {/* BRAND NAME SCREEN */}
               {activeLesson.type === 'brand_name' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/30">
                     <BookOpen className="text-white" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-bold mb-2">What is the name of your new venture?</h2>
                     <p className="text-white/60 text-sm">Choose something memorable, easy to spell, and relevant to your niche. This will be the foundation of your brand.</p>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-white/80 ml-1">Brand Name</label>
                     <input 
                       type="text" 
                       placeholder="e.g. Vaulty Studios"
                       value={brandName}
                       onChange={(e) => setBrandName(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-colors"
                     />
                   </div>
                 </motion.div>
               )}

               {/* LOGO UPLOAD SCREEN */}
               {activeLesson.type === 'logo' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/30">
                     <Sparkles className="text-white" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-bold mb-2">Create your visual identity</h2>
                     <p className="text-white/60 text-sm">A professional logo builds trust. You can easily create one for free using tools like Canva.</p>
                   </div>
                   
                   <a href="https://www.canva.com/create/logos/" target="_blank" rel="noopener noreferrer" className="block">
                     <div className="bg-gradient-to-r from-white/10 to-white/10 border border-white/30 rounded-2xl p-5 flex items-center justify-between group hover:border-white/60 transition-colors">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-white/60 font-black text-xl">C</div>
                         <div>
                           <h4 className="font-bold text-white">Create with Canva</h4>
                           <p className="text-xs text-white/80">Opens in new tab</p>
                         </div>
                       </div>
                       <ExternalLink className="text-white w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </div>
                   </a>

                   <div className="mt-6">
                     <label className="text-sm font-bold text-white/80 ml-1 block mb-2">Upload Your Logo</label>
                     <button 
                       onClick={() => setUploadedLogo(true)}
                       className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${uploadedLogo ? 'border-white/50 bg-white/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                     >
                       {uploadedLogo ? (
                         <>
                           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-white">
                             <Check size={24} />
                           </div>
                           <span className="font-bold text-white">Logo uploaded successfully!</span>
                         </>
                       ) : (
                         <>
                           <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/50">
                             <Upload size={24} />
                           </div>
                           <span className="font-bold text-white/60">Tap to select image</span>
                         </>
                       )}
                     </button>
                   </div>
                 </motion.div>
               )}

               {/* SOCIAL LINKS SCREEN */}
               {activeLesson.type === 'social' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/30">
                     <Check className="text-white" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-bold mb-2">Secure your social handles</h2>
                     <p className="text-white/60 text-sm">Make sure you own your brand name on the major platforms where your audience hangs out.</p>
                   </div>
                   
                   <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-white/80 ml-1">Instagram Handle</label>
                       <div className="relative">
                         <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 font-bold">@</span>
                         <input type="text" placeholder="yourbrand" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-colors" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-white/80 ml-1">TikTok Handle</label>
                       <div className="relative">
                         <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 font-bold">@</span>
                         <input type="text" placeholder="yourbrand" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-colors" />
                       </div>
                     </div>
                   </div>
                 </motion.div>
               )}
               {/* TEXT/INFO SCREEN (Used for Premium & Advanced quests) */}
               {activeLesson.type === 'text' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/30">
                     <BookOpen className="text-white" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-bold mb-4">{activeLesson.title}</h2>
                     <div className="prose prose-invert max-w-none">
                       <p className="text-white/80 leading-relaxed text-sm">
                         This is a simulated advanced lesson module. In a fully generated AI roadmap, this section would contain detailed, step-by-step instructions, market analysis, templates, and actionable strategies specific to your business ({selectedBusiness}).
                       </p>
                       <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                         <h3 className="text-lg font-bold text-white">Key Takeaways</h3>
                         <ul className="space-y-2 text-sm text-white/60 list-disc pl-4">
                           <li>Research your target audience thoroughly.</li>
                           <li>Create a unique value proposition that stands out.</li>
                           <li>Consistency and quality are the keys to long-term success.</li>
                         </ul>
                       </div>
                       
                       <label className="flex items-center gap-3 mt-8 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                         <input 
                           type="checkbox" 
                           checked={lessonChecked}
                           onChange={(e) => setLessonChecked(e.target.checked)}
                           className="w-5 h-5 rounded border-white/20 text-white focus:ring-white focus:ring-offset-0 bg-black"
                         />
                         <span className="text-sm font-medium text-gray-200">I have read and understood this lesson</span>
                       </label>
                     </div>
                   </div>
                 </motion.div>
               )}
             </div>
           )}
        </div>

        {/* Footer Action */}
        {(!activeLesson.isPremium || hasPremium) && (
          <div className="shrink-0 p-5 pt-0 bg-black pb-8">
             <div className="pt-4 border-t border-white/10">
                <button 
                  onClick={handleCompleteLesson}
                  disabled={(activeLesson.type === 'brand_name' && !brandName) || (activeLesson.type === 'logo' && !uploadedLogo) || (activeLesson.type === 'text' && !lessonChecked)}
                  className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
                    (activeLesson.type === 'brand_name' && !brandName) || (activeLesson.type === 'logo' && !uploadedLogo) || (activeLesson.type === 'text' && !lessonChecked)
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  }`}
                >
                  Complete Quest (+{activeLesson.points} XP)
                </button>
             </div>
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
            <p className="text-xs text-white font-medium">Wealth Builder Phase</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Intro */}
        <div className="bg-gradient-to-br from-white/5 to-black border border-white/20 rounded-[32px] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full" />
          <div className="relative z-10 flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center shrink-0">
              {(() => {
                 const biz = BUSINESS_OPTIONS.find(b => b.id === selectedBusiness);
                 if (biz) {
                   const Icon = biz.icon;
                   return <Icon className="w-6 h-6 text-white" />;
                 }
                 return <Brain className="w-6 h-6 text-white" />;
              })()}
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2">
                 {BUSINESS_OPTIONS.find(b => b.id === selectedBusiness)?.title || "Your Business"}
              </h2>
              <p className="text-sm text-white/60 leading-relaxed">
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
                 className="text-xs text-white/40 underline"
               >
                 Reset choices
               </button>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-lg">{activeSkill.title}</h4>
                  <div className="flex gap-3 mt-2 text-xs font-medium text-white/60">
                    <span className="flex items-center gap-1"><BookOpen size={14} /> {activeSkill.duration}</span>
                    <span className="flex items-center gap-1 text-white"><Trophy size={14} /> {activeSkill.xp} XP total</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-black border-[5px] border-white/5 flex items-center justify-center relative overflow-hidden shrink-0">
                   <div 
                     className="absolute bottom-0 left-0 right-0 bg-white transition-all duration-1000 ease-out" 
                     style={{ height: `${activeSkill.progress}%` }}
                   />
                   <span className="text-[12px] font-bold relative z-10">{activeSkill.progress}%</span>
                </div>
              </div>

              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent mb-6">
                {activeSkill.lessons.map((lesson: any, idx: number) => {
                  
                  // Find if this is the first uncompleted lesson
                  const isNextUp = !lesson.completed && (idx === 0 || activeSkill.lessons[idx - 1].completed);
                  // Allow access to completed lessons and the next uncompleted one
                  const isLocked = !lesson.completed && !isNextUp;

                  return (
                    <div 
                      key={lesson.id}
                      onClick={() => {
                        if (!isLocked) {
                          setActiveLesson(lesson);
                        }
                      }}
                      className={`relative flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                        lesson.completed 
                          ? 'bg-white/10 border-white/20 cursor-pointer hover:bg-white/10' 
                          : isNextUp 
                            ? 'bg-white/10 border-white/20 cursor-pointer hover:bg-white/15 hover:scale-[1.02]' 
                            : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm relative z-10 ${
                        lesson.completed 
                          ? 'bg-white text-black' 
                          : isNextUp 
                            ? 'bg-white text-black' 
                            : 'bg-zinc-800 text-zinc-500 border border-white/5'
                      }`}>
                        {lesson.completed ? <Check size={18} /> : lesson.isPremium ? <Lock size={16} /> : idx + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm font-bold truncate ${lesson.completed ? 'text-white' : 'text-white'}`}>
                            {lesson.title}
                          </p>
                          {lesson.isPremium && (
                            <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-white border border-white/30 uppercase tracking-wider">
                              Vaulty+
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40">{lesson.points} XP</p>
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

              {requiredLessonsCompleted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  <button 
                    onClick={handleFinishRoadmap}
                    className="w-full py-4 rounded-full font-bold text-lg bg-bg-white/10 text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                  >
                    <BookOpen size={20} />
                    Generate My Business Booklet
                  </button>
                  <p className="text-xs text-center text-white/60 mt-3">
                    Unlock your complete strategy guide and next steps
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}