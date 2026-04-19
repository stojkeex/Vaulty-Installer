import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Check, Link as LinkIcon, Sparkles, User, Wallet, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";

function hasCustomProfilePhoto(photoURL?: string | null) {
  if (!photoURL) return false;
  const normalized = photoURL.toLowerCase();
  return !normalized.includes("dicebear") && !normalized.includes("github.com/shadcn.png");
}

export function CompleteProfileWidget() {
  const { user, userData } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const tasks = useMemo(() => {
    const photoDone = hasCustomProfilePhoto(userData?.photoURL || user?.photoURL);
    const usernameDone = Boolean(userData?.username && String(userData.username).trim().length >= 3);
    const bioDone = Boolean(userData?.bio && String(userData.bio).trim().length >= 8);
    const links = userData?.links || {};
    const socialDone = Boolean(
      (links.website && String(links.website).trim().length >= 4) ||
      (links.instagram && String(links.instagram).trim().length >= 2) ||
      (links.twitter && String(links.twitter).trim().length >= 2)
    );
    const walletDone = Boolean(userData?.walletPin);

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
        id: "social",
        title: "Add one link",
        description: "Website or social profile",
        done: socialDone,
        icon: LinkIcon,
        actionLabel: socialDone ? "Done" : "Open",
        onClick: socialDone ? undefined : () => setLocation("/edit-profile"),
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
    ];
  }, [setLocation, user?.photoURL, userData?.bio, userData?.links, userData?.photoURL, userData?.username, userData?.walletPin]);

  const completedCount = tasks.filter((task) => task.done).length;
  const isComplete = tasks.length > 0 && completedCount === tasks.length;

  if (!user || isComplete) return null;

  return (
    <>
      <div className="fixed bottom-24 right-4 z-[9999]">
        <AnimatePresence initial={false} mode="wait">
          {isOpen ? (
            <>
              <motion.button
                key="overlay"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                data-testid="overlay-complete-profile"
              />
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="fixed left-1/2 top-1/2 z-[9999] w-[calc(100vw-32px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/12 bg-black/94 p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.7)] backdrop-blur-3xl"
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
                    className="flex h-10 w-10 items-center justify-center rounded-full border-vaulty-gradient bg-white/5 text-white/75 transition hover:bg-white/10 hover:text-white"
                    data-testid="button-close-complete-profile"
                  >
                    <X className="h-4 w-4" />
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
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${task.done ? "border-vaulty-gradient bg-white/[0.04] opacity-70" : "border-vaulty-gradient bg-white/[0.06] hover:bg-white/[0.1]"}`}
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
                        <span className="shrink-0 rounded-full border-vaulty-gradient bg-white/6 px-3 py-1 text-[11px] font-medium text-white/70">
                          {task.actionLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          ) : (
            <motion.button
              key="toggle"
              type="button"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={() => setIsOpen(true)}
              className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-black text-white shadow-[0_16px_50px_rgba(0,0,0,0.65)]"
              data-testid="button-open-complete-profile"
            >
              <div className="relative flex h-full w-full items-center justify-center">
                <Check className="h-6 w-6 text-white" />
                <div className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black shadow-[0_6px_18px_rgba(0,0,0,0.4)]">
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
