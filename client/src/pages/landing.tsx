import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Facebook, Twitter, Instagram, Linkedin, Mail, ChevronDown, ChevronUp, MessageSquare, Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import vaultyLogo from "@assets/IMG_1067_1775569221193.png";
import vaultyStoryBg from "@assets/IMG_1135_1775757374085.jpeg";
import { featuresData } from "@/lib/features-data";

function FeatureCard({ feature, setLocation }: { feature: typeof featuresData[0], setLocation: any }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div 
      className="relative h-[320px] w-full cursor-pointer group"
      style={{ perspective: "1000px" }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="w-full h-full relative"
        style={{ 
          transformStyle: "preserve-3d", 
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 p-8 rounded-[32px] border border-white/10 bg-[#121217] flex flex-col justify-center shadow-2xl"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-indigo-400 transition-colors duration-300">{feature.title}</h3>
          <p className="text-white/50 font-light leading-relaxed">{feature.shortDesc}</p>
          <div className="mt-auto pt-8 text-xs font-bold uppercase tracking-wider text-indigo-400/60 flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
            Click to flip <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 p-8 rounded-[32px] border border-indigo-500/30 bg-[#0f0e1f] flex flex-col justify-center items-center text-center shadow-2xl" 
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <h3 className="text-2xl font-bold mb-4 text-indigo-300">{feature.backTitle}</h3>
          <p className="text-white/70 font-light leading-relaxed mb-8">{feature.backDesc}</p>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/feature/${feature.id}`);
            }}
            className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all active:scale-95 w-full mt-auto shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Read More
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("home");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(() => {
    const saved = localStorage.getItem("vaulty_landing_subscribers");
    return saved ? parseInt(saved, 10) : 14;
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showStory, setShowStory] = useState(false);

  const handleGetStarted = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setSubscribersCount(prev => {
        const next = prev + 1;
        localStorage.setItem("vaulty_landing_subscribers", next.toString());
        return next;
      });
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Simulate growing subscriber count persistently
  useEffect(() => {
    const interval = setInterval(() => {
      setSubscribersCount(prev => {
        const next = prev + Math.floor(Math.random() * 3);
        localStorage.setItem("vaulty_landing_subscribers", next.toString());
        return next;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    setScrollProgress((scrollPosition / maxScroll) * 100);

    const sections = [
      { id: "home", offset: 0 },
      { id: "about", offset: document.getElementById("about")?.offsetTop || 0 },
      { id: "features", offset: document.getElementById("features")?.offsetTop || 0 },
      { id: "faq", offset: document.getElementById("faq")?.offsetTop || 0 },
      { id: "subscribe", offset: document.getElementById("subscribe")?.offsetTop || 0 },
    ];

    let current = "home";
    for (let i = sections.length - 1; i >= 0; i--) {
      if (scrollPosition >= sections[i].offset - 300) {
        current = sections[i].id;
        break;
      }
    }
    
    // Keep 'home' active when scrolling through 'about' section since we removed it from nav
    if (current === "about") {
      current = "home";
    }
    
    setActiveSection(current);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    
    // Intersection Observer for chat demo
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !chatStarted) {
          setChatStarted(true);
        }
      });
    }, { threshold: 0.3 });

    const demoSection = document.getElementById("demo");
    if (demoSection) {
      observer.observe(demoSection);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (demoSection) {
        observer.unobserve(demoSection);
      }
    };
  }, [chatStarted]);

  useEffect(() => {
    if (chatStarted && chatMessage === "") {
      // Type user message
      const userMessageText = "Tell me more about crypto";
      let userIndex = 0;
      setIsTyping(true);
      
      const userTimer = setInterval(() => {
        if (userIndex < userMessageText.length) {
          setChatMessage((prev) => userMessageText.substring(0, userIndex + 1));
          userIndex++;
        } else {
          clearInterval(userTimer);
          setIsTyping(false);
          
          // After user message done, wait 1.5s then start AI response
          setTimeout(() => {
            setIsResponding(true);
            const aiResponse = "Cryptocurrency is a digital currency that operates on blockchain technology. Bitcoin, the first cryptocurrency, was created in 2009. There are thousands of cryptocurrencies today, each with unique features. The crypto market is highly volatile, offering both opportunities and risks. Smart investors study market trends and fundamentals before trading.";
            let aiIndex = 0;
            
            const aiTimer = setInterval(() => {
              if (aiIndex < aiResponse.length) {
                setChatResponse((prev) => aiResponse.substring(0, aiIndex + 1));
                aiIndex++;
              } else {
                clearInterval(aiTimer);
                setIsResponding(false);
              }
            }, 30);
          }, 1500);
        }
      }, 50);
      
      return () => clearInterval(userTimer);
    }
  }, [chatStarted]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "faq", label: "FAQ" },
    { id: "subscribe", label: "Subscribe" },
  ];

  const faqs = [
    {
      question: "What is Vaulty?",
      answer: "Vaulty is a mobile-first premium finance and social application. It combines an AI trading assistant, demo trading with our native Vaulty Coin, a digital wallet, educational resources, and a social feed for traders into one seamless experience."
    },
    {
      question: "Is it real money trading?",
      answer: "Currently, Vaulty features a demo trading environment using our virtual 'Vaulty Coin'. This allows you to practice trading strategies, learn the markets, and complete quests without any financial risk."
    },
    {
      question: "How does the AI Assistant work?",
      answer: "Our built-in AI Assistant is designed to help you understand market trends, explain complex financial concepts, and provide general guidance. It's like having a financial expert in your pocket 24/7."
    },
    {
      question: "When will the app be released?",
      answer: "We are currently in active development. You can join our waiting list by subscribing below to get early access and exclusive updates when we launch."
    },
    {
      question: "What are quests and how do they work?",
      answer: "Quests are daily and weekly challenges that help you learn trading concepts. Completing quests earns you Vaulty Coins and experience points, making learning finance fun and engaging."
    }
  ];

  return (
    <div 
      className="min-h-screen text-white overflow-x-hidden font-sans relative"
    >
      {/* Background image */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img 
          src={vaultyStoryBg} 
          alt="Vaulty Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle dark overlay just for text readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-400 z-50"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Fixed Navigation Bar */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <nav className="flex items-center gap-1 p-1.5 rounded-full backdrop-blur-xl border border-white/30 bg-black/50 shadow-2xl pointer-events-auto">
          <div className="relative z-10 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center mr-2 ml-1">
            <img src={vaultyLogo} alt="Vaulty" className="w-5 h-5 object-contain" />
          </div>
          {navItems.map((item) => (
            <div key={item.id} className="relative">
              {activeSection === item.id && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/30"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <button
                onClick={() => scrollToSection(item.id)}
                className={`relative z-10 px-4 py-2 rounded-full font-medium text-[13px] whitespace-nowrap transition-colors duration-300 ${
                  activeSection === item.id
                    ? "text-white drop-shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            </div>
          ))}
        </nav>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24">
        <motion.div
          className="max-w-4xl mx-auto space-y-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            From zero to<br />financial freedom.
          </h1>
          
          <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
            Learn, invest, and grow your wealth — all in one place.
          </p>

          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="relative">
              <motion.button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all active:scale-95 group shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <AnimatePresence>
                {showComingSoon && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-xl"
                  >
                    The app is still in development. Coming soon!
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-500 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Redefining the Trading Experience.</h2>
              <div className="space-y-6 text-white/60 text-lg font-light leading-relaxed">
                <p>
                  Vaulty isn't just another trading app. It's a complete ecosystem designed to make finance accessible, social, and intelligent.
                </p>
                <p>
                  We've built an environment where you can learn without risk using our native Vaulty Coin, consult with an advanced AI assistant, and share your journey with a community of like-minded individuals.
                </p>
                <p>
                  Wrapped in a premium, minimalist design, Vaulty strips away the clutter of traditional finance apps to focus on what truly matters: your growth.
                </p>
              </div>

              {/* Story Card inside About Section */}
              <motion.div
                className="mt-12 p-8 rounded-[32px] border border-indigo-500/30 bg-gradient-to-br from-indigo-900/20 to-black/60 backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.15)] relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3 text-white">Do you want to know more about Vaulty's History and Our Story?</h3>
                  <p className="text-white/60 mb-6 font-light">Discover how we started, our mission to redefine finance, and the team behind the vision.</p>
                  <button
                    onClick={() => setShowStory(true)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-full transition-all flex items-center gap-2"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative h-[500px] rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] backdrop-blur-xl flex flex-col items-center justify-center p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
              <img src={vaultyLogo} alt="Vaulty Logo" className="w-32 h-32 mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
              <h3 className="text-2xl font-bold mb-2 z-10">Vaulty Ecosystem</h3>
              <p className="text-white/50 text-center max-w-sm z-10 font-light">A seamless blend of AI, social networking, and demo trading capabilities.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Chatbot Demo Section */}
      <section id="demo" className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Meet Vaulty AI.</h2>
            <p className="text-xl text-white/50 font-light max-w-2xl mx-auto">Your personal 24/7 financial advisor. Ask questions, analyze markets, and learn faster.</p>
          </motion.div>

          <motion.div
            className="relative rounded-[32px] border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-2xl shadow-[0_0_100px_rgba(99,102,241,0.1)] overflow-hidden h-[450px] flex flex-col"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Vaulty AI</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-white/50">Online</span>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
              <AnimatePresence>
                {chatStarted && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="self-end max-w-[80%]"
                  >
                    <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm">
                      {chatMessage}
                      {isTyping && <span className="ml-1 animate-pulse">|</span>}
                    </div>
                  </motion.div>
                )}
                
                {(chatResponse || isResponding) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="self-start max-w-[85%] flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="bg-[#1a1a24] border border-white/5 text-white/90 px-5 py-4 rounded-2xl rounded-tl-sm leading-relaxed text-sm">
                      {chatResponse}
                      {isResponding && <span className="ml-1 animate-pulse">|</span>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-full py-4 pl-6 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors pointer-events-none"
                  disabled
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 pointer-events-none">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Everything You Need.</h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto font-light">Powerful features wrapped in an elegant, intuitive interface.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {featuresData.map((feature, idx) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <FeatureCard feature={feature} setLocation={setLocation} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Overlay */}
      <AnimatePresence>
        {showStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto"
          >
            <div className="fixed inset-0 pointer-events-none z-[-1] bg-transparent">
              <img 
                src={vaultyStoryBg} 
                alt="Vaulty Background" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />
            </div>
            <div className="min-h-screen p-6 md:p-12 pb-32 max-w-4xl mx-auto relative z-10">
              <button
                onClick={() => setShowStory(false)}
                className="sticky top-6 right-6 ml-auto w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors mb-12 z-50"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-16"
              >
                <div className="text-center space-y-6">
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    Our Story
                  </h2>
                  <p className="text-xl text-white/50 font-light max-w-2xl mx-auto">
                    The journey of building the ultimate financial companion.
                  </p>
                </div>

                <div className="grid gap-12">
                  <div className="p-8 rounded-[32px] border border-white/10 bg-white/5 space-y-6">
                    <h3 className="text-2xl font-bold text-indigo-400">The Beginning</h3>
                    <p className="text-white/70 leading-relaxed text-lg font-light">
                      Vaulty was born from a simple realization: traditional trading apps were either too complex for beginners or too simple for serious traders. We set out to build a platform that bridges this gap, combining professional-grade tools with an intuitive, social experience.
                    </p>
                  </div>

                  <div className="p-8 rounded-[32px] border border-white/10 bg-white/5 space-y-6">
                    <h3 className="text-2xl font-bold text-indigo-400">Our Mission</h3>
                    <p className="text-white/70 leading-relaxed text-lg font-light">
                      To democratize financial education and trading. We believe everyone should have access to the knowledge and tools needed to build wealth, without risking their life savings while learning.
                    </p>
                  </div>

                  <div className="relative border-l border-indigo-500/30 ml-4 md:ml-8 space-y-12 pb-8">
                    <div className="relative pl-8 md:pl-12">
                      <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                      <h4 className="text-xl font-bold mb-2">Q3 2023</h4>
                      <p className="text-white/60 font-light">The concept of Vaulty is born. Initial prototypes developed.</p>
                    </div>
                    <div className="relative pl-8 md:pl-12">
                      <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                      <h4 className="text-xl font-bold mb-2">Q1 2024</h4>
                      <p className="text-white/60 font-light">Core team assembled. AI trading assistant model trained.</p>
                    </div>
                    <div className="relative pl-8 md:pl-12">
                      <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                      <h4 className="text-xl font-bold mb-2">Q4 2024</h4>
                      <p className="text-white/60 font-light">Closed Beta testing begins with selected users.</p>
                    </div>
                    <div className="relative pl-8 md:pl-12">
                      <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-pulse" />
                      <h4 className="text-xl font-bold mb-2 text-sky-400">2025</h4>
                      <p className="text-white/60 font-light">Public launch and mobile app release.</p>
                    </div>
                  </div>

                  <div className="p-8 rounded-[32px] border border-white/10 bg-white/5 space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                      <div className="w-24 h-24 rounded-full bg-indigo-900/30 border border-indigo-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={vaultyLogo} alt="CEO" className="w-full h-full object-cover opacity-80" />
                      </div>
                      <div className="space-y-4 text-center md:text-left">
                        <h3 className="text-2xl font-bold">The Leadership</h3>
                        <p className="text-white/70 leading-relaxed font-light">
                          Founded by a team of experienced fintech developers and passionate traders who understood the need for a safer, more educational entry into the world of trading.
                        </p>
                        <div className="flex justify-center md:justify-start gap-4 pt-4">
                          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Linkedin className="w-5 h-5 text-white/70" />
                          </a>
                          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Twitter className="w-5 h-5 text-white/70" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Common Questions.</h2>
            <p className="text-xl text-white/50 font-light">Everything you need to know about Vaulty.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border border-white/10 bg-white/5 backdrop-blur-md rounded-[20px] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-lg font-medium pr-4">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-white/50 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-white/60 font-light leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Waiting List Subscribe Section */}
      <section id="subscribe" className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="p-12 md:p-16 rounded-[32px] border border-white/10 bg-gradient-to-b from-indigo-900/20 to-black backdrop-blur-2xl relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_60%)]" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Be the first to know.</h2>
              <p className="text-xl text-white/60 font-light mb-10 max-w-xl mx-auto">
                Join the waiting list to get early access when Vaulty launches.
              </p>

              <form onSubmit={handleSubscribe} className="max-w-md mx-auto relative">
                <div className="relative flex items-center">
                  <Mail className="absolute left-5 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-black/50 border border-white/10 rounded-full py-4 pl-14 pr-32 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-full font-medium hover:bg-gray-200 transition-colors"
                  >
                    Subscribe
                  </button>
                </div>
              </form>

              <AnimatePresence>
                {isSubscribed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-emerald-400 font-medium"
                  >
                    Thanks for subscribing! We'll be in touch soon.
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-center gap-2 text-white/50 font-mono text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-white">{subscribersCount.toLocaleString()}</span> Subscribers on the waitlist
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 text-center text-white/40 font-light">
        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
        </div>
        <p>&copy; {new Date().getFullYear()} Vaulty. All rights reserved.</p>
      </footer>
    </div>
  );
}
