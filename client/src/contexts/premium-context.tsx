import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type SubscriptionTier = "free" | "plus";

interface PremiumContextType {
  subscription: SubscriptionTier;
  loading: boolean;
  hasAccess: (requiredTier: SubscriptionTier) => boolean;
  isPremium: boolean;
  tier: SubscriptionTier;
}

const PremiumContext = createContext<PremiumContextType>({
  subscription: "free",
  loading: true,
  hasAccess: () => false,
  isPremium: false,
  tier: "free",
});

export const usePremium = () => useContext(PremiumContext);

const normalizePlan = (plan: unknown): SubscriptionTier => {
  if (typeof plan !== "string") return "free";
  return ["pro", "max", "team", "ultra", "plus"].includes(plan.toLowerCase()) ? "plus" : "free";
};

export const PremiumProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription("free");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        const plan = userData?.premiumPlan || userData?.subscription || "free";
        setSubscription(normalizePlan(plan));
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription("free");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const hasAccess = (requiredTier: SubscriptionTier) => {
    if (requiredTier === "free") return true;
    return subscription === "plus";
  };

  return (
    <PremiumContext.Provider
      value={{
        subscription,
        loading,
        hasAccess,
        isPremium: subscription === "plus",
        tier: subscription
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};
