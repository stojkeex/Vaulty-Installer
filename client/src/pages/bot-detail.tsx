import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Monitor, Smartphone, Tablet, ExternalLink, Bot, Check, Shield, Code, Download, Zap, MessageSquare, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import robotImg from "@/assets/astronaut.png";
import astroPortraitImg from "@/assets/astro-portrait.png";

// Shared data, should ideally be in a shared file but keeping here for simplicity
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

  if (showFullPreview) {
    return (
      <div className="fixed inset-0 z-[100] bg-zinc-900 flex flex-col">
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
        <div className="flex-1 bg-zinc-800/50 p-4 md:p-8 flex items-center justify-center overflow-hidden">
          <div 
            className={`bg-white rounded-xl shadow-2xl relative overflow-hidden transition-all duration-300 ${
              previewDevice === 'mobile' ? 'w-[375px] h-[812px]' : 
              previewDevice === 'tablet' ? 'w-[768px] h-[1024px]' : 
              'w-full max-w-[1200px] h-full'
            }`}
          >
            {/* Fake Website Content */}
            <div className="w-full h-full bg-slate-50 flex flex-col">
              <header className="h-16 bg-white border-b flex items-center px-6">
                <div className="w-32 h-6 bg-slate-200 rounded"></div>
                <div className="ml-auto flex gap-4">
                  <div className="w-16 h-4 bg-slate-200 rounded"></div>
                  <div className="w-16 h-4 bg-slate-200 rounded"></div>
                  <div className="w-16 h-4 bg-slate-200 rounded"></div>
                </div>
              </header>
              <main className="p-8 md:p-12 flex-1 overflow-y-auto">
                <div className="w-3/4 h-12 bg-slate-200 rounded mb-6"></div>
                <div className="w-1/2 h-6 bg-slate-200 rounded mb-4"></div>
                <div className="w-full h-64 bg-slate-200 rounded-xl"></div>
              </main>
            </div>

            {/* Chatbot Representation */}
            {bot.id === 'premium' ? (
              // Premium Full Screen Preview
              <div className="absolute inset-4 md:inset-8 bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500">
                <div className="h-16 border-b flex items-center justify-between px-6 bg-blue-50/50">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-600" />
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-800">AI Assistant</h4>
                       <p className="text-[10px] text-blue-600 font-medium">Online</p>
                     </div>
                   </div>
                   <div className="flex gap-4">
                     <span className="text-sm font-medium text-slate-500 border-b-2 border-blue-600 pb-1">Chat</span>
                     <span className="text-sm font-medium text-slate-400">FAQ</span>
                   </div>
                </div>
                <div className="flex-1 p-6 bg-slate-50 flex flex-col gap-4 overflow-y-auto">
                   <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tl-sm self-start max-w-[80%] shadow-sm">
                      Hi there! I'm your premium AI assistant. How can I help you today?
                   </div>
                   <div className="bg-white border text-slate-700 p-3 rounded-2xl rounded-tr-sm self-end max-w-[80%] shadow-sm">
                      Can you show me the typing animation?
                   </div>
                   <div className="flex gap-1 items-center bg-white border p-3 rounded-2xl rounded-tl-sm self-start shadow-sm text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-75"></span>
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-150"></span>
                   </div>
                </div>
                <div className="p-4 bg-white border-t">
                  <div className="h-12 bg-slate-100 rounded-full flex items-center px-4">
                    <span className="text-slate-400 text-sm">Type a message...</span>
                  </div>
                </div>
              </div>
            ) : bot.id === 'starter' ? (
              // Starter 1/4 screen preview
              <>
                <div className="absolute bottom-6 right-6 w-[350px] h-[500px] bg-white shadow-2xl rounded-2xl border border-zinc-200 overflow-hidden flex flex-col max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
                  <div className="h-14 bg-green-500 flex items-center px-4">
                     <h4 className="font-bold text-white">Chat with us</h4>
                  </div>
                  <div className="flex-1 p-4 bg-slate-50">
                     <div className="bg-white border text-slate-700 p-3 rounded-xl rounded-tl-sm self-start text-sm shadow-sm">
                        Hello! Let me know if you have any questions.
                     </div>
                  </div>
                  <div className="p-3 border-t bg-white">
                    <div className="h-10 border rounded-lg flex items-center px-3">
                      <span className="text-slate-400 text-sm">Message...</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-6 right-[380px] w-14 h-14 bg-green-500 rounded-full shadow-lg hidden md:flex items-center justify-center cursor-pointer">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              // Demo Free preview
              <>
                <div className="absolute bottom-6 right-6 w-[300px] h-[400px] bg-white shadow-xl rounded-xl border border-zinc-200 overflow-hidden flex flex-col">
                  <div className="h-12 bg-purple-600 flex items-center px-4">
                     <h4 className="font-bold text-white text-sm">Demo Bot</h4>
                  </div>
                  <div className="flex-1 p-4 bg-slate-50">
                     <div className="bg-purple-100 text-purple-900 p-2.5 rounded-lg rounded-tl-sm self-start text-xs">
                        I am a simulated demo bot. I only know ~20 responses!
                     </div>
                  </div>
                  <div className="p-3 border-t bg-white">
                    <div className="h-8 border rounded flex items-center px-2">
                      <span className="text-slate-400 text-xs">Reply...</span>
                    </div>
                  </div>
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
                
                <div className="aspect-video bg-black/50 rounded-xl border border-white/10 mb-4 overflow-hidden relative">
                   {/* Mini placeholder preview */}
                   <div className="absolute inset-0 p-4 flex flex-col opacity-50">
                     <div className="w-full h-4 bg-white/10 rounded mb-4"></div>
                     <div className="w-2/3 h-4 bg-white/10 rounded mb-4"></div>
                     <div className="w-full flex-1 bg-white/5 rounded"></div>
                   </div>
                   <div className="absolute bottom-4 right-4 bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
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
