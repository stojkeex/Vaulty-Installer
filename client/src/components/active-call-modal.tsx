import { useEffect, useState } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useCall } from "@/contexts/call-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ActiveCallModal() {
  const { activeCall, endCall, isMuted, toggleMute, isSpeakerOn, toggleSpeaker } = useCall();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!activeCall) return;
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCall]);

  if (!activeCall) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-b from-black to-purple-500 z-[9999] flex flex-col items-center justify-center p-4"
    >
      {/* Close area */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <button 
          onClick={endCall}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Caller info */}
      <div className="text-center mb-12">
        <Avatar className="h-32 w-32 mx-auto border-4 border-gray-600 mb-6">
          <AvatarImage src={activeCall.from.photoURL} />
          <AvatarFallback>{activeCall.from.name[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-3xl font-bold text-white mb-2">{activeCall.from.name}</h2>
        <p className="text-gray-400 text-lg font-mono">{formatDuration(duration)}</p>
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        <Button
          size="icon"
          variant="outline"
          className={`rounded-full h-16 w-16 ${
            isMuted ? "bg-red-500/20 border-red-500/30" : "border-gray-500/30"
          }`}
          onClick={toggleMute}
        >
          {isMuted ? (
            <MicOff size={24} className="text-red-500" />
          ) : (
            <Mic size={24} className="text-gray-300" />
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className={`rounded-full h-16 w-16 ${
            isSpeakerOn ? "border-gray-500/30" : "bg-gray-700/20 border-gray-500/30"
          }`}
          onClick={toggleSpeaker}
        >
          {isSpeakerOn ? (
            <Volume2 size={24} className="text-gray-300" />
          ) : (
            <VolumeX size={24} className="text-gray-300" />
          )}
        </Button>
        <Button
          size="icon"
          onClick={endCall}
          className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 text-white"
        >
          <PhoneOff size={24} />
        </Button>
      </div>

      {/* Status */}
      <div className="flex gap-3 justify-center">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isMuted ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
          {isMuted ? "Muted" : "Mic On"}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isSpeakerOn ? "bg-white/10/20 text-white" : "bg-gray-600/20 text-gray-400"}`}>
          {isSpeakerOn ? "Speaker On" : "Speaker Off"}
        </span>
      </div>
    </motion.div>
  );
}
