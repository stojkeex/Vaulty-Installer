import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function ChristmasOfferModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    // Show modal every time the app is loaded/logged in
    if (user) {
      setIsOpen(true);
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;

    if (timeLeft <= 0) {
      setIsOpen(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const plans = [
    { name: "PRO", regular: 9.99, promo: 7.49 },
    { name: "MAX", regular: 39.99, promo: 29.99 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-gray-500/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]"
          >
            {/* Christmas Theme Decoration */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600" />
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 pt-10 text-center">
              <div className="inline-block mb-4 px-4 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase">Limited Time Offer</span>
              </div>
              
              <h2 className="text-3xl font-black mb-2 text-white">
                CHRISTMAS OFFER
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                Use code <span className="text-white font-mono font-bold bg-white/10 px-2 py-0.5 rounded">CHRISTMAS25</span> for 25% OFF all plans!
                <br />
                <span className="text-[10px] opacity-50 mt-1 block">Valid from 1.12 to 9.1</span>
              </p>

              {/* Horizontal Scroll Plans */}
              <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                {plans.map((plan) => (
                  <div 
                    key={plan.name}
                    className="min-w-[200px] bg-white/5 border border-white/10 rounded-3xl p-6 snap-center"
                  >
                    <h3 className="text-xl font-black mb-4 text-white uppercase tracking-tighter">{plan.name}</h3>
                    <div className="space-y-1">
                      <p className="text-white/30 line-through text-sm font-medium">${plan.regular}</p>
                      <p className="text-4xl font-black bg-gradient-to-br from-gray-200 via-white to-gray-300 bg-clip-text text-transparent">${plan.promo}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">per month</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col items-center gap-4">
                <Button 
                  className="w-full h-14 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-600 hover:opacity-90 text-white font-black text-lg rounded-2xl shadow-xl shadow-gray-400/20 border-none"
                  onClick={() => setIsOpen(false)}
                >
                  GET OFFER NOW
                </Button>
                
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono font-bold tracking-widest">
                  <span>CLOSING IN</span>
                  <span className="text-white font-black w-6 text-xs">{timeLeft}</span>
                  <span>SECONDS</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
