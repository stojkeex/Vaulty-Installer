import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation, useRoute } from "wouter";
import { ChevronLeft, Flag, ShieldBan, UserPlus, BadgeCheck, MessageCircle, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, collection, onSnapshot, updateDoc, arrayUnion, arrayRemove, increment, addDoc } from "firebase/firestore";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { isVerifiedEmail } from "@/lib/admins";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BADGES } from "@/lib/badges";

export default function PublicProfile() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/user/:id");
  const userId = params?.id;

  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(doc(db, "users", userId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const badges = data.badges || [];
        const normalizedData = isVerifiedEmail(data.email) && !badges.includes("verified")
          ? { ...data, badges: [...badges, "verified"], isVerified: true }
          : data;

        setUserData(normalizedData);

        if (currentUser && data.followers && data.followers.includes(currentUser.uid)) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      }
    });

    return () => unsub();
  }, [userId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !userId || followLoading) return;

    setFollowLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      const currentUserRef = doc(db, "users", currentUser.uid);

      if (isFollowing) {
        await updateDoc(userRef, {
          followers: arrayRemove(currentUser.uid),
          followersCount: increment(-1)
        });
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId),
          followingCount: increment(-1)
        });
      } else {
        await updateDoc(userRef, {
          followers: arrayUnion(currentUser.uid),
          followersCount: increment(1)
        });
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId),
          followingCount: increment(1)
        });

        await addDoc(collection(db, "users", userId, "notifications"), {
          type: "follow",
          message: `${currentUser.displayName} started following you`,
          timestamp: new Date(),
          read: false
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageRequest = () => {
    toast({
      title: "Message request sent",
      description: `Your request to message ${userData?.displayName || "this user"} is ready.`,
    });
  };

  const handleBlock = () => {
    toast({
      title: "User blocked",
      description: `${userData?.displayName || "This user"} has been blocked from your profile flow.`,
    });
  };

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "We have received your report and will review it shortly.",
    });
  };

  const customStyle = userData?.cardStyle ? {
    color: userData.cardStyle.color,
    scale: (userData.cardStyle.size || 100) / 100,
    gradientTo: userData.cardStyle.gradientTo
  } : undefined;

  const resolvedBadges = useMemo(() => {
    const badgeIds: string[] = userData?.badges || [];
    return badgeIds
      .map((badgeId) => BADGES.find((badge) => badge.id === badgeId))
      .filter(Boolean);
  }, [userData?.badges]);

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-black pb-24 text-white">
      <div className="relative z-20 flex items-center justify-between p-4">
        <button
          onClick={() => setLocation("/")}
          className="rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/70"
          data-testid="button-public-profile-back"
        >
          <ChevronLeft size={20} />
        </button>

        {currentUser?.uid !== userId && (
          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-white/20 disabled:opacity-60"
            data-testid="button-public-profile-follow"
          >
            {followLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      <div className="p-4 pt-2">
        <div className="relative mx-auto mb-6 w-full max-w-[340px]">
          {currentUser?.uid !== userId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="absolute right-6 top-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-xl transition-all hover:bg-white/10"
                  data-testid="button-public-profile-menu"
                >
                  <UserPlus size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-white/10 bg-black/90 p-2 text-white backdrop-blur-xl">
                <DropdownMenuItem onClick={handleMessageRequest} className="cursor-pointer rounded-xl px-3 py-3 focus:bg-white/10">
                  <MessageCircle className="mr-2 h-4 w-4 text-sky-300" />
                  Message Request
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsBadgesOpen(true)} className="cursor-pointer rounded-xl px-3 py-3 focus:bg-white/10">
                  <BadgeCheck className="mr-2 h-4 w-4 text-sky-300" />
                  Badges
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-white/10" />
                <DropdownMenuItem onClick={handleBlock} className="cursor-pointer rounded-xl px-3 py-3 focus:bg-white/10">
                  <ShieldBan className="mr-2 h-4 w-4 text-orange-300" />
                  Block User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReport} className="cursor-pointer rounded-xl px-3 py-3 text-red-400 focus:bg-white/10 focus:text-red-400">
                  <Flag className="mr-2 h-4 w-4" />
                  Report User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ProfileCard
            user={userData}
            isOwner={false}
            hideControls={true}
            customStyle={customStyle}
          />
        </div>
      </div>

      <Dialog open={isBadgesOpen} onOpenChange={setIsBadgesOpen}>
        <DialogContent className="max-w-md rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#090c14_0%,#03060d_100%)] p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
          <DialogHeader className="border-b border-white/6 px-6 pb-4 pt-6 text-left">
            <DialogTitle className="text-2xl font-black tracking-tight">{userData?.displayName || "User"} badges</DialogTitle>
            <p className="mt-1 text-sm text-zinc-400">All earned profile badges in one place.</p>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-3 overflow-y-auto px-6 py-5">
            {resolvedBadges.length > 0 ? (
              resolvedBadges.map((badge: any) => (
                <div
                  key={badge.id}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-white/8 bg-white/[0.04] p-4"
                  data-testid={`card-badge-${badge.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/30 p-2">
                      <img src={badge.image} alt={badge.name} className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{badge.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{badge.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
                <p className="text-base font-semibold text-white">No badges yet</p>
                <p className="mt-2 text-sm text-zinc-400">This user has not unlocked any profile badges yet.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
