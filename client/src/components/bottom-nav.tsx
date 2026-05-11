import { Link, useLocation } from "wouter";
import { Home, User, Compass, Wallet, Bot, ShoppingBag } from "lucide-react";
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
    { href: "/marketplace", label: "STORE", icon: ShoppingBag },
    { href: "/home", label: "HOME", icon: Home },
    { href: "/ai", label: "ASTRO", icon: Bot },
    { href: "/wallet", label: "WALLET", icon: Wallet },
  ], []);

  const shouldHide = location === "/login" || 
                     location === "/register" || 
                     location === "/landing" ||
                     location.startsWith("/feature/") ||
                     location.startsWith("/demo-trading/") ||
                     location.startsWith("/messages/user/") ||
                     location === "/messages/global" ||
                     location.includes("/info") ||
                     location.startsWith("/course/") ||
                     location.startsWith("/academy/") ||
                     location === "/tos" ||
                     location === "/premium" ||
                     location.startsWith("/chat/private/") ||
                     location.startsWith("/coin/") ||
                     location === "/message-requests" ||
                     location === "/high-income-skills" ||
                     location.startsWith("/booklet/") ||
                     location === "/investment-simulator" ||
                     location === "/create-post";

  return (
    <div
      className="pointer-events-none fixed bottom-8 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4"
      style={{
        opacity: shouldHide ? 0 : 1,
        pointerEvents: shouldHide ? "none" : "auto",
        transition: "opacity 150ms ease-in-out",
        visibility: shouldHide ? "hidden" : "visible"
      }}
    >
      <div className="pointer-events-auto relative flex items-center justify-between gap-1 rounded-full bg-[#0a0a0a] px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/[0.05]">
        {items.map((item) => {
          let isActive = false;

          if (item.href === "/home") {
            isActive = location === "/home" || location === "/";
          } else {
            isActive = location.startsWith(item.href);
          }

          const content = (
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
              className={cn(
                "group relative flex h-14 w-[72px] flex-col items-center justify-center cursor-pointer overflow-hidden rounded-full"
              )}
              data-testid={`link-bottom-nav-${item.label.toLowerCase()}`}
            >
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    key="bubble"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 m-auto bg-[#1a1a1a] rounded-full shadow-inner"
                  />
                )}
              </AnimatePresence>

              <motion.div
                whileTap={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 500, damping: 12 }}
                className="relative z-10 flex items-center justify-center mt-1"
              >
                {/* @ts-ignore */}
                <item.icon
                  className="h-[22px] w-[22px]"
                  style={{
                    color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                    strokeWidth: 2,
                    transition: "color 150ms ease-in-out"
                  }}
                />
              </motion.div>

              <span
                className={cn(
                  "relative z-10 mt-1.5 text-[9px] font-bold tracking-widest transition-colors",
                  isActive ? "text-white" : "text-white/40"
                )}
              >
                {item.label}
              </span>

              {item.href === "/messages" && unreadCount > 0 && (
                <div className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[8px] font-bold text-black">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </motion.div>
          );

          return (
            <Link key={item.href} href={item.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
