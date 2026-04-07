import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { ChevronLeft, Check, Sparkles, Headset, Gift, Lock, Zap, MessageSquare, Mic, Star, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, collection, getDocs, query, where } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { addMonths } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { usePremiumThanks } from "@/components/premium-thanks-modal";

// Import badge images
import badgePro from "/assets/badges/badge-pro.png";
import badgeUltra from "/assets/badges/badge-ultra.png";
import badgeMax from "/assets/badges/badge-max.png";

// Placeholder for generated asset
import heroImage from "@assets/generated_images/futuristic_ethereal_silhouetted_figure_in_cosmic_space_background.png";

// Initialize Stripe with the LIVE key
const stripePromise = loadStripe("pk_live_51SbQJ9HChlVvIks4OVBZysQhGeehAbwISpcSDuxNYy64nTJu780uJcvR0afAzKUZhpnVkFVHPv7iUPlcIYjEIDLh00GF5Z3JoY");

const CheckoutForm = ({ tier, price, billingCycle, onSuccess, onCancel }: { 
  tier: string, 
  price: number, 
  billingCycle: string, 
  onSuccess: () => void, 
  onCancel: () => void 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/premium?success=true",
        },
        redirect: "if_required",
      });

      if (submitError) {
        setError(submitError.message || "Payment failed");
        setProcessing(false);
      } else {
        // Payment successful
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium capitalize">{tier} Plan</span>
            <span className="font-bold">${price}/{billingCycle === "monthly" ? "mo" : "yr"}</span>
          </div>
          <div className="text-sm text-gray-400">
            Total to pay today
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <PaymentElement 
              options={{
                layout: "tabs",
                paymentMethodOrder: ["apple_pay", "google_pay", "card"],
              }}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-md border border-red-400/20">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!stripe || processing}
              className="flex-1 bg-white text-black font-bold hover:bg-gray-200"
            >
              {processing ? "Processing..." : `Pay $${price}`}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Lock size={12} />
        <span>Secured by Stripe (Live Mode)</span>
      </div>
    </div>
  );
};

