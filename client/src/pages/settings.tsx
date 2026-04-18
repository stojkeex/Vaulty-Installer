import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { ChevronLeft, Bell, Lock, Shield, HelpCircle, LogOut, Moon, Globe, DollarSign, Check, EyeOff, Camera, MessageSquare, Volume2, Play, User, Zap } from "lucide-react";
import { useCurrency, type CurrencyCode } from "@/contexts/currency-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Helper to determine gender from voice name
const getVoiceGender = (name: string): "male" | "female" => {
  const lowerName = name.toLowerCase();
  
  const maleKeywords = ["male", "man", "boy", "david", "mark", "daniel", "fred", "alex", "bruce", "ralph", "oliver", "rishi", "luca", "thomas", "damien", "jorge", "juan", "maged", "tarik", "carlos", "nicolas", "felipe", "klause", "otto", "markus", "carl", "jan", "mikko", "jacques"];
  const femaleKeywords = ["female", "woman", "girl", "zira", "samantha", "victoria", "moira", "fiona", "tessa", "monica", "amelie", "anna", "joana", "sara", "alva", "lekha", "karen", "veena", "kyoko", "yuri", "ting-ting", "mei-jia", "sin-ji", "milena", "yelda", "nora", "paula", "clara", "marija"];
  
  if (maleKeywords.some(k => lowerName.includes(k))) return "male";
  if (femaleKeywords.some(k => lowerName.includes(k))) return "female";
  
  // Google voices defaults
  if (lowerName.includes("google")) {
      if (lowerName.includes("uk english male")) return "male";
      return "female"; // Most default Google voices are female-sounding
  }
  
  // Microsoft defaults
  if (lowerName.includes("microsoft")) {
      if (lowerName.includes("david") || lowerName.includes("mark")) return "male";
      if (lowerName.includes("zira")) return "female";
  }

  // Hash based fallback for stability
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash % 2 === 0 ? "male" : "female";
};

