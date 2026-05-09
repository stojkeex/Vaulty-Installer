import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Bot, Save, Paintbrush, MessageSquare, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ChatbotCustomization({ params }: { params?: { id: string } }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [name, setName] = useState("Customer Support Pro");
  const [themeColor, setThemeColor] = useState("#3b82f6");
  const [firstMessage, setFirstMessage] = useState("Hi there! How can I help you today?");
  
  const handleSave = () => {
      toast({
          title: "Changes Saved",
          description: "Chatbot settings have been updated successfully."
      });
      setLocation("/home");
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 animate-in fade-in">
      <div className="sticky top-0 z-20 border-b border-white/5 bg-black/80 px-4 pb-4 pt-6 backdrop-blur-2xl flex items-center justify-between">
         <div className="flex items-center gap-3">
             <button onClick={() => setLocation("/home")} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
                 <ChevronLeft className="w-5 h-5" />
             </button>
             <div>
                <p className="text-[10px] uppercase tracking-widest text-white/50">Settings</p>
                <h1 className="text-lg font-bold">Customize Bot</h1>
             </div>
         </div>
         <Button onClick={handleSave} size="sm" className="rounded-full bg-white text-black font-bold h-9">
             <Save className="w-4 h-4 mr-2" /> Save
         </Button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-4">
        
        {/* Preview */}
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 flex flex-col items-center justify-center py-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${themeColor} 0%, transparent 70%)` }} />
            
            <div className="relative z-10 w-20 h-20 rounded-full bg-black border-4 flex items-center justify-center shadow-2xl" style={{ borderColor: themeColor }}>
                <Bot className="w-10 h-10" style={{ color: themeColor }} />
            </div>
            <h2 className="mt-4 text-xl font-bold">{name}</h2>
            
            <div className="mt-6 w-full bg-black/50 rounded-2xl p-4 border border-white/10 text-sm">
                <p className="text-white/60 mb-2 text-xs uppercase tracking-wider">Preview</p>
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center bg-white/10">
                        <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 text-sm">
                        {firstMessage}
                    </div>
                </div>
            </div>
        </div>

        {/* Settings */}
        <div className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                    <Bot className="w-4 h-4" /> Bot Name
                </label>
                <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="h-12 bg-white/5 border-white/10 rounded-xl"
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> First Message
                </label>
                <textarea 
                    value={firstMessage} 
                    onChange={e => setFirstMessage(e.target.value)} 
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-white/30 transition-colors resize-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                    <Paintbrush className="w-4 h-4" /> Theme Color
                </label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2">
                    <input 
                        type="color" 
                        value={themeColor} 
                        onChange={e => setThemeColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-none"
                    />
                    <Input 
                        value={themeColor} 
                        onChange={e => setThemeColor(e.target.value)}
                        className="h-10 border-none bg-transparent outline-none flex-1 font-mono uppercase"
                    />
                </div>
            </div>
            
            <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Custom Avatar
                </label>
                <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white/70 justify-start px-4">
                    Upload image...
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
}