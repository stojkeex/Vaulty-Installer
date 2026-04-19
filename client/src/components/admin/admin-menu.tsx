import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useGlobalNotification } from "@/contexts/global-notification-context";
import { isAdmin, isSuperAdmin } from "@/lib/admins";
import { usePremiumThanks } from "@/components/premium-thanks-modal";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Shield, User, Ban, Coins, FileText, Bell, Search, Trash2, ChevronLeft, ChevronRight, Crown, Megaphone, Lock, MessageCircle, Star, Ghost, Trophy, ExternalLink, Zap, X, Eye, EyeOff } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, addDoc, getDocs, query, where, orderBy, limit, deleteDoc, collectionGroup, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RANKS, getRank } from "@/lib/ranks";
import { BADGES } from "@/lib/badges";
import { formatPoints } from "@/lib/utils";
import { VaultyIcon } from "@/components/ui/vaulty-icon";

const formatCreditsShort = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + "mio";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + "k";
  return num.toString();
};

export function AdminMenu() {
  const { user, userData, updateUserBadges } = useAuth();
  const { addNotification } = useGlobalNotification();
  const { showPremiumThanks } = usePremiumThanks();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pointsAmount, setPointsAmount] = useState("");
  const [xpAmount, setXpAmount] = useState("");
  const [notificationMsg, setNotificationMsg] = useState("");
  const [globalNotificationMsg, setGlobalNotificationMsg] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const [usersList, setUsersList] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [promoPlan, setPromoPlan] = useState("All");
  const [promoDuration, setPromoDuration] = useState("1week");
  const [customDays, setCustomDays] = useState("");
  const [activePromoCodes, setActivePromoCodes] = useState<any[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const isSuper = user ? isSuperAdmin(user.email) : false;
  const isAuthorized = user && (userData?.isAdmin || isSuper);

  useEffect(() => {
    if (isOpen && isAuthorized) {
      fetchUsers();
      if (isSuper) {
        fetchPromoCodes();
      }
    }
  }, [isOpen, isAuthorized]);

  if (!isAuthorized) return null;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsersList(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Failed to fetch users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (selectedUser: any) => {
    setTargetUser(selectedUser);
    setShowPassword(false);
    fetchLogs(selectedUser.id);
  };

  const handleBackToList = () => {
    setTargetUser(null);
    setLogs([]);
    setShowPassword(false);
  };

  const fetchLogs = async (userId: string) => {
    try {
      const postsQuery = query(collection(db, "posts"), where("userId", "==", userId), orderBy("timestamp", "desc"), limit(20));
      const postsSnapshot = await getDocs(postsQuery);
      const postLogs = postsSnapshot.docs.map(d => ({
        id: d.id,
        type: "post",
        content: `Posted: "${d.data().content}"`,
        timestamp: d.data().timestamp,
        icon: <FileText className="h-4 w-4 text-gray-400" />
      }));

      const messagesQuery = query(collectionGroup(db, "messages"), where("senderId", "==", userId), orderBy("timestamp", "desc"), limit(20));
      const messagesSnapshot = await getDocs(messagesQuery);
      const messageLogs = messagesSnapshot.docs.map(d => ({
        id: d.id,
        type: "message",
        content: `Sent message: "${d.data().text || '[Image]'}"`,
        timestamp: d.data().timestamp,
        icon: <MessageCircle className="h-4 w-4 text-gray-600" />
      }));

      const allLogs = [...postLogs, ...messageLogs].sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });

      setLogs(allLogs);
    } catch (e) {
      console.log("No logs found or error", e);
      try {
         const postsQuery = query(collection(db, "posts"), where("userId", "==", userId), orderBy("timestamp", "desc"), limit(20));
         const postsSnapshot = await getDocs(postsQuery);
         const postLogs = postsSnapshot.docs.map(d => ({
            id: d.id,
            type: "post",
            content: `Posted: "${d.data().content}"`,
            timestamp: d.data().timestamp,
            icon: <FileText className="h-4 w-4 text-gray-400" />
         }));
         setLogs(postLogs);
      } catch (innerError) {
          setLogs([]);
      }
    }
  };

  const handleToggleBadge = async (badgeId: string) => {
      if (!targetUser) return;
      if (!isSuper) {
          toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
          return;
      }
      
      const currentBadges = targetUser.badges || [];
      let newBadges;
      
      if (currentBadges.includes(badgeId)) {
          newBadges = currentBadges.filter((b: string) => b !== badgeId);
          toast({ title: "Badge removed" });
      } else {
          newBadges = [...currentBadges, badgeId];
          toast({ title: "Badge awarded!" });
      }
      
      try {
          await updateUserBadges(targetUser.id, newBadges);
          const updatedUser = { ...targetUser, badges: newBadges };
          setTargetUser(updatedUser);
          setUsersList(usersList.map(u => u.id === targetUser.id ? updatedUser : u));
      } catch (error) {
          toast({ title: "Failed to update badges", variant: "destructive" });
      }
  };

  const handleBanUser = async () => {
    if (!targetUser) return;
    try {
      const newStatus = !targetUser.isBanned;
      await updateDoc(doc(db, "users", targetUser.id), { isBanned: newStatus });
      setTargetUser({ ...targetUser, isBanned: newStatus });
      setUsersList(usersList.map(u => u.id === targetUser.id ? { ...u, isBanned: newStatus } : u));
      
      toast({
        title: newStatus ? "Account Suspended" : "Account Restored",
        description: `${targetUser.displayName} has been ${newStatus ? 'banned' : 'unbanned'}.`,
        className: newStatus 
          ? "bg-red-600/10 border-red-500/50 text-red-400 font-bold" 
          : "bg-green-600/10 border-green-500/50 text-green-400 font-bold",
      });
    } catch (error) {
      toast({ 
        title: "Update Failed", 
        variant: "destructive",
        description: "Could not sync ban status."
      });
    }
  };

  const handleGhostUser = async () => {
    if (!targetUser) return;
    if (!isSuper) {
        toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
        return;
    }
    try {
        const newStatus = !targetUser.isGhost;
        await updateDoc(doc(db, "users", targetUser.id), { isGhost: newStatus });
        setTargetUser({ ...targetUser, isGhost: newStatus });
        setUsersList(usersList.map(u => u.id === targetUser.id ? { ...u, isGhost: newStatus } : u));
        
        toast({
          title: newStatus ? "Ghost Mode Active" : "Ghost Mode Disabled",
          description: `${targetUser.displayName} is ${newStatus ? 'now invisible' : 'now visible'} in logs.`,
          className: newStatus 
            ? "bg-orange-600/10 border-orange-500/50 text-orange-400 font-medium" 
            : "bg-white/10/10 border-blue-500/50 text-white font-medium",
        });
    } catch (error) {
        toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const handleDeleteUser = async () => {
    if (!targetUser) return;
    if (!isSuper) {
      toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
      return;
    }
    if (!confirm("⚠️ DANGER: This will PERMANENTLY DELETE this user account and ALL their data. This CANNOT be undone.\n\nType 'DELETE' to confirm.")) return;

    try {
      await deleteDoc(doc(db, "users", targetUser.id));
      setUsersList(usersList.filter(u => u.id !== targetUser.id));
      setTargetUser(null);
      toast({ title: "User deleted successfully" });
    } catch (error) {
      toast({ title: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleUpdateRole = async (role: string) => {
    if (!targetUser) return;
    if (!isSuper) {
      toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
      return;
    }
    try {
      await updateDoc(doc(db, "users", targetUser.id), {
        role: role,
        isAdmin: role === 'admin'
      });
      const updatedUser = { ...targetUser, role: role, isAdmin: role === 'admin' };
      setTargetUser(updatedUser);
      setUsersList(usersList.map(u => u.id === targetUser.id ? updatedUser : u));
      
      toast({
        title: "Role Updated",
        description: `${targetUser.displayName} assigned to ${role.replace('_', ' ')}.`,
        className: "bg-white/5 border-white/20 text-white font-medium",
      });
    } catch (error) {
      toast({ title: "Failed to update role", variant: "destructive" });
    }
  };

  const handleUpdatePoints = async (action: 'add' | 'remove') => {
    if (!targetUser || !pointsAmount) return;
    if (!isSuper) {
      toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
      return;
    }
    const amount = parseInt(pointsAmount);
    if (isNaN(amount)) return;

    try {
      const currentPoints = targetUser.vaultyPoints || 0;
      const newPoints = action === 'add' ? currentPoints + amount : Math.max(0, currentPoints - amount);
      await updateDoc(doc(db, "users", targetUser.id), { vaultyPoints: newPoints });
      setTargetUser({ ...targetUser, vaultyPoints: newPoints });
      setUsersList(usersList.map(u => u.id === targetUser.id ? { ...u, vaultyPoints: newPoints } : u));
      
      toast({
        title: action === 'add' ? "Credits Added" : "Credits Removed",
        description: `${amount} Vaulty Credits ${action === 'add' ? 'added to' : 'removed from'} ${targetUser.displayName}.`,
        className: action === 'add' 
          ? "bg-green-600/10 border-green-500/50 text-green-400 font-bold" 
          : "bg-red-600/10 border-red-500/50 text-red-400 font-bold",
      });
      setPointsAmount("");
    } catch (error) {
      toast({ title: "Failed to update points", variant: "destructive" });
    }
  };

  const handleUpdateXP = async (action: 'add' | 'remove') => {
    if (!targetUser || !xpAmount) return;
    if (!isSuper) {
      toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
      return;
    }
    const amount = parseInt(xpAmount);
    if (isNaN(amount)) return;

    try {
      const currentXP = targetUser.xp || 0;
      const newXP = action === 'add' ? currentXP + amount : Math.max(0, currentXP - amount);
      await updateDoc(doc(db, "users", targetUser.id), { xp: newXP });
      setTargetUser({ ...targetUser, xp: newXP });
      setUsersList(usersList.map(u => u.id === targetUser.id ? { ...u, xp: newXP } : u));
      
      toast({
        title: action === 'add' ? "XP Boosted" : "XP Reduced",
        description: `${amount} XP ${action === 'add' ? 'added to' : 'removed from'} ${targetUser.displayName}.`,
        className: action === 'add' 
          ? "bg-white/10/10 border-blue-500/50 text-white font-bold" 
          : "bg-orange-600/10 border-orange-500/50 text-orange-400 font-bold",
      });
      setXpAmount("");
    } catch (error) {
      toast({ title: "Failed to update XP", variant: "destructive" });
    }
  };

  const handleSetRank = async (rankId: string) => {
    if (!targetUser) return;
    if (!isSuper) {
      toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
      return;
    }
    const rank = RANKS.find(r => r.id === rankId);
    if (!rank) return;

    try {
        await updateDoc(doc(db, "users", targetUser.id), { xp: rank.minXP });
        setTargetUser({ ...targetUser, xp: rank.minXP });
        setUsersList(usersList.map(u => u.id === targetUser.id ? { ...u, xp: rank.minXP } : u));
        setSelectedRank("");
        toast({ title: `User rank set to ${rank.name}` });
    } catch (error) {
        toast({ title: "Failed to update rank", variant: "destructive" });
    }
  };

  const handleSetPlan = async (plan: string) => {
    if (!targetUser) return;
    if (!isSuper) {
      toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
      return;
    }
    try {
        const updateData: any = {};
        let newBadges = [...(targetUser.badges || [])];
        newBadges = newBadges.filter((b: string) => !b.includes("premium"));
        
        if (plan === "none") {
            updateData.premiumPlan = null;
            updateData.subscription = "free";
            updateData.premiumExpiry = null;
        } else {
            updateData.premiumPlan = "PLUS";
            updateData.subscription = "plus";
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            updateData.premiumExpiry = expiryDate;
            newBadges.push("premium-pro");
        }
        
        updateData.badges = newBadges;
        await updateDoc(doc(db, "users", targetUser.id), updateData);
        const updatedUser = { ...targetUser, ...updateData };
        setTargetUser(updatedUser);
        setUsersList(usersList.map(u => u.id === targetUser.id ? updatedUser : u));
        setSelectedPlan("");
        toast({ title: plan === "none" ? "Plan removed successfully" : `Plan set to ${plan}` });
        
        if (plan !== "none") {
            showPremiumThanks(plan);
        }
    } catch (error) {
        toast({ title: "Failed to update plan", variant: "destructive" });
    }
  };

  const handleGoToProfile = () => {
    if (!targetUser) return;
    setIsOpen(false);
    setLocation(`/user/${targetUser.id}`);
  };

  const handleSendNotification = async () => {
    if (!targetUser || !notificationMsg) return;
    try {
      await addDoc(collection(db, "users", targetUser.id, "notifications"), {
        message: notificationMsg,
        timestamp: new Date(),
        read: false,
        type: "admin_alert"
      });
      toast({ title: "Notification sent" });
      setNotificationMsg("");
    } catch (error) {
      toast({ title: "Failed to send notification", variant: "destructive" });
    }
  };

  const handleSendGlobalNotification = async () => {
      if (!isSuper || !globalNotificationMsg) return;
      try {
          const [title, ...descParts] = globalNotificationMsg.split('\n');
          const description = descParts.join('\n').trim();
          await addDoc(collection(db, "global_notifications"), {
              message: title,
              description: description || undefined,
              timestamp: new Date(),
              type: "global_alert"
          });
          addNotification(title, description, 'info', 5000);
          toast({ title: "Global notification broadcasted!" });
          setGlobalNotificationMsg("");
      } catch (error) {
          toast({ title: "Failed to broadcast", variant: "destructive" });
      }
  };

  const handleSeedMockData = async () => {
    if (!isSuper) return;
    setIsSeeding(true);
    try {
      const mockUsers = [
        { id: "user_lukas", name: "Lukas Novak", bio: "Tech enthusiast & crypto trader", xp: 1500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lukas" },
        { id: "user_maja", name: "Maja Kranjc", bio: "Digital nomad | UI/UX Designer", xp: 800, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maja" },
        { id: "user_marko", name: "Marko Zupan", bio: "Coffee lover and full-stack dev", xp: 2200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marko" },
        { id: "user_ana", name: "Ana Horvat", bio: "Marketing specialist & fitness fan", xp: 300, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" },
        { id: "user_janez", name: "Janez Potocnik", bio: "Photography and nature", xp: 3500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Janez" },
        { id: "user_tina", name: "Tina Vidmar", bio: "Traveler | Content Creator", xp: 1200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tina" },
        { id: "user_rok", name: "Rok Golob", bio: "Gaming is life", xp: 500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rok" },
        { id: "user_nina", name: "Nina Jereb", bio: "Sustainability advocate", xp: 2800, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nina" },
        { id: "user_peter", name: "Peter Hribar", bio: "Chef and food blogger", xp: 1800, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Peter" },
        { id: "user_lara", name: "Lara Kovac", bio: "Always learning something new", xp: 8500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lara" },
      ];

      const postTemplates = [
        "Just finished a great workout! Feel amazing. 💪",
        "Exploring some new React features today. Hooks are life!",
        "Has anyone tried the new coffee shop downtown? Best latte ever. ☕",
        "Sunrise this morning was absolutely breathtaking. #nature",
        "Working on a secret project... can't wait to share it with you all!",
        "Crypto market is looking interesting today. What are your picks?",
        "Just read an amazing book on minimalist design. Highly recommend.",
        "Beautiful day for a walk in the park. 🌿",
        "Finally hit my coding goal for the week! 🚀",
        "Does anyone have good recommendations for a productivity app?",
        "Weekend vibes! Time to relax and recharge.",
        "Cooking something special tonight. Stay tuned for photos!",
        "Travel bug is hitting hard. Where should I go next?",
        "The best way to predict the future is to create it.",
        "Struggling with some CSS layout issues... any experts here?",
        "Watching the stars tonight. The universe is huge.",
        "Healthy breakfast to start the day right. 🥑",
        "Consistency is key to any success. Keep going!",
        "New setup is finally complete. Productivity +100!",
        "Looking for collaborators on a new open source project. DM me!",
        "Life is short, make every hair flip count. ✨",
        "Just discovered a hidden gem in the city. Feeling lucky!",
        "Coding late into the night. Fuelled by caffeine and passion.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "A quiet evening with a good book is all I need right now.",
        "Focus on the good and the good gets better.",
        "Can't believe it's already December! Time flies.",
        "Starting a new hobby today. Wish me luck!",
        "Sometimes you win, sometimes you learn.",
        "The view from the top is always better after the climb."
      ];

      // Seed Users
      for (const u of mockUsers) {
        await setDoc(doc(db, "users", u.id), {
          uid: u.id,
          displayName: u.name,
          bio: u.bio,
          photoURL: u.avatar,
          xp: u.xp,
          vaultyPoints: Math.floor(Math.random() * 5000),
          createdAt: serverTimestamp(),
          badges: u.xp > 2000 ? ["verified"] : [],
          isVerified: u.xp > 2000,
          premiumPlan: u.xp > 3000 ? "PLUS" : "none"
        }, { merge: true });

        // Seed some posts for each user
        const numPosts = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numPosts; i++) {
          const content = postTemplates[Math.floor(Math.random() * postTemplates.length)];
          // First post is always from just now, others vary within 2 hours
          const hoursAgo = i === 0 ? 0 : Math.floor(Math.random() * 2);
          const timestamp = i === 0 ? new Date() : new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
          
          await addDoc(collection(db, "posts"), {
            userId: u.id,
            displayName: u.name,
            photoURL: u.avatar,
            content: content,
            timestamp: timestamp,
            likes: Math.floor(Math.random() * 50),
            comments: Math.floor(Math.random() * 10),
            isVerified: u.xp > 2000,
            type: "text"
          });
        }
      }

      toast({ 
        title: "Simulation Complete", 
        description: "10 mock accounts and their activity have been successfully injected.",
        className: "bg-green-600/10 border-green-500/50 text-green-400 font-bold"
      });
      fetchUsers();
    } catch (error) {
      console.error("Error seeding data:", error);
      toast({ 
        title: "Simulation Failed", 
        variant: "destructive",
        description: "Check your connection or permissions."
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreatePromoCode = async () => {
    if (!isSuper) {
      toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
      return;
    }
    if (!promoCode.trim() || !promoDiscount) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setPromoLoading(true);
    try {
      const discountNum = parseInt(promoDiscount);
      if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
        toast({ title: "Discount must be 0-100", variant: "destructive" });
        setPromoLoading(false);
        return;
      }

      let expiresAt: Date | null = null;
      if (promoDuration === "1day") expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      else if (promoDuration === "1week") expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      else if (promoDuration === "1month") expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      else if (promoDuration === "custom") {
        const days = parseInt(customDays);
        if (isNaN(days) || days <= 0) {
          toast({ title: "Enter valid number of days", variant: "destructive" });
          setPromoLoading(false);
          return;
        }
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }

      await addDoc(collection(db, "promo_codes"), {
        code: promoCode.toUpperCase(),
        discount: discountNum,
        plan: promoPlan,
        expiresAt: expiresAt,
        createdAt: new Date(),
        active: true
      });

      toast({ title: "Promo code created!", description: `${promoCode.toUpperCase()} - ${discountNum}% off` });
      setPromoCode("");
      setPromoDiscount("");
      setPromoPlan("All");
      setPromoDuration("1week");
      setCustomDays("");
      fetchPromoCodes();
    } catch (error) {
      console.error("Error creating promo code:", error);
      toast({ title: "Failed to create promo code", variant: "destructive" });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleDeletePromoCode = async (id: string) => {
    if (!isSuper) {
      toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
      return;
    }
    try {
      await deleteDoc(doc(db, "promo_codes", id));
      toast({ title: "Promo code deleted" });
      fetchPromoCodes();
    } catch (error) {
      toast({ title: "Failed to delete promo code", variant: "destructive" });
    }
  };
  
  const totalUsers = usersList.length;
  const totalVaultyCredits = usersList.reduce((acc, curr) => acc + (curr.vaultyPoints || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`fixed right-0 top-1/2 -translate-y-1/2 z-[9999] rounded-l-xl rounded-r-none h-12 w-12 ${isSuper ? "bg-gradient-to-br from-blue-500 to-purple-500 hover:opacity-90 shadow-[0_0_15px_rgba(0,211,253,0.5)]" : "bg-red-600 hover:bg-red-700"} shadow-lg border-l border-y border-white/20`}
          size="icon"
        >
          {isSuper ? <Crown className="h-6 w-6 text-white" /> : <Shield className="h-6 w-6 text-white" />}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-md bg-[#0a0a0a] border-vaulty-gradient text-white max-h-[90vh] h-[800px] overflow-hidden flex flex-col z-[10000] p-0 gap-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-2 border-b border-vaulty-gradient bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 to-purple-500 z-0" />
          <div className="flex items-center justify-between relative z-10">
            <DialogTitle className={`flex items-center gap-2 text-2xl font-bold ${isSuper ? "bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent" : "text-red-500"}`}>
              {isSuper ? <Crown className="h-7 w-7 text-gray-400" /> : <Shield className="h-7 w-7" />} 
              {isSuper ? "Super Admin Dashboard" : "Admin Dashboard"}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col bg-[#0a0a0a]">
          {!targetUser ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-white/5 bg-[#0a0a0a] space-y-6">
                <div className="flex gap-4">
                    <div className="flex-1 bg-white/5 border border-vaulty-gradient rounded-2xl p-5 hover:border-[#a0a0a0]/30 transition-all group">
                        <div className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.1em] mb-2">Total Users</div>
                        <div className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{totalUsers}</div>
                    </div>
                    <div className="flex-1 bg-white/5 border border-vaulty-gradient rounded-2xl p-5 hover:border-[#808080]/30 transition-all group">
                        <div className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.1em] mb-2">Total Vaulty Balance</div>
                        <div className="flex items-baseline gap-2 group-hover:scale-105 transition-transform origin-left">
                          <VaultyIcon className="text-gray-400" size={20} />
                          <div className="text-3xl font-bold text-white">{formatCreditsShort(totalVaultyCredits)}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-gray-400 transition-colors" />
                    <Input 
                      placeholder="Search for user..." 
                      className="pl-10 bg-[#111] border-vaulty-gradient h-12 rounded-2xl focus:border-[#a0a0a0]/50 text-sm transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="grid gap-3">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <div 
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className="flex items-center justify-between p-4 bg-white/5 border border-vaulty-gradient rounded-2xl hover:border-[#a0a0a0]/30 hover:bg-white/[0.07] transition-all cursor-pointer group active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={u.photoURL || "https://github.com/shadcn.png"} alt="" className="h-12 w-12 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-[#a0a0a0]/30 transition-all" />
                            {u.isAdmin && (
                              <div className="absolute -top-1 -right-1 bg-[#808080] p-1 rounded-lg border-2 border-black shadow-lg">
                                <Shield className="h-2 w-2 text-white" fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-gray-400 transition-colors">{u.displayName}</p>
                            <p className="text-[10px] text-gray-500 font-mono">@{u.id.slice(0, 12)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {u.isBanned && (
                            <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/30 px-2 py-0.5 rounded-lg text-[10px]">BANNED</Badge>
                          )}
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold bg-[#a0a0a0]/5 px-3 py-1.5 rounded-xl border border-[#a0a0a0]/10">
                            <VaultyIcon size={14} />
                            {formatPoints(u.vaultyPoints)}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-700 group-hover:text-gray-600 transition-all transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-gray-600 italic">
                      <p className="text-sm">No users detected in sector.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
                <Button variant="ghost" size="sm" onClick={handleBackToList} className="text-gray-500 hover:text-gray-400 rounded-xl px-4 transition-all">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <h3 className="font-bold text-sm flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                    {targetUser.displayName}
                    {targetUser.isAdmin && <Shield className="h-3.5 w-3.5 text-gray-600" fill="currentColor" />}
                </h3>
                <Button onClick={handleGoToProfile} size="sm" className="text-gray-500 hover:text-gray-400 rounded-xl px-4 transition-all">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4 max-w-4xl mx-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-vaulty-gradient rounded-xl p-4">
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Email</p>
                      <p className="text-xs text-white break-all">{targetUser.email}</p>
                    </div>
                    <div className="bg-white/5 border border-vaulty-gradient rounded-xl p-4">
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">ID</p>
                      <p className="text-xs text-white font-mono">{targetUser.id.slice(0, 12)}...</p>
                    </div>
                    <div className="bg-white/5 border border-vaulty-gradient rounded-xl p-4">
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Points</p>
                      <p className="text-sm text-gray-400 font-bold">{formatPoints(targetUser.vaultyPoints || 0)}</p>
                    </div>
                    <div className="bg-white/5 border border-vaulty-gradient rounded-xl p-4">
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">XP</p>
                      <p className="text-sm text-gray-600 font-bold">{targetUser.xp || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 block">Password</label>
                    <div className="flex gap-2">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        readOnly
                        value={targetUser.password || targetUser.userPassword || "No password set"}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="bg-[#111] border-vaulty-gradient h-10 rounded-xl focus:border-white/30 text-xs cursor-default"
                      />
                      <Button onClick={() => setShowPassword(!showPassword)} className="h-10 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-3 text-xs transition-all">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={handleBanUser} className={`h-10 text-xs font-bold rounded-xl transition-all ${targetUser.isBanned ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30' : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30'}`}>
                        {targetUser.isBanned ? "✓ Unban" : "✕ Ban"}
                      </Button>
                      <Button onClick={handleGhostUser} className={`h-10 text-xs font-bold rounded-xl transition-all ${targetUser.isGhost ? 'bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-600/30' : 'bg-white/5 hover:bg-white/10 text-white border border-vaulty-gradient'}`}>
                        {targetUser.isGhost ? "✓ Un-Ghost" : "👻 Ghost"}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "cursor-pointer transition-all h-10 px-4 text-xs font-bold rounded-xl border-vaulty-gradient flex-1 justify-center", 
                          targetUser.role === 'admin' ? "bg-red-500/20 border-red-500 text-red-500 opacity-100" : "bg-white/5 text-gray-400 hover:bg-white/10"
                        )} 
                        onClick={() => handleUpdateRole('admin')}
                      >
                        <Shield className="mr-2 h-3 w-3" /> Admin
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "cursor-pointer transition-all h-10 px-4 text-xs font-bold rounded-xl border-vaulty-gradient flex-1 justify-center", 
                          targetUser.role === 'news_writer' ? "bg-orange-500/20 border-orange-500 text-orange-500 opacity-100" : "bg-white/5 text-gray-400 hover:bg-white/10"
                        )} 
                        onClick={() => handleUpdateRole('news_writer')}
                      >
                        <FileText className="mr-2 h-3 w-3" /> News Writer
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "cursor-pointer transition-all h-10 px-4 text-xs font-bold rounded-xl border-vaulty-gradient flex-1 justify-center", 
                          (!targetUser.role || targetUser.role === 'user') ? "bg-gray-500/20 border-gray-500 text-gray-500 opacity-100" : "bg-white/5 text-gray-400 hover:bg-white/10"
                        )} 
                        onClick={() => handleUpdateRole('user')}
                      >
                        <User className="mr-2 h-3 w-3" /> User
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 block">Points</label>
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Amount" value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="bg-[#111] border-vaulty-gradient h-10 rounded-xl focus:border-[#a0a0a0]/50 text-xs" />
                      <Button onClick={() => handleUpdatePoints('add')} className="h-10 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 font-bold rounded-xl px-3 text-xs">+</Button>
                      <Button onClick={() => handleUpdatePoints('remove')} className="h-10 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 font-bold rounded-xl px-3 text-xs">-</Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 block">XP</label>
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Amount" value={xpAmount} onChange={(e) => setXpAmount(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="bg-[#111] border-vaulty-gradient h-10 rounded-xl focus:border-[#808080]/50 text-xs" />
                      <Button onClick={() => handleUpdateXP('add')} className="h-10 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 font-bold rounded-xl px-3 text-xs">+</Button>
                      <Button onClick={() => handleUpdateXP('remove')} className="h-10 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 font-bold rounded-xl px-3 text-xs">-</Button>
                    </div>
                  </div>

                  {isSuper && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 block">Rank</label>
                        <select value={selectedRank} onChange={(e) => { setSelectedRank(e.target.value); if (e.target.value) handleSetRank(e.target.value); }} onKeyDown={(e) => e.stopPropagation()} className="w-full bg-[#111] border border-vaulty-gradient text-white rounded-xl p-2 h-10 focus:border-[#a0a0a0]/50 text-xs">
                          <option value="">Select...</option>
                          {RANKS.map(rank => <option key={rank.id} value={rank.id}>{rank.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 block">Premium Plan</label>
                        <select value={selectedPlan} onChange={(e) => { setSelectedPlan(e.target.value); if (e.target.value) handleSetPlan(e.target.value); }} onKeyDown={(e) => e.stopPropagation()} className="w-full bg-[#111] border border-vaulty-gradient text-white rounded-xl p-2 h-10 focus:border-[#a0a0a0]/50 text-xs">
                          <option value="">Select...</option>
                          <option value="none">Free Tier (Remove)</option>
                          <option value="PLUS">Vaulty+ Plan</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "cursor-pointer transition-all h-10 px-4 text-xs font-bold rounded-xl border-vaulty-gradient flex-1 justify-center", 
                        targetUser?.badges?.includes("verified") ? "bg-white/10/20 border-blue-500 text-white opacity-100" : "bg-white/5 text-gray-400 hover:bg-white/10"
                      )} 
                      onClick={async () => {
                        if (!targetUser) return;
                        if (!isSuper) {
                          toast({ title: "You Don't Have Permissions For This Action!", variant: "destructive" });
                          return;
                        }
                        try {
                          const isVerified = !!(targetUser?.isVerified || targetUser?.badges?.includes("verified"));
                          const newStatus = !isVerified;
                          const badges = [...(targetUser.badges || [])];
                          let newBadges: string[] = [];
                          if (newStatus && !badges.includes("verified")) {
                            newBadges = [...badges, "verified"];
                          } else if (!newStatus && badges.includes("verified")) {
                            newBadges = badges.filter((b: string) => b !== "verified");
                          } else {
                            newBadges = badges;
                          }

                          await updateDoc(doc(db, "users", targetUser.id), { 
                            isVerified: newStatus,
                            badges: newBadges
                          });
                          
                          const updatedUser = { ...targetUser, isVerified: newStatus, badges: newBadges };
                          setTargetUser(updatedUser);
                          setUsersList(usersList.map(u => u.id === targetUser.id ? updatedUser : u));
                          
                          toast({
                            title: newStatus ? "Verification Badge Added" : "Verification Badge Removed",
                            description: `${targetUser.displayName}'s status has been updated.`,
                            className: newStatus 
                              ? "bg-white/10/10 border-blue-500/50 text-white font-medium" 
                              : "bg-red-600/10 border-red-500/50 text-red-400 font-medium",
                          });
                        } catch (error) {
                          toast({ 
                            title: "Update Failed", 
                            variant: "destructive",
                            description: "Could not sync with the database."
                          });
                        }
                      }}
                    >
                      ✓ Verified
                    </Badge>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 block">Send Alert</label>
                    <div className="flex gap-2">
                      <Input placeholder="System message..." value={notificationMsg} onChange={(e) => setNotificationMsg(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="bg-[#111] border-vaulty-gradient h-10 rounded-xl focus:border-gray-500/50 text-xs" />
                      <Button onClick={handleSendNotification} className="h-10 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 border border-gray-600/30 font-bold rounded-xl px-3 text-xs"><Bell size={16} /></Button>
                    </div>
                  </div>

                  {isSuper && (
                    <div className="space-y-3">
                      <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Global Broadcast</label>
                      <Textarea placeholder="Broadcast to all users..." value={globalNotificationMsg} onChange={(e) => setGlobalNotificationMsg(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="bg-[#111] border-vaulty-gradient rounded-xl focus:border-red-500/50 text-xs min-h-[80px]" />
                      <Button onClick={handleSendGlobalNotification} className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 font-bold rounded-xl h-10 text-xs">BROADCAST TO ALL</Button>
                    </div>
                  )}
                  
                  {isSuper && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Mock Activity Simulator</label>
                      <Button 
                        onClick={handleSeedMockData} 
                        disabled={isSeeding}
                        className="w-full bg-white/10/20 hover:bg-white/10/30 text-white border border-blue-600/30 font-bold rounded-xl h-10 text-xs flex items-center justify-center gap-2"
                      >
                        {isSeeding ? <Loader2 className="animate-spin h-4 w-4" /> : <Zap size={16} />}
                        GENERATE 10 MOCK ACCOUNTS & POSTS
                      </Button>
                    </div>
                  )}

                  {isSuper && (
                    <div className="pt-4 border-t border-red-900/20">
                      <Button onClick={handleDeleteUser} className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 font-bold rounded-xl h-10 text-xs flex items-center justify-center gap-2"><Trash2 size={16} /> DELETE ACCOUNT PERMANENTLY</Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
