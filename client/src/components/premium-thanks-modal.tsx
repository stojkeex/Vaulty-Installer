import { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Star, Zap } from "lucide-react";

interface PremiumThanksContextType {
  showPremiumThanks: (tier: string) => void;
  hidePremiumThanks: () => void;
}

const PremiumThanksContext = createContext<PremiumThanksContextType | undefined>(undefined);

export const usePremiumThanks = () => {
  const context = useContext(PremiumThanksContext);
  if (!context) {
    throw new Error("usePremiumThanks must be used within PremiumThanksProvider");
  }
  return context;
};

export function PremiumThanksProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tier, setTier] = useState("PRO");

  const showPremiumThanks = (selectedTier: string) => {
    setTier(selectedTier.toUpperCase());
    setIsOpen(true);
  };

  const hidePremiumThanks = () => {
    setIsOpen(false);
  };

  return (
    <PremiumThanksContext.Provider value={{ showPremiumThanks, hidePremiumThanks }}>
      {children}
      <PremiumThanksModal isOpen={isOpen} tier={tier} onClose={hidePremiumThanks} />
    </PremiumThanksContext.Provider>
  );
}

function PremiumThanksModal({ isOpen, tier, onClose }: { isOpen: boolean; tier: string; onClose: () => void }) {
  const [displayText, setDisplayText] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayText(0);
      setShowConfetti(false);
      const timer = setTimeout(() => setShowConfetti(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const benefits = [
    "📊 Advanced Analytics",
    "🤖 AI Assistant Access",
    "💎 Exclusive Features",
    "🚀 Priority Support",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti Elements */}
          {showConfetti && (
            <>
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 1, 
                    y: -50, 
                    x: Math.random() * 100 - 50,
                    rotate: 0 
                  }}
                  animate={{ 
                    opacity: 0, 
                    y: window.innerHeight + 100,
                    rotate: Math.random() * 720
                  }}
                  transition={{ 
                    duration: 2.5 + Math.random() * 1.5, 
                    ease: "easeIn",
                    delay: Math.random() * 0.3
                  }}
                  className="fixed pointer-events-none"
                  style={{
                    left: `${50 + (Math.random() - 0.5) * 100}%`,
                    top: "-20px"
                  }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              ))}
            </>
          )}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-black border border-white/20 rounded-3xl overflow-hidden"
          >
            {/* Top decorative line */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-white/5 hover:bg-white/15 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 pt-12 pb-10 text-center">
              {/* Animated Icons */}
              <div className="flex justify-center gap-2 mb-8">
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="w-8 h-8 text-white/80" fill="white" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                >
                  <Zap className="w-8 h-8 text-white/80" fill="white" />
                </motion.div>
              </div>

              {/* Main Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-4"
              >
                <h2 className="text-5xl font-black text-white mb-2">
                  🎉 Congratulations!
                </h2>
              </motion.div>

              {/* Tier Display */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6"
              >
                <p className="text-xl text-white/80 mb-2">You've unlocked</p>
                <div className="inline-block px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-2xl">
                  <p className="text-4xl font-black text-white uppercase tracking-wider">{tier}</p>
                </div>
              </motion.div>

              {/* Benefits Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-8"
              >
                <p className="text-white/60 text-base leading-relaxed mb-6">
                  Get instant access to exclusive features and unlock the full power of Vaulty!
                </p>
              </motion.div>

              {/* Benefits Grid */}
              <motion.div
                className="grid grid-cols-2 gap-3 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm font-medium"
                  >
                    {benefit}
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 px-6 bg-white text-black font-black text-lg rounded-2xl transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                Start Exploring
              </motion.button>

              {/* Bottom text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-white/40 text-xs mt-6 font-mono tracking-wider uppercase"
              >
                Welcome to the premium experience
              </motion.p>
            </div>

            {/* Bottom decorative line */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
