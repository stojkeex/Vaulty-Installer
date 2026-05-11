import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { 
  Menu, History, LineChart, Wallet, PlusCircle, HelpCircle, ArrowUp, Plus, ChevronRight, MessageSquare, Activity, Sparkles, Paperclip
} from "lucide-react";
import { useLocation } from "wouter";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, query, getDocs, setDoc, increment, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePremium } from "@/contexts/premium-context";
import { useAuth } from "@/contexts/auth-context";
import astronautImage from "@/assets/astronaut_no_bg.png";

type Message = {
  role: "user" | "assistant";
  content: string;
  id?: string;
  timestamp?: number;
  customCard?: any;
};

const SUGGESTIONS = [
  { text: "Analyze my agents", icon: LineChart },
  { text: "Check my credits", icon: Wallet },
  { text: "View recent activity", icon: PlusCircle },
  { text: "Create a new agent", icon: Plus, isAdd: true },
  { text: "How does Vaulty work?", icon: HelpCircle },
];

const MOCK_CARD_DATA = {
  name: "Customer Support Pro",
  status: "Online",
  messages: "1,240",
  messagesGrowth: "18.6%",
  resolutionRate: "96.4%",
  resolutionGrowth: "8.2%",
  avgResponse: "1m 32s",
  responseGrowth: "4.3%",
  isResponseDown: true,
  satisfaction: "4.8",
  satisfactionGrowth: "12.7%",
};

