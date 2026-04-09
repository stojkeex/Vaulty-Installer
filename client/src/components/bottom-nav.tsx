import { Link, useLocation } from "wouter";
import { Home, Users, User, Compass, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const chatsQuery = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
    const chatsUnsubscribe = onSnapshot(chatsQuery, () => {
    }, (error) => {
      console.log("Error fetching chats:", error);
    });

    return () => chatsUnsubscribe();
  }, [user]);

  const items = useMemo(() => [
    { href: "/demo-trading", label: "DEMO", icon: TrendingUp },
    { href: "/discover", label: "DISCOVER", icon: Compass },
    { href: "/home", label: "HOME", icon: Home },
    { href: "/posts", label: "FEED", icon: Users, disabled: true },
    { href: "/profile", label: "PROFILE", icon: User },
  ], []);

  const shouldHide = location === "/login" || 
                     location === "/register" || 
                     location.startsWith("/demo-trading/") ||
                     location === "/ai" ||
                     location.startsWith("/messages/user/") ||
                     location === "/messages/global" ||
                     location.includes("/info") ||
                     location.startsWith("/course/") ||
                     location.startsWith("/academy/") ||
                     location === "/tos" ||
                     location === "/premium" ||
                     location.startsWith("/chat/private/") ||
                     location.startsWith("/coin/") ||
                     location.startsWith("/wallet") ||
                     location === "/message-requests" ||
                     location === "/create-post";

  return (
    <div
      className="pointer-events-none fixed bottom-10 left-1/2 z-50 w-auto -translate-x-1/2"
      style={{
        opacity: shouldHide ? 0 : 1,
        pointerEvents: shouldHide ? "none" : "auto",
        transition: "opacity 150ms ease-in-out",
        visibility: shouldHide ? "hidden" : "visible"
      }}
    >
      <div className="pointer-events-auto relative flex items-end justify-center gap-1 rounded-full border border-white/15 bg-black/80 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
        {items.map((item) => {
          let isActive = false;

          if (item.href === "/home") {
            isActive = location === "/home" || location === "/";
          } else if (item.href === "/messages") {
            isActive = location.startsWith("/messages");
          } else {
            isActive = location.startsWith(item.href);
          }

          const content = (
            <motion.div
              whileTap={item.disabled ? {} : { scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
              className={cn(
                "group relative flex h-14 w-16 flex-col items-center justify-center rounded-full",
                item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              )}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                  alert("Stay Tuned");
                }
              }}
              data-testid={`link-bottom-nav-${item.label.toLowerCase()}`}
            >
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    key="bubble"
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.82 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 m-auto h-14 w-14 rounded-full border border-white/20 bg-gradient-to-b from-white/25 to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.3)] backdrop-blur-md"
                  />
                )}
              </AnimatePresence>

              <motion.div
                whileTap={{ scale: 1.08, y: -1 }}
                transition={{ type: "spring", stiffness: 500, damping: 12 }}
                className="relative z-10 flex items-center justify-center"
              >
                <item.icon
                  className="h-5.5 w-5.5"
                  style={{
                    color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.58)",
                    stroke: "currentColor",
                    transition: "color 150ms ease-in-out, filter 150ms ease-in-out, opacity 150ms ease-in-out"
                  }}
                />
              </motion.div>

              <span
                className={cn(
                  "relative z-10 mt-1 text-[9px] font-bold uppercase tracking-[0.18em] transition-colors",
                  isActive ? "text-white" : "text-white/45"
                )}
              >
                {item.label}
              </span>

              {item.href === "/messages" && unreadCount > 0 && (
                <div className="absolute right-2 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1.5 text-[9px] font-bold text-slate-950">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </motion.div>
          );

          return (
            <Link key={item.href} href={item.disabled ? "#" : item.href} onClick={(e) => {
              if (item.disabled) {
                e.preventDefault();
              }
            }}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
