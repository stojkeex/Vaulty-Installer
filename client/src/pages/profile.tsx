import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useLocation } from "wouter";
import { Sparkles, Edit2, ChevronRight, User, CreditCard, Activity, Shield, Code, Bell, LogOut, Crown, Plus } from "lucide-react";
import vaultyTextLogo from "@/assets/vaulty-text-logo.png";
import astronautImage from "@/assets/astronaut_no_bg.png";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, userData, signOut } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return <div className="min-h-screen bg-[#050505]" />;

  const userPoints = userData?.vaultyPoints || 543474.47;

  return (
    <div className="min-h-screen pb-32 bg-[#050505] text-white selection:bg-gray-500/30 animate-in fade-in font-sans">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
        <div className="w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.02] pointer-events-auto">
          <div className="w-full px-4 md:px-6 py-4 flex items-center justify-between">
             <div className="flex items-center -ml-2">
                <img
                    src={vaultyTextLogo}
                    alt="Vaulty"
                    className="h-6 md:h-8 object-contain"
                />
             </div>
             
             <Link href="/wallet">
                 <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#121218] backdrop-blur-xl px-4 py-2 cursor-pointer hover:bg-white/10 transition-all shadow-lg">
                     <Sparkles className="w-4 h-4 text-purple-400" />
                     <span className="text-[13px] font-bold text-white tracking-wide">{userPoints.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} VC</span>
                 </div>
             </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-5 max-w-[1200px] w-full mx-auto pt-24 space-y-4">
        
        {/* Profile Card */}
        <div className="rounded-[24px] border border-white/5 bg-[#0a0a0f] p-5 shadow-lg flex flex-col relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-900 to-black border border-purple-500/30 overflow-hidden flex items-center justify-center p-1 relative shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                        <img src={astronautImage} alt="Profile" className="w-full h-full object-cover rounded-full bg-black" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-white">{userData?.displayName || 'Alex'}</h2>
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        </div>
                        <p className="text-sm text-white/50 mb-2">{userData?.email || 'alex@vaulty.ai'}</p>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
                            <Crown className="w-3.5 h-3.5" /> Premium Plan
                        </div>
                    </div>
                </div>
                <button onClick={() => setLocation('/edit-profile')} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Edit2 className="w-4 h-4 text-white/70" />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-5">
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-medium">JOINED</p>
                    <p className="text-sm font-semibold">Mar 15, 2024</p>
                </div>
                <div className="text-center border-x border-white/5">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-medium">AGENTS</p>
                    <p className="text-sm font-semibold text-purple-400">8</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-medium">TOTAL MESSAGES</p>
                    <p className="text-sm font-semibold text-blue-400">125,430</p>
                </div>
            </div>
        </div>

        {/* Credits Block */}
        <div className="rounded-[24px] border border-white/5 bg-[#0a0a0f] p-5 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#1a0f2e] border border-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5 font-medium">Vaulty Credits</p>
                    <p className="text-lg font-bold text-white leading-tight">543,474.47 VC</p>
                    <p className="text-[10px] text-white/40">≈ 1.3M messages</p>
                </div>
            </div>
            <Button className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold">
                Top Up <Plus className="w-4 h-4 ml-1" />
            </Button>
        </div>

        {/* Plan Block */}
        <div className="rounded-[24px] border border-white/5 bg-[#0a0a0f] p-5 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5 font-medium">Your Plan</p>
                    <p className="text-lg font-bold text-white leading-tight">Premium</p>
                    <p className="text-[10px] text-blue-400 font-medium">Renews on Jun 15, 2025</p>
                </div>
            </div>
            <Button variant="ghost" className="h-10 px-4 rounded-xl hover:bg-white/5 text-white font-semibold">
                Manage Plan <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
        </div>

        {/* Menu Links */}
        <div className="rounded-[24px] border border-white/5 bg-[#0a0a0f] overflow-hidden shadow-lg">
            <MenuLink icon={User} label="Account Settings" onClick={() => setLocation('/settings')} />
            <MenuLink icon={CreditCard} label="Billing & Subscription" onClick={() => setLocation('/billing')} />
            <MenuLink icon={Activity} label="Usage & Limits" onClick={() => setLocation('/usage')} />
            <MenuLink icon={Shield} label="Security" onClick={() => setLocation('/security')} />
            <MenuLink icon={Code} label="API & Integrations" onClick={() => setLocation('/api')} />
            <MenuLink icon={Bell} label="Notifications" onClick={() => setLocation('/notifications')} />
        </div>

        {/* Log Out */}
        <div className="rounded-[24px] border border-red-500/10 bg-[#0a0a0f] overflow-hidden shadow-lg mt-4">
            <button 
                onClick={() => signOut()}
                className="w-full flex items-center justify-between p-5 hover:bg-red-500/5 transition-colors text-red-400"
            >
                <div className="flex items-center gap-4">
                    <LogOut className="w-5 h-5" />
                    <span className="font-semibold text-[15px]">Log Out</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
            </button>
        </div>

      </div>
    </div>
  );
}

function MenuLink({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 transition-colors last:border-b-0"
        >
            <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-white/50" />
                <span className="text-white font-semibold text-[15px]">{label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30" />
        </button>
    );
}
