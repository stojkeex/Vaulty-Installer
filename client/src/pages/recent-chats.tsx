import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import {
  ChevronLeft,
  Edit3,
  Inbox,
  MessageSquare,
  Search,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import verifiedBadge from "@assets/IMG_1076_1775576984427.png";
import { cn } from "@/lib/utils";

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
  const [, setLocation] = useLocation();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestCount, setRequestCount] = useState(0);
  const [showTab, setShowTab] = useState<"chats" | "requests">("chats");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user || authLoading) {
      setLoading(true);
      return;
    }

    setLoading(true);

    const chatsQuery = query(collection(db, "chats"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      try {
        const userChats = snapshot.docs.filter((chatDoc) => {
          const data = chatDoc.data();
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
              } catch (error) {
                console.error("Error fetching user:", error);
              }
            } else if (data.participants.includes("global")) {
              otherUser = { displayName: "Global Chat", photoURL: "", isGlobal: true };
            }

            return {
              id: chatDoc.id,
              ...data,
              otherUser,
            } as ChatPreview;
          }),
        );

        setChats(chatData);
        setLoading(false);
      } catch (error) {
        console.error("Error processing chats:", error);
        setLoading(false);
      }
    });

    const requestsQuery = query(collection(db, "messageRequests"), orderBy("timestamp", "desc"));

    const requestsUnsub = onSnapshot(requestsQuery, (snapshot) => {
      const count = snapshot.docs.filter((requestDoc) => requestDoc.data().recipientId === user.uid).length;
      setRequestCount(count);
    });

    return () => {
      unsubscribe();
      requestsUnsub();
    };
  }, [user, authLoading]);

  const filteredChats = useMemo(
    () => chats.filter((chat) => chat.otherUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())),
    [chats, searchQuery],
  );

  const getStatusText = (timestamp: any, isMe: boolean) => {
    if (!timestamp?.toDate) return isMe ? "Sent recently" : "Open conversation";
    const date = timestamp.toDate();
    const days = differenceInDays(new Date(), date);

    if (days < 1) return isMe ? "Sent today" : "Active today";
    if (days < 7) return isMe ? `Sent ${days}d ago` : `Active ${days}d ago`;
    return isMe ? "Earlier message" : "Quiet lately";
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-zinc-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-28 text-white">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-black/70 px-4 pb-4 pt-5 backdrop-blur-2xl">
        <div className="mx-auto max-w-md space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocation("/home")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
                data-testid="button-back-messages"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Vaulty Messages</p>
                <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
              </div>
            </div>

            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
              data-testid="button-edit-messages"
            >
              <Edit3 size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5">
            <button
              onClick={() => setShowTab("chats")}
              className={cn(
                "rounded-[18px] px-4 py-3 text-sm font-semibold transition-all",
                showTab === "chats"
                  ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.18)]"
                  : "text-zinc-400 hover:text-white",
              )}
              data-testid="button-tab-chats"
            >
              Messages
            </button>
            <button
              onClick={() => setShowTab("requests")}
              className={cn(
                "rounded-[18px] px-4 py-3 text-sm font-semibold transition-all",
                showTab === "requests"
                  ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.18)]"
                  : "text-zinc-400 hover:text-white",
              )}
              data-testid="button-tab-requests"
            >
              Requests {requestCount > 0 ? `(${requestCount})` : ""}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search messages"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 rounded-2xl border-white/10 bg-white/[0.04] pl-11 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20"
              data-testid="input-search-messages"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-5">
        {showTab === "chats" ? (
          <div className="space-y-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Conversations</h2>
                <span className="text-xs text-zinc-600">{filteredChats.length}</span>
              </div>

              <div className="space-y-3">
                {filteredChats.map((chat) => {
                  if (!chat.otherUser && !chat.participants.includes("global")) return null;

                  const isMe = chat.lastMessageSender === user?.uid;
                  const statusText = getStatusText(chat.lastMessageTimestamp, isMe);
                  const lastSeenDate = chat.otherUser?.lastSeen?.toDate?.();
                  const isOnline = lastSeenDate && new Date().getTime() - lastSeenDate.getTime() < 45000;
                  const destination = chat.otherUser?.isGlobal
                    ? "/messages/global"
                    : `/messages/user/${chat.participants.find((participant: string) => participant !== user?.uid)}`;

                  return (
                    <button
                      key={chat.id}
                      onClick={() => setLocation(destination)}
                      className="w-full rounded-[28px] border border-white/10 bg-white/[0.04] p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition-all hover:border-white/20 hover:bg-white/[0.07]"
                      data-testid={`button-open-chat-${chat.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <Avatar className="h-14 w-14 border border-white/10 bg-black/30">
                            <AvatarImage src={chat.otherUser?.photoURL} className="object-cover" />
                            <AvatarFallback>{chat.otherUser?.displayName?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          {isOnline && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#050505] bg-emerald-400" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <p className="truncate text-base font-semibold text-white" data-testid={`text-chat-name-${chat.id}`}>
                                {chat.otherUser?.displayName || "Unknown"}
                              </p>
                              {chat.otherUser?.badges?.includes("verified") && (
                                <img src={verifiedBadge} alt="Verified" className="h-4 w-4 shrink-0" />
                              )}
                            </div>
                            <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                              {chat.otherUser?.isGlobal ? "GLOBAL" : isOnline ? "LIVE" : "DM"}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-sm text-zinc-400" data-testid={`text-chat-preview-${chat.id}`}>
                            {chat.lastMessage || "Open the conversation"}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
                            <span>{statusText}</span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                              <Shield className="h-3 w-3" /> Private
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredChats.length === 0 && (
                  <div className="rounded-[32px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                      <Inbox className="h-6 w-6 text-zinc-500" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-white">No conversations yet</h3>
                    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-400">
                      Start chatting with people from Vaulty and your direct conversations will show up here.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-6 py-14 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/20">
              <MessageSquare className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">Requests inbox</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-400">
              {requestCount > 0
                ? `${requestCount} pending request${requestCount === 1 ? "" : "s"} waiting for your review.`
                : "No new requests right now. Your inbox is clean."}
            </p>
            <Button
              variant="outline"
              onClick={() => setLocation("/message-requests")}
              className="mt-6 h-11 rounded-2xl border-white/10 bg-white/5 px-5 text-white hover:bg-white/10"
              data-testid="button-view-message-requests"
            >
              View all requests
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
