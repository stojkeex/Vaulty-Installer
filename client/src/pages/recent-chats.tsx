import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { ChevronLeft, Edit, Search, Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { differenceInDays, differenceInMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import verifiedBadge from '@assets/IMG_1076_1775576984427.png';

interface ChatPreview {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTimestamp: any;
  lastMessageSender: string;
  otherUser?: any;
}

export default function RecentChats() {
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestCount, setRequestCount] = useState(0);
  const [showTab, setShowTab] = useState<"chats" | "requests">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Companions state
  const [companions, setCompanions] = useState<any[]>([]);

  useEffect(() => {
    const loadCompanions = () => {
      const stored = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
      setCompanions(stored);
    };
    
    loadCompanions();
    window.addEventListener("storage", loadCompanions);
    window.addEventListener("focus", loadCompanions);
    
    return () => {
      window.removeEventListener("storage", loadCompanions);
      window.removeEventListener("focus", loadCompanions);
    };
  }, []);

  useEffect(() => {
    if (!user || authLoading) {
      setLoading(true);
      return;
    }

    setLoading(true);

    const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const userChats = snapshot.docs.filter((doc) => {
          const data = doc.data();
          return data.participants && data.participants.includes(user.uid);
        });

        const chatData = await Promise.all(
          userChats.map(async (chatDoc) => {
            const data = chatDoc.data();
            const otherUserId = data.participants.find((uid: string) => uid !== user.uid);
            
            let otherUser = null;
            if (otherUserId && otherUserId !== "global") {
              try {
                const userDoc = await getDoc(doc(db, "users", otherUserId));
                if (userDoc.exists()) {
                  otherUser = userDoc.data();
                }
              } catch (err) {
                console.error("Error fetching user:", err);
              }
            } else if (data.participants.includes("global")) {
              otherUser = { displayName: "Global Chat", photoURL: "", isGlobal: true };
            }

            return {
              id: chatDoc.id,
              ...data,
              otherUser
            } as ChatPreview;
          })
        );

        setChats(chatData);
        setLoading(false);
      } catch (err) {
        console.error("Error processing chats:", err);
        setLoading(false);
      }
    });

    const requestsQuery = query(
      collection(db, "messageRequests"),
      orderBy("timestamp", "desc")
    );

    const requestsUnsub = onSnapshot(requestsQuery, (snapshot) => {
      const count = snapshot.docs.filter(doc => doc.data().recipientId === user.uid).length;
      setRequestCount(count);
    });

    return () => {
      unsubscribe();
      requestsUnsub();
    };
  }, [user, authLoading]);

  const filteredChats = chats.filter(chat => 
    chat.otherUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanions = companions.filter(comp => 
    comp.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusText = (timestamp: any, isMe: boolean) => {
    if (!timestamp?.toDate) return isMe ? "sent" : "seen";
    const date = timestamp.toDate();
    const days = differenceInDays(new Date(), date);
    const prefix = isMe ? "sent" : "seen";
    
    if (days < 1) return `${prefix} today`;
    if (days < 7) return `${prefix} ${days}d ago`;
    return prefix;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#a0a0a0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-6 bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => setLocation("/")} className="text-white hover:text-zinc-300 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Vaulty Creator</h1>
        </div>
        <button className="text-white hover:text-zinc-300 transition-colors">
          <Edit size={22} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 px-4 py-2 border-b border-white/5 sticky top-[68px] z-10 bg-black/80 backdrop-blur-md">
        <button
          onClick={() => setShowTab("chats")}
          className={`font-bold text-sm transition-all pb-2 relative ${
            showTab === "chats" ? "text-white" : "text-zinc-500"
          }`}
        >
          Messages
          {showTab === "chats" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-700" />
          )}
        </button>
        <button
          onClick={() => setShowTab("requests")}
          className={`font-bold text-sm transition-all pb-2 relative ${
            showTab === "requests" ? "text-white" : "text-zinc-500"
          }`}
        >
          Requests
          {requestCount > 0 && (
            <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px]">
              {requestCount}
            </span>
          )}
          {showTab === "requests" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-700" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-gray-400 transition-colors" />
          <Input 
            placeholder="Search messages" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#111] border-none pl-10 h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-[#a0a0a0]/30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-2 pb-24 overflow-y-auto">
        {showTab === "chats" ? (
          <div className="space-y-1">
            {/* AI Companions */}
            {filteredCompanions.map(comp => (
              <div 
                key={comp.id} 
                onClick={() => setLocation(`/messages/${comp.id}`)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <Avatar className="w-12 h-12 border border-[#a0a0a0]/20">
                  <AvatarImage src={`/${comp.avatar}`} className="object-cover" />
                  <AvatarFallback>{comp.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-[15px] truncate">{comp.name}</h3>
                    <span className="text-[10px] text-zinc-500">Companion</span>
                  </div>
                  <p className="text-zinc-500 text-xs truncate">AI Companion active</p>
                </div>
              </div>
            ))}

            {/* Regular Chats */}
            {filteredChats.map((chat) => {
              if (!chat.otherUser && !chat.participants.includes("global")) return null;
              
              const isMe = chat.lastMessageSender === user?.uid;
              const statusText = getStatusText(chat.lastMessageTimestamp, isMe);
              const lastSeenDate = chat.otherUser?.lastSeen?.toDate();
              const isOnline = lastSeenDate && (new Date().getTime() - lastSeenDate.getTime()) < 45000;
              
              return (
                <div 
                  key={chat.id} 
                  onClick={() => 
                    setLocation(
                      chat.otherUser?.isGlobal 
                        ? `/messages/global` 
                        : `/messages/user/${chat.participants.find((p: string) => p !== user?.uid)}`
                    )
                  }
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12 border border-white/5">
                      <AvatarImage src={chat.otherUser?.photoURL} className="object-cover" />
                      <AvatarFallback>{chat.otherUser?.displayName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <h3 className="text-white font-bold text-[15px] truncate">{chat.otherUser?.displayName || "Unknown"}</h3>
                        {chat.otherUser?.badges?.includes("verified") && (
                          <img src={verifiedBadge} alt="Verified" className="w-5 h-5 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-zinc-500 text-xs truncate">
                      {statusText}
                    </p>
                  </div>
                </div>
              );
            })}

            {filteredChats.length === 0 && filteredCompanions.length === 0 && (
              <div className="text-center text-zinc-600 py-20 text-sm">
                No conversations found
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center border border-white/5">
                <Plus className="text-zinc-500" size={24} />
             </div>
             <p className="text-zinc-500 text-sm">No new requests</p>
             <Button
                variant="outline"
                onClick={() => setLocation("/message-requests")}
                className="border-white/10 text-xs h-8 rounded-full"
              >
                View all requests
              </Button>
          </div>
        )}
      </div>

      {/* Floating Bottom Button */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-20 pointer-events-none">
        <Button 
          onClick={() => setLocation("/create-companion")}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-700 text-black font-black uppercase tracking-widest shadow-[0_8px_30px_rgba(0,211,253,0.3)] pointer-events-auto active:scale-95 transition-all border-none"
        >
          <Plus className="mr-2" size={20} strokeWidth={3} />
          Create Companion
        </Button>
      </div>
    </div>
  );
}
