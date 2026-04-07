import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { Check, Sparkles, Headset, Gift, Lock, Zap, MessageSquare, Mic, Star, X, ChevronDown } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { usePremiumThanks } from "@/components/premium-thanks-modal";
import badgePro from "@assets/IMG_1085_1775581026902.png";
import heroImage from "@assets/generated_images/futuristic_ethereal_silhouetted_figure_in_cosmic_space_background.png";

const stripePromise = loadStripe("pk_live_51SbQJ9HChlVvIks4OVBZysQhGeehAbwISpcSDuxNYy64nTJu780uJcvR0afAzKUZhpnVkFVHPv7iUPlcIYjEIDLh00GF5Z3JoY");

const CheckoutForm = ({ price, billingCycle, onSuccess, onCancel }: {
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
            <span className="font-medium">Vaulty+ Plan</span>
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

const PaymentWrapper = ({ price, billingCycle, onSuccess, onCancel }: {
  price: number,
  billingCycle: string,
  onSuccess: () => void,
  onCancel: () => void
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: price, tier: "plus", billingCycle }),
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
  }, [price, billingCycle]);

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
  const [, setLocation] = useLocation();
  const { showPremiumThanks } = usePremiumThanks();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const plan = {
    name: "Vaulty+",
    price: { monthly: 12.99, yearly: 89.99 },
    features: [
      { icon: <Zap size={20} />, text: "Unlimited Fast & Expert usage" },
      { icon: <Star size={20} />, text: "Advanced AI insights, budgeting and predictions" },
      { icon: <Mic size={20} />, text: "Voice mode and smart companions" },
      { icon: <MessageSquare size={20} />, text: "Full community access and premium conversations" },
      { icon: <Gift size={20} />, text: "Exclusive Vaulty+ badge and member drops" },
      { icon: <Sparkles size={20} />, text: "Early access to every upcoming feature" },
      { icon: <Headset size={20} />, text: "Priority support and premium account care" },
      { icon: <Lock size={20} />, text: "Advanced security controls and shared vault tools" },
    ],
    points: 5000,
  } as const;

  const monthlyTotal = plan.price.monthly * 12;
  const yearlySavings = monthlyTotal - plan.price.yearly;
  const yearlyDiscount = Math.round((yearlySavings / monthlyTotal) * 100);

  const basePrice = plan.price[billingCycle];
  let currentPrice = basePrice;
  let displayDiscount = appliedDiscount;

  if (appliedDiscount && appliedDiscount.plan) {
    const discountPlan = appliedDiscount.plan.toLowerCase();
    if (discountPlan !== "all" && discountPlan !== "plus") {
      displayDiscount = null;
    }
  }

  if (displayDiscount && displayDiscount.discount) {
    const discountAmount = (basePrice * displayDiscount.discount) / 100;
    currentPrice = Math.round((basePrice - discountAmount) * 100) / 100;
  }

  const currentPlan = (userData?.premiumPlan || userData?.subscription || "free").toString().toLowerCase();
  const currentSubscription = ["pro", "max", "team", "plus", "ultra"].includes(currentPlan) ? "plus" : currentPlan;
  const isCurrentPlan = currentSubscription === "plus";
  const visibleFeatures = showAllFeatures ? plan.features : plan.features.slice(0, 3);
  const hiddenFeaturesCount = Math.max(plan.features.length - 3, 0);

  useEffect(() => {
    const stored = sessionStorage.getItem("appliedDiscount");
    if (stored) {
      try {
        setAppliedDiscount(JSON.parse(stored));
      } catch (e) {
        setAppliedDiscount(null);
      }
    }
  }, []);

  const handleSubscribeClick = () => {
    if (!user) return;
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await updateDoc(doc(db, "users", user.uid), {
        premiumPlan: "PLUS",
        subscription: "plus",
        subscriptionDate: new Date(),
        premiumExpiry: expiryDate,
        vaultyPoints: increment(plan.points)
      });

      setShowPaymentModal(false);
      sessionStorage.removeItem("appliedDiscount");
      setAppliedDiscount(null);
      showPremiumThanks("Vaulty+");
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[60vh] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />
        <img
          src={heroImage}
          alt="Premium background"
          className="w-full h-full object-cover opacity-80"
        />
      </div>

      <div className="relative z-20 w-full flex justify-between p-6">
        <button
          onClick={() => setLocation("/")}
          className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
          data-testid="button-close-premium"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative z-20 flex flex-col items-center w-full max-w-md px-6 pt-12 pb-20 text-center flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 mb-8"
        >
          <div className="flex justify-center">
            <div className="relative rounded-[28px] border border-white/12 bg-white/5 px-5 py-4 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/12 via-transparent to-white/4" />
              <img
                src={badgePro}
                alt="Vaulty+ badge"
                className="relative z-10 h-20 w-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-gray-300">
              <Sparkles size={14} className="text-white" />
              One plan. Everything unlocked.
            </div>
            <h1 className="text-5xl font-bold tracking-tight">{plan.name}</h1>
            <p className="text-lg text-gray-300 font-medium max-w-[320px] mx-auto leading-tight">
              All Pro, Max and Team perks combined into one cleaner premium membership.
            </p>
          </div>
        </motion.div>

        <div className="w-full rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl p-3 mb-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`min-h-[132px] rounded-[24px] border px-4 py-4 text-left transition-all flex flex-col justify-between ${billingCycle === "monthly" ? "border-white/70 bg-white text-black shadow-[0_18px_40px_rgba(255,255,255,0.18)]" : "border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
              data-testid="button-monthly-plan"
            >
              <div className="space-y-2">
                <div className="inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                  Monthly
                </div>
                <div className="text-3xl font-black tracking-tight">$12.99</div>
              </div>
              <p className={`text-xs font-medium ${billingCycle === "monthly" ? "text-black/70" : "text-gray-400"}`}>
                Flexible billing, cancel anytime.
              </p>
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`min-h-[132px] rounded-[24px] border px-4 py-4 text-left transition-all flex flex-col justify-between ${billingCycle === "yearly" ? "border-white/70 bg-white text-black shadow-[0_18px_40px_rgba(255,255,255,0.18)]" : "border-emerald-400/20 bg-emerald-400/10 text-white hover:bg-emerald-400/15"}`}
              data-testid="button-yearly-plan"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                    Yearly
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${billingCycle === "yearly" ? "bg-black text-white" : "bg-emerald-400/15 text-emerald-300"}`}>
                    {yearlyDiscount}% OFF
                  </span>
                </div>
                <div className="text-3xl font-black tracking-tight">$89.99</div>
              </div>
              <p className={`text-xs font-medium ${billingCycle === "yearly" ? "text-black/70" : "text-emerald-200/80"}`}>
                Best deal for long-term access.
              </p>
            </button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/35 px-5 py-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-400">{billingCycle === "monthly" ? "Flexible billing" : "Best value yearly plan"}</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-5xl font-black tracking-tight">${currentPrice}</span>
                  <span className="pb-2 text-sm text-gray-400">/{billingCycle === "monthly" ? "month" : "year"}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
              <span className="text-sm font-medium text-gray-300">
                {billingCycle === "yearly" ? "You will save" : "Better value option"}
              </span>
              <span className={`text-sm font-black ${billingCycle === "yearly" ? "text-emerald-300" : "text-white"}`}>
                {billingCycle === "yearly" ? `$${yearlySavings.toFixed(2)} per year` : `Save ${yearlyDiscount}% with yearly`}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              {billingCycle === "yearly"
                ? `That's ${yearlyDiscount}% off compared with paying monthly for a full year.`
                : "Switch to yearly if you want the biggest deal."}
            </p>
          </div>
        </div>

        <div className="w-full mb-10 px-1">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-500">What you get</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Top premium benefits</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-300">
              {plan.points.toLocaleString()} bonus points
            </div>
          </div>

          <div className="space-y-4">
            {visibleFeatures.map((feature, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                key={feature.text}
                className="flex items-center justify-between rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
              >
                <div className="flex items-center gap-3 pr-4 text-left">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/90">{feature.icon}</span>
                  <span className="text-base font-semibold leading-tight text-white">{feature.text}</span>
                </div>
                <Check size={18} className="text-white shrink-0" />
              </motion.div>
            ))}
          </div>

          {hiddenFeaturesCount > 0 && (
            <button
              onClick={() => setShowAllFeatures((prev) => !prev)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              data-testid="button-toggle-premium-features"
            >
              <span>{showAllFeatures ? "Show less" : `View more benefits (${hiddenFeaturesCount})`}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAllFeatures ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        <button
          onClick={handleSubscribeClick}
          disabled={isCurrentPlan}
          className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-lg mb-4 active:scale-[0.98] transition-transform disabled:opacity-50"
          data-testid="button-upgrade-premium"
        >
          {isCurrentPlan ? "Current Plan" : `Upgrade to Vaulty+ for $${currentPrice}`}
        </button>

        <p className="text-sm text-gray-400 mb-6 max-w-[300px]">
          Premium access, exclusive badge, better AI and the strongest yearly discount in the app.
        </p>

        <div className="flex gap-4 text-xs text-gray-500 font-medium">
          <button onClick={() => setLocation("/tos")} data-testid="button-premium-terms">Terms & Conditions</button>
          <span>|</span>
          <button data-testid="button-premium-privacy">Privacy Policy</button>
          <span>|</span>
          <button data-testid="button-premium-restore">Restore Purchases</button>
        </div>
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Secure Checkout</DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete your upgrade to Vaulty+
            </DialogDescription>
          </DialogHeader>

          <PaymentWrapper
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
