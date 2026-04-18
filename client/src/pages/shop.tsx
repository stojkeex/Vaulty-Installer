import { useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { Brain, ChevronLeft, Coins, Loader2, Sparkles, Plus, Minus } from "lucide-react";
import { cn, formatPoints } from "@/lib/utils";
import { VaultyIcon } from "@/components/ui/vaulty-icon";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useDemoStore } from "@/hooks/use-demo-store";

type ShopItem = {
  id: string;
  name: string;
  description: string;
  vcCost: number;
  rewardAmount: number;
  rewardLabel: string;
  badge: string;
  kind: "demo" | "ai";
  isCustom?: boolean;
};

const DEMO_MONEY_PACKAGES: ShopItem[] = [
  {
    id: "demo-custom",
    name: "Demo Boost Custom",
    description: "Choose exactly how much demo cash you want to add.",
    vcCost: 0,
    rewardAmount: 0,
    rewardLabel: "Custom Demo Cash",
    badge: "Custom",
    kind: "demo",
    isCustom: true,
  },
  {
    id: "demo-10k",
    name: "Demo Boost I",
    description: "Perfect for a quick account top-up before your next trade.",
    vcCost: 1000,
    rewardAmount: 10000,
    rewardLabel: "10K Demo Cash",
    badge: "Starter",
    kind: "demo",
  },
  {
    id: "demo-25k",
    name: "Demo Boost II",
    description: "A stronger cash refill for bigger demo positions.",
    vcCost: 2000,
    rewardAmount: 25000,
    rewardLabel: "25K Demo Cash",
    badge: "Best value",
    kind: "demo",
  },
  {
    id: "demo-30k",
    name: "Demo Boost III",
    description: "Every next tier adds 5K more demo money for testing ideas.",
    vcCost: 3000,
    rewardAmount: 30000,
    rewardLabel: "30K Demo Cash",
    badge: "+5K",
    kind: "demo",
  },
  {
    id: "demo-35k",
    name: "Demo Boost IV",
    description: "More room to practice, scale, and reset your strategy.",
    vcCost: 4000,
    rewardAmount: 35000,
    rewardLabel: "35K Demo Cash",
    badge: "+5K",
    kind: "demo",
  },
  {
    id: "demo-40k",
    name: "Demo Boost V",
    description: "The largest demo refill for high-volume paper trading.",
    vcCost: 5000,
    rewardAmount: 40000,
    rewardLabel: "40K Demo Cash",
    badge: "+5K",
    kind: "demo",
  },
];

const AI_CREDIT_PACKAGES: ShopItem[] = [
  {
    id: "ai-custom",
    name: "AI Pack Custom",
    description: "Choose exactly how many AI credits you want to add.",
    vcCost: 0,
    rewardAmount: 0,
    rewardLabel: "Custom AI Credits",
    badge: "Custom",
    kind: "ai",
    isCustom: true,
  },
  {
    id: "ai-100",
    name: "AI Pack I",
    description: "Unlock extra Vaulty AI usage for quick questions and ideas.",
    vcCost: 10000,
    rewardAmount: 100,
    rewardLabel: "100 AI Credits",
    badge: "Starter",
    kind: "ai",
  },
  {
    id: "ai-250",
    name: "AI Pack II",
    description: "A bigger bundle for deeper sessions and more prompts.",
    vcCost: 20000,
    rewardAmount: 250,
    rewardLabel: "250 AI Credits",
    badge: "Best value",
    kind: "ai",
  },
  {
    id: "ai-300",
    name: "AI Pack III",
    description: "From here, every next tier adds 50 more AI credits.",
    vcCost: 30000,
    rewardAmount: 300,
    rewardLabel: "300 AI Credits",
    badge: "+50",
    kind: "ai",
  },
  {
    id: "ai-350",
    name: "AI Pack IV",
    description: "Built for frequent analysis, planning, and market questions.",
    vcCost: 40000,
    rewardAmount: 350,
    rewardLabel: "350 AI Credits",
    badge: "+50",
    kind: "ai",
  },
  {
    id: "ai-400",
    name: "AI Pack V",
    description: "The largest AI top-up for power users inside Vaulty AI.",
    vcCost: 50000,
    rewardAmount: 400,
    rewardLabel: "400 AI Credits",
    badge: "+50",
    kind: "ai",
  },
];

