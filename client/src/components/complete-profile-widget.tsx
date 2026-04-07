import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Check, ChevronLeft, Link as LinkIcon, MapPin, Sparkles, User, Wallet, Palette, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";

function hasCustomProfilePhoto(photoURL?: string | null) {
  if (!photoURL) return false;
  const normalized = photoURL.toLowerCase();
  return !normalized.includes("dicebear") && !normalized.includes("github.com/shadcn.png");
}

export function CompleteProfileWidget() {
  const { user, userData } = useAuth();
  const [, setLocation] = useLocation();
  const [goalsCount, setGoalsCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (!user) return;

    const goalsQuery = query(collection(db, "users", user.uid, "goals"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(goalsQuery, (snapshot) => {
      setGoalsCount(snapshot.size);
    }, () => {
      setGoalsCount(0);
    });

    return () => unsubscribe();
  }, [user]);

  const tasks = useMemo(() => {
    const photoDone = hasCustomProfilePhoto(userData?.photoURL || user?.photoURL);
    const usernameDone = Boolean(userData?.username && String(userData.username).trim().length >= 3);
    const bioDone = Boolean(userData?.bio && String(userData.bio).trim().length >= 8);
    const locationDone = Boolean(userData?.location && String(userData.location).trim().length >= 2);
    const links = userData?.links || {};
    const socialDone = Boolean(
      (links.website && String(links.website).trim().length >= 4) ||
      (links.instagram && String(links.instagram).trim().length >= 2) ||
      (links.twitter && String(links.twitter).trim().length >= 2)
    );
    const customizationDone = Boolean(userData?.cardStyle);
    const walletDone = Boolean(userData?.walletPin);
    const goalsDone = goalsCount > 0;

    return [
      {
        id: "username",
        title: "Add username",
        description: "Pick your @name",
        done: usernameDone,
        icon: User,
        actionLabel: usernameDone ? "Done" : "Open",
        onClick: usernameDone ? undefined : () => setLocation("/edit-profile"),
      },
      {
        id: "bio",
        title: "Write short bio",
        description: "Tell people who you are",
        done: bioDone,
        icon: Sparkles,
        actionLabel: bioDone ? "Done" : "Open",
        onClick: bioDone ? undefined : () => setLocation("/edit-profile"),
      },
      {
        id: "photo",
        title: "Upload profile photo",
        description: "Add a real profile image",
        done: photoDone,
        icon: User,
        actionLabel: photoDone ? "Done" : "Open",
        onClick: photoDone ? undefined : () => setLocation("/edit-profile"),
      },
      {
        id: "location",
        title: "Add your location",
        description: "Show where you are from",
        done: locationDone,
        icon: MapPin,
        actionLabel: locationDone ? "Done" : "Open",
        onClick: locationDone ? undefined : () => setLocation("/edit-profile"),
      },
      {
        id: "social",
        title: "Add one link",
        description: "Website or social profile",
        done: socialDone,
        icon: LinkIcon,
        actionLabel: socialDone ? "Done" : "Open",
        onClick: socialDone ? undefined : () => setLocation("/edit-profile"),
      },
      {
        id: "customization",
        title: "Customize profile card",
        description: "Give your profile its own look",
        done: customizationDone,
        icon: Palette,
        actionLabel: customizationDone ? "Done" : "Open",
        onClick: customizationDone ? undefined : () => setLocation("/customization"),
      },
      {
        id: "wallet",
        title: "Secure your wallet",
        description: "Set your wallet PIN",
        done: walletDone,
        icon: Wallet,
        actionLabel: walletDone ? "Done" : "Open",
        onClick: walletDone ? undefined : () => setLocation("/wallet"),
      },
      {
        id: "goal",
        title: "Set your first goal",
        description: "Start planning your next move",
        done: goalsDone,
        icon: Target,
        actionLabel: goalsDone ? "Done" : "Go home",
        onClick: goalsDone ? undefined : () => setLocation("/home"),
      },
    ];
  }, [goalsCount, setLocation, user?.photoURL, userData?.bio, userData?.cardStyle, userData?.links, userData?.location, userData?.photoURL, userData?.username, userData?.walletPin]);

  const completedCount = tasks.filter((task) => task.done).length;
  const isComplete = tasks.length > 0 && completedCount === tasks.length;

  useEffect(() => {
    if (isComplete) {
      setShowBubble(false);
      setIsOpen(false);
      return;
    }

    const showTimer = window.setTimeout(() => {
      setShowBubble(true);
    }, 12000);

    const hideTimer = window.setTimeout(() => {
      setShowBubble(false);
    }, 24000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isComplete]);

  if (!user || isComplete) return null;

  return (
    <>
      <AnimatePresence>
        {showBubble && !isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => {
              setIsOpen(true);
              setShowBubble(false);
            }}
            className="fixed bottom-56 right-4 z-[9999] rounded-full border border-white/15 bg-black/92 px-4 py-3 text-left text-white shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
            data-testid="button-complete-profile-bubble"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Vaulty</p>
                <p className="text-sm font-semibold leading-none">Complete your profile</p>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed bottom-36 right-4 z-[9999]">
        <AnimatePresence initial={false} mode="wait">
          {isOpen ? (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-[320px] rounded-[28px] border border-white/12 bg-black/92 p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.65)] backdrop-blur-3xl"
              data-testid="panel-complete-profile"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Profile</p>
                  <h3 className="mt-1 text-lg font-semibold">Complete your profile</h3>
                  <p className="mt-1 text-sm text-white/55">{completedCount}/{tasks.length} completed</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10 hover:text-white"
                  data-testid="button-close-complete-profile"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-300"
                  style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                  data-testid="status-complete-profile-progress"
                />
              </div>

              <div className="space-y-2">
                {tasks.map((task) => {
                  const Icon = task.icon;

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        if (task.onClick) {
                          task.onClick();
                          setIsOpen(false);
                        }
                      }}
                      disabled={!task.onClick}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${task.done ? "border-white/8 bg-white/[0.04] opacity-70" : "border-white/10 bg-white/[0.06] hover:bg-white/[0.1]"}`}
                      data-testid={`button-complete-profile-task-${task.id}`}
                    >
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/10">
                        <Icon className="h-5 w-5 text-white" />
                        {task.done && (
                          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{task.title}</p>
                        <p className="mt-0.5 text-xs text-white/50">{task.description}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium text-white/70">
                        {task.actionLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="toggle"
              type="button"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={() => setIsOpen(true)}
              className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white text-black shadow-[0_16px_50px_rgba(0,0,0,0.65)]"
              data-testid="button-open-complete-profile"
            >
              <div className="relative flex h-full w-full items-center justify-center">
                <Check className="h-6 w-6" />
                <div className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white shadow-[0_6px_18px_rgba(0,0,0,0.4)]">
                  {tasks.length - completedCount}
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
