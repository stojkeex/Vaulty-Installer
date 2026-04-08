import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import {
  Edit3,
  Inbox,
  MessageSquare,
  MoreHorizontal,
  Search,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInDays } from "date-fns";
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
    () => chats.filter((chat) => (chat.otherUser?.displayName || "").toLowerCase().includes(searchQuery.toLowerCase())),
    [chats, searchQuery],
  );

  const featuredChats = useMemo(() => filteredChats.slice(0, 7), [filteredChats]);

  const getStatusText = (timestamp: any, isMe: boolean) => {
    if (!timestamp?.toDate) return isMe ? "Sent recently" : "Open conversation";
    const date = timestamp.toDate();
    const days = differenceInDays(new Date(), date);

    if (days < 1) return isMe ? "Sent today" : "Active today";
    if (days < 7) return isMe ? `Sent ${days}d ago` : `Active ${days}d ago`;
    return isMe ? "Earlier message" : "Quiet lately";
  };

  const getTimeLabel = (timestamp: any) => {
    if (!timestamp?.toDate) return "";

    const date = timestamp.toDate();
    const days = differenceInDays(new Date(), date);

    if (days < 1) {
      return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }

    if (days < 7) {
      return new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
      }).format(date);
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-zinc-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-28 text-white">
      <div className="mx-auto max-w-md px-5 pb-10 pt-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[2.2rem] font-black tracking-[-0.06em] text-white" data-testid="text-messages-title">
            message
          </h1>

          <div className="flex items-center gap-2">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f21] text-white transition-colors hover:bg-[#2a2a2d]"
              data-testid="button-edit-messages"
            >
              <Edit3 size={19} />
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f21] text-white transition-colors hover:bg-[#2a2a2d]"
              data-testid="button-more-messages"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search messages"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-14 rounded-full border-0 bg-[#2a2a2d] pl-11 text-base text-white placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            data-testid="input-search-messages"
          />
        </div>

        {(featuredChats.length > 0 || requestCount > 0) && (
          <div className="mt-5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-4 pr-5">
              <button
                onClick={() => setShowTab("requests")}
                className="w-[78px] shrink-0 text-left"
                data-testid="button-story-requests"
              >
                <div className="relative flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#1f1f21] ring-1 ring-white/6 transition-transform duration-200 hover:scale-[1.02]">
                  <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#2a2a2d] text-lg font-bold text-white">
                    {requestCount}
                  </div>
                </div>
                <p className="mt-2 truncate text-center text-[13px] text-zinc-300">Requests</p>
              </button>

              {featuredChats.map((chat) => {
                const lastSeenDate = chat.otherUser?.lastSeen?.toDate?.();
                const isOnline = lastSeenDate && new Date().getTime() - lastSeenDate.getTime() < 45000;
                const destination = chat.otherUser?.isGlobal
                  ? "/messages/global"
                  : `/messages/user/${chat.participants.find((participant: string) => participant !== user?.uid)}`;

                return (
                  <button
                    key={`story-${chat.id}`}
                    onClick={() => setLocation(destination)}
                    className="w-[78px] shrink-0 text-left"
                    data-testid={`button-story-chat-${chat.id}`}
                  >
                    <div className="relative">
                      <Avatar className="h-[78px] w-[78px] ring-1 ring-white/10 transition-transform duration-200 hover:scale-[1.02]">
                        <AvatarImage src={chat.otherUser?.photoURL} className="object-cover" />
                        <AvatarFallback>{chat.otherUser?.displayName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      {isOnline && <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-black bg-[#31d158]" />}
                    </div>
                    <p className="mt-2 truncate text-center text-[13px] text-zinc-300">
                      {chat.otherUser?.displayName || "Unknown"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setShowTab("chats")}
            className={cn(
              "rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors",
              showTab === "chats" ? "bg-[#1f3b80] text-[#6fa0ff]" : "bg-[#1f1f21] text-white",
            )}
            data-testid="button-tab-all"
          >
            All
          </button>
          <button
            onClick={() => setShowTab("requests")}
            className={cn(
              "rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors",
              showTab === "requests" ? "bg-[#1f3b80] text-[#6fa0ff]" : "bg-[#1f1f21] text-white",
            )}
            data-testid="button-tab-requests"
          >
            Requests{requestCount > 0 ? ` (${requestCount})` : ""}
          </button>
          <div className="rounded-full bg-[#1f1f21] px-5 py-2.5 text-[15px] font-semibold text-white/80" data-testid="status-private-pill">
            Private
          </div>
          <button
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1f1f21] text-white transition-colors hover:bg-[#2a2a2d]"
            data-testid="button-more-filters"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="mt-5">
          {showTab === "chats" ? (
            <div className="space-y-1">
              {filteredChats.map((chat) => {
                if (!chat.otherUser && !chat.participants.includes("global")) return null;

                const isMe = chat.lastMessageSender === user?.uid;
                const statusText = getStatusText(chat.lastMessageTimestamp, isMe);
                const timeLabel = getTimeLabel(chat.lastMessageTimestamp);
                const lastSeenDate = chat.otherUser?.lastSeen?.toDate?.();
                const isOnline = lastSeenDate && new Date().getTime() - lastSeenDate.getTime() < 45000;
                const destination = chat.otherUser?.isGlobal
                  ? "/messages/global"
                  : `/messages/user/${chat.participants.find((participant: string) => participant !== user?.uid)}`;
                const previewText = chat.lastMessage || "Open the conversation";

                return (
                  <button
                    key={chat.id}
                    onClick={() => setLocation(destination)}
                    className="group flex w-full items-start gap-3 rounded-[22px] px-1 py-3 text-left transition-colors hover:bg-white/[0.04]"
                    data-testid={`button-open-chat-${chat.id}`}
                  >
                    <div className="relative shrink-0 pt-0.5">
                      <Avatar className="h-16 w-16 bg-[#151515]">
                        <AvatarImage src={chat.otherUser?.photoURL} className="object-cover" />
                        <AvatarFallback>{chat.otherUser?.displayName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      {isOnline && <div className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-black bg-[#31d158]" />}
                    </div>

                    <div className="min-w-0 flex-1 border-b border-white/6 pb-3 group-last:border-b-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <p className="truncate text-[1.02rem] font-semibold text-white" data-testid={`text-chat-name-${chat.id}`}>
                              {chat.otherUser?.displayName || "Unknown"}
                            </p>
                            {chat.otherUser?.badges?.includes("verified") && (
                              <img src={verifiedBadge} alt="Verified" className="h-4 w-4 shrink-0" />
                            )}
                          </div>

                          <p className="mt-1 truncate text-[0.98rem] text-zinc-400" data-testid={`text-chat-preview-${chat.id}`}>
                            {isMe ? `You: ${previewText}` : previewText}
                          </p>

                          <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1">
                              <Shield className="h-3 w-3" />
                              {chat.otherUser?.isGlobal ? "Global" : "Private"}
                            </span>
                            <span className="truncate">{statusText}</span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
                          <span className="text-[13px] text-zinc-500">{timeLabel}</span>
                          {isOnline ? <div className="h-2.5 w-2.5 rounded-full bg-[#31d158]" /> : <div className="h-2.5 w-2.5 rounded-full bg-transparent" />}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredChats.length === 0 && (
                <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1f1f21]">
                    <Inbox className="h-6 w-6 text-zinc-500" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">No conversations yet</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-400">
                    Start chatting with people from Vaulty and your message list will appear here.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[30px] bg-[#141416] px-6 py-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#202024]">
                <MessageSquare className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">Requests</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-400">
                {requestCount > 0
                  ? `${requestCount} pending request${requestCount === 1 ? "" : "s"} waiting for your review.`
                  : "No new requests right now. Your inbox is clean."}
              </p>
              <button
                onClick={() => setLocation("/message-requests")}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                data-testid="button-view-message-requests"
              >
                View all requests
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
