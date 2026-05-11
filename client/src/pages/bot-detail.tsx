import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Monitor, Smartphone, Tablet, ExternalLink, Bot, Check, Shield, Code, Zap, MessageSquare, BrainCircuit, Sparkles, ArrowRight, X } from "lucide-react";
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), text: inputValue, isBot: false };
    setMessages(prev => [...prev, newUserMsg]);
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
      <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col font-sans">
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
        <div className="flex-1 bg-zinc-900/50 p-4 md:p-8 flex items-center justify-center overflow-hidden">
          <div 
            className={`bg-white shadow-2xl relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              previewDevice === 'mobile' ? 'w-[375px] h-[812px] border-[8px] border-zinc-800 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 
              previewDevice === 'tablet' ? 'w-[768px] h-[1024px] border-[8px] border-zinc-800 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 
              'w-full max-w-[1400px] h-full rounded-xl border border-white/10'
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
              <div className="absolute inset-4 md:inset-8 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] rounded-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500 z-50">
                <div className="h-16 md:h-20 border-b flex items-center justify-between px-4 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 shrink-0">
                   <div className="flex items-center gap-3 md:gap-4">
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden border-2 border-white/20">
                        <img src={astroPortraitImg} alt="Bot" className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <h4 className="font-bold text-white text-base md:text-lg leading-tight">Vaulty AI Assistant</h4>
                       <div className="flex items-center gap-1.5 mt-0.5">
                         <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                         <p className="text-[11px] md:text-xs text-blue-100 font-medium">Online & Ready</p>
                       </div>
                     </div>
                   </div>
                   <div className="flex gap-1 bg-black/20 p-1 md:p-1.5 rounded-xl backdrop-blur-sm">
                     <button 
                       onClick={() => setActiveTab('chat')}
                       className={`px-3 py-1.5 md:px-5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-white text-blue-700 shadow-sm' : 'text-white/70 hover:text-white'}`}
                     >
                       Chat
                     </button>
                     <button 
                       onClick={() => setActiveTab('faq')}
                       className={`px-3 py-1.5 md:px-5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'faq' ? 'bg-white text-blue-700 shadow-sm' : 'text-white/70 hover:text-white'}`}
                     >
                       FAQ
                     </button>
                   </div>
                </div>
                
                {activeTab === 'chat' ? (
                  <>
                    <div className="flex-1 p-4 md:p-8 bg-slate-50 flex flex-col gap-4 overflow-y-auto pb-4">
                       {messages.map(msg => (
                         <div key={msg.id} className={`max-w-[85%] md:max-w-[75%] p-3.5 md:p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.isBot ? 'bg-white border text-slate-700 rounded-tl-sm self-start' : 'bg-blue-600 text-white rounded-tr-sm self-end'}`}>
                            {msg.text}
                         </div>
                       ))}
                       {isTyping && (
                         <div className="flex gap-1.5 items-center bg-white border p-4 md:p-5 rounded-2xl rounded-tl-sm self-start shadow-sm text-slate-400">
                            <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-blue-400 animate-bounce"></span>
                            <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-blue-400 animate-bounce delay-75"></span>
                            <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-blue-400 animate-bounce delay-150"></span>
                         </div>
                       )}
                       <div className="h-2"></div>
                    </div>
                    <div className="p-4 md:p-6 bg-white border-t shrink-0">
                      <form onSubmit={handleSendMessage} className="relative flex items-center max-w-4xl mx-auto">
                        <input 
                          type="text" 
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Type a message..."
                          className="w-full h-12 md:h-14 bg-slate-100 rounded-full pl-6 pr-14 text-sm md:text-base text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-transparent focus:border-blue-200 focus:bg-white"
                        />
                        <button type="submit" disabled={!inputValue.trim()} className="absolute right-2 md:right-3 w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity hover:bg-blue-700 shadow-md group">
                          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 bg-slate-50 p-6 md:p-10 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        <h3 className="font-black text-slate-800 mb-6 text-xl md:text-2xl">Frequently Asked Questions</h3>
                        <div className="space-y-4">
                        {[
                            { q: "What are Vaulty Credits used for?", a: "Vaulty Credits are used to power our premium AI engine. Each AI response consumes a small amount of credits based on the complexity of the query." },
                            { q: "Can I customize the chatbot's appearance?", a: "Yes! You can change colors, icons, welcome messages, and placement from the Bot Settings dashboard to match your brand." },
                            { q: "How do I install this on my website?", a: "If you're renting, just copy the embed script from your dashboard and paste it before the closing </body> tag of your site." },
                            { q: "Is the source code included?", a: "If you purchase the lifetime license, you will receive the full source code allowing you to host the bot on your own servers and modify it freely." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white border rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                                setActiveTab('chat');
                                setInputValue(faq.q);
                            }}>
                            <h4 className="font-bold text-slate-800 text-sm md:text-base mb-2">{faq.q}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                  </div>
                )}
              </div>
            ) : bot.id === 'starter' ? (
              // Starter 1/4 screen preview
              <>
                {isChatOpen && (
                <div className="absolute bottom-24 right-6 w-[350px] md:w-[400px] h-[500px] md:h-[600px] bg-white shadow-2xl rounded-2xl border border-zinc-200 overflow-hidden flex flex-col max-w-[calc(100vw-32px)] max-h-[calc(100vh-140px)] z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right">
                  <div className="h-16 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-between px-5 shrink-0 shadow-sm z-10">
                     <div className="flex items-center">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-inner overflow-hidden border-2 border-green-400">
                            <img src={astroPortraitImg} alt="Bot" className="w-full h-full object-cover" />
                         </div>
                         <div>
                             <h4 className="font-bold text-white text-base leading-tight">Vaulty Assistant</h4>
                             <p className="text-[10px] text-green-100 font-medium">Online</p>
                         </div>
                     </div>
                     <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="flex-1 p-5 bg-slate-50 overflow-y-auto flex flex-col gap-4 pb-4">
                     {messages.map(msg => (
                         <div key={msg.id} className={`max-w-[85%] p-3.5 rounded-xl text-sm shadow-sm leading-relaxed ${msg.isBot ? 'bg-white border text-slate-700 rounded-tl-sm self-start' : 'bg-green-600 text-white rounded-tr-sm self-end'}`}>
                            {msg.text}
                         </div>
                     ))}
                     {isTyping && (
                         <div className="flex gap-1.5 items-center bg-white border p-4 rounded-xl rounded-tl-sm self-start shadow-sm text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce"></span>
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce delay-75"></span>
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce delay-150"></span>
                         </div>
                     )}
                     <div className="h-2"></div>
                  </div>
                  <div className="p-4 border-t bg-white shrink-0">
                    <form onSubmit={handleSendMessage} className="relative flex items-center">
                      <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full h-12 bg-slate-100 rounded-xl pl-4 pr-12 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-green-500/50 transition-all border border-transparent focus:border-green-200 focus:bg-white"
                      />
                      <button type="submit" disabled={!inputValue.trim()} className="absolute right-2 w-9 h-9 bg-green-600 hover:bg-green-700 transition-colors rounded-lg flex items-center justify-center disabled:opacity-50 shadow-sm group">
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </form>
                  </div>
                </div>
                )}
                {/* Floating Action Button */}
                <div onClick={() => setIsChatOpen(!isChatOpen)} className={`absolute bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform z-50 ${isChatOpen ? 'scale-90 opacity-90' : ''}`}>
                  {isChatOpen ? <X className="w-6 h-6 md:w-7 md:h-7 text-white" /> : <img src={astroPortraitImg} alt="Bot" className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full border border-green-300" />}
                </div>
              </>
            ) : (
              // Demo Free preview
              <>
                {isChatOpen && (
                <div className="absolute bottom-20 right-6 w-[300px] md:w-[320px] h-[400px] md:h-[450px] bg-white shadow-xl rounded-xl border border-zinc-200 overflow-hidden flex flex-col z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right">
                  <div className="h-12 bg-purple-600 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                     <div className="flex items-center">
                         <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2 overflow-hidden border border-purple-400">
                             <img src={astroPortraitImg} alt="Bot" className="w-full h-full object-cover" />
                         </div>
                         <h4 className="font-bold text-white text-sm">Demo Bot</h4>
                     </div>
                     <button onClick={() => setIsChatOpen(false)} className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors">
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
                  <div className="p-3 border-t bg-white shrink-0">
                    <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                      <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Reply..."
                        className="flex-1 h-10 bg-slate-100 border-transparent focus:bg-white rounded-lg pl-3 pr-10 text-xs text-slate-700 outline-none focus:border-purple-400 border transition-all"
                      />
                      <button type="submit" disabled={!inputValue.trim()} className="absolute right-1 top-1 w-8 h-8 bg-purple-600 hover:bg-purple-700 transition-colors text-white rounded-md flex items-center justify-center disabled:opacity-50">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
                )}
                {/* Floating Action Button */}
                <div onClick={() => setIsChatOpen(!isChatOpen)} className={`absolute bottom-6 right-6 w-12 h-12 bg-purple-600 rounded-full shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform z-50 ${isChatOpen ? 'scale-90 opacity-90' : ''}`}>
                  {isChatOpen ? <X className="w-5 h-5 text-white" /> : <img src={astroPortraitImg} alt="Bot" className="w-8 h-8 object-cover rounded-full border border-purple-400" />}
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