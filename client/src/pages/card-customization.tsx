import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { ChevronLeft, Palette, Check } from "lucide-react";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

type CardMode = "default" | "solid" | "gradient";

export default function CardCustomization() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cardMode, setCardMode] = useState<CardMode>("default");
  const [primaryColor, setPrimaryColor] = useState("#333333");
  const [secondaryColor, setSecondaryColor] = useState("#7c3aed");

  const colorOptions = [
    { id: "slate", value: "#333333", label: "Slate" },
    { id: "red", value: "#ef4444", label: "Red" },
    { id: "blue", value: "#3b82f6", label: "Blue" },
    { id: "green", value: "#22c55e", label: "Green" },
    { id: "purple", value: "#a855f7", label: "Purple" },
    { id: "orange", value: "#f97316", label: "Orange" },
    { id: "pink", value: "#ec4899", label: "Pink" },
    { id: "black", value: "#000000", label: "Black" },
    { id: "gold", value: "#f59e0b", label: "Gold" },
    { id: "teal", value: "#14b8a6", label: "Teal" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const cardStyle = data.cardStyle || {};
            setUserData(data);

            if (cardStyle.color && cardStyle.color !== "default") {
              setPrimaryColor(cardStyle.color);
              if (cardStyle.gradientTo) {
                setCardMode("gradient");
                setSecondaryColor(cardStyle.gradientTo);
              } else {
                setCardMode("solid");
              }
            } else {
              setCardMode("default");
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [user]);

  if (loading) return null;

  const hasPro = userData?.badges?.includes("premium-pro") || userData?.badges?.includes("premium-max") || userData?.badges?.includes("premium-team");

  if (!hasPro) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <Palette size={32} className="text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Customization Locked</h1>
        <p className="text-gray-400 mb-8 max-w-sm">
          Card customization is available exclusively for Vaulty+ members.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setLocation("/profile")}
            className="px-6 py-2 rounded-full border border-white/20 font-bold hover:bg-white/10"
            data-testid="button-back-profile"
          >
            Go Back
          </button>
          <button
            onClick={() => setLocation("/premium")}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold hover:brightness-110"
            data-testid="button-upgrade-pro"
          >
            Upgrade to PRO
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        cardStyle: {
          color: cardMode === "default" ? "default" : primaryColor,
          gradientTo: cardMode === "gradient" ? secondaryColor : null,
          size: userData?.cardStyle?.size || 100,
        }
      });
      toast({
        title: "Changes Saved",
        description: "Your card customization has been updated.",
      });
      setLocation("/profile");
    } catch (e) {
      console.error("Error saving customization:", e);
      toast({
        title: "Error",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const previewUser = {
    ...userData,
    cardStyle: {
      color: cardMode === "default" ? "default" : primaryColor,
      gradientTo: cardMode === "gradient" ? secondaryColor : null,
      size: userData?.cardStyle?.size || 100,
    }
  };

  const previewStyle = {
    color: cardMode === "default" ? "default" : primaryColor,
    gradientTo: cardMode === "gradient" ? secondaryColor : undefined,
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 flex flex-col">
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/profile")} className="p-2 hover:bg-white/10 rounded-full" data-testid="button-back-profile">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">Customize Card</h1>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-gray-200"
          data-testid="button-save-customization"
        >
          <Check size={16} /> Save
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 p-6 overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 p-8 min-h-[600px] overflow-hidden relative">
          <div className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-wider" data-testid="text-live-preview">Live Preview</div>
          <div className="transform transition-all duration-300 w-[340px]">
            <ProfileCard
              user={previewUser}
              isOwner={true}
              hideControls={true}
              customStyle={previewStyle}
            />
          </div>
        </div>

        <div className="w-full lg:w-96 space-y-8 h-full overflow-y-auto pr-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold">
              <Palette size={20} className="text-gray-400" />
              <h3>Card Colors</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "default", label: "Default" },
                { id: "solid", label: "Solid" },
                { id: "gradient", label: "Gradient" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setCardMode(mode.id as CardMode)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${cardMode === mode.id ? "border-white bg-white text-black shadow-lg shadow-white/10" : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"}`}
                  data-testid={`button-card-mode-${mode.id}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Primary Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      if (cardMode === "default") setCardMode("solid");
                    }}
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    data-testid="input-primary-color-picker"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      if (cardMode === "default") setCardMode("solid");
                    }}
                    className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 font-mono text-sm uppercase"
                    data-testid="input-primary-color-hex"
                  />
                </div>
              </div>

              {cardMode === "gradient" && (
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Gradient Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      data-testid="input-secondary-color-picker"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 font-mono text-sm uppercase"
                      data-testid="input-secondary-color-hex"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-400 uppercase">Quick Colors</div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setPrimaryColor(color.value);
                      if (cardMode === "default") {
                        setCardMode("solid");
                      }
                    }}
                    className={`shrink-0 w-12 h-12 rounded-full border-2 transition-all ${primaryColor === color.value && cardMode !== "default" ? "border-white scale-110 shadow-lg shadow-white/20" : "border-white/10 hover:border-white/30"}`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                    data-testid={`button-primary-preset-${color.id}`}
                  />
                ))}
              </div>
            </div>

            {cardMode === "gradient" && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase">Gradient Pairing</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "violet-pink", from: "#7c3aed", to: "#ec4899", label: "Violet Pink" },
                    { id: "blue-cyan", from: "#2563eb", to: "#06b6d4", label: "Blue Cyan" },
                    { id: "emerald-teal", from: "#10b981", to: "#14b8a6", label: "Emerald Teal" },
                    { id: "orange-rose", from: "#f97316", to: "#f43f5e", label: "Orange Rose" },
                  ].map((pair) => (
                    <button
                      key={pair.id}
                      onClick={() => {
                        setCardMode("gradient");
                        setPrimaryColor(pair.from);
                        setSecondaryColor(pair.to);
                      }}
                      className="rounded-2xl border border-white/10 p-3 text-left hover:bg-white/5 transition-colors"
                      data-testid={`button-gradient-preset-${pair.id}`}
                    >
                      <div className="h-12 rounded-xl mb-2" style={{ background: `linear-gradient(135deg, ${pair.from}, ${pair.to})` }} />
                      <div className="text-sm font-semibold text-white">{pair.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