export default function Ai() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
   
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Mock responses for demo
  const getMockResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("performance") && lowerMessage.includes("customer support")) {
       return {
           text: "Absolutely! Here's the performance overview for Customer Support Pro over the last 7 days.",
           customCard: MOCK_CARD_DATA
       }
    }

    return {
      text: "I can help you with that! Just let me know what you need."
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = messageToSend.trim();
    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = getMockResponse(userMessage);
      
      const newBotMessage: Message = {
        role: "assistant",
        content: response.text,
        timestamp: Date.now(),
        customCard: response.customCard,
      };

      setMessages(prev => [...prev, newBotMessage]);
      
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to send message.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0a0a0a] text-white font-sans overflow-hidden animate-in fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 shrink-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-10 border-b border-white/[0.02]">
         <button className="w-11 h-11 rounded-[14px] bg-[#121212] flex items-center justify-center border border-white/5">
             <Menu className="w-5 h-5 text-white/70" />
         </button>
         
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10">
                 <img src={astronautImage} className="w-full h-full object-cover filter contrast-125 grayscale" alt="Vaulty Astro" />
             </div>
             <div className="flex flex-col items-start">
                 <span className="text-[16px] font-semibold leading-tight tracking-tight">Vaulty Astro</span>
                 <div className="flex items-center gap-1.5 mt-0.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                     <span className="text-[12px] text-white/50 font-medium tracking-wide">Online</span>
                 </div>
             </div>
         </div>
         
         <button className="w-11 h-11 rounded-[14px] bg-[#121212] flex items-center justify-center border border-white/5">
             <History className="w-5 h-5 text-white/70" />
         </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center mt-4">
            <div className="w-[340px] h-[340px] mb-6 relative">
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10"></div>
               <img src={astronautImage} alt="Astronaut" className="w-full h-full object-contain filter contrast-125 brightness-75 relative z-0" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-semibold mb-3 tracking-tight">How can I help you today?</h1>
            <p className="text-[15px] text-white/50 mb-10 max-w-[280px] leading-relaxed">
              I'm Vaulty Astro, your AI assistant.<br/>
              Ask me anything or get help with your agents.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-[500px]">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggestion.text)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#121212] border border-white/5 hover:bg-white/10 transition-colors text-[14px] font-medium text-white/80 ${suggestion.isAdd ? 'border-dashed border-white/20' : ''}`}
                >
                  {suggestion.isAdd ? <Plus className="w-4 h-4 text-white/60" /> : <suggestion.icon className="w-4 h-4 text-white/60" />}
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start gap-3"}`}
              >
                {msg.role === "assistant" && (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-black border border-white/10 overflow-hidden flex items-center justify-center mt-1 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                        <img src={astronautImage} className="w-full h-full object-cover filter contrast-125 grayscale" alt="Vaulty Astro" />
                    </div>
                )}
                
                <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div 
                      className={`p-4 rounded-[20px] ${
                        msg.role === "user" 
                          ? "bg-[#1a1a24] text-white/90 rounded-tr-sm border border-white/5 shadow-sm" 
                          : "bg-[#12121a] text-white/90 rounded-tl-sm border border-white/5 shadow-sm"
                      }`}
                    >
                      <p className={`text-[15px] leading-relaxed ${msg.role === "assistant" ? "font-normal" : "font-medium"}`}>{msg.content}</p>
                      {msg.role === "user" && <p className="text-[10px] text-white/30 text-right mt-1.5">10:42 ✓✓</p>}
                      {msg.role === "assistant" && <p className="text-[10px] text-white/30 text-left mt-1.5">10:42</p>}
                    </div>

                    {msg.customCard && (
                        <div className="mt-4 w-full max-w-[400px] rounded-[24px] bg-[#12121a] border border-white/5 p-5 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="text-[16px] font-semibold text-white mb-1 tracking-tight">{msg.customCard.name}</h4>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                                        <span className="text-[12px] text-white/60 font-medium">{msg.customCard.status}</span>
                                    </div>
                                </div>
                                <button className="text-[12px] text-white/50 flex items-center gap-1 hover:text-white transition-colors font-medium">
                                    View full report <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-3">
                                <div className="flex flex-col">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                                        <MessageSquare className="w-4 h-4 text-white/60" />
                                    </div>
                                    <p className="text-[10px] text-white/40 mb-1 font-medium tracking-wide">Messages</p>
                                    <p className="text-[18px] font-bold text-white mb-1.5">{msg.customCard.messages}</p>
                                    <p className="text-[10px] text-[#22c55e] flex items-center gap-0.5 font-semibold tracking-tight">
                                        <ArrowUp className="w-3 h-3" /> {msg.customCard.messagesGrowth}
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                                        <Activity className="w-4 h-4 text-white/60" />
                                    </div>
                                    <p className="text-[10px] text-white/40 mb-1 font-medium tracking-wide">Resolution rate</p>
                                    <p className="text-[18px] font-bold text-white mb-1.5">{msg.customCard.resolutionRate}</p>
                                    <p className="text-[10px] text-[#22c55e] flex items-center gap-0.5 font-semibold tracking-tight">
                                        <ArrowUp className="w-3 h-3" /> {msg.customCard.resolutionGrowth}
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                                        <LineChart className="w-4 h-4 text-white/60" />
                                    </div>
                                    <p className="text-[10px] text-white/40 mb-1 font-medium tracking-wide">Avg. response time</p>
                                    <p className="text-[18px] font-bold text-white mb-1.5 tracking-tight">{msg.customCard.avgResponse}</p>
                                    <p className={`text-[10px] ${msg.customCard.isResponseDown ? 'text-[#3b82f6]' : 'text-[#22c55e]'} flex items-center gap-0.5 font-semibold tracking-tight`}>
                                        <ArrowUp className={`w-3 h-3 ${msg.customCard.isResponseDown ? 'rotate-180' : ''}`} /> {msg.customCard.responseGrowth}
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                                        <Sparkles className="w-4 h-4 text-white/60" />
                                    </div>
                                    <p className="text-[10px] text-white/40 mb-1 font-medium tracking-wide">Satisfaction</p>
                                    <p className="text-[18px] font-bold text-white mb-1.5">{msg.customCard.satisfaction}<span className="text-[13px] text-white/40 font-medium">/5</span></p>
                                    <p className="text-[10px] text-[#22c55e] flex items-center gap-0.5 font-semibold tracking-tight">
                                        <ArrowUp className="w-3 h-3" /> {msg.customCard.satisfactionGrowth}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-3">
                            <div className="w-12 h-6 rounded-full bg-[#12121a] border border-white/5 flex items-center justify-center gap-1">
                                <div className="w-1 h-1 bg-white/40 rounded-full" />
                                <div className="w-1 h-1 bg-white/40 rounded-full" />
                                <div className="w-1 h-1 bg-white/40 rounded-full" />
                            </div>
                        </div>
                    )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-black border border-white/10 overflow-hidden flex items-center justify-center mt-1 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                        <img src={astronautImage} className="w-full h-full object-cover filter contrast-125 grayscale" alt="Vaulty Astro" />
                  </div>
                  <div className="flex items-center gap-1.5 h-[52px] px-5 rounded-[20px] bg-[#12121a] border border-white/5 shadow-sm rounded-tl-sm">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-40">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative flex items-center">
            <button className="absolute left-4 z-10 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Paperclip className="w-4 h-4 text-white/70 hover:text-white transition-colors" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Message Vaulty Astro..."
              className="w-full h-14 pl-14 pr-12 rounded-full bg-[#121212] border border-white/5 text-[15px] font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-white/10 transition-colors shadow-lg"
            />
            <button className="absolute right-4 z-10">
                <Sparkles className="w-5 h-5 text-white/50 hover:text-white transition-colors" />
            </button>
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-14 h-14 shrink-0 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <ArrowUp className="w-6 h-6 text-black" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}