export default function Settings() {
  const { user, signOut } = useAuth();
  const [location, setLocation] = useLocation();
  const { currency, setCurrency } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [privateFollowing, setPrivateFollowing] = useState(false);
  const [profileZoomBlock, setProfileZoomBlock] = useState(false);
  const [messageRequestsEnabled, setMessageRequestsEnabled] = useState(true);
  const { toast } = useToast();
  
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [maleVoices, setMaleVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [femaleVoices, setFemaleVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [voiceTab, setVoiceTab] = useState<"male" | "female">("female");

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPrivateFollowing(data.privateFollowingList || false);
          setProfileZoomBlock(data.profileZoomBlock || false);
          setMessageRequestsEnabled(data.messageRequestsEnabled !== false);
        }
      }
    };
    fetchSettings();
  }, [user]);

  useEffect(() => {
    // Load voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      
      // Filter primarily for Slovenian and English
      // Prioritize: 
      // 1. Slovenian (sl-SI)
      // 2. English (en-US, en-GB)
      // 3. Others (fallback)
      
      const slovenian = availableVoices.filter(v => v.lang.includes('sl'));
      const english = availableVoices.filter(v => v.lang.startsWith('en'));
      
      // Combine them, putting Slovenian first
      const relevantVoices = [...slovenian, ...english];
      
      // Remove duplicates by name
      const uniqueVoices = Array.from(new Map(relevantVoices.map(item => [item.name, item])).values());

      setAllVoices(uniqueVoices);
      
      const male = uniqueVoices.filter(v => getVoiceGender(v.name) === "male");
      const female = uniqueVoices.filter(v => getVoiceGender(v.name) === "female");
      
      setMaleVoices(male);
      setFemaleVoices(female);

      const savedVoice = localStorage.getItem("vaulty_selected_voice");
      if (savedVoice) {
        setSelectedVoice(savedVoice);
        // Set initial tab based on saved voice
        if (male.some(v => v.name === savedVoice)) setVoiceTab("male");
        else setVoiceTab("female");
      } else if (uniqueVoices.length > 0) {
        // Default to first available
        setSelectedVoice(uniqueVoices[0].name);
        if (male.some(v => v.name === uniqueVoices[0].name)) setVoiceTab("male");
        else setVoiceTab("female");
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setLocation("/login");
  };

  const togglePrivateFollowing = async (checked: boolean) => {
    if (!user) return;
    setPrivateFollowing(checked);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        privateFollowingList: checked
      });
      toast({
        title: checked ? "Privacy Enabled" : "Privacy Disabled",
        description: checked ? "Your following list is now hidden from others." : "Your following list is now visible to everyone."
      });
    } catch (error) {
      console.error("Error updating privacy:", error);
      setPrivateFollowing(!checked);
      toast({
        title: "Error",
        description: "Failed to update privacy settings.",
        variant: "destructive"
      });
    }
  };

  const toggleProfileZoomBlock = async (checked: boolean) => {
    if (!user) return;
    setProfileZoomBlock(checked);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        profileZoomBlock: checked
      });
      toast({
        title: checked ? "Zoom Block Enabled" : "Zoom Block Disabled",
        description: checked ? "Profile picture zooming is now blocked." : "Profile picture zooming is now allowed."
      });
    } catch (error) {
      console.error("Error updating zoom block:", error);
      setProfileZoomBlock(!checked);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive"
      });
    }
  };

  const toggleMessageRequests = async (checked: boolean) => {
    if (!user) return;
    setMessageRequestsEnabled(checked);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        messageRequestsEnabled: checked
      });
      toast({
        title: checked ? "Message Requests Enabled" : "Message Requests Disabled",
        description: checked ? "You will receive message requests from users." : "Message requests are disabled."
      });
    } catch (error) {
      console.error("Error updating message requests:", error);
      setMessageRequestsEnabled(!checked);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive"
      });
    }
  };

  const handleVoicePreview = (voiceName: string) => {
    const voice = allVoices.find(v => v.name === voiceName);
    if (!voice) return;

    window.speechSynthesis.cancel();
    
    let text = "Hello, I am your Vaulty Assistant. I can help you with crypto and finance.";
    if (voice.lang.includes("sl")) {
        text = "Pozdravljeni, jaz sem vaš Vaulty asistent. Pomagam vam lahko pri kriptovalutah in financah.";
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.onstart = () => setSpeaking(voiceName);
    utterance.onend = () => setSpeaking(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleSetVoice = (voiceName: string) => {
    setSelectedVoice(voiceName);
    localStorage.setItem("vaulty_selected_voice", voiceName);
    toast({
      title: "Voice Updated",
      description: `Assistant voice set to ${voiceName}`,
    });
  };

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "GBP", label: "British Pound", symbol: "£" },
    { code: "JPY", label: "Japanese Yen", symbol: "¥" },
    { code: "AUD", label: "Australian Dollar", symbol: "A$" },
    { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
  ];

  const sections = [
    {
      title: "Account",
      items: [
        { icon: Bell, label: "Notifications", value: "On", action: () => {} },
        { 
          icon: EyeOff, 
          label: "Private Following List", 
          isToggle: true,
          checked: privateFollowing,
          onCheckedChange: togglePrivateFollowing
        },
        { 
          icon: Camera, 
          label: "Block Profile Zoom", 
          isToggle: true,
          checked: profileZoomBlock,
          onCheckedChange: toggleProfileZoomBlock
        },
        { 
          icon: MessageSquare, 
          label: "Message Requests", 
          isToggle: true,
          checked: messageRequestsEnabled,
          onCheckedChange: toggleMessageRequests
        },
        { icon: Shield, label: "Security", value: "", action: () => {} },
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Moon, label: "Dark Mode", value: "System", action: () => {} },
        { icon: Globe, label: "Language", value: "English", action: () => {} },
        { 
          icon: DollarSign, 
          label: "Currency", 
          value: currency, 
          action: () => setCurrencyOpen(true) 
        },
        {
          icon: Volume2,
          label: "AI Voice",
          value: selectedVoice ? (selectedVoice.length > 15 ? selectedVoice.slice(0, 15) + "..." : selectedVoice) : "Default",
          action: () => setVoiceOpen(true)
        }
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", value: "", action: () => setLocation("/support") },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <button onClick={() => setLocation("/profile")} className="p-2 hover:bg-white/10 rounded-full">
             <ChevronLeft size={24} />
           </button>
           <h1 className="font-bold text-lg">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="text-gray-500 font-bold text-sm uppercase tracking-wider px-2">{section.title}</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {section.items.map((item: any, idx) => (
                <div 
                  key={item.label} 
                  onClick={item.action}
                  className={`flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors ${idx !== section.items.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="text-gray-400" />
                    <span>{item.label}</span>
                  </div>
                  
                  {item.isToggle ? (
                    <Switch 
                      checked={item.checked} 
                      onCheckedChange={item.onCheckedChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="text-sm">{item.value}</span>
                      <ChevronLeft size={16} className="rotate-180" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={handleSignOut}
          className="w-full p-4 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
        
        <p className="text-center text-xs text-gray-600 pt-4">
          Version 1.0.0 • Vaulty
        </p>
      </div>

      <Dialog open={currencyOpen} onOpenChange={setCurrencyOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white w-[90%] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Select Currency</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 mt-4">
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  setCurrencyOpen(false);
                }}
                className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors ${
                  currency === c.code 
                    ? "bg-gray-500/20 text-gray-400" 
                    : "hover:bg-white/5 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold w-8 text-center bg-white/5 rounded-lg py-1">{c.symbol}</span>
                  <span>{c.label} ({c.code})</span>
                </div>
                {currency === c.code && <Check size={18} />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={voiceOpen} onOpenChange={setVoiceOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white w-[90%] max-h-[80vh] flex flex-col rounded-3xl p-0 overflow-hidden">
          <div className="p-6 pb-2">
            <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                    <Zap className="text-gray-400 fill-cyan-400" size={20} />
                    AI Voice Settings
                </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue={voiceTab} value={voiceTab} onValueChange={(v) => setVoiceTab(v as any)} className="w-full mt-4">
                <TabsList className="w-full bg-white/5 p-1 rounded-xl">
                    <TabsTrigger value="female" className="flex-1 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        Female
                    </TabsTrigger>
                    <TabsTrigger value="male" className="flex-1 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                        Male
                    </TabsTrigger>
                </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2">
            {(voiceTab === "male" ? maleVoices : femaleVoices).length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>No {voiceTab} voices found.</p>
                </div>
            ) : (
                (voiceTab === "male" ? maleVoices : femaleVoices).map((voice) => (
                  <div
                    key={voice.name}
                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                      selectedVoice === voice.name 
                        ? "bg-gradient-to-r from-[#00CCFF]/40 to-[#FF00BB] border border-gray-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
                        : "bg-white/5 border border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div 
                        className="flex-1 flex items-center gap-3 cursor-pointer"
                        onClick={() => handleSetVoice(voice.name)}
                    >
                      <div className={`p-2.5 rounded-full ${selectedVoice === voice.name ? "bg-gray-500 text-black" : "bg-white/10 text-gray-400"}`}>
                        <Volume2 size={18} />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className={`text-sm font-bold truncate ${selectedVoice === voice.name ? "text-gray-400" : "text-white"}`}>
                            {voice.name.replace(/Microsoft|Google|English|United States|Direct/g, "").trim() || voice.name}
                        </p>
                        <div className="flex items-center gap-2">
                             {voice.lang.includes("sl") && (
                                <span className="text-[10px] font-bold bg-white/20 text-white px-1.5 rounded">SLO</span>
                             )}
                             <p className="text-xs text-gray-500 truncate">{voice.lang}</p>
                        </div>
                      </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVoicePreview(voice.name);
                        }}
                        className={`p-3 rounded-full transition-all ${
                            speaking === voice.name 
                            ? "text-gray-400 bg-gray-500/20 animate-pulse" 
                            : "text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        {speaking === voice.name ? <Volume2 size={20} /> : <Play size={20} className="ml-0.5" />}
                    </button>
                  </div>
                ))
            )}
          </div>
          
          <div className="p-4 border-t border-white/10 bg-black/40 text-center">
             <p className="text-xs text-gray-500">
                Voices are provided by your browser/device.
             </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
