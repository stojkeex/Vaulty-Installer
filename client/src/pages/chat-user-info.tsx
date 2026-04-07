import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { ChevronLeft, Bell, Lock, Search, Phone, Video, MoreVertical, Pin, Palette, Upload, Check, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PinnedMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  timestamp: any;
}

const PRESET_BACKGROUNDS = [
  { id: 'black', name: 'Original', value: '#000000', type: 'color' },
  { id: 'dark-gray', name: 'Anthracite', value: '#1a1a1a', type: 'color' },
  { id: 'night-blue', name: 'Night Blue', value: '#0a192f', type: 'color' },
  { id: 'deep-purple', name: 'Deep Purple', value: '#1a0b2e', type: 'color' },
  { id: 'forest', name: 'Deep Forest', value: '#0a1a0f', type: 'color' },
  { id: 'sunset', name: 'Sunset Glow', value: 'linear-gradient(to bottom right, #2c0b2e, #1a0b2e, #000000)', type: 'gradient' },
  { id: 'ocean', name: 'Ocean Depth', value: 'linear-gradient(to bottom right, #0a192f, #001a33, #000000)', type: 'gradient' },
  { id: 'midnight', name: 'Midnight', value: 'linear-gradient(to bottom, #111111, #000000)', type: 'gradient' },
  { id: 'emerald-pulse', name: 'Emerald Pulse', value: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', type: 'gradient' },
  { id: 'ruby-glaze', name: 'Ruby Glaze', value: 'linear-gradient(135deg, #450a0a 0%, #000000 100%)', type: 'gradient' },
];

export default function ChatUserInfo() {
  const [match, params] = useRoute("/messages/:userId/info");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const userId = params?.userId;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetUser, setTargetUser] = useState<any>(null);
  const [mediaImages, setMediaImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingBg, setUpdatingBg] = useState(false);
  const [chatData, setChatData] = useState<any>(null);

  const chatId = user && userId ? [user.uid, userId].sort().join('_') : null;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !user || !chatId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setTargetUser(userDoc.data());
        }

        const chatDoc = await getDoc(doc(db, "chats", chatId));
        if (chatDoc.exists()) {
          setChatData(chatDoc.data());
        }
        
        const messagesQuery = query(
          collection(db, "chats", chatId, "messages"),
          where("imageURL", "!=", null)
        );
        const messagesSnap = await getDocs(messagesQuery);
        
        const images = messagesSnap.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          }));
        
        setMediaImages(images);

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, user, chatId]);

  const handleUpdateBackground = async (bg: { type: string, value: string }) => {
    if (!chatId || !user) return;
    setUpdatingBg(true);
    try {
      await updateDoc(doc(db, "chats", chatId), {
        background: bg
      });

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: `${user.displayName} changed the chat background`,
        senderId: "system",
        timestamp: serverTimestamp(),
        type: "system"
      });

      setChatData(prev => ({ ...prev, background: bg }));
      toast({ title: "Background updated" });
    } catch (error) {
      console.error("Error updating background:", error);
      toast({ title: "Failed to update background", variant: "destructive" });
    } finally {
      setUpdatingBg(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max size is 2MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        handleUpdateBackground({ type: 'image', value: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-bold">User Not Found</h1>
        <Button onClick={() => setLocation("/messages")} className="bg-gray-700 hover:bg-gray-600">
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation(`/messages/${userId}`)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Contact info</h1>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      <ScrollArea className="flex-1 pb-24">
        <div className="p-6 space-y-6 border-b border-white/5">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-gray-600">
              <AvatarImage src={targetUser.photoURL} />
              <AvatarFallback>{targetUser.displayName?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{targetUser.displayName}</h2>
              <p className="text-gray-400 text-sm">{targetUser.bio || "No bio"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/10">
              <Phone size={18} />
            </Button>
            <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/10">
              <Video size={18} />
            </Button>
            <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/10">
              <Search size={18} />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase px-3">Customization</h3>
          
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300">
                <div className="flex items-center gap-4">
                  <Palette size={20} />
                  <span className="text-sm">Change Background</span>
                </div>
                <div className="h-4 w-4 rounded-full border border-white/20" style={{ background: chatData?.background?.value || 'transparent' }} />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-sm">
              <DialogHeader>
                <DialogTitle>Chat Background</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-5 gap-3 py-4">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => handleUpdateBackground(bg)}
                    disabled={updatingBg}
                    className={cn(
                      "aspect-square rounded-full border-2 transition-all flex items-center justify-center relative overflow-hidden",
                      chatData?.background?.value === bg.value ? "border-white" : "border-transparent hover:border-white/50"
                    )}
                    style={{ background: bg.value }}
                  >
                    {chatData?.background?.value === bg.value && <Check size={16} className="text-white drop-shadow-md" />}
                  </button>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={updatingBg}
                  className="aspect-square rounded-full border-2 border-white/20 hover:border-white/50 flex items-center justify-center bg-white/5 transition-all"
                >
                  {updatingBg ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </div>
              <p className="text-[10px] text-gray-500 text-center">Changes are visible to both participants</p>
            </DialogContent>
          </Dialog>

          <button className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300">
            <Bell size={20} />
            <span className="text-sm">Notifications</span>
          </button>
          <button className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300">
            <Lock size={20} />
            <span className="text-sm">Encryption</span>
          </button>
        </div>

        <Separator className="bg-white/5" />

        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold text-gray-400 uppercase">Media</span>
            <span className="text-xs text-gray-500">{mediaImages.length}</span>
          </div>
          
          {mediaImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {mediaImages.slice(0, 9).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg bg-gray-900 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src={img.imageURL} 
                    alt="Media" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs text-center py-6">No media shared yet</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
