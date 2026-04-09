import { ChevronLeft, LineChart } from "lucide-react";
import { Link, useLocation } from "wouter";
import vaultyLogoImage from "@assets/IMG_1067_1775729849437.png";
import { cn } from "@/lib/utils";

export default function VaultyCoinInfoPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto p-4 flex items-center gap-4">
          <button 
            onClick={() => setLocation("/home")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">About Vaulty Coin</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-4 py-6">
          <div className="w-32 h-32 rounded-3xl bg-[linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.1))] border border-indigo-500/30 p-6 shadow-[0_0_40px_rgba(99,102,241,0.2)] flex items-center justify-center">
             <img src={vaultyLogoImage} alt="Vaulty Coin" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Vaulty Coin</h2>
            <div className="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Native Platform Token
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          <div className="p-6 rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)] border border-white/10 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              What is Vaulty Coin?
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Vaulty Coin is the native token of the Vaulty ecosystem. Currently, it is available exclusively for <strong className="text-white">demo investing</strong>. This allows our users to learn market dynamics, practice trading strategies, and experience the thrill of crypto investing in a completely risk-free environment.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)] border border-white/10 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              The Origin Story
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Vaulty Coin was born out of a simple need: to give our users a safe sandbox. We noticed many users wanted to learn about crypto but were afraid of the volatility. It started as a "demo investing" feature—a virtual currency to learn the ropes without financial risk.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-[linear-gradient(180deg,rgba(99,102,241,0.1),rgba(99,102,241,0.02))] border border-indigo-500/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(99,102,241,0.1)]">
            <h3 className="text-lg font-bold text-indigo-100 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(165,180,252,0.8)]"></span>
              Our Future Vision
            </h3>
            <p className="text-indigo-200/80 text-sm leading-relaxed">
              We have ambitious plans. In the future, we intend to introduce <strong className="text-white">real trading capabilities</strong> for Vaulty Coin. It will transition from a purely educational tool into a fully tradeable asset within the app ecosystem. Your demo experience today is shaping the real market of tomorrow.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="pt-6">
          <button 
            onClick={() => setLocation("/demo-trading/vaulty-coin")}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-[0.98]"
          >
            <LineChart className="w-6 h-6" />
            Trade Vaulty Coin
          </button>
          <p className="text-center text-xs text-gray-500 mt-4 uppercase tracking-wider font-semibold">
            Try Demo Trading Now
          </p>
        </div>

      </div>
    </div>
  );
}
