import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Monitor, Smartphone, Tablet, ExternalLink, Bot, Check, Shield, Code, Zap, MessageSquare, BrainCircuit, Sparkles, ArrowRight, ArrowUp, X, BadgeCheck, Volume2, RefreshCcw, MoreVertical, Rocket, BarChart3, Calendar, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import astroPortraitImg from "@/assets/astro-portrait.png";

// Shared data
export const CHATBOT_TIERS = [
  {
    id: "free-demo",
    name: "Demo Vaulty Bot",
    subtitle: "SIMULATED AI",
    description: "A free simulated chatbot with ~20-30 pre-programmed responses. Perfect for testing the UI without consuming any API credits. Does not connect to external APIs.",
    longDescription: "The Demo Vaulty Bot is designed for users who want to experience the Vaulty interface without incurring any costs. It comes pre-loaded with around 20-30 common responses and does not consume any Vaulty Credits or use external APIs like OpenAI.",
    type: "free",
    priceMonth: 0,
    priceLifetime: 0,
    monthlyCredits: 0,
    features: ["20-30 Pre-programmed responses", "No API costs", "Basic floating UI", "Standard support"],
    badge: "FREE",
    theme: "purple",
    iconImg: astroPortraitImg,
  },
  {
    id: "starter",
    name: "Starter Chatbot",
    subtitle: "ESSENTIAL AI ASSISTANT",
    description: "A clean floating chat widget that opens a 1/4 screen chat interface. Ideal for standard customer support and websites.",
    longDescription: "The Starter Chatbot provides a classic floating icon in the corner of your website. When clicked, it expands into a chat window taking up about 1/4 of the screen. If you rent it, you get an embed script to place on your site, hosted on Vaulty. If you buy the lifetime license, you get the full source code and a license file, allowing you to host it anywhere with any API.",
    type: "paid",
    priceMonth: 9.99,
    priceLifetime: 119.99,
    monthlyCredits: 100,
    features: ["Floating corner widget", "1/4 screen chat interface", "Embed script (Rent) or Source Code (Buy)", "Vaulty Hosting (Rent)", "100 Free Credits / month"],
    badge: "STARTER",
    theme: "green"
  },
  {
    id: "premium",
    name: "Premium Chatbot",
    subtitle: "ADVANCED FULL-SCREEN AI",
    description: "A luxurious full-screen chat experience featuring FAQ tabs, customizable Q&A, human-like typing animations, and conversational memory.",
    longDescription: "The Premium Chatbot is our flagship offering. It opens in full screen and features advanced UI elements like FAQ tabs where administrators can pre-define questions and answers. It boasts beautiful animations including 'thinking' states, 'human typing' effects, and advanced conversational memory. Renting provides Vaulty hosting, while buying gives you the complete source code and license file to host anywhere.",
    type: "paid",
    priceMonth: 49.99,
    priceLifetime: 599.99,
    monthlyCredits: 1000,
    features: ["Full-screen immersive UI", "FAQ Tabs & Customization", "Human typing & thinking animations", "Conversational Memory", "Source Code & License (Buy)", "1000 Free Credits / month"],
    badge: "PREMIUM",
    theme: "blue"
  }
];