const PaymentWrapper = ({ tier, price, billingCycle, onSuccess, onCancel }: {
  tier: string,
  price: number,
  billingCycle: string,
  onSuccess: () => void,
  onCancel: () => void
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: price, tier, billingCycle }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, [price, tier, billingCycle]);

  if (loading || !clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm 
        tier={tier} 
        price={price} 
        billingCycle={billingCycle}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default function Premium() {
  const { user, userData } = useAuth();
  const [location, setLocation] = useLocation();
  const { showPremiumThanks } = usePremiumThanks();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedTier, setSelectedTier] = useState<"pro" | "max" | "team">("pro");
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const tiers = {
    pro: {
      name: "Vaulty Pro",
      price: { monthly: 9.99, yearly: 99.99 },
      features: [
        { icon: <Zap size={20} />, text: "Higher usage on Fast & Expert", check: true },
        { icon: <Star size={20} />, text: "Basic AI Insights & Budgeting", check: true },
        { icon: <MessageSquare size={20} />, text: "Community Access", check: true },
        { icon: <Gift size={20} />, text: "Exclusive Profile Badge", check: true }
      ],
      points: 1000
    },
    max: {
      name: "Vaulty Max",
      price: { monthly: 39.99, yearly: 399.99 },
      features: [
        { icon: <Zap size={20} />, text: "Unlimited usage on Fast & Expert", check: true },
        { icon: <Star size={20} />, text: "Advanced AI Predictions & Coach", check: true },
        { icon: <Mic size={20} />, text: "Voice Mode & Smart Companions", check: true },
        { icon: <Sparkles size={20} />, text: "Early access to new features", check: true }
      ],
      points: 3500
    },
    team: {
      name: "Vaulty Team",
      price: { monthly: 139.99, yearly: 1399.99 },
      features: [
        { icon: <Zap size={20} />, text: "Enterprise usage for up to 5 users", check: true },
        { icon: <Star size={20} />, text: "Team Analytics & Shared Vault", check: true },
        { icon: <Headset size={20} />, text: "Dedicated Account Manager", check: true },
        { icon: <Lock size={20} />, text: "Audit Logs & Security Controls", check: true }
      ],
      points: 10000,
      pointsLabel: "3000 VC/user"
    }
  };

  const basePrice = tiers[selectedTier].price[billingCycle];
  let currentPrice = basePrice;
  let displayDiscount = appliedDiscount;
  
  if (appliedDiscount && appliedDiscount.plan) {
    if (appliedDiscount.plan !== "All" && appliedDiscount.plan.toLowerCase() !== selectedTier.toLowerCase()) {
      displayDiscount = null;
    }
  }
  
  if (displayDiscount && displayDiscount.discount) {
    const discountAmount = (basePrice * displayDiscount.discount) / 100;
    currentPrice = Math.round((basePrice - discountAmount) * 100) / 100;
  }

  const currentPlan = userData?.premiumPlan || userData?.subscription || "free";
  const currentSubscription = currentPlan.toLowerCase();

  useEffect(() => {
    const stored = sessionStorage.getItem("appliedDiscount");
    if (stored) {
      try { setAppliedDiscount(JSON.parse(stored)); } catch (e) { setAppliedDiscount(null); }
    }
  }, []);

  const handleSubscribeClick = () => {
    if (!user) return;
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    try {
      const points = tiers[selectedTier].points;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      await updateDoc(doc(db, "users", user.uid), {
        premiumPlan: selectedTier.toUpperCase(),
        subscription: selectedTier,
        subscriptionDate: new Date(),
        premiumExpiry: expiryDate,
        vaultyPoints: increment(points)
      });
      setShowPaymentModal(false);
      sessionStorage.removeItem("appliedDiscount");
      setAppliedDiscount(null);
      showPremiumThanks(selectedTier);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center overflow-x-hidden">
      {/* Background Image / Ethereal Figure */}
      <div className="absolute top-0 left-0 w-full h-[60vh] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />
        <img 
          src={heroImage} 
          alt="Premium background" 
          className="w-full h-full object-cover opacity-80"
        />
      </div>

      {/* Top Controls */}
      <div className="relative z-20 w-full flex justify-between p-6">
        <button 
          onClick={() => setLocation("/")}
          className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative z-20 flex flex-col items-center w-full max-w-md px-6 pt-16 pb-20 text-center flex-1 justify-center">
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1 mb-8"
        >
          <h1 className="text-5xl font-bold tracking-tight">{tiers[selectedTier].name}</h1>
          <p className="text-lg text-gray-300 font-medium max-w-[280px] mx-auto leading-tight">
            Vaulty 1.0: the smartest and most conversational version of Vaulty
          </p>
        </motion.div>

        {/* Features List */}
        <div className="w-full space-y-4 mb-10 px-4">
          {tiers[selectedTier].features.map((feature, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-white/80">{feature.icon}</span>
                <span className="text-base font-medium text-white">{feature.text}</span>
              </div>
              <Check size={18} className="text-white" />
            </motion.div>
          ))}
        </div>

        {/* Plan Selector */}
        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 mb-6 flex">
          {(Object.keys(tiers) as Array<keyof typeof tiers>).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                selectedTier === tier 
                  ? "bg-white/10 ring-1 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                  : "text-gray-500"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5">
                {tiers[tier].name.split(' ')[1]}
              </span>
              <span className={`text-base font-bold ${selectedTier === tier ? "text-white" : ""}`}>
                {tier === currentSubscription ? "Active" : `${tiers[tier].price[billingCycle]}€`}
              </span>
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubscribeClick}
          disabled={currentSubscription === selectedTier.toLowerCase()}
          className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-lg mb-6 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {currentSubscription === selectedTier.toLowerCase() ? "Current Plan" : "Upgrade Now"}
        </button>

        {/* Footer Links */}
        <div className="flex gap-4 text-xs text-gray-500 font-medium">
          <button onClick={() => setLocation("/tos")}>Terms & Conditions</button>
          <span>|</span>
          <button>Privacy Policy</button>
          <span>|</span>
          <button>Restore Purchases</button>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Secure Checkout</DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete your upgrade to {tiers[selectedTier].name}
            </DialogDescription>
          </DialogHeader>
          
          <PaymentWrapper
            tier={selectedTier} 
            price={currentPrice} 
            billingCycle={billingCycle}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
