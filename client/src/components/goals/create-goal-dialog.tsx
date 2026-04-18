import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2, Upload } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { usePremium } from "@/contexts/premium-context";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  targetAmount: z.coerce.number().min(1, "Target amount must be greater than 0"),
  currentAmount: z.coerce.number().min(0, "Current amount must be positive"),
  deadline: z.date({
    required_error: "A deadline is required.",
  }),
  imageUrl: z.string().optional(),
});

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoalCount: number;
}

export function CreateGoalDialog({ open, onOpenChange, currentGoalCount }: CreateGoalDialogProps) {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [loading, setLoading] = useState(false);

  // Free tier limit check
  const isLimitReached = !isPremium && currentGoalCount >= 3;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      targetAmount: 0,
      currentAmount: 0,
      imageUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "users", user.uid, "goals"), {
        ...values,
        createdAt: serverTimestamp(),
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating goal:", error);
    } finally {
      setLoading(false);
    }
  }

  if (isLimitReached && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-[28px] border-white/10 bg-[linear-gradient(180deg,#10131c_0%,#070a11_100%)] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Limit Reached</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center space-y-4">
            <p className="text-gray-400">
              You have reached the limit of 3 goals for the Free plan. 
              Upgrade to Premium for unlimited goals!
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full bg-gradient-to-r from-blue-500 to-blue-500 font-bold text-slate-950 hover:from-blue-500 hover:to-blue-500" data-testid="button-goal-upgrade-now">
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[28px] border-white/10 bg-[linear-gradient(180deg,#10131c_0%,#070a11_100%)] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Dream Car" 
              className="border-white/10 bg-white/5"
              data-testid="input-goal-title"
              {...form.register("title")} 
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-400">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Goal Amount ($)</Label>
              <Input 
                id="targetAmount" 
                type="number" 
                placeholder="10000" 
                className="border-white/10 bg-white/5"
                data-testid="input-goal-target-amount"
                {...form.register("targetAmount")} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Current Capital ($)</Label>
              <Input 
                id="currentAmount" 
                type="number" 
                placeholder="0" 
                className="border-white/10 bg-white/5"
                data-testid="input-goal-current-amount"
                {...form.register("currentAmount")} 
              />
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start border-white/10 bg-white/5 text-left font-normal hover:bg-white/10 hover:text-white",
                    !form.watch("deadline") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("deadline") ? format(form.watch("deadline"), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#111] border-white/10" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch("deadline")}
                  onSelect={(date) => form.setValue("deadline", date as Date)}
                  initialFocus
                  className="bg-[#111] text-white"
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.deadline && (
              <p className="text-xs text-red-400">{form.formState.errors.deadline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <div className="flex gap-2">
              <Input 
                id="imageUrl" 
                placeholder="https://..." 
                className="border-white/10 bg-white/5"
                data-testid="input-goal-image-url"
                {...form.register("imageUrl")} 
              />
            </div>
            <p className="text-xs text-gray-500">Paste an image URL for your goal cover</p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-500 font-bold text-slate-950 hover:from-blue-500 hover:to-blue-500"
            disabled={loading}
            data-testid="button-submit-goal"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
