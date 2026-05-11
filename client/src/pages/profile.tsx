import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useLocation } from "wouter";
import { Sparkles, Edit2, ChevronRight, User, CreditCard, Activity, Shield, Code, Bell, LogOut, Plus } from "lucide-react";
import astronautImage from "@/assets/astronaut_no_bg.png";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, userData, signOut } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return <div className="min-h-screen bg-black" />;

  const userPoints = userData?.vaultyPoints || 543474.47;

  return (
    <div className="min-h-screen pb-32 bg-black text-white selection:bg-white/20 animate-in fade-in font-sans">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
        <div className="w-full bg-black/80 backdrop-blur-xl border-b border-white/5 pointer-events-auto">
          <div className="w-full px-4 md:px-6 py-4 flex items-center justify-between">
             <div className="flex items-center tracking-[0.2em] font-medium text-lg">
                V A U L T Y
             </div>
             
             <Link href="/wallet">
                 <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-2 cursor-pointer hover:bg-white/5 transition-all">
                     <Sparkles className="w-4 h-4 text-white" />
                     <span className="text-[13px] font-medium text-white tracking-wide">{userPoints.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} VC</span>
                 </div>
             </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-5 max-w-[1200px] w-full mx-auto pt-24 space-y-6">
        
        {/* Profile Card */}
        <div className="rounded-[24px] border border-white/5 bg-[#0a0a0a] p-6 flex flex-col relative overflow-hidden">
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center p-0.5">
                        <img src={astronautImage} alt="Profile" className="w-full h-full object-cover rounded-full bg-black filter grayscale" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-[22px] font-semibold text-white tracking-tight">{userData?.displayName || 'Alex'}</h2>
                        </div>
                        <p className="text-[14px] text-white/50 mb-3">{userData?.email || 'alex@vaulty.ai'}</p>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/5 text-white/80 text-[11px] font-medium uppercase tracking-wider">
                            Premium Plan
                        </div>
                    </div>
                </div>
                <button onClick={() => setLocation('/edit-profile')} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Edit2 className="w-4 h-4 text-white/60" />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                <div className="text-center">
                    <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1 font-semibold">JOINED</p>
                    <p className="text-[15px] font-medium text-white">Mar 15, 2024</p>
                </div>
                <div className="text-center border-x border-white/5">
                    <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1 font-semibold">AGENTS</p>
                    <p className="text-[15px] font-medium text-white">8</p>
                </div>
                <div className="text-center">
                    <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1 font-semibold">MESSAGES</p>
                    <p className="text-[15px] font-medium text-white">125,430</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Credits Block */}
            <div className="rounded-[20px] border border-white/5 bg-[#0a0a0a] p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-white/5 border border-white/5 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-0.5 font-semibold">Vaulty Credits</p>
                        <p className="text-[16px] font-semibold text-white leading-tight">543,474.47 VC</p>
                    </div>
                </div>
                <Button className="h-9 px-4 rounded-lg bg-white text-black hover:bg-gray-200 text-[13px] font-medium">
                    Top Up
                </Button>
            </div>

            {/* Plan Block */}
            <div className="rounded-[20px] border border-white/5 bg-[#0a0a0a] p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-white/5 border border-white/5 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-0.5 font-semibold">Active Plan</p>
                        <p className="text-[16px] font-semibold text-white leading-tight">Premium</p>
                    </div>
                </div>
                <Button variant="ghost" className="h-9 px-3 rounded-lg hover:bg-white/5 text-white/70 text-[13px] font-medium">
                    Manage
                </Button>
            </div>
        </div>

        {/* Menu Links */}
        <div className="rounded-[24px] border border-white/5 bg-[#0a0a0a] overflow-hidden">
            <MenuLink icon={User} label="Account Settings" onClick={() => setLocation('/settings')} />
            <MenuLink icon={CreditCard} label="Billing & Subscription" onClick={() => setLocation('/billing')} />
            <MenuLink icon={Activity} label="Usage & Limits" onClick={() => setLocation('/usage')} />
            <MenuLink icon={Shield} label="Security" onClick={() => setLocation('/security')} />
            <MenuLink icon={Code} label="API & Integrations" onClick={() => setLocation('/api')} />
            <MenuLink icon={Bell} label="Notifications" onClick={() => setLocation('/notifications')} />
        </div>

        {/* Log Out */}
        <div className="rounded-[20px] border border-white/5 bg-[#0a0a0a] overflow-hidden mt-4">
            <button 
                onClick={() => signOut()}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors text-white"
            >
                <div className="flex items-center gap-4">
                    <LogOut className="w-5 h-5 opacity-60" />
                    <span className="font-medium text-[15px]">Log Out</span>
                </div>
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
            className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-b-0"
        >
            <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-white/50" />
                <span className="text-white font-medium text-[15px]">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30" />
        </button>
    );
}
