import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { ChevronLeft, Book, Download, Sparkles, Store, Coffee, Music, Video, Laptop, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const BUSINESS_ICONS: Record<string, any> = {
  shop: Store,
  bar: Coffee,
  singer: Music,
  creator: Video,
  cleaner: Sparkles,
  developer: Laptop,
};

export default function BusinessBooklet() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`vaulty_skills_${user.uid}`);
      if (savedData) {
        setData(JSON.parse(savedData));
      }
    }
  }, [user]);

  if (!data) {
    return <div className="min-h-screen bg-black text-white p-6">Loading...</div>;
  }

  const Icon = BUSINESS_ICONS[data.business] || Book;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-vaulty-gradient px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/high-income-skills">
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-vaulty-gradient hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Your Business Booklet</h1>
              <p className="text-xs text-white font-medium">Official Strategy</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center border-vaulty-gradient">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Cover */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border-vaulty-gradient rounded-[32px] p-8 text-center relative overflow-hidden shadow-[0_8px_32px_rgba(0,204,255,0.15)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full mix-blend-screen pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <Icon className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-black mb-2 tracking-tight">
              {data.brandName || "Your New Venture"}
            </h1>
            <p className="text-white font-bold tracking-widest uppercase text-xs mb-8">
              Official Playbook
            </p>
            
            <div className="w-full flex items-center justify-center gap-4 text-sm text-white/60 border-t border-vaulty-gradient pt-6 mt-6">
              <span>Budget: €{data.budget.toLocaleString()}</span>
              <span>•</span>
              <span>Founder Age: {data.age}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="bg-white/5 border-vaulty-gradient rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,204,255,0.1)]">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-white w-5 h-5" />
              Brand Assets
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-vaulty-gradient">
                <span className="text-white/60">Brand Name</span>
                <span className="font-bold">{data.brandName || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-vaulty-gradient">
                <span className="text-white/60">Logo Status</span>
                <span className="font-bold text-white">{data.hasLogo ? "Uploaded & Ready" : "Pending"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Social Handles</span>
                <span className="font-bold text-white">Secured</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border-vaulty-gradient rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,204,255,0.1)]">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Book className="text-white w-5 h-5" />
              Core Guidelines
            </h3>
            <div className="prose prose-invert max-w-none text-white/80 text-sm space-y-4">
              <p>
                This booklet represents the foundation of your new venture. Based on your starting capital of €{data.budget.toLocaleString()}, we recommend a lean, bootstrap approach.
              </p>
              <h4 className="text-white font-bold text-base mt-6 mb-2">Phase 1: Market Entry</h4>
              <ul className="list-disc pl-4 space-y-2">
                <li>Focus on organic growth before spending on ads.</li>
                <li>Leverage short-form video (TikTok, IG Reels) for free reach.</li>
                <li>Your first 10 customers will provide the most valuable feedback—listen to them.</li>
              </ul>

              <h4 className="text-white font-bold text-base mt-6 mb-2">Phase 2: Scaling</h4>
              <ul className="list-disc pl-4 space-y-2">
                <li>Reinvest 80% of profits back into the business.</li>
                <li>Build an email list from day one.</li>
                <li>Once you find a winning acquisition channel, double down your budget there.</li>
              </ul>
              
              <div className="mt-8 p-4 bg-white/10 border-vaulty-gradient rounded-2xl text-white/80">
                <strong className="text-white block mb-1">Vaulty AI Notice:</strong>
                This is a simulated basic playbook. In the future, this will contain a fully AI-generated personalized strategy guide tailored to your exact niche and market conditions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
