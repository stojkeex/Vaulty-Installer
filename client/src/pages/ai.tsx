import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { 
  Send, X, Settings, History, Copy, Check, ThumbsUp, ThumbsDown, 
  Volume2, Menu, User, CreditCard, Crown, Sparkles, ChevronLeft,
  Paperclip, ChevronDown, Lock, Zap, HardDrive, LogOut, Brain, ChevronUp
} from "lucide-react";
import { useLocation } from "wouter";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, query, getDocs, setDoc, increment, deleteDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { usePremium } from "@/contexts/premium-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import botAvatar from "@assets/1B800ADD-4D3C-4FAB-8D82-8893E729D46A_1765457083436.png";
import vaultyLogo from "@assets/IMG_1067_1775569221193.png";

type Message = {
  role: "user" | "assistant";
  content: string;
  id?: string;
  sender?: string;
  timestamp?: number;
  isError?: boolean;
  feedback?: "positive" | "negative" | null;
  thinking?: string;
  thinkingTime?: number;
  isTyping?: boolean;
};

interface ChatHistory {
  id: string;
  title: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  createdAt: number;
  updatedAt: number;
}

const MODELS = [
  { id: "v1-basic", name: "Vaulty 1.0 Basic", tier: "free", cost: 0.05 },
  { id: "v1-pro", name: "Vaulty 1.0 Pro", tier: "pro", cost: 0.20 },
  { id: "v1.5-basic", name: "Vaulty 1.5 Basic", tier: "free", cost: 0.10 },
  { id: "v1.5-pro", name: "Vaulty 1.5 Pro", tier: "pro", cost: 0.50 },
];

const LIMITS: Record<string, number> = {
  free: 10,
  pro: 30,
  ultra: 100,
  max: Infinity,
  plus: 100
};

const MEMORY_LIMITS: Record<string, number> = {
  free: 0.1,
  pro: 1,
  ultra: 5,
  max: 20,
  plus: 5
};

const SUGGESTIONS_POOL = [
  "Tell me more about bitcoin",
  "Analyse crypto market in 2025",
  "What is Ethereum?",
  "Explain DeFi concepts",
  "Crypto investment strategies",
  "How to read a candlestick chart?",
  "What is a blockchain wallet?",
  "Difference between BTC and ETH",
  "What are NFTs?",
  "Risks of crypto trading",
  "Top 5 altcoins to watch",
  "Explain market cap",
  "What is staking?",
  "How to keep crypto safe?"
];

// 1 memory unit = 0.5-2 KB
const MEMORY_UNIT_KB = 1; // Using 1KB as default memory unit

// Konfiguracija za API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const appId = typeof (window as any).__app_id !== 'undefined' ? (window as any).__app_id : 'default-app-id';

