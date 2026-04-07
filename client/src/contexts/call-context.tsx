import React, { createContext, useState, useCallback } from "react";

export interface IncomingCall {
  callId: string;
  from: {
    id: string;
    name: string;
    photoURL: string;
  };
  timestamp: Date;
}

export interface CallContextType {
  incomingCall: IncomingCall | null;
  activeCall: IncomingCall | null;
  isMuted: boolean;
  isSpeakerOn: boolean;
  
  receiveCall: (call: IncomingCall) => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  playRingSound: () => void;
  playCallEndSound: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<IncomingCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Create audio context for sounds
  const playTone = useCallback((frequency: number, duration: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, []);

  const playRingSound = useCallback(() => {
    // Alternating ring tones
    playTone(400, 0.5);
    setTimeout(() => playTone(600, 0.5), 600);
    setTimeout(() => playRingSound(), 1200); // Loop every 1.2s
  }, [playTone]);

  const playCallEndSound = useCallback(() => {
    playTone(800, 0.3);
  }, [playTone]);

  const receiveCall = useCallback((call: IncomingCall) => {
    setIncomingCall(call);
    playRingSound();
  }, [playRingSound]);

  const acceptCall = useCallback(() => {
    if (incomingCall) {
      setActiveCall(incomingCall);
      setIncomingCall(null);
    }
  }, [incomingCall]);

  const declineCall = useCallback(() => {
    playCallEndSound();
    setIncomingCall(null);
  }, [playCallEndSound]);

  const endCall = useCallback(() => {
    playCallEndSound();
    setActiveCall(null);
  }, [playCallEndSound]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn(prev => !prev);
  }, []);

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        activeCall,
        isMuted,
        isSpeakerOn,
        receiveCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleSpeaker,
        playRingSound,
        playCallEndSound,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = React.useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within CallProvider");
  }
  return context;
}
