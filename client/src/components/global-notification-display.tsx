import React from 'react';
import { useGlobalNotification } from '@/contexts/global-notification-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Sparkles, Shield, Info } from 'lucide-react';

export function GlobalNotificationDisplay() {
  const { notifications, removeNotification } = useGlobalNotification();

  return (
    <div className="fixed top-0 left-0 right-0 z-[10001] pointer-events-none pt-4">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const isPro = notification.message.toLowerCase().includes('pro') || 
                        notification.message.toLowerCase().includes('max') || 
                        notification.message.toLowerCase().includes('team') ||
                        notification.message.toLowerCase().includes('plan');
          
          const isVerified = notification.message.toLowerCase().includes('verified') || 
                             notification.message.toLowerCase().includes('badge');

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className="pointer-events-auto w-full mb-3"
            >
              <div className="max-w-2xl mx-auto px-4">
                <div className={`relative overflow-hidden rounded-full py-3 px-6 flex items-center justify-between shadow-2xl backdrop-blur-2xl border transition-all ${
                  isPro 
                    ? "bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-black/90 border-gray-500/40" 
                    : isVerified
                      ? "bg-gradient-to-r from-blue-900/90 to-black/90 border-blue-500/30"
                      : "bg-black/80 border-white/10"
                }`}>
                  {/* Decorative background glow for Premium/Special */}
                  {(isPro || isVerified) && (
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${
                      isPro ? "from-gray-400 via-transparent to-transparent" : "from-blue-400 via-transparent to-transparent"
                    }`} />
                  )}

                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isPro 
                        ? "bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg shadow-gray-500/30" 
                        : isVerified
                          ? "bg-blue-500/20 border border-blue-500/30"
                          : "bg-white/5 border border-white/10"
                    }`}>
                      {isPro ? (
                        <Sparkles className="h-4 w-4 text-white" />
                      ) : isVerified ? (
                        <Shield className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Bell className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold leading-tight truncate ${
                        isPro ? "text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300" : "text-white"
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
                    onClick={() => removeNotification(notification.id)}
                    className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                  >
                    <X size={18} className="text-white/40 hover:text-white" />
                  </button>
                  
                  {/* Subtle progress bar */}
                  {notification.duration && (
                    <motion.div 
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: (notification.duration / 1000), ease: "linear" }}
                      className={`absolute bottom-0 left-0 h-[2px] opacity-50 ${
                        isPro ? "bg-gray-400" : isVerified ? "bg-blue-400" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
