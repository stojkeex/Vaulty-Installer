import { useState, useEffect, useMemo } from "react";
import { Plus, Target, Sparkles, TrendingUp, Clock3 } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { GoalCard } from "./goal-card";
import { CreateGoalDialog } from "./create-goal-dialog";

export function GoalsView() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "goals"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));
      setGoals(goalsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const totalTarget = goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
    const averageProgress = totalTarget > 0 ? Math.min(100, (totalCurrent / totalTarget) * 100) : 0;

    const deadlines = goals
      .map((goal) => {
        const deadlineDate = goal.deadline?.toDate ? goal.deadline.toDate() : new Date(goal.deadline);
        return differenceInDays(deadlineDate, new Date());
      })
      .filter((days) => Number.isFinite(days));

    const nearestDeadline = deadlines.length ? Math.min(...deadlines) : null;

    return {
      totalGoals,
      totalTarget,
      totalCurrent,
      averageProgress,
      nearestDeadline,
    };
  }, [goals]);

  if (loading) {
    return <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-t-2 border-sky-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">Your goals</h2>
          <p className="mt-1 text-sm text-zinc-400">Professional planning for the things you really want.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-400 to-blue-500 text-slate-950 shadow-[0_16px_36px_rgba(59,130,246,0.3)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
          data-testid="button-create-goal"
        >
          <Plus size={22} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[24px] border border-white/8 bg-white/[0.05] p-4 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            <Target className="h-3.5 w-3.5" />
            Active
          </div>
          <p className="text-2xl font-black text-white" data-testid="text-goals-count">{stats.totalGoals}</p>
        </div>
        <div className="rounded-[24px] border border-white/8 bg-white/[0.05] p-4 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            <TrendingUp className="h-3.5 w-3.5" />
            Progress
          </div>
          <p className="text-2xl font-black text-white" data-testid="text-goals-progress">{Math.round(stats.averageProgress)}%</p>
        </div>
        <div className="rounded-[24px] border border-white/8 bg-white/[0.05] p-4 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            <Clock3 className="h-3.5 w-3.5" />
            Deadline
          </div>
          <p className="text-lg font-black text-white" data-testid="text-goals-deadline">
            {stats.nearestDeadline === null ? "—" : stats.nearestDeadline < 0 ? "Ended" : `${stats.nearestDeadline}d`}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_28%),linear-gradient(145deg,rgba(15,23,42,0.88),rgba(2,6,23,0.94))] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.32)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              Strategy view
            </div>
            <h3 className="mt-4 text-2xl font-black leading-tight text-white">Stay on top of every milestone</h3>
            <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-slate-300">
              Keep your targets visible, monitor momentum, and build confidence with a cleaner savings flow.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Capital tracked</p>
            <p className="mt-2 text-lg font-black text-white" data-testid="text-goals-capital-tracked">
              {Math.round(stats.totalCurrent).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.04] px-5 py-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sky-300">
            <Target size={30} />
          </div>
          <h3 className="text-xl font-black text-white">No goals yet</h3>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
            Start with a car, apartment, emergency fund, or dream trip and turn it into a clear plan.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-6 rounded-full bg-sky-400 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 transition-colors hover:bg-sky-300"
            data-testid="button-create-first-goal"
          >
            Create first goal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <CreateGoalDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        currentGoalCount={goals.length}
      />
    </div>
  );
}
