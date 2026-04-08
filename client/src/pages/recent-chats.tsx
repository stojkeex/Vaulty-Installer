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
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="sticky top-0 z-30 border-b border-white/6 bg-black/95 backdrop-blur-xl">
        <div className="mx-auto max-w-md px-5 pb-4 pt-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[2rem] font-black tracking-[-0.05em] text-white" data-testid="text-messages-title">
              Vaulty Message
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
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md px-5 pb-10 pt-3">
          {requestCount > 0 && (
            <button
              onClick={() => setLocation("/message-requests")}
              className="mb-3 flex w-full items-center justify-between rounded-[22px] bg-[#141416] px-4 py-4 text-left transition-colors hover:bg-[#1a1a1d]"
              data-testid="button-view-message-requests"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#202024]">
                  <MessageSquare className="h-5 w-5 text-zinc-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Requests</p>
                  <p className="text-sm text-zinc-400">
                    {requestCount} pending request{requestCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">Open</span>
            </button>
          )}

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
        </div>
      </div>
    </div>
  );
}
