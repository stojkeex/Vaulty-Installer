import { Link, useLocation } from "wouter";
import { Home, MessageSquare, User, Compass, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

import VAULTY_AI_LOGO from "@assets/IMG_1067_1775569221193.png";

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
    const chatsUnsubscribe = onSnapshot(chatsQuery, (chatsSnapshot) => {
      // Mocking unread count logic
    }, (error) => {
      console.log("Error fetching chats:", error);
    });
    
    return () => chatsUnsubscribe();
  }, [user]);

  const items = useMemo(() => [
    { href: "/home", label: "HOME", icon: Home },
    { href: "/demo-trading", label: "MARKETS", icon: Compass },
    { href: "/ai", label: "AI", icon: Sparkles, isAI: true },
    { href: "/academy", label: "LEARN", icon: MessageSquare },
    { href: "/profile", label: "PROFILE", icon: User },
  ], []);

  // Check if we should hide the nav
  const shouldHide = location === "/login" || 
                     location === "/register" || 
                     location.startsWith("/demo-trading/") ||
                     location === "/ai" ||
                     location.startsWith("/messages") ||
                     location.startsWith("/course/") ||
                     location.startsWith("/academy/") ||
                     location === "/tos" ||
                     location === "/premium" ||
                     location.startsWith("/chat/private/") ||
                     location.startsWith("/create-companion") ||
                     location.startsWith("/coin/") ||
                     location.startsWith("/wallet") ||
                     location === "/message-requests" ||
                     location === "/create-post";

  return (
    <div 
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-auto pointer-events-none"
      style={{
        opacity: shouldHide ? 0 : 1,
        pointerEvents: shouldHide ? "none" : "auto",
        transition: "opacity 150ms ease-in-out",
        visibility: shouldHide ? "hidden" : "visible"
      }}
    >
      <div
        className="pointer-events-auto relative flex items-center justify-center p-2 rounded-full bg-black/80 backdrop-blur-3xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)] gap-1"
      >
        {items.map((item) => {
          let isActive = false;
          
          if (item.href === "/home") {
            isActive = location === "/home" || location === "/";
          } else if (item.href === "/messages") {
            isActive = location.startsWith("/messages");
          } else {
            isActive = location.startsWith(item.href);
          }
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative flex flex-col items-center justify-center w-16 h-14 rounded-full cursor-pointer group"
              >
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key="bubble"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-gradient-to-b from-white/25 to-white/5 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.3)] backdrop-blur-md"
                    />
                  )}
                </AnimatePresence>
                
                <motion.div
                  whileTap={{ scale: 1.15, y: -2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 12 }}
                  className={cn("flex items-center justify-center")}
                >
                  {item.isAI ? (
                    <img 
                      src={VAULTY_AI_LOGO} 
                      alt="Vaulty AI" 
                      className={cn(
                        "relative z-10 w-12 h-12 object-contain",
                        isActive ? "opacity-100 scale-110" : "opacity-80 scale-100"
                      )}
                    />
                  ) : (
                    item.icon && (
                      <item.icon 
                        className={cn(
                          "relative z-10 w-6 h-6",
                          isActive ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" : "group-hover:opacity-80"
                        )}
                        style={{
                          color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.55)",
                          stroke: "currentColor",
                          transition: "color 150ms ease-in-out, filter 150ms ease-in-out, opacity 150ms ease-in-out"
                        }}
                      />
                    )
                  )}
                </motion.div>

                {item.href === "/messages" && unreadCount > 0 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
