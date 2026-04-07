import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Check, ChevronLeft, Sparkles, User, Wallet, Palette, Target } from "lucide-react";
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
  const [location, setLocation] = useLocation();
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
    const customizationDone = Boolean(userData?.cardStyle);
    const walletDone = Boolean(userData?.walletPin);
    const goalsDone = goalsCount > 0;

    return [
      {
        id: "account",
        title: "Create account",
        description: "Your account is ready",
        done: true,
        icon: User,
        actionLabel: "Done",
        onClick: undefined,
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
  }, [goalsCount, setLocation, user?.photoURL, userData?.cardStyle, userData?.photoURL, userData?.walletPin]);

  const completedCount = tasks.filter((task) => task.done).length;
  const isComplete = completedCount === tasks.length;
  const isHomePage = location === "/home" || location === "/";

  useEffect(() => {
    if (isComplete || !isHomePage) {
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
  }, [isComplete, isHomePage]);

  if (!user || !userData || isComplete || !isHomePage) return null;

  return (
    <>
      <AnimatePresence>
        {showBubble && !isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => {
              setIsOpen(true);
              setShowBubble(false);
            }}
            className="fixed right-24 top-1/2 z-[90] -translate-y-1/2 rounded-full border border-white/15 bg-black/88 px-4 py-3 text-left text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
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

      <div className="fixed right-3 top-1/2 z-[91] -translate-y-1/2">
        <AnimatePresence initial={false} mode="wait">
          {isOpen ? (
            <motion.div
              key="panel"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-[320px] rounded-[28px] border border-white/12 bg-black/88 p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-3xl"
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
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={() => setIsOpen(true)}
              className="group mr-0 flex items-center gap-3 rounded-l-full border border-r-0 border-white/12 bg-black/85 py-3 pl-4 pr-3 text-white shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
              data-testid="button-open-complete-profile"
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10">
                <Check className="h-5 w-5 text-white" />
                <div className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border border-black/50 bg-white px-1 text-[10px] font-bold text-black">
                  {completedCount}/{tasks.length}
                </div>
              </div>
              <div className="pr-1">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Profile</p>
                <p className="text-sm font-semibold leading-none">Complete</p>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
