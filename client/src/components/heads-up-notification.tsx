import React, { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Bell, Sparkles, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeadsUpNotif {
  id: string;
  message: string;
  description?: string;
  timestamp: any;
}

export function HeadsUpNotification() {
  const [notification, setNotification] = useState<HeadsUpNotif | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, "global_notifications"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const doc = change.doc;
          const data = doc.data();
          
          setNotification({
            id: doc.id,
            message: data.message,
            description: data.description,
            timestamp: data.timestamp
          });
          setIsVisible(true);

          const timer = setTimeout(() => {
            setIsVisible(false);
          }, 6000);

          return () => clearTimeout(timer);
        }
      });
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <div className="fixed top-0 left-0 right-0 z-[10002] pointer-events-none pt-4">
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            className="max-w-md mx-auto px-4 pointer-events-auto"
          >
            {(() => {
              const msg = (notification.message || "").toLowerCase();
              const isPro = msg.includes('pro') || msg.includes('max') || msg.includes('team') || msg.includes('plan');
              const isVerified = msg.includes('verified') || msg.includes('badge');

              return (
                <div className={`relative overflow-hidden rounded-full py-3 px-6 flex items-center justify-between shadow-2xl backdrop-blur-2xl border transition-all ${
                  isPro 
                    ? "bg-gradient-to-r from-blue-500/90 via-blue-500/50/90 to-black/90 border-gray-500/40" 
                    : isVerified
                      ? "bg-gradient-to-r from-blue-500 to-black/90 border-blue-500/30"
                      : "bg-black/80 border-vaulty-gradient"
                }`}>
                  {/* Decorative background glow */}
                  {(isPro || isVerified) && (
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${
                      isPro ? "from-blue-500 via-transparent to-transparent" : "from-blue-500 via-transparent to-transparent"
                    }`} />
                  )}

                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isPro 
                        ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-gray-500/30" 
                        : isVerified
                          ? "bg-white/10/20 border border-blue-500/30"
                          : "bg-white/5 border-vaulty-gradient"
                    }`}>
                      {isPro ? (
                        <Sparkles className="h-4 w-4 text-white" />
                      ) : isVerified ? (
                        <Shield className="h-4 w-4 text-white" />
                      ) : (
                        <Bell className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold leading-tight truncate ${
                        isPro ? "text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-500" : "text-white"
                      }`}>
                        {notification.message}
                      </p>
                      {notification.description && (
                        <p className="text-[11px] text-white/50 leading-tight truncate">
                          {notification.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsVisible(false)}
                    className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                  >
                    <X size={18} className="text-white/40 hover:text-white" />
                  </button>

                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 6, ease: "linear" }}
                    className={`absolute bottom-0 left-0 h-[2px] opacity-50 ${
                      isPro ? "bg-gray-400" : isVerified ? "bg-white/10" : "bg-white/20"
                    }`}
                  />
                </div>
              );
            })()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
