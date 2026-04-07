import { useLocation } from "wouter";
import { ChevronLeft, Sparkles } from "lucide-react";
import { GoalsView } from "@/components/goals/goals-view";

export default function GoalsPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.14),transparent_30%),linear-gradient(180deg,#05070b_0%,#000_100%)] pb-28 text-white">
      <div className="sticky top-0 z-30 border-b border-white/6 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <button
            onClick={() => setLocation("/home")}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
            data-testid="button-goals-back"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-sky-300">
            Goal planner
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-5">
        <div className="mb-6 overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_32%),linear-gradient(145deg,rgba(13,18,30,0.96),rgba(4,7,14,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            Vaulty goals
          </div>
          <h1 className="mt-4 text-[2rem] font-black leading-[0.98] tracking-tight text-white">
            Turn big plans into a clean savings roadmap
          </h1>
          <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-slate-300">
            Build personal targets, track progress, and keep every milestone in one polished place.
          </p>
        </div>

        <GoalsView />
      </div>
    </div>
  );
}
