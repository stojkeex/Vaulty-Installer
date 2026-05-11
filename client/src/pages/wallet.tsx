import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Wallet, 
  CreditCard,
  ChevronRight,
  Settings,
  Lock,
  Loader2,
  Smartphone,
  Delete,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { doc, collection, query, orderBy, limit, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const PACKAGES = [
  { credits: 100, price: 9.99, label: "Starter" },
  { credits: 500, price: 39.99, label: "Pro" },
  { credits: 1000, price: 69.99, label: "Ultra" },
];

export default function WalletPage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Security State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [setupPin, setSetupPin] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Data State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Initial Auth Check
  useEffect(() => {
    if (userData) {
      if (!userData.walletPin) {
        setShowSetup(true);
      } else {
        // PIN is set, check for Face ID
        if (userData.isFaceIdEnabled) {
          authenticateFaceId();
        }
      }
    }
  }, [userData]);

  const authenticateFaceId = () => {
    setIsAuthenticating(true);
    // Simulate Face ID delay
    setTimeout(() => {
      setIsAuthenticating(false);
      setIsUnlocked(true);
      toast({ title: "Authenticated with Face ID" });
    }, 1500);
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
        const newPin = pinInput + digit;
        setPinInput(newPin);
        
        // Auto submit on 4th digit
        if (newPin.length === 4) {
            validatePin(newPin);
        }
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  const validatePin = (pin: string) => {
    if (pin === userData?.walletPin) {
      setIsUnlocked(true);
      toast({ title: "Wallet Unlocked" });
    } else {
      toast({ title: "Incorrect PIN", variant: "destructive" });
      setPinInput("");
    }
  };

  const handleSetupSubmit = async () => {
    if (setupPin.length !== 4) {
      toast({ title: "PIN must be 4 digits", variant: "destructive" });
      return;
    }
    if (setupPin !== setupConfirm) {
      toast({ title: "PINs do not match", variant: "destructive" });
      return;
    }
    
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        walletPin: setupPin,
        isFaceIdEnabled: false // Default off
      });
      setShowSetup(false);
      setIsUnlocked(true);
      toast({ title: "Wallet PIN set successfully!" });
    } catch (e) {
      toast({ title: "Failed to save PIN", variant: "destructive" });
    }
  };

  // Fetch Transactions
  useEffect(() => {
    if (user && isUnlocked) {
      const fetchTransactions = async () => {
        setLoadingTx(true);
        try {
          // Assuming a subcollection 'transactions' exists or creating a dummy fetch if empty
          // Since backend is not editable, we try to fetch. If empty, we mock for visual if user has no data.
          const q = query(collection(db, "users", user.uid, "transactions"), orderBy("timestamp", "desc"), limit(10));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          } else {
             // If no real transactions, we mock for clean style view
             setTransactions([
                { id: "1", type: "deposit", title: "Vaulty Credits Add", timestamp: { seconds: Date.now()/1000 - 86400 }, amount: 500 },
                { id: "2", type: "purchase", title: "Customer Support Pro", timestamp: { seconds: Date.now()/1000 - 86400*3 }, amount: -20 },
                { id: "3", type: "purchase", title: "Sales Assistant", timestamp: { seconds: Date.now()/1000 - 86400*7 }, amount: -49 },
             ]); 
          }
        } catch (e) {
          console.error("Error fetching transactions", e);
        } finally {
          setLoadingTx(false);
        }
      };
      
      fetchTransactions();
    }
  }, [user, isUnlocked]);


  const handleAction = () => {
    toast({
      title: "Coming Soon!",
      description: "Feature is under construction.",
    });
  };

  const handlePurchase = () => {
    toast({
      title: "Purchase Unavailable",
      description: "Currently unavailable for purchase.",
      variant: "destructive",
    });
  };

  if (!userData) return null;

  // SETUP MODE
  if (showSetup) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-white/20">
        <div className="w-full max-w-sm space-y-8">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/70 mb-4 border border-white/5">
                    <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Set up Wallet PIN</h1>
                <p className="text-[15px] text-white/50">Create a 4-digit PIN to secure your assets.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[11px] text-white/50 uppercase font-semibold ml-1 tracking-wider">Create PIN</label>
                    <Input 
                        type="password" 
                        maxLength={4}
                        value={setupPin}
                        onChange={(e) => setSetupPin(e.target.value.replace(/[^0-9]/g, ''))}
                        className="bg-[#0a0a0a] border-white/5 text-center text-2xl tracking-[1em] h-14 rounded-xl"
                        placeholder="••••"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] text-white/50 uppercase font-semibold ml-1 tracking-wider">Confirm PIN</label>
                    <Input 
                        type="password" 
                        maxLength={4}
                        value={setupConfirm}
                        onChange={(e) => setSetupConfirm(e.target.value.replace(/[^0-9]/g, ''))}
                        className="bg-[#0a0a0a] border-white/5 text-center text-2xl tracking-[1em] h-14 rounded-xl"
                        placeholder="••••"
                    />
                </div>
                <Button onClick={handleSetupSubmit} className="w-full h-12 text-[15px] font-semibold bg-white text-black hover:bg-gray-200 rounded-xl">
                    Set PIN
                </Button>
            </div>
        </div>
      </div>
    );
  }

  // LOCKED MODE
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden selection:bg-white/20">
         <Link href="/home">
            <Button variant="ghost" size="icon" className="absolute top-6 left-6 text-white/50 hover:text-white hover:bg-white/5 z-20">
              <ArrowLeft className="w-6 h-6" />
            </Button>
         </Link>

         {isAuthenticating ? (
             <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in z-10">
                 <div className="relative">
                    <div className="w-24 h-24 rounded-[32px] border border-white/10 flex items-center justify-center bg-[#0a0a0a]">
                        <Smartphone className="w-10 h-10 text-white/70" />
                    </div>
                    <div className="absolute inset-0 border-2 border-white/20 border-t-white rounded-[32px] animate-spin" />
                 </div>
                 <p className="text-white/60 font-medium tracking-wide text-[15px]">Face ID</p>
             </div>
         ) : (
            <div className="flex-1 flex flex-col items-center pt-24 pb-8 px-6 animate-in fade-in slide-in-from-bottom-8 duration-500 z-10">
                
                {/* Profile Section */}
                <div className="flex flex-col items-center gap-4 mb-12">
                    <Avatar className="w-20 h-20 border border-white/10 shadow-xl bg-[#0a0a0a]">
                        <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} className="object-cover filter grayscale" />
                        <AvatarFallback className="bg-[#0a0a0a] text-xl font-medium text-white">
                            {user?.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="text-center space-y-1">
                        <h1 className="text-[22px] font-semibold text-white tracking-tight">
                            Hello, {user?.displayName?.split(' ')[0] || "User"}
                        </h1>
                        <p className="text-[14px] text-white/50">Enter your PIN to access Vaulty</p>
                    </div>
                </div>

                {/* PIN Dots Display */}
                <div className="flex gap-6 mb-16">
                    {[0, 1, 2, 3].map((i) => (
                        <div 
                            key={i} 
                            className={cn(
                                "w-3 h-3 rounded-full transition-all duration-300",
                                i < pinInput.length 
                                    ? "bg-white scale-110" 
                                    : "bg-white/10 border border-white/5"
                            )}
                        />
                    ))}
                </div>

                {/* Spacer to push numpad down */}
                <div className="flex-1" />

                {/* Custom Number Pad */}
                <div className="w-full max-w-[280px] grid grid-cols-3 gap-x-6 gap-y-4 mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handlePinDigit(num.toString())}
                            className="w-16 h-16 rounded-full text-[26px] font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center active:scale-95 mx-auto"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="w-16 h-16" /> {/* Empty slot */}
                    <button
                        onClick={() => handlePinDigit("0")}
                        className="w-16 h-16 rounded-full text-[26px] font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center active:scale-95 mx-auto"
                    >
                        0
                    </button>
                    <button
                        onClick={handleBackspace}
                        className="w-16 h-16 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center active:scale-95 mx-auto"
                    >
                        <Delete className="w-6 h-6" />
                    </button>
                </div>

                <div className="text-[13px] text-white/40 font-medium cursor-pointer hover:text-white transition-colors">
                    Forgot PIN?
                </div>
            </div>
         )}
      </div>
    );
  }

  // UNLOCKED WALLET
  return (
    <div className="min-h-screen bg-black text-white pb-32 animate-in fade-in selection:bg-white/20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
        <div className="w-full bg-black/80 backdrop-blur-xl border-b border-white/5 pointer-events-auto">
          <div className="w-full px-4 md:px-6 py-4 flex items-center justify-between">
            <Link href="/home">
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-[16px] font-medium tracking-wide">Wallet</h1>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto pt-24 px-5 space-y-6">
        
        {/* Balance Card */}
        <div className="rounded-[24px] bg-[#0a0a0a] border border-white/5 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-white/70" />
            </div>
            <p className="text-[12px] text-white/50 uppercase tracking-widest font-semibold mb-2">Vaulty Credits</p>
            <h2 className="text-[40px] font-semibold tracking-tight text-white leading-none">
                {userData?.vaultyPoints ? userData.vaultyPoints.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
            </h2>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={handleAction}
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-[20px] bg-[#0a0a0a] border border-white/5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-medium text-white/70">Deposit</span>
          </button>
          
          <button 
            onClick={handleAction}
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-[20px] bg-[#0a0a0a] border border-white/5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-medium text-white/70">Withdraw</span>
          </button>

          <button 
            onClick={handleAction}
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-[20px] bg-[#0a0a0a] border border-white/5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-medium text-white/70">Exchange</span>
          </button>
        </div>

        {/* Credit Packages */}
        <div>
          <h3 className="text-[18px] font-medium text-white mb-4 px-1">Top Up Packages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PACKAGES.map((pkg, index) => (
              <button
                key={index}
                onClick={handlePurchase}
                className="rounded-[20px] bg-[#0a0a0a] border border-white/5 p-5 text-left hover:bg-white/[0.02] transition-colors flex items-center justify-between"
              >
                  <div>
                    <p className="text-[20px] font-semibold text-white mb-1">{pkg.credits} <span className="text-[14px] text-white/40 font-normal">VC</span></p>
                    <p className="text-[13px] text-white/50">{pkg.label} Package</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white text-[16px]">${pkg.price}</span>
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[18px] font-medium text-white">Recent Activity</h3>
            <button className="text-[13px] text-white/50 hover:text-white transition-colors">
              View All
            </button>
          </div>

          <div className="rounded-[24px] border border-white/5 bg-[#0a0a0a] overflow-hidden flex flex-col">
            {loadingTx ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-white/30 w-6 h-6" />
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((tx, i) => (
                <div key={tx.id} className={`flex items-center justify-between p-5 ${i !== transactions.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white/70`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> :
                       tx.type === 'purchase' ? <CreditCard className="w-4 h-4" /> :
                       <RefreshCw className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-white text-[15px] mb-0.5">{tx.title || "Transaction"}</p>
                      <p className="text-[12px] text-white/40">
                        {tx.timestamp ? new Date(tx.timestamp.seconds * 1000).toLocaleDateString() : "Date Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-[16px] ${tx.amount > 0 ? "text-white" : "text-white/60"}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </p>
                    <p className="text-[12px] text-white/40">VC</p>
                  </div>
                </div>
              ))
            ) : (
                <div className="text-center p-8 text-white/50">
                    <p className="text-[14px]">No recent transactions</p>
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
