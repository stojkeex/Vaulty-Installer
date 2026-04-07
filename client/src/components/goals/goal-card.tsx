import { useState } from "react";
import { MoreVertical, Trash2, Sparkles, TrendingUp, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useCurrency } from "@/contexts/currency-context";
import { VaultyIcon } from "@/components/ui/vaulty-icon";

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: any; // Firestore Timestamp
  imageUrl?: string;
}

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");

  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const deadlineDate = goal.deadline?.toDate ? goal.deadline.toDate() : new Date(goal.deadline);
  const daysLeft = differenceInDays(deadlineDate, new Date());
  
  const handleDelete = async () => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this goal?")) {
      await deleteDoc(doc(db, "users", user.uid, "goals", goal.id));
    }
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setAnalysisOpen(true);
    
    // Mock AI Analysis
    setTimeout(() => {
      const dailySaving = (goal.targetAmount - goal.currentAmount) / Math.max(1, daysLeft);
      const isOnTrack = dailySaving < (goal.targetAmount * 0.01); // Arbitrary logic
      
      let advice = "";
      if (daysLeft < 0) {
        advice = "This goal is past its deadline. Consider adjusting the timeline or prioritizing a lump sum contribution.";
      } else if (progress >= 100) {
        advice = "Congratulations! You've reached your goal. Time to set a new one!";
      } else {
        advice = `To reach your goal of ${goal.targetAmount.toLocaleString()} Credits by ${deadlineDate.toLocaleDateString()}, you need to save approximately ${dailySaving.toLocaleString()} Credits per day. ${isOnTrack ? "You are on track!" : "You might need to increase your savings rate."} Consider setting up automatic transfers to stay consistent.`;
      }
      
      setAnalysisResult(advice);
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.12),transparent_26%),linear-gradient(145deg,rgba(15,23,42,0.82),rgba(2,6,23,0.92))] shadow-[0_14px_36px_rgba(0,0,0,0.24)] transition-all hover:border-sky-400/20 hover:shadow-[0_18px_42px_rgba(37,99,235,0.18)]">
        <div className="h-32 w-full bg-gradient-to-r from-slate-950/40 to-slate-900/20 relative">
          {goal.imageUrl ? (
            <img src={goal.imageUrl} alt={goal.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="text-white/20 w-16 h-16" />
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full bg-black/45 p-1.5 text-white transition-colors hover:bg-black/65" data-testid={`button-goal-menu-${goal.id}`}>
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-white/10 bg-[#111827]/95 text-white backdrop-blur-xl">
                <DropdownMenuItem onClick={handleAnalyze} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                  <Sparkles className="mr-2 h-4 w-4 text-sky-300" />
                  <span>AI Analyze</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-400">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-black leading-tight text-white">{goal.title}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={12} />
                <span>{daysLeft > 0 ? `${daysLeft} days left` : "Expired"}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-sky-300">{Math.round(progress)}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2.5 bg-white/10" indicatorClassName={cn("bg-gradient-to-r from-sky-400 to-blue-500", progress >= 100 && "from-green-400 to-emerald-500")} />
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                Current: 
                <span className="text-white font-medium inline-flex items-center gap-1">
                    <VaultyIcon size={10} />{goal.currentAmount.toLocaleString()}
                </span>
              </span>
              <span className="text-gray-400 flex items-center gap-1">
                Goal: 
                <span className="text-white font-medium inline-flex items-center gap-1">
                    <VaultyIcon size={10} />{goal.targetAmount.toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="rounded-[28px] border-white/10 bg-[linear-gradient(180deg,#10131c_0%,#070a11_100%)] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-sky-300" size={20} />
              AI Goal Analysis
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Smart insights for "{goal.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 text-sky-300 animate-spin" />
                <p className="text-sm text-gray-400 animate-pulse">Analyzing financial data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-4">
                  <p className="text-sm leading-relaxed text-gray-200">
                    {analysisResult}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setAnalysisOpen(false)} className="w-full bg-white/10 hover:bg-white/20" data-testid={`button-close-goal-analysis-${goal.id}`}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