export default function Ai() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const chatId = searchParams.get("chatId");
  const { subscription: contextSubscription, hasAccess } = usePremium();
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recentChats, setRecentChats] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
   
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [usage, setUsage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [memoryUsed, setMemoryUsed] = useState(0);
  const [memoryLimit, setMemoryLimit] = useState(0.1);
  const [showMemoryMenu, setShowMemoryMenu] = useState(false);
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [expandedThinking, setExpandedThinking] = useState<number | null>(null);
  const [typingMessages, setTypingMessages] = useState<Set<number>>(new Set());
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
   
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleImageLongPress = (imageUrl: string) => {
    setLocation(`/image-save?url=${encodeURIComponent(imageUrl)}`);
  };

  // Mock responses for demo when API quota is exceeded
  const getMockResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    const mockResponses: Record<string, { thinking: string; text: string }> = {
      bitcoin: {
        thinking: "Analiziram uporabnikovo vprašanje o Bitcoinu. Preverjam trenutne trende, tehnično analizo in makroekonomske dejavnike. Upoštevam se tržno ponudbo in povpraševanja.",
        text: "# Bitcoin - Digitalno Zlato\n\nBitcoin je prva in največja kriptovaluta, ustvarjena leta 2009. Tukaj so ključne točke:\n\n## Karakteristike\n- **Omejeni Ponos**: Največ 21 milijonov bitcoinov\n- **Blockchain**: Decentralizirana javna knjiga\n- **Proof of Work**: Varnostni mehanizem\n\n## Trenutna Uporaba\n- Store vrednosti\n- Mednarodni transferji\n- Zaščita pred inflacijo\n\n**Napomena**: To ni finančni nasvet, le izobraževalna vsebina."
      },
      ethereum: {
        thinking: "Analiziram vprašanje o Ethereumu. Preverjam razlike med Bitcoinom in Ethereumom, pametne pogodbe in DeFi ekosistem.",
        text: "# Ethereum - Platforma za Pametne Pogodbe\n\nEthereum je druga največja kriptovaluta in omogoča decentralizirane aplikacije.\n\n## Razlike od Bitcoina\n- **Pametne Pogodbe**: Programabilna transakcija\n- **dApps**: Decentralizovane aplikacije\n- **DeFi**: Decentralizovane finance\n\n## Tehnologija\n- Proof of Stake (od 2022)\n- EVM (Ethereum Virtual Machine)\n- Hitrejši transakcije\n\n**Upotreba**: Decentralizovane finance, NFT-ji, Web3 aplikacije."
      },
      defi: {
        thinking: "Analiziram koncept DeFi. Pojašnjujem decentralizirane finance, pametne pogodbe, likvidnostne bazene in rizike.",
        text: "# DeFi - Decentralizovane Finance\n\nDeFi je financijski sistem izgrađen na blockchain tehnologiji bez centralne vlasti.\n\n## Glavne Komponente\n- **DEX (Decentralizovane Berze)**: Direktna razmena tokena\n- **Lending**: Posudbe bez intermedijara\n- **Staking**: Zarađivanje od čuvanja kripto sredstava\n- **Likvidnostni Bazeni**: Automatizovane tržne maker\n\n## Prednosti\n- Neprekidni rad 24/7\n- Transparentnost\n- Manja komisija\n\n## Rizici\n- Volatilnost\n- Smanjena likvidnost\n- Sigurnosni rizici\n\n**Oprez**: DeFi je riskantno, pažljivo investirajte."
      },
      market: {
        thinking: "Korisnik pita o kripto tržištu. Analiziram tržne trendove, volatilnost i faktore koji utiču na cijene.",
        text: "# Kripto Tržište u 2025\n\n## Trenutni Trendovi\n- Bitcoin blizu istorijskih maksimuma\n- Ethereum konkurira altcoin tržištu\n- Institucije ulaze na tržište\n\n## Ključni Faktori\n- **Regulacija**: Government politika\n- **Tehnologija**: Blockchain razvoj\n- **Adoption**: Masovna upotreba\n- **Makroekonomija**: Kamatne stope, inflacija\n\n## Strategije\n- **DCA** (Dollar Cost Averaging): Redovna ulaganja\n- **HODL**: Dugoročno čuvanje\n- **Trading**: Aktivna trgovina\n\n**Napomena**: Uvek radite sopstvenu analizu pre nego što investirate."
      }
    };

    // Check if any keyword matches
    for (const [keyword, response] of Object.entries(mockResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    // Default response
    return {
      thinking: "Analiziram vprašanje korisnika. Preverjam dostupne informacije i pripravljam odgovor.",
      text: "# Vaulty AI Asistent\n\nHvala što ste postavili vprašanje! Mogu da vam pomognem sa sledećim temama:\n\n## Podržane Teme\n- **Bitcoin**: Digitalno zlato\n- **Ethereum**: Pametne pogodbe\n- **DeFi**: Decentralizovane finance\n- **Tržišne Analize**: Trendy i strategije\n\n## Kako Mogu Pomoći\n- Objasniti koncepte\n- Analizirati trendove\n- Dati edukativne savete\n- Odgovoriti na pitanja\n\nPitajte me bilo šta vezano za kripto i finance! 💡"
    };
  };

  // Funkcija za klic pravog Gemini API-ja sa fallback-om
  const getRealAIResponse = async (message: string, history: Message[]) => {
    // Enhanced System Prompt for "Professional" Thinking
    const systemPrompt = `Ti si Vaulty AI, vrhunski finančni in kripto svetovalec. 
    Tvoja naloga je zagotavljati natančne, poglobljene in strokovne analize trga, investicijske strategije in izobraževalne vsebine.
    
    NAVODILA ZA RAZMIŠLJANJE:
    Preden podaš končni odgovor, moraš simulirati profesionalen proces razmišljanja. 
    To razmišljanje mora biti strukturirano in analitično.
    Vključi naslednje korake v svoje razmišljanje:
    1. Analiza zahteve: Kaj točno uporabnik sprašuje? Kateri so ključni pojmi?
    2. Identifikacija konteksta: Ali gre za tehnično analizo, fundamentalno analizo, varnost ali izobraževanje?
    3. Pridobivanje znanja: Na katere podatke ali koncepte se moram opreti?
    4. Oblikovanje odgovora: Kako bom strukturiral odgovor, da bo jasen, jedrnat in uporaben?
    5. Varnostno preverjanje: Ali odgovor vsebuje finančni nasvet? (Dodaj opozorilo, da to ni finančni nasvet).

    FORMAT ODGOVORA:
    Svoj odgovor MORAŠ strukturirati takole:
    <thinking>
    [Tukaj vpiši svoj proces razmišljanja v 3-5 stavkih. Bodi analitičen. Npr: "Analiziram uporabnikovo vprašanje o Bitcoinu. Preverjam trenutne trende in ključne nivoje odpora. Upoštevam makroekonomske dejavnike..."]
    </thinking>
    [Tukaj vpiši svoj končni odgovor uporabniku v Markdown formatu]
    
    Če te uporabnik vpraša o čemerkoli drugem (npr. vremenu, športu, kuhanju), vljudno zavrni in ostani v vlogi finančnega svetovalca.
    `;
    
    const apiCall = async () => {
      try {
        if (!apiKey) {
          throw new Error("Missing Gemini API key");
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                ...history.slice(-10).map(m => ({
                  role: m.role === "user" ? "user" : "model",
                  parts: [{ text: m.content }]
                })),
                { role: "user", parts: [{ text: message }] }
              ],
              systemInstruction: { parts: [{ text: systemPrompt }] }
            })
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          const errorMessage = data.error?.message || `HTTP ${response.status}`;
          console.error("Gemini API Error:", errorMessage, data);
          throw new Error(errorMessage);
        }
        
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Na žalost nisem mogel generirati odgovora.";
      } catch (err: any) {
        console.error("API Call Error:", err);
        throw err;
      }
    };

    // Try API first
    try {
      let rawResponse = "";
      let delay = 1000;
      
      for (let i = 0; i < 3; i++) {
        try {
          rawResponse = await apiCall();
          break;
        } catch (err: any) {
          console.log(`Attempt ${i + 1} failed, using fallback...`);
          if (i === 2) throw err;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
      
      // Parse Thinking and Response
      const thinkingMatch = rawResponse.match(/<thinking>([\s\S]*?)<\/thinking>/);
      const thinking = thinkingMatch ? thinkingMatch[1].trim() : "Analiziram zahtevo...";
      const text = rawResponse.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim();

      return { text, thinking };
    } catch (err: any) {
      console.error("API failed:", err.message);
      if (String(err?.message || "").includes("quota") || String(err?.message || "").includes("429")) {
        throw new Error("Gemini quota is currently exceeded. Check billing or rate limits for this key.");
      }
      throw new Error(err?.message || "Failed to connect to Gemini API.");
    }
  };

  useEffect(() => {
    if (user) {
      loadRecentChats();
      loadUsage();
    }
  }, [user, isSidebarOpen]);

  useEffect(() => {
    if (chatId && user) {
      loadChatHistory(chatId);
    }
  }, [chatId, user]);

  useEffect(() => {
    if (!shouldAutoScroll) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    const tier = contextSubscription || "free";
    setLimit(LIMITS[tier]);
    setMemoryLimit(MEMORY_LIMITS[tier]);
  }, [contextSubscription]);

  // Load random suggestions on mount
  useEffect(() => {
    const shuffled = [...SUGGESTIONS_POOL].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  }, []);

  const loadUsage = async () => {
    if (!user) return;
    try {
      // Uporaba Rule 1 za poti v Firestore
      const docRef = doc(db, "artifacts", appId, "users", user.uid, "features", "ai_usage");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUsage(docSnap.data().used || 0);
        setMemoryUsed(docSnap.data().memoryUsed || 0);
      } else {
        setUsage(0);
        setMemoryUsed(0);
      }
    } catch (e) {
      console.error("Error loading usage:", e);
    }
  };

  const updateUsage = async (cost: number, messageLength: number = 0) => {
    if (!user) return;
    try {
      const memoryUsedByMessage = messageLength / (1024 * 1024 * 1024);
      const docRef = doc(db, "artifacts", appId, "users", user.uid, "features", "ai_usage");
      await setDoc(docRef, { 
        used: increment(cost),
        memoryUsed: increment(memoryUsedByMessage),
        lastUpdated: Date.now()
      }, { merge: true });
      setUsage(prev => prev + cost);
      setMemoryUsed(prev => prev + memoryUsedByMessage);
    } catch (e) {
      console.error("Error updating usage:", e);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      if (!user) return;
      await deleteDoc(doc(db, "artifacts", appId, "users", user.uid, "chatHistories", chatId));
      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
      }
      await loadRecentChats();
      toast({ title: "Chat deleted" });
      setSwipeId(null);
      setDeleteChatId(null);
    } catch (e) {
      console.error("Error deleting chat:", e);
      toast({ title: "Failed to delete chat", variant: "destructive" });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, chatId: string) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe(touchStart, e.changedTouches[0].clientX, chatId);
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShouldAutoScroll(distanceFromBottom < 120);
  };

  const handleSwipe = (start: number, end: number, chatId: string) => {
    const distance = start - end;
    if (distance > 50) {
      setSwipeId(chatId);
    } else if (distance < -50) {
      setSwipeId(null);
    }
  };

  const loadRecentChats = async () => {
    try {
      if (!user) return;
      const chatsCollection = collection(db, "artifacts", appId, "users", user.uid, "chatHistories");
      const chatsSnapshot = await getDocs(query(chatsCollection));
      const chats: ChatHistory[] = [];
      chatsSnapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as ChatHistory);
      });
      chats.sort((a, b) => b.updatedAt - a.updatedAt);
      setRecentChats(chats.slice(0, 10));
    } catch (error) {
      console.error("Error loading recent chats:", error);
    }
  };

  const loadChatHistory = async (id: string) => {
    try {
      if (!user) return;
      const chatDoc = await getDoc(doc(db, "artifacts", appId, "users", user.uid, "chatHistories", id));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        setMessages(chatData.messages || []);
        setCurrentChatId(id);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const saveChatToFirebase = async (updatedMessages: Message[], userMessage: string) => {
    try {
      if (!user) return;
      const chatTitle = userMessage.slice(0, 30) + "...";

      if (currentChatId) {
        await updateDoc(doc(db, "artifacts", appId, "users", user.uid, "chatHistories", currentChatId), {
          messages: updatedMessages,
          updatedAt: Date.now(),
        });
      } else {
        const newChatDoc = await addDoc(collection(db, "artifacts", appId, "users", user.uid, "chatHistories"), {
          title: chatTitle,
          messages: updatedMessages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        setCurrentChatId(newChatDoc.id);
      }
      loadRecentChats();
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  const handleCopyMessage = (content: string) => {
    const el = document.createElement('textarea');
    el.value = content;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleSpeakMessage = (content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      
      // Get selected voice from localStorage
      const savedVoiceName = localStorage.getItem("vaulty_selected_voice");
      if (savedVoiceName) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.name === savedVoiceName);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Error",
        description: "Text-to-speech not supported in this browser",
        variant: "destructive"
      });
    }
  };

  const handleFeedback = (index: number, isPositive: boolean) => {
    const feedbackType = isPositive ? "positive" : "negative";
    
    setMessages(prev => prev.map((msg, i) => {
      if (i === index) {
        const newFeedback = msg.feedback === feedbackType ? null : feedbackType;
        return { ...msg, feedback: newFeedback };
      }
      return msg;
    }));

    toast({
      title: "Thank You",
      description: "Thank you for your feedback!",
    });
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;
    
    if (limit !== Infinity && usage + selectedModel.cost > limit) {
      alert("Insufficient credits! Please upgrade your plan.");
      return;
    }

    const userMessage = messageToSend.trim();
    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);
    setShouldAutoScroll(true);

    try {
      const startTime = Date.now();
      const response = await getRealAIResponse(userMessage, messages);
      const endTime = Date.now();
      const thinkingTime = (endTime - startTime) / 1000;
      
      const aiResponseText = typeof response === 'string' ? response : response.text;
      const thinkingContent = typeof response === 'string' ? "" : response.thinking;
      
      const newBotMessage: Message = {
        role: "assistant",
        content: aiResponseText,
        timestamp: Date.now(),
        thinking: thinkingContent,
        thinkingTime: Math.ceil(thinkingTime),
        isTyping: true,
      };

      setMessages(prev => [...prev, newBotMessage]);
      const msgIndex = messages.length + 1;
      setTypingMessages(new Set([msgIndex]));

      // Character by character typing effect
      let displayedText = "";
      for (let i = 0; i < aiResponseText.length; i++) {
        displayedText += aiResponseText[i];
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 ? { ...msg, content: displayedText } : msg
        ));
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 ? { ...msg, isTyping: false } : msg
      ));
      setTypingMessages(new Set());

      const updatedMessages = [...messages, newUserMessage, newBotMessage];
      await saveChatToFirebase(updatedMessages, userMessage);
      const totalMessageLength = userMessage.length + aiResponseText.length;
      await updateUsage(selectedModel.cost, totalMessageLength);
      
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMsg = error?.message || "Prišlo je do napake pri povezavi z AI.";
      toast({ 
        title: "Napaka", 
        description: errorMsg,
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setIsSidebarOpen(false);
    setLocation("/ai");
    // Refresh suggestions
    const shuffled = [...SUGGESTIONS_POOL].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  };

  const usagePercent = limit === Infinity ? 0 : Math.min(100, (usage / limit) * 100);

  return (
    <div className="flex h-[100dvh] bg-black text-white overflow-hidden relative">
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 w-80 bg-black/80 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-in-out border-r border-white/10 flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-gray-900/10 via-purple-900/10 to-slate-900/10">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="font-bold text-lg tracking-wider flex items-center gap-2">
              <img src={vaultyLogo} alt="Logo" className="w-6 h-6 object-contain" />
              VAULTY AI
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4">
             {contextSubscription === "free" && (
               <div 
                 onClick={() => setLocation("/premium")}
                 className="mb-3 p-3 rounded-xl bg-gradient-to-r from-[#00d8ff]/10 via-[#8b00ff]/10 to-[#ff00ea]/10 border border-[#00d8ff]/20 cursor-pointer hover:bg-[#ff00ea]/10 transition-all group"
               >
                 <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-400">UPGRADE TO PRO</span>
                    <Crown size={12} className="text-gray-400" />
                 </div>
                 <p className="text-xs text-gray-300 group-hover:text-white transition-colors">
                    Get more AI Credits & Models
                 </p>
               </div>
             )}
             <button 
               onClick={handleNewChat}
               className="w-full py-3 px-4 bg-gradient-to-br from-[#00d8ff] via-[#8b00ff] to-[#ff00ea] text-white rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(255,0,234,0.4)] transition-all flex items-center justify-center gap-2"
             >
               <Sparkles size={18} /> New Chat
             </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-2">
            <p className="text-xs text-gray-500 font-bold tracking-widest mb-2">RECENT</p>
            {recentChats.map(chat => (
              <div
                key={chat.id}
                className="relative overflow-hidden rounded-lg"
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, chat.id)}
              >
                {/* Delete button background - Only visible when swiped */}
                {swipeId === chat.id && (
                  <div className="absolute right-0 top-0 h-full w-16 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => setDeleteChatId(chat.id)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {/* Chat item */}
                <div
                  className={cn(
                    "w-full flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer relative",
                    swipeId === chat.id ? "translate-x-[-60px]" : "translate-x-0"
                  )}
                  style={{ transition: "transform 0.3s ease-out" }}
                  onClick={() => {
                    if (swipeId !== chat.id) {
                      loadChatHistory(chat.id);
                      setIsSidebarOpen(false);
                    }
                  }}
                >
                  <div className="flex-1 text-left text-sm truncate">
                    {chat.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteChatId} onOpenChange={(open) => !open && setDeleteChatId(null)}>
            <DialogContent className="bg-black border border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Delete Chat?</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Are you sure you want to delete this chat? The entire conversation will be lost forever!
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-3">
                <button
                  onClick={() => setDeleteChatId(null)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteChatId) {
                      deleteChat(deleteChatId);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Delete
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Profile & Memory Section */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <DropdownMenu open={showMemoryMenu} onOpenChange={setShowMemoryMenu}>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName ?? "User"} 
                          className="w-full h-full object-cover cursor-pointer select-none"
                          data-testid="image-useravatar-longpress"
                          onTouchStart={() => {
                            longPressTimer.current = setTimeout(() => handleImageLongPress(user.photoURL!), 500);
                          }}
                          onTouchEnd={() => {
                            if (longPressTimer.current) clearTimeout(longPressTimer.current);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleImageLongPress(user.photoURL!);
                          }}
                        />
                      ) : (
                        <User size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">{user?.displayName || "User"}</p>
                      <p className="text-[10px] text-gray-400">{contextSubscription?.toUpperCase() || 'FREE'}</p>
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/95 border border-white/10 text-white backdrop-blur-xl mb-2">
                <div className="p-4 space-y-4 border-b border-white/10">
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-2">MEMORY STORAGE</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">{memoryUsed.toFixed(2)} GB / {memoryLimit.toFixed(1)} GB</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (memoryUsed / memoryLimit) * 100)} 
                        className="h-2 bg-white/10" 
                        indicatorClassName="bg-gradient-to-r from-[#ff00ea] to-[#00d8ff]" 
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-2">MONTHLY CREDITS</p>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-300">${usage.toFixed(2)} / {limit === Infinity ? "∞" : `$${limit}`}</span>
                    </div>
                    <Progress 
                      value={usagePercent} 
                      className="h-2 bg-white/10" 
                      indicatorClassName="bg-gradient-to-r from-gray-500 to-gray-500" 
                    />
                  </div>
                </div>
                
                <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 py-3 px-4">
                   <Settings size={14} className="mr-2" />
                   Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10 py-3 px-4 text-red-400">
                  <LogOut size={14} className="mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="text-[10px] text-gray-500 text-center">
              {contextSubscription === 'free' ? 'Upgrade to unlock more storage' : `${contextSubscription.toUpperCase()} MEMBER`}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full min-w-0 bg-black">
        {/* Header - Fixed to top */}
        <header className="h-14 flex-shrink-0 flex items-center px-4 justify-between bg-black z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-full text-white">
              <Menu size={22} />
            </button>
            
            {/* Model Selector (replaces Upgrade badge) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">
                  <span className="font-semibold text-[15px] text-white/90">{selectedModel.name}</span>
                  <ChevronDown size={14} className="text-white/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#2f2f2f] border border-white/10 text-white rounded-xl shadow-2xl">
                {MODELS.map((model) => {
                  const isLocked = model.tier !== "free" && contextSubscription === "free";
                  return (
                    <DropdownMenuItem 
                      key={model.id}
                      disabled={isLocked}
                      onClick={() => setSelectedModel(model)}
                      className={cn(
                        "flex items-center justify-between cursor-pointer focus:bg-white/10 focus:text-white",
                        selectedModel.id === model.id && "bg-gray-500/20 text-gray-400"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-gray-500">${model.cost}/msg</span>
                      </div>
                      {isLocked && <Lock size={14} className="text-gray-500" />}
                      {selectedModel.id === model.id && <Check size={14} />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <button onClick={() => setLocation("/")} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
            <X size={24} />
          </button>
        </header>

        {/* Messages */}
        <div ref={messagesContainerRef} onScroll={handleMessagesScroll} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-700">
              <div className="w-32 h-32 mb-8 relative">
                <img 
                  src={vaultyLogo} 
                  alt="Vaulty AI" 
                  className="w-full h-full object-contain relative z-10 cursor-pointer select-none"
                  data-testid="image-vaultylogo-longpress"
                  onTouchStart={() => {
                    longPressTimer.current = setTimeout(() => handleImageLongPress(vaultyLogo), 500);
                  }}
                  onTouchEnd={() => {
                    if (longPressTimer.current) clearTimeout(longPressTimer.current);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleImageLongPress(vaultyLogo);
                  }}
                />
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-8 text-white">VAULTY AI</h1>
              
              {/* SUGGESTIONS SECTION */}
              <div className="w-full max-w-md space-y-3">
                <p className="text-sm text-gray-500 mb-4">Try asking...</p>
                <div className="grid gap-3">
                  {suggestions.map((suggestion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all text-left"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-4 max-w-3xl mx-auto",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <button
                  onClick={() => msg.role === "user" && setLocation("/profile")}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden transition-transform hover:scale-110",
                    msg.role === "user" ? "bg-white/10 cursor-pointer hover:bg-white/20" : "bg-transparent cursor-default"
                  )}>
                  {msg.role === "user" ? (
                    user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName ?? "User"} className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )
                  ) : (
                    <img src={botAvatar} className="w-full h-full object-cover" alt="AI" />
                  )}
                </button>
                <div className={cn(
                  "p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed group relative",
                  msg.role === "user" 
                    ? "bg-white/10 text-white rounded-tr-sm border border-white/20 backdrop-blur-md" 
                    : "bg-white/5 border border-white/10 rounded-tl-sm"
                )}>
                  {msg.role === "assistant" && msg.thinking && (
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedThinking(expandedThinking === idx ? null : idx)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-900/20 border border-purple-500/20 text-xs font-medium text-purple-300 hover:bg-purple-900/30 transition-all w-full",
                          expandedThinking === idx && "bg-purple-900/30"
                        )}
                      >
                        <Brain size={14} className="text-purple-400" />
                        <span>Thinking Process ({msg.thinkingTime}s)</span>
                        <ChevronDown size={12} className={cn("ml-auto transition-transform", expandedThinking === idx && "rotate-180")} />
                      </button>
                      
                      {expandedThinking === idx && (
                        <div className="mt-2 p-3 rounded-lg bg-black/40 border border-purple-500/10 text-xs text-gray-300 animate-in slide-in-from-top-2 duration-200">
                          <p className="leading-relaxed whitespace-pre-line">{msg.thinking}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MARKDOWN RENDERING */}
                  <div className="prose prose-invert prose-sm max-w-none break-words">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}: any) => <p className="mb-2 last:mb-0" {...props} />,
                        strong: ({node, ...props}: any) => <strong className="font-bold text-gray-400" {...props} />,
                        em: ({node, ...props}: any) => <em className="italic text-purple-300" {...props} />,
                        h1: ({node, ...props}: any) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                        h2: ({node, ...props}: any) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                        h3: ({node, ...props}: any) => <h3 className="text-md font-bold mt-2 mb-1" {...props} />,
                        ul: ({node, ...props}: any) => <ul className="list-disc pl-4 mb-2" {...props} />,
                        ol: ({node, ...props}: any) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                        code: ({node, ...props}: any) => <code className="bg-black/30 rounded px-1 py-0.5 font-mono text-xs" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 transition-opacity">
                      <button 
                        onClick={() => handleCopyMessage(msg.content)}
                        className="text-gray-500 hover:text-white transition-colors p-1"
                        title="Copy"
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        onClick={() => handleSpeakMessage(msg.content)}
                        className="text-gray-500 hover:text-white transition-colors p-1"
                        title="Read Aloud"
                      >
                        <Volume2 size={14} />
                      </button>
                      <div className="w-px h-3 bg-white/10 mx-1" />
                      <button 
                        onClick={() => handleFeedback(idx, true)}
                        className={cn(
                          "transition-colors p-1",
                          msg.feedback === "positive" ? "text-gray-400" : "text-gray-500 hover:text-green-400"
                        )}
                        title="Good Response"
                      >
                        <ThumbsUp size={14} className={cn(msg.feedback === "positive" && "fill-current")} />
                      </button>
                      <button 
                        onClick={() => handleFeedback(idx, false)}
                        className={cn(
                          "transition-colors p-1",
                          msg.feedback === "negative" ? "text-red-500" : "text-gray-500 hover:text-red-400"
                        )}
                        title="Bad Response"
                      >
                        <ThumbsDown size={14} className={cn(msg.feedback === "negative" && "fill-current")} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
             <div className="flex gap-4 max-w-3xl mx-auto opacity-50">
               <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                 <img src={botAvatar} className="w-full h-full object-cover grayscale" alt="AI" />
               </div>
               <div className="flex items-center h-8">
                 <span className="text-sm text-gray-500 animate-pulse">Thinking...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Glass Style Like Bottom Bar */}
        <div className="flex-shrink-0 p-4 bg-black/80 backdrop-blur-md z-20 border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-3xl mx-auto">
            <div
              className="glass-card rounded-3xl p-1.5 relative flex items-end gap-2 group"
              style={{
                boxShadow: "0 0 40px -10px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)",
                background: "rgba(15, 15, 15, 0.7)",
                backdropFilter: "blur(20px)"
              }}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-500/5 via-purple-500/5 to-slate-500/5 opacity-50 blur-xl -z-10" />
              
              {/* Attachment Button - White Icon */}
              <button 
                className="p-3 rounded-full hover:bg-white/10 text-white hover:text-white transition-colors flex-shrink-0"
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={`Message ${selectedModel.name}...`}
                className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none text-white placeholder-gray-400 py-3 px-2 max-h-32 overflow-y-auto resize-none"
                disabled={isLoading}
              />
              
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-3 rounded-full transition-all flex items-center justify-center flex-shrink-0",
                  input.trim() && !isLoading
                    ? "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    : "bg-white/10 text-gray-400 cursor-not-allowed"
                )}
              >
                <Send size={20} />
              </button>
            </div>
            
            <p className="text-center text-[10px] text-gray-500 mt-3 font-medium tracking-wide">
              AI can occasionally make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}