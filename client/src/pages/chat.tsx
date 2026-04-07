import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { ChevronLeft, Image as ImageIcon, Send, Smile, X, MoreVertical } from "lucide-react";
import verifiedBadge from '@assets/IMG_1076_1775576984427.png';
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, serverTimestamp, doc, setDoc, 
  updateDoc, limit, Timestamp
} from "firebase/firestore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  imageURL?: string;
  senderId: string;
  senderName?: string;
  timestamp: Timestamp;
  read?: boolean;
  type?: "text" | "image" | "system";
}

export default function Chat() {
  const [match, params] = useRoute("/messages/user/:id");
  const targetUserId = params?.id || (window.location.pathname.endsWith('/global') ? "global" : null);
  const isGlobal = window.location.pathname.endsWith('/global');
  
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const [chatData, setChatData] = useState<any>(null);

  // Determine Chat ID and listen to chat settings
  useEffect(() => {
    if (!user || !targetUserId) return;
    if (isGlobal) {
      setChatId("global");
      setTargetUser({ displayName: "Global Chat", photoURL: "", isGlobal: true });
      return;
    }
    const ids = [user.uid, targetUserId].sort();
    const generatedChatId = `${ids[0]}_${ids[1]}`;
    setChatId(generatedChatId);

    const unsubscribeUser = onSnapshot(doc(db, "users", targetUserId), (snap) => {
      if (snap.exists()) {
        setTargetUser(snap.data());
      }
    });

    const unsubscribeChat = onSnapshot(doc(db, "chats", generatedChatId), (snap) => {
      if (snap.exists()) {
        setChatData(snap.data());
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeChat();
    };
  }, [user, targetUserId, isGlobal]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(msgs);

      if (user && !isGlobal) {
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.senderId !== user.uid && !data.read) {
            updateDoc(doc.ref, { read: true });
          }
        });
      }
    });

    return () => unsubscribe();
  }, [chatId, user, isGlobal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (imageURL?: string) => {
    if ((!inputText.trim() && !imageURL) || !user || !chatId) return;
    
    const text = inputText;
    setInputText("");
    setReplyingTo(null);

    try {
      await setDoc(doc(db, "chats", chatId), {
        participants: isGlobal ? ["global"] : [user.uid, targetUserId],
        lastMessage: imageURL ? "📷 Image" : text,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSender: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const messageData: any = {
        text: text || "",
        senderId: user.uid,
        senderName: user.displayName || "User",
        timestamp: serverTimestamp(),
        read: false
      };

      if (imageURL) messageData.imageURL = imageURL;

      await addDoc(collection(db, "chats", chatId, "messages"), messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        handleSend(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp?.toDate) return "";
    return format(timestamp.toDate(), "HH:mm");
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
        {chatData?.background ? (
          <div 
            className="absolute inset-0 z-0" 
            style={{ 
              background: chatData.background.type === 'image' 
                ? `url(${chatData.background.value}) center/cover no-repeat` 
                : chatData.background.value 
            }}
          />
        ) : (
          <div 
            className="absolute inset-0 opacity-[0.1] pointer-events-none z-0" 
            style={{ 
              backgroundImage: `url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-dark-background-whatsapp.jpg')`,
              backgroundBlendMode: 'overlay',
              filter: 'invert(1)'
            }}
          />
        )}
        
        {/* Header */}
        <div className="px-4 py-3 bg-zinc-900/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <button onClick={() => setLocation("/messages")} className="text-white hover:bg-white/10 p-1 rounded-full transition-colors">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex items-center gap-2">
                    <Avatar className="w-10 h-10 border border-white/10">
                        <AvatarImage src={targetUser?.photoURL} />
                        <AvatarFallback>{targetUser?.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div 
                      onClick={() => !isGlobal && setLocation(`/messages/${targetUserId}/info`)}
                      className={!isGlobal ? "cursor-pointer group" : ""}
                    >
                        <div className="flex items-center gap-1">
                          <h2 className="font-bold text-[15px] leading-tight group-hover:text-gray-300 transition-colors">{targetUser?.displayName || "Loading..."}</h2>
                          {targetUser?.badges?.includes("verified") && (
                            <img src={verifiedBadge} alt="Verified" className="w-4 h-4" />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-tight">
                            {(() => {
                                if (!targetUser?.lastSeen) return "last seen long ago";
                                const lastSeenDate = targetUser.lastSeen.toDate();
                                const now = new Date();
                                const diffInMs = now.getTime() - lastSeenDate.getTime();
                                if (diffInMs < 45000) return <span className="text-blue-400">active now</span>;
                                return `last seen ${formatDistanceToNow(lastSeenDate, { addSuffix: true }).replace("about ", "")}`;
                            })()}
                        </p>
                    </div>
                </div>
            </div>
            <div className="relative">
                <button onClick={() => setShowInfoMenu(!showInfoMenu)} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MoreVertical size={22} />
                </button>
                <AnimatePresence>
                  {showInfoMenu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 min-w-48 shadow-2xl"
                    >
                      <button 
                        onClick={() => !isGlobal && setLocation(`/messages/${targetUserId}/info`)}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 transition-colors"
                      >
                        Profile Info
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 transition-colors text-red-400">
                        Report User
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24 scrollbar-hide">
            {messages.map((msg, index) => {
                const isMe = msg.senderId === user?.uid;
                const showTime = index === 0 || (messages[index-1]?.timestamp?.toMillis && msg.timestamp?.toMillis && msg.timestamp.toMillis() - messages[index-1].timestamp.toMillis() > 300000);

                return (
                    <div key={msg.id} className="w-full">
                        {msg.type === "system" ? (
                          <div className="flex justify-center my-4">
                            <span className="text-[10px] font-medium text-zinc-500 bg-zinc-900/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                              {msg.text}
                            </span>
                          </div>
                        ) : (
                          <>
                            {showTime && msg.timestamp && (
                              <div className="flex justify-center my-6">
                                <span className="text-[12px] font-medium text-zinc-400 bg-zinc-900/50 backdrop-blur-md border border-white/5 px-4 py-1.5 rounded-full shadow-sm">
                                  {format(msg.timestamp.toDate(), "eeee dd.MM.yyyy")}
                                </span>
                              </div>
                            )}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("flex w-full mb-2", isMe ? "justify-end" : "justify-start")}
                            >
                                <div className={cn("max-w-[85%] relative")}>
                                    {msg.imageURL ? (
                                      <div className={cn(
                                        "relative rounded-[20px] overflow-hidden border border-white/10 shadow-lg group mb-1",
                                        isMe ? "bg-zinc-800" : "bg-zinc-900"
                                      )}>
                                        <img 
                                          src={msg.imageURL} 
                                          alt="Sent" 
                                          className="w-full h-auto max-h-[400px] object-cover"
                                          onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                                        />
                                        {/* Overlay for time/seen on image */}
                                        <div className="absolute bottom-0 right-0 left-0 p-2 bg-gradient-to-t from-black/60 to-transparent flex justify-end items-center gap-1.5">
                                          <span className="text-[10px] text-white/90 font-light">
                                            {formatMessageTime(msg.timestamp)}
                                          </span>
                                          {isMe && (
                                            <div className="flex">
                                              {msg.read ? (
                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M12.5 4.5L6.5 10.5L3.5 7.5" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                  <path d="M15.5 4.5L9.5 10.5L8 9" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                              ) : (
                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M12.5 4.5L6.5 10.5L3.5 7.5" stroke="#8696a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                  <path d="M15.5 4.5L9.5 10.5L8 9" stroke="#8696a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className={cn(
                                          "px-4 py-2 shadow-lg relative border border-white/5",
                                          isMe 
                                            ? "bg-gradient-to-br from-zinc-700 via-zinc-800 to-black text-white rounded-l-[30px] rounded-r-[5px]" 
                                            : "bg-zinc-900/80 backdrop-blur-md text-white rounded-r-[30px] rounded-l-[5px]"
                                      )}>
                                          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-1">
                                            <p className="text-[15px] leading-snug break-words">
                                              {msg.text}
                                            </p>
                                            <div className="flex items-center gap-1 ml-auto">
                                              <span className="text-[10px] text-zinc-500 font-light whitespace-nowrap">
                                                {formatMessageTime(msg.timestamp)}
                                              </span>
                                              {isMe && (
                                                <div className="flex">
                                                  {msg.read ? (
                                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                      <path d="M12.5 4.5L6.5 10.5L3.5 7.5" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                      <path d="M15.5 4.5L9.5 10.5L8 9" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                  ) : (
                                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                      <path d="M12.5 4.5L6.5 10.5L3.5 7.5" stroke="#8696a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                      <path d="M15.5 4.5L9.5 10.5L8 9" stroke="#8696a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                      </div>
                                    )}
                                </div>
                            </motion.div>
                          </>
                        )}
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-zinc-900/80 backdrop-blur-xl border-t border-white/10">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 flex-1 border border-white/10 focus-within:border-white/20 transition-all">
                    <button onClick={() => fileInputRef.current?.click()} className="text-zinc-400 hover:text-white transition-colors">
                        <ImageIcon size={20} />
                    </button>
                    <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <input 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a message"
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-500 text-[15px]"
                    />
                    <button className="text-zinc-400 hover:text-white transition-colors">
                        <Smile size={20} />
                    </button>
                </div>
                <button 
                  onClick={() => handleSend()} 
                  className="bg-white text-black p-3 rounded-full shadow-lg active:scale-95 transition-transform hover:bg-gray-200"
                >
                    <Send size={20} fill="black" />
                </button>
            </div>
        </div>
    </div>
  );
}
