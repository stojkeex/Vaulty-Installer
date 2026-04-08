import { useEffect, useMemo, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import {
  ChevronLeft,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
} from "lucide-react";
import verifiedBadge from "@assets/IMG_1076_1775576984427.png";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  limit,
  Timestamp,
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

const getLastSeenText = (targetUser: any) => {
  if (targetUser?.isGlobal) {
    return "Always active";
  }

  if (!targetUser?.lastSeen?.toDate) {
    return "Seen recently";
  }

  const lastSeenDate = targetUser.lastSeen.toDate();
  const now = new Date();
  const diffInMs = now.getTime() - lastSeenDate.getTime();

  if (diffInMs < 45000) {
    return "Active now";
  }

  return `Seen ${formatDistanceToNow(lastSeenDate, { addSuffix: true }).replace("about ", "")}`;
};

const formatMessageTime = (timestamp: any) => {
  if (!timestamp?.toDate) return "";
  return format(timestamp.toDate(), "HH:mm");
};

export default function Chat() {
  const [, params] = useRoute("/messages/user/:id");
  const targetUserId = params?.id || (window.location.pathname.endsWith("/global") ? "global" : null);
  const isGlobal = window.location.pathname.endsWith("/global");

  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatData, setChatData] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    const unsubscribeUser = onSnapshot(doc(db, "users", targetUserId), (snapshot) => {
      if (snapshot.exists()) {
        setTargetUser(snapshot.data());
      }
    });

    const unsubscribeChat = onSnapshot(doc(db, "chats", generatedChatId), (snapshot) => {
      if (snapshot.exists()) {
        setChatData(snapshot.data());
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeChat();
    };
  }, [user, targetUserId, isGlobal]);

  useEffect(() => {
    if (!chatId) return;

    const messageQuery = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"), limit(100));

    const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
      const nextMessages = snapshot.docs.map((messageDoc) => ({
        id: messageDoc.id,
        ...messageDoc.data(),
      } as Message));

      setMessages(nextMessages);

      if (user && !isGlobal) {
        snapshot.docs.forEach((messageDoc) => {
          const data = messageDoc.data();
          if (data.senderId !== user.uid && !data.read) {
            updateDoc(messageDoc.ref, { read: true });
          }
        });
      }
    });

    return () => unsubscribe();
  }, [chatId, user, isGlobal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
  }, [inputText]);

  const onlineState = useMemo(() => {
    if (targetUser?.isGlobal) {
      return { label: "Live room", active: true };
    }

    const active = !!targetUser?.lastSeen?.toDate && new Date().getTime() - targetUser.lastSeen.toDate().getTime() < 45000;
    return {
      label: getLastSeenText(targetUser),
      active,
    };
  }, [targetUser]);

  const handleSend = async (imageURL?: string) => {
    if ((!inputText.trim() && !imageURL) || !user || !chatId) return;

    const text = inputText;
    setInputText("");

    try {
      await setDoc(
        doc(db, "chats", chatId),
        {
          participants: isGlobal ? ["global"] : [user.uid, targetUserId],
          lastMessage: imageURL ? "📷 Photo" : text,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSender: user.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      const messageData: any = {
        text: text || "",
        senderId: user.uid,
        senderName: user.displayName || "User",
        timestamp: serverTimestamp(),
        read: false,
        type: imageURL ? "image" : "text",
      };

      if (imageURL) {
        messageData.imageURL = imageURL;
      }

      await addDoc(collection(db, "chats", chatId, "messages"), messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      const base64 = loadEvent.target?.result as string;
      handleSend(base64);
    };
    reader.readAsDataURL(file);
  };

  const groupedMessageDates = useMemo(() => {
    return messages.map((message, index) => {
      const previous = messages[index - 1];
      const showDateDivider =
        index === 0 ||
        (previous?.timestamp?.toMillis &&
          message.timestamp?.toMillis &&
          message.timestamp.toMillis() - previous.timestamp.toMillis() > 300000);

      return {
        message,
        showDateDivider,
      };
    });
  }, [messages]);

  return (
    <div className="fixed inset-0 z-40 flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_26%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={chatData?.background ? {
          background: chatData.background.type === "image"
            ? `url(${chatData.background.value}) center/cover no-repeat`
            : chatData.background.value,
        } : undefined}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34),rgba(5,5,5,0.92)_18%,rgba(5,5,5,0.92)_80%,rgba(0,0,0,0.4))]" />

      <div className="sticky top-0 z-30 shrink-0 border-b border-white/8 bg-black/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setLocation("/messages")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1c1c1f] text-white transition-colors hover:bg-[#26262a]"
              data-testid="button-back-chat"
            >
              <ChevronLeft size={20} />
            </button>

            <div
              onClick={() => !isGlobal && setLocation(`/messages/${targetUserId}/info`)}
              className={cn("flex min-w-0 items-center gap-3", !isGlobal && "cursor-pointer")}
              data-testid="button-open-chat-user-info"
            >
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12 ring-1 ring-white/10">
                  <AvatarImage src={targetUser?.photoURL} className="object-cover" />
                  <AvatarFallback>{targetUser?.displayName?.[0] || "?"}</AvatarFallback>
                </Avatar>
                {onlineState.active && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black bg-[#31d158]" />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="truncate text-[1rem] font-semibold text-white" data-testid="text-chat-user-name">
                    {targetUser?.displayName || "Loading..."}
                  </h1>
                  {targetUser?.badges?.includes("verified") && <img src={verifiedBadge} alt="Verified" className="h-4 w-4 shrink-0" />}
                </div>
                <p className="mt-0.5 truncate text-[13px] text-zinc-400" data-testid="text-chat-user-status">
                  {onlineState.label}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowInfoMenu((current) => !current)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1c1c1f] text-zinc-300 transition-colors hover:bg-[#26262a]"
                data-testid="button-chat-more"
              >
                <MoreVertical size={16} />
              </button>

              <AnimatePresence>
                {showInfoMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#111113]/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
                  >
                    {!isGlobal && (
                      <button
                        onClick={() => {
                          setLocation(`/messages/${targetUserId}/info`);
                          setShowInfoMenu(false);
                        }}
                        className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                        data-testid="button-chat-menu-profile"
                      >
                        View profile
                      </button>
                    )}
                    <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10" data-testid="button-chat-menu-media">
                      Shared media
                    </button>
                    <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-white/10" data-testid="button-chat-menu-report">
                      Report user
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-md flex-col gap-3 px-4 pb-28 pt-5">
          {messages.length === 0 && (
            <div className="rounded-[30px] bg-[#111113] px-6 py-14 text-center shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.05]">
                <Smile className="h-6 w-6 text-zinc-500" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-white">Start the conversation</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-400">
                Send the first message and keep the thread clean, calm, and private.
              </p>
            </div>
          )}

          {groupedMessageDates.map(({ message, showDateDivider }, index) => {
            const isMe = message.senderId === user?.uid;

            return (
              <div key={message.id} className="w-full">
                {message.type === "system" ? (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] text-zinc-400" data-testid={`text-chat-system-${message.id}`}>
                      {message.text}
                    </span>
                  </div>
                ) : (
                  <>
                    {showDateDivider && message.timestamp?.toDate && (
                      <div className="my-5 flex justify-center">
                        <span className="rounded-full bg-[#151518] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                          {format(message.timestamp.toDate(), "eeee, MMM d")}
                        </span>
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", isMe ? "justify-end" : "justify-start")}
                    >
                      <div className={cn("flex max-w-[82%] flex-col", isMe ? "items-end" : "items-start")}>
                        {message.imageURL ? (
                          <div
                            className={cn(
                              "w-fit overflow-hidden rounded-[22px] border shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl",
                              isMe
                                ? "border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))]"
                                : "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))]",
                            )}
                          >
                            <img
                              src={message.imageURL}
                              alt="Sent"
                              className="max-h-[420px] w-full object-cover"
                              data-testid={`image-chat-message-${message.id}`}
                            />
                            <div className={cn("flex items-center justify-end gap-2 px-3 py-2 text-[11px]", isMe ? "bg-black/20 text-white/80" : "bg-black/30 text-zinc-300")}>
                              <span>{formatMessageTime(message.timestamp)}</span>
                              {isMe && <span>{message.read ? "Seen" : "Sent"}</span>}
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "inline-block w-fit max-w-full rounded-[22px] border px-3.5 py-2.5 shadow-[0_18px_48px_rgba(0,0,0,0.2)] backdrop-blur-xl",
                              isMe
                                ? "rounded-br-[8px] border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] text-white"
                                : "rounded-bl-[8px] border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] text-white",
                            )}
                            data-testid={`bubble-chat-message-${message.id}`}
                          >
                            <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.5]">{message.text}</p>
                          </div>
                        )}

                        <div className={cn("mt-1.5 flex items-center gap-2 px-1 text-[11px] text-zinc-500", isMe ? "justify-end" : "justify-start")}>
                          <span data-testid={`text-chat-message-time-${message.id}`}>{formatMessageTime(message.timestamp)}</span>
                          {isMe && <span>{message.read ? "Read" : "Delivered"}</span>}
                          {!isMe && index === messages.length - 1 && !isGlobal && <span>{onlineState.active ? "Online" : "Inbox"}</span>}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 z-30 shrink-0 border-t border-white/8 bg-black/75 backdrop-blur-2xl">
        <div className="mx-auto max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div
            className="relative flex items-end gap-2 rounded-[32px] border border-white/10 bg-[rgba(15,15,15,0.72)] p-1.5 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.1)]"
            style={{
              background: "rgba(15, 15, 15, 0.7)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-r from-gray-500/5 via-purple-500/5 to-slate-500/5 opacity-50 blur-xl" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              data-testid="button-chat-attach-image"
            >
              <Paperclip size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="flex min-h-[52px] flex-1 items-center">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${targetUser?.displayName || "Vaulty"}...`}
                rows={1}
                className="max-h-[140px] w-full resize-none overflow-y-auto bg-transparent px-1 py-3 text-[15px] leading-6 text-white outline-none placeholder:text-zinc-400"
                data-testid="input-chat-message"
              />
            </div>

            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all",
                inputText.trim()
                  ? "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  : "bg-white/10 text-gray-400 cursor-not-allowed"
              )}
              data-testid="button-send-chat-message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
