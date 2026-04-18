import { useState, useEffect } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useCall } from "@/contexts/call-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function IncomingCallModal() {
  const { incomingCall, acceptCall, declineCall, isMuted, toggleMute, isSpeakerOn, toggleSpeaker } = useCall();
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (incomingCall) {
      setIsRinging(true);
      const timer = setInterval(() => {
        setIsRinging(prev => !prev);
      }, 500);
      return () => clearInterval(timer);
    }
  }, [incomingCall]);

  if (!incomingCall) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-b from-blue-500 to-black border border-gray-600/30 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl"
      >
        {/* Avatar with ring effect */}
        <motion.div
          animate={{ scale: isRinging ? 1.05 : 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Avatar className="h-24 w-24 mx-auto border-4 border-gray-500">
            <AvatarImage src={incomingCall.from.photoURL} />
            <AvatarFallback>{incomingCall.from.name[0]}</AvatarFallback>
          </Avatar>
        </motion.div>

        {/* Caller name */}
        <h2 className="text-2xl font-bold text-white mb-2">{incomingCall.from.name}</h2>
        <p className="text-gray-400 text-sm mb-8">
          {isRinging ? "Calling..." : "Incoming call"}
        </p>

        {/* Control buttons (during ring) */}
        <div className="flex gap-4 mb-8 justify-center">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full h-12 w-12 border-gray-500/30 hover:bg-gray-900"
            onClick={toggleMute}
          >
            {isMuted ? (
              <MicOff size={20} className="text-gray-400" />
            ) : (
              <Mic size={20} className="text-gray-400" />
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full h-12 w-12 border-gray-500/30 hover:bg-gray-900"
            onClick={toggleSpeaker}
          >
            {isSpeakerOn ? (
              <Volume2 size={20} className="text-gray-400" />
            ) : (
              <VolumeX size={20} className="text-gray-400" />
            )}
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button
            onClick={declineCall}
            className="flex-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full h-14"
          >
            <PhoneOff size={20} className="mr-2" />
            Decline
          </Button>
          <Button
            onClick={acceptCall}
            className="flex-1 bg-green-600/90 hover:bg-green-700 text-white rounded-full h-14"
          >
            <Phone size={20} className="mr-2" />
            Accept
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