export default function BotDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const botId = params.id;
  const bot = CHATBOT_TIERS.find(b => b.id === botId);
  
  const [purchaseMode, setPurchaseMode] = useState<'rent' | 'buy'>('rent');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Chat Preview State
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm your AI assistant. How can I help you today?", isBot: true }
  ]);

  // Reset chat when switching bots or closing preview
  useEffect(() => {
    if (!showFullPreview) {
      setMessages([{ id: 1, text: "Hi there! I'm your AI assistant. How can I help you today?", isBot: true }]);
      setInputValue('');
      setIsTyping(false);
      setActiveTab('chat');
      setIsChatOpen(true);
    }
  }, [showFullPreview]);

  if (!bot) {
    return <div className="p-8 text-white">Bot not found</div>;
  }

  const handleAcquire = () => {
    if (bot.type === 'free') {
      toast({
        title: "Bot Added",
        description: `${bot.name} has been added to your dashboard.`,
      });
      setLocation('/home');
    } else {
      toast({
        title: "Purchase Initiated",
        description: `Redirecting to payment for ${bot.name} (${purchaseMode === 'rent' ? 'Monthly' : 'Lifetime'}).`,
      });
    }
  };

  const handleSendMessage = (e?: React.FormEvent | null, textOverride?: string) => {
    if (e) e.preventDefault();
    
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim()) return;

    const newUserMsg = { id: Date.now(), text: textToSend, isBot: false };
    setMessages(prev => {
      // If we are overriding and the last message was a user message, we might just append.
      // But actually, just append it.
      return [...prev, newUserMsg];
    });
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      let replyText = "I'm a simulated demo bot, so I don't connect to a real AI engine right now! In production, I'd give you a perfect answer.";
      
      if (bot.id === 'premium') {
          replyText = "With the Premium AI Engine, I can remember context, type like a human, and provide highly accurate answers based on your custom knowledge base.";
      } else if (bot.id === 'starter') {
          replyText = "Starter AI response: Thank you for your message. I can assist with general inquiries and support routing.";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: replyText,
        isBot: true
      }]);
    }, 1500 + Math.random() * 1000); // Random typing delay
  };

  if (showFullPreview) {
    return (
      <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col font-sans h-[100dvh] overflow-hidden">
        {/* Preview Header */}
        <div className="h-14 bg-zinc-950 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => setShowFullPreview(false)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-semibold text-white">Live Preview: {bot.name}</span>
          </div>
          
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-md transition-colors ${previewDevice === 'mobile' ? 'bg-zinc-700 text-white' : 'text-white/50 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewDevice('tablet')}
              className={`p-1.5 rounded-md transition-colors ${previewDevice === 'tablet' ? 'bg-zinc-700 text-white' : 'text-white/50 hover:text-white'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-md transition-colors ${previewDevice === 'desktop' ? 'bg-zinc-700 text-white' : 'text-white/50 hover:text-white'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 bg-zinc-900/50 p-0 md:p-8 flex items-center justify-center overflow-hidden min-h-0 relative">
          <div 
            className={`bg-white shadow-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              previewDevice === 'mobile' ? 'absolute inset-0 md:relative w-full h-full md:w-[375px] md:max-h-[812px] md:h-full md:border-[8px] md:border-zinc-800 md:rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 
              previewDevice === 'tablet' ? 'absolute inset-0 md:relative w-full h-full md:w-[768px] md:max-h-[1024px] md:h-full md:border-[8px] md:border-zinc-800 md:rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 
              'absolute inset-0 md:relative w-full max-w-[1400px] h-full md:rounded-xl md:border border-white/10'
            }`}
          >
            {/* Professional Mock Website */}
            <div className="w-full h-full bg-[#f8fafc] flex flex-col overflow-y-auto">
              {/* Mock Header */}
              <header className="h-16 bg-white border-b flex items-center px-6 sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-slate-800 text-lg tracking-tight">Vaulty Official</span>
                </div>
                <div className="ml-auto hidden md:flex gap-8">
                  <span className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">Products</span>
                  <span className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">Solutions</span>
                  <span className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">Pricing</span>
                </div>
                {previewDevice !== 'desktop' && (
                  <div className="ml-auto w-6 h-4 flex flex-col justify-between">
                     <div className="w-full h-0.5 bg-slate-400 rounded"></div>
                     <div className="w-full h-0.5 bg-slate-400 rounded"></div>
                     <div className="w-full h-0.5 bg-slate-400 rounded"></div>
                  </div>
                )}
              </header>
              
              {/* Mock Hero Section */}
              <div className="bg-white py-16 md:py-24 px-6 text-center border-b">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-6 border border-blue-100">NEW: AI Platform 2.0</div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight max-w-3xl mx-auto">Welcome to the Future of Finance & AI</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">Experience seamless transactions, AI-driven insights, and unparalleled security with Vaulty's next-generation platform for creators and businesses.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button className="bg-slate-900 hover:bg-slate-800 transition-colors text-white rounded-full px-8 py-3.5 font-bold shadow-lg">Get Started Free</button>
                  <button className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 transition-colors rounded-full px-8 py-3.5 font-bold">Explore Features</button>
                </div>
              </div>

              {/* Mock Content Grid */}
              <div className="p-6 md:p-12 max-w-6xl mx-auto w-full grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 pb-32">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl mb-6"></div>
                    <div className="w-3/4 h-5 bg-slate-800 rounded mb-4"></div>
                    <div className="w-full h-2.5 bg-slate-200 rounded mb-3"></div>
                    <div className="w-full h-2.5 bg-slate-200 rounded mb-3"></div>
                    <div className="w-5/6 h-2.5 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chatbot Representation */}
            {bot.id === 'premium' ? (
              // Premium Full Screen Preview
              <div className="absolute inset-4 md:inset-8 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] rounded-[32px] md:rounded-[40px] border border-indigo-500/20 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500 z-[9999]">
                
                {/* Premium Abstract Background Elements */}
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>
                
                <div className="h-16 md:h-20 flex items-center justify-between px-6 md:px-8 bg-transparent shrink-0 relative z-10 mt-2">
                   <div className="flex items-center gap-3 md:gap-4">
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden border border-gray-100">
                        <img src={astroPortraitImg} alt="Bot" className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-900 text-base md:text-lg leading-tight flex items-center gap-1.5">
                          Vaulty AI Assistant 
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                       </h4>
                       <div className="flex items-center gap-1.5 mt-0.5">
                         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                         <p className="text-[11px] md:text-xs text-slate-500 font-medium">Always here to help</p>
                       </div>
                     </div>
                   </div>
                   <div className="flex gap-2 items-center">
                     <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                        <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
                     </button>
                     <button onClick={() => {
                        setMessages([{ id: 1, text: "Hi there! 👋\n\nI'm Vaulty AI, your intelligent assistant.\nHow can I help you today?", isBot: true }]);
                        setInputValue('');
                     }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                        <RefreshCcw className="w-4 h-4 md:w-5 md:h-5" />
                     </button>
                     <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                     </button>
                     {/* Close Button */}
                     <button onClick={() => setShowFullPreview(false)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer ml-1">
                        <X className="w-6 h-6 md:w-7 md:h-7" />
                     </button>
                   </div>
                </div>
                
                {/* Hero Avatar Area */}
                {messages.length <= 1 && !isTyping && (
                  <div className="flex flex-col items-center justify-center py-6 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                     <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                        <img src={astroPortraitImg} alt="Bot Large" className="w-full h-full object-cover rounded-full border-4 border-white shadow-2xl relative z-10" />
                        
                        {/* Audio visualizer wave mockup */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-12 flex items-center justify-center gap-1 opacity-40 z-0 pointer-events-none">
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                                <div key={i} className={`w-1 bg-blue-500 rounded-full animate-pulse`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                     </div>
                  </div>
                )}
                
                <div className="flex-1 p-4 md:p-8 bg-transparent flex flex-col gap-4 overflow-y-auto pb-4 relative z-10">
                   {messages.map(msg => (
                     <div key={msg.id} className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-[24px] shadow-sm text-[15px] md:text-base leading-relaxed whitespace-pre-wrap ${msg.isBot ? 'bg-white/80 backdrop-blur-md border border-gray-100 text-slate-800 rounded-tl-[8px] self-start' : 'bg-indigo-600 text-white rounded-tr-[8px] self-end shadow-md font-medium'}`}>
                        {msg.id === 1 && msg.isBot ? (
                            <>
                                <h3 className="text-2xl font-bold mb-3">{msg.text.split('\n')[0]}</h3>
                                <p className="text-slate-600 leading-relaxed">{msg.text.split('\n').slice(2).join('\n')}</p>
                            </>
                        ) : msg.text}
                     </div>
                   ))}
                   
                   {/* Quick Action Buttons (shown only after first message) */}
                   {messages.length === 1 && !isTyping && (
                      <div className="flex flex-col gap-3 mt-4 w-full max-w-[85%] md:max-w-[75%] self-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                          <button onClick={() => handleSendMessage(null, "Tell me about your AI services")} className="bg-white/80 backdrop-blur-md border border-gray-100 p-4 rounded-[20px] text-left hover:bg-white hover:shadow-md transition-all group flex items-center justify-between">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <Rocket className="w-4 h-4 text-purple-500" />
                                      <span className="font-bold text-slate-800 text-[15px]">Our Services</span>
                                  </div>
                                  <p className="text-[13px] text-slate-500">Learn more about our AI solutions</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                          </button>
                          
                          <button onClick={() => handleSendMessage(null, "I need help with something")} className="bg-white/80 backdrop-blur-md border border-gray-100 p-4 rounded-[20px] text-left hover:bg-white hover:shadow-md transition-all group flex items-center justify-between">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <MessageSquare className="w-4 h-4 text-blue-500" />
                                      <span className="font-bold text-slate-800 text-[15px]">Get Support</span>
                                  </div>
                                  <p className="text-[13px] text-slate-500">I need help with something</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                          </button>
                          
                          <button onClick={() => handleSendMessage(null, "View pricing plans")} className="bg-white/80 backdrop-blur-md border border-gray-100 p-4 rounded-[20px] text-left hover:bg-white hover:shadow-md transition-all group flex items-center justify-between">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <BarChart3 className="w-4 h-4 text-teal-500" />
                                      <span className="font-bold text-slate-800 text-[15px]">Pricing Plans</span>
                                  </div>
                                  <p className="text-[13px] text-slate-500">View our pricing and packages</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                          </button>
                          
                          <button onClick={() => handleSendMessage(null, "Schedule a demo")} className="bg-white/80 backdrop-blur-md border border-gray-100 p-4 rounded-[20px] text-left hover:bg-white hover:shadow-md transition-all group flex items-center justify-between">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <Calendar className="w-4 h-4 text-orange-500" />
                                      <span className="font-bold text-slate-800 text-[15px]">Book a Demo</span>
                                  </div>
                                  <p className="text-[13px] text-slate-500">Schedule a personalized demo</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                          </button>
                      </div>
                   )}
                   
                   {isTyping && (
                     <div className="flex gap-1.5 items-center bg-white/80 backdrop-blur-md border border-gray-100 p-5 md:p-6 rounded-[24px] rounded-tl-[8px] self-start shadow-sm">
                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                     </div>
                   )}
                   <div className="h-4"></div>
                </div>
                
                <div className="p-4 md:p-6 bg-transparent shrink-0 relative z-10 pb-6 md:pb-8">
                  <form onSubmit={(e) => handleSendMessage(e)} className="relative flex items-center max-w-4xl mx-auto">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full h-14 md:h-16 bg-white border border-gray-200 shadow-sm rounded-full pl-6 pr-16 text-[15px] md:text-base text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all focus:border-indigo-300"
                    />
                    <button type="submit" disabled={!inputValue.trim()} className="absolute right-2 md:right-3 w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity hover:opacity-90 shadow-md group cursor-pointer z-10">
                      <ArrowUp className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </form>
                  
                  {/* Footer Branding */}
                  <div className="mt-6 flex items-center justify-between px-2">
                      <div className="flex items-center gap-1.5 opacity-50">
                          <Sparkles className="w-4 h-4 text-slate-800" />
                          <span className="text-xs font-semibold text-slate-800">Powered by Vaulty AI</span>
                      </div>
                      <div className="bg-amber-100 text-amber-800 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-200/50">
                          <Crown className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          Premium Assistant
                      </div>
                  </div>
                </div>
              </div>
            ) : bot.id === 'starter' ? (
              // Starter 1/4 screen preview
              <>
                {isChatOpen && (
                <div className="absolute bottom-[80px] md:bottom-24 right-4 left-4 md:left-auto md:right-6 md:w-[400px] h-[400px] md:h-[600px] max-h-[60dvh] md:max-h-[calc(100vh-140px)] bg-white shadow-2xl rounded-[24px] md:rounded-[32px] border border-green-500/30 overflow-hidden flex flex-col z-[9999] animate-in slide-in-from-bottom-5 fade-in origin-bottom-right">
                  {/* Animated Color Glow Wrapper */}
                  <div className="absolute inset-0 rounded-[24px] md:rounded-[32px] ring-2 ring-green-400/50 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] pointer-events-none shadow-[0_0_30px_rgba(34,197,94,0.2)] z-50"></div>

                  <div className="h-14 md:h-16 bg-white flex items-center justify-between px-4 md:px-5 shrink-0 border-b border-gray-100 z-10 relative">
                     <h4 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                        Vaulty Official
                     </h4>
                     <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-full transition-colors z-20 cursor-pointer relative">
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                     </button>
                  </div>
                  <div className="flex-1 p-4 md:p-5 bg-[#F9FAFB] overflow-y-auto flex flex-col gap-3 md:gap-4 pb-4">
                     <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border-[2px] md:border-[2.5px] border-green-500 mb-1 shrink-0">
                        <img src={astroPortraitImg} alt="Bot" className="w-full h-full object-cover" />
                     </div>
                     {messages.map(msg => (
                         <div key={msg.id} className={`max-w-[90%] md:max-w-[85%] p-3 md:p-4 rounded-[16px] md:rounded-[20px] text-[13px] md:text-[15px] shadow-sm leading-relaxed ${msg.isBot ? 'bg-white border border-gray-100 text-slate-800 rounded-tl-sm self-start' : 'bg-black text-white rounded-tr-sm self-end'}`}>
                            {msg.text}
                         </div>
                     ))}
                     {isTyping && (
                         <div className="flex gap-1.5 items-center bg-white border border-gray-100 p-3 md:p-4 rounded-[16px] md:rounded-[20px] rounded-tl-sm self-start shadow-sm">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                         </div>
                     )}
                     <div className="h-2"></div>
                  </div>
                  <div className="p-3 md:p-4 bg-white shrink-0 border-t border-gray-100 z-10 relative">
                    <form onSubmit={handleSendMessage} className="relative flex items-center">
                      <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full h-[44px] md:h-[52px] bg-[#F5F5F7] rounded-[16px] pl-4 pr-12 text-[14px] md:text-[15px] text-slate-700 outline-none transition-all border border-transparent focus:border-gray-200 focus:bg-white"
                      />
                      <button type="submit" disabled={!inputValue.trim()} className={`absolute right-1.5 w-8 h-8 md:w-10 md:h-10 transition-colors rounded-[10px] md:rounded-[12px] flex items-center justify-center shadow-sm group cursor-pointer z-20 ${inputValue.trim() ? 'bg-black hover:bg-green-600' : 'bg-slate-200'}`}>
                        <ArrowUp className={`w-4 h-4 md:w-5 md:h-5 ${inputValue.trim() ? 'text-white' : 'text-slate-400'}`} />
                      </button>
                    </form>
                  </div>
                </div>
                )}
                {/* Floating Action Button */}
                <div onClick={() => setIsChatOpen(!isChatOpen)} className={`absolute bottom-4 right-4 md:bottom-6 md:right-6 w-14 h-14 md:w-16 md:h-16 bg-black rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform z-[99999] animate-[pulse_3s_ease-in-out_infinite] ${isChatOpen ? 'scale-90 opacity-90 animate-none shadow-xl' : ''}`}>
                  {isChatOpen ? <X className="w-6 h-6 md:w-7 md:h-7 text-white" /> : <img src={astroPortraitImg} alt="Bot" className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full border border-green-400" />}
                </div>
              </>
            ) : (
              // Demo Free preview
              <>
                {isChatOpen && (
                <div className="absolute bottom-[80px] md:bottom-24 right-4 left-4 md:left-auto md:right-6 md:w-[320px] h-[400px] md:h-[450px] max-h-[60dvh] md:max-h-[calc(100vh-140px)] bg-white shadow-xl rounded-xl border border-zinc-200 overflow-hidden flex flex-col z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right">
                  <div className="h-12 bg-purple-600 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                     <div className="flex items-center">
                         <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2 overflow-hidden border border-purple-400">
                             <img src={astroPortraitImg} alt="Bot" className="w-full h-full object-cover" />
                         </div>
                         <h4 className="font-bold text-white text-sm">Demo Bot</h4>
                     </div>
                     <button onClick={() => setIsChatOpen(false)} className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors z-20 cursor-pointer relative">
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="flex-1 p-4 bg-slate-50 overflow-y-auto flex flex-col gap-3 pb-4">
                     {messages.map(msg => (
                         <div key={msg.id} className={`max-w-[90%] p-3 rounded-lg text-xs shadow-sm leading-relaxed ${msg.isBot ? 'bg-purple-50 border border-purple-100 text-purple-900 rounded-tl-sm self-start' : 'bg-purple-600 text-white rounded-tr-sm self-end'}`}>
                            {msg.text}
                         </div>
                     ))}
                     {isTyping && (
                         <div className="flex gap-1.5 items-center bg-white border p-3 rounded-lg rounded-tl-sm self-start shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-150"></span>
                         </div>
                     )}
                     <div className="h-2"></div>
                  </div>
                  <div className="p-3 border-t bg-white shrink-0 z-10 relative">
                    <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                      <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Reply..."
                        className="flex-1 h-10 bg-slate-100 border-transparent focus:bg-white rounded-lg pl-3 pr-10 text-xs text-slate-700 outline-none focus:border-purple-400 border transition-all"
                      />
                      <button type="submit" disabled={!inputValue.trim()} className="absolute right-1 top-1 w-8 h-8 bg-purple-600 hover:bg-purple-700 transition-colors text-white rounded-md flex items-center justify-center disabled:opacity-50 z-20 cursor-pointer">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
                )}
                {/* Floating Action Button */}
                <div onClick={() => setIsChatOpen(!isChatOpen)} className={`absolute bottom-4 right-4 md:bottom-6 md:right-6 w-14 h-14 md:w-16 md:h-16 bg-purple-600 rounded-full shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform z-[99999] ${isChatOpen ? 'scale-90 opacity-90' : ''}`}>
                  {isChatOpen ? <X className="w-6 h-6 md:w-7 md:h-7 text-white" /> : <img src={astroPortraitImg} alt="Bot" className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full border border-purple-400" />}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.02]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 flex items-center">
          <Link href="/marketplace">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">Bot Details</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 pt-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left Column: Details */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-2.5 py-1 rounded-md bg-${bot.theme}-600/20 text-${bot.theme}-400 text-[10px] font-black uppercase tracking-wider border border-${bot.theme}-500/30`}>
                {bot.badge}
              </div>
              <div className="text-xs font-bold text-white/50 bg-white/5 px-2 py-1 rounded-md">
                {bot.type === 'free' ? 'Simulated AI' : 'Vaulty AI Engine'}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{bot.name}</h1>
            <p className="text-lg text-white/60 leading-relaxed mb-8">
              {bot.longDescription}
            </p>

            <div className="space-y-4 mb-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">Included Features</h3>
              {bot.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <div className={`w-6 h-6 rounded-full bg-${bot.theme}-500/20 flex items-center justify-center shrink-0`}>
                    <Check className={`w-3.5 h-3.5 text-${bot.theme}-400`} strokeWidth={3} />
                  </div>
                  <span className="text-sm text-white/80 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {bot.type !== 'free' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Included Credits
                </h3>
                <p className="text-sm text-white/60">
                  This chatbot includes <strong className="text-white">{bot.monthlyCredits} free credits</strong> every month. Need more? You can purchase Vaulty Credits from the Wallet.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Preview */}
          <div className="space-y-6">
            {/* Live Preview Card */}
            <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-white/60" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Live Preview</h3>
                    <p className="text-xs text-white/50">See how it looks on a website</p>
                  </div>
                </div>
                
                <div className="aspect-video bg-black/50 rounded-xl border border-white/10 mb-4 overflow-hidden relative cursor-pointer group-hover:border-purple-500/50 transition-colors" onClick={() => setShowFullPreview(true)}>
                   {/* Mini placeholder preview */}
                   <div className="absolute inset-0 bg-slate-900">
                     <div className="w-full h-8 bg-slate-800 border-b border-white/5"></div>
                     <div className="p-4 opacity-30">
                       <div className="w-3/4 h-3 bg-slate-700 rounded mb-2"></div>
                       <div className="w-1/2 h-3 bg-slate-700 rounded"></div>
                     </div>
                   </div>
                   <div className={`absolute bottom-3 right-3 bg-${bot.theme}-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                      <MessageSquare className="w-4 h-4 text-white" />
                   </div>
                </div>
                
                <Button 
                  onClick={() => setShowFullPreview(true)}
                  className="w-full rounded-xl bg-white text-black hover:bg-zinc-200 font-bold"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> View Full Preview
                </Button>
              </div>
            </div>

            {/* Pricing Card */}
            <div className={`bg-[#0f0f13] border border-${bot.theme}-500/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
              {bot.type === 'free' ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">Free Forever</h3>
                    <div className="text-4xl font-black">$0</div>
                  </div>
                  <Button 
                    onClick={handleAcquire}
                    className={`w-full rounded-xl py-6 text-sm font-bold bg-${bot.theme}-600 hover:bg-${bot.theme}-700 text-white`}
                  >
                    Add to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
                    <button 
                      onClick={() => setPurchaseMode('rent')}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${purchaseMode === 'rent' ? `bg-${bot.theme}-600/20 text-${bot.theme}-400 shadow-sm` : 'text-white/50 hover:text-white'}`}
                    >
                      Rent Monthly
                    </button>
                    <button 
                      onClick={() => setPurchaseMode('buy')}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${purchaseMode === 'buy' ? `bg-${bot.theme}-600/20 text-${bot.theme}-400 shadow-sm` : 'text-white/50 hover:text-white'}`}
                    >
                      Buy License
                    </button>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-5xl font-black">${purchaseMode === 'rent' ? bot.priceMonth : bot.priceLifetime}</span>
                      <span className="text-sm text-white/50 mb-2">{purchaseMode === 'rent' ? '/ month' : 'one-time'}</span>
                    </div>
                    <p className="text-sm text-white/60">
                      {purchaseMode === 'rent' 
                        ? 'Hosted on Vaulty Platform. Includes embed script.' 
                        : 'Full source code and license file. Host anywhere.'}
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {purchaseMode === 'rent' ? (
                      <div className="flex items-start gap-3">
                        <BrainCircuit className={`w-5 h-5 text-${bot.theme}-400 shrink-0 mt-0.5`} />
                        <div>
                          <p className="text-sm font-bold text-white">Vaulty Hosting</p>
                          <p className="text-xs text-white/50">Simply copy and paste the embed script into your website. We handle the rest.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <Code className={`w-5 h-5 text-${bot.theme}-400 shrink-0 mt-0.5`} />
                          <div>
                            <p className="text-sm font-bold text-white">Source Code</p>
                            <p className="text-xs text-white/50">Download the complete source code to modify and host on your own servers.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Shield className={`w-5 h-5 text-${bot.theme}-400 shrink-0 mt-0.5`} />
                          <div>
                            <p className="text-sm font-bold text-white">Commercial License</p>
                            <p className="text-xs text-white/50">Includes a license .txt and .png file proving ownership.</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <Button 
                    onClick={handleAcquire}
                    className={`w-full rounded-xl py-6 text-sm font-bold bg-${bot.theme}-600 hover:bg-${bot.theme}-700 text-white`}
                  >
                    {purchaseMode === 'rent' ? 'Subscribe Now' : 'Purchase License'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}