function ShopSection({
  title,
  subtitle,
  icon,
  packages,
  accentClass,
  purchasingId,
  userPoints,
  onPurchase,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  packages: ShopItem[];
  accentClass: string;
  purchasingId: string | null;
  userPoints: number;
  onPurchase: (item: ShopItem) => void;
}) {
  const [customAmount, setCustomAmount] = useState<number>(0);

  const getCustomCost = (amount: number, kind: "demo" | "ai") => {
    if (kind === "demo") {
      return (amount / 10000) * 1000;
    } else {
      return (amount / 100) * 10000;
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">{subtitle}</p>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border text-white shadow-lg", accentClass)}>
          {icon}
        </div>
      </div>

      <div className="space-y-3">
        {packages.map((item) => {
          const isCustom = item.isCustom;
          
          let currentRewardAmount = item.rewardAmount;
          let currentVcCost = item.vcCost;
          
          if (isCustom) {
             currentRewardAmount = customAmount;
             currentVcCost = getCustomCost(customAmount, item.kind);
          }

          const isDisabled = purchasingId !== null || userPoints < currentVcCost || (isCustom && customAmount <= 0);
          const isLoading = purchasingId === item.id;

          const handleCustomChange = (delta: number) => {
             const newAmount = Math.max(0, customAmount + delta);
             setCustomAmount(newAmount);
          };

          return (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              data-testid={`card-shop-item-${item.id}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_38%)]" />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">{item.name}</h3>
                    <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-300">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-right">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Reward</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {isCustom ? (item.kind === 'demo' ? `${formatPoints(currentRewardAmount)} Demo Cash` : `${formatPoints(currentRewardAmount)} AI Credits`) : item.rewardLabel}
                  </p>
                </div>
              </div>
              
              {isCustom && (
                 <div className="relative z-10 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/40 p-3">
                   <div className="flex items-center gap-3 w-full">
                     <button 
                       onClick={() => handleCustomChange(item.kind === 'demo' ? -5000 : -50)}
                       className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                     >
                       <Minus size={14} />
                     </button>
                     <input
                       type="number"
                       value={customAmount}
                       onChange={(e) => {
                         const val = parseInt(e.target.value) || 0;
                         setCustomAmount(Math.max(0, val));
                       }}
                       className="w-full bg-transparent text-center text-lg font-bold text-white outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                       placeholder="0"
                     />
                     <button 
                       onClick={() => handleCustomChange(item.kind === 'demo' ? 5000 : 50)}
                       className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                     >
                       <Plus size={14} />
                     </button>
                   </div>
                 </div>
              )}

              <div className="relative z-10 mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Price</p>
                  <p className="mt-1 flex items-center gap-2 text-base font-semibold text-white" data-testid={`text-shop-price-${item.id}`}>
                    <VaultyIcon size={16} />
                    {formatPoints(currentVcCost)} VC
                  </p>
                </div>

                <Button
                  onClick={() => onPurchase({ ...item, vcCost: currentVcCost, rewardAmount: currentRewardAmount })}
                  disabled={isDisabled}
                  className="h-11 rounded-2xl bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-gray-500"
                  data-testid={`button-buy-${item.id}`}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy now"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Shop() {
  const { user, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { balance, addFunds } = useDemoStore();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const userPoints = userData?.vaultyPoints || 0;
  const currentAiCredits = userData?.aiCredits || 0;

  const handlePurchase = async (item: ShopItem) => {
    if (!user || !userData) return;

    if (userPoints < item.vcCost) {
      toast({
        title: "Not enough Vaulty Credits",
        description: `You need ${formatPoints(item.vcCost)} VC, but you currently have ${formatPoints(userPoints)} VC.`,
        variant: "destructive",
      });
      return;
    }

    setPurchasingId(item.id);

    try {
      const userRef = doc(db, "users", user.uid);
      const nextVaultyPoints = userPoints - item.vcCost;

      if (item.kind === "demo") {
        await updateDoc(userRef, {
          vaultyPoints: nextVaultyPoints,
        });
        addFunds(item.rewardAmount);

        toast({
          title: "Demo money added",
          description: `${formatPoints(item.rewardAmount)} demo cash has been added to your account.`,
        });
      } else {
        const nextAiCredits = currentAiCredits + item.rewardAmount;
        await updateDoc(userRef, {
          vaultyPoints: nextVaultyPoints,
          aiCredits: nextAiCredits,
        });

        toast({
          title: "AI credits added",
          description: `${formatPoints(item.rewardAmount)} Vaulty AI credits are now in your balance.`,
        });
      }
    } catch (error) {
      console.error("Error purchasing shop item:", error);
      toast({
        title: "Purchase failed",
        description: "Something went wrong while processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-24 text-white">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/75 px-4 pb-5 pt-4 backdrop-blur-2xl">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setLocation("/home/overview")}
            className="rounded-full border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10"
            data-testid="button-back-shop"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500">Vaulty Store</p>
            <h1 className="text-2xl font-semibold tracking-tight">Point Shop</h1>
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-yellow-500/20 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(249,115,22,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-300/80">Available balance</p>
              <div className="mt-2 flex items-center gap-2 text-3xl font-bold text-white" data-testid="text-shop-vc-balance">
                {formatPoints(userPoints)} <VaultyIcon size={24} />
              </div>
              <p className="mt-3 max-w-xs text-sm text-yellow-50/70">
                Spend your Vaulty Credits on extra demo money and more Vaulty AI credits.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/20 bg-black/20">
              <Sparkles className="h-7 w-7 text-yellow-300" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4" data-testid="card-demo-balance">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Demo balance</p>
              <p className="mt-2 text-lg font-semibold text-white">${formatPoints(Math.round(balance))}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4" data-testid="card-ai-balance">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">AI credits</p>
              <p className="mt-2 text-lg font-semibold text-white">{formatPoints(currentAiCredits)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-4 py-6">
        <ShopSection
          title="Demo Money Packages"
          subtitle="1000 VC gets you 10K demo cash, 2000 VC gets you 25K, and every next tier adds 5K more."
          icon={<Coins className="h-6 w-6" />}
          packages={DEMO_MONEY_PACKAGES}
          accentClass="border-emerald-400/20 bg-white/10/10"
          purchasingId={purchasingId}
          userPoints={userPoints}
          onPurchase={handlePurchase}
        />

        <ShopSection
          title="Vaulty AI Credit Packages"
          subtitle="10K VC gets you 100 AI credits, 20K VC gets you 250, and every next tier adds 50 more."
          icon={<Brain className="h-6 w-6" />}
          packages={AI_CREDIT_PACKAGES}
          accentClass="border-fuchsia-400/20 bg-fuchsia-500/10"
          purchasingId={purchasingId}
          userPoints={userPoints}
          onPurchase={handlePurchase}
        />
      </div>
    </div>
  );
}
