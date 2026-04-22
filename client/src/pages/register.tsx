import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation, Link } from "wouter";
import { Loader2, Mail, Lock, User, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import registerBg from "@assets/starfield_background.jpeg";
import vaultyLogo from "@assets/1934AF6F-6D3D-49A5-A43E-F71984228AEC_1776900057983.png";

const sentences = [
  "Build your wealth with Vaulty.",
  "Secure your future in decentralized finance.",
  "Join the next generation of investors.",
  "Experience institutional-grade security.",
  "The ultimate hub for digital assets."
];

export default function Register() {
  const { register, signInWithGoogle } = useAuth();
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");

  const [currentSentence, setCurrentSentence] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [shootingStarKey, setShootingStarKey] = useState(0);

  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 100;
    const sentence = sentences[currentSentence];

    const timer = setTimeout(() => {
      if (!isDeleting && displayText === sentence) {
        setTimeout(() => setIsDeleting(true), 3000);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setCurrentSentence((prev) => (prev + 1) % sentences.length);
      } else {
        const nextChar = isDeleting 
          ? sentence.substring(0, displayText.length - 1)
          : sentence.substring(0, displayText.length + 1);
        setDisplayText(nextChar);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentSentence]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShootingStarKey(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await register(email, password, name);
      setLocation("/home");
    } catch (err: any) {
      setError("Failed to create account. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      setLocation("/home");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden text-white font-sans"
      style={{
        backgroundImage: `url(${registerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Shooting Star */}
      <div key={shootingStarKey} className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute w-1 h-1 bg-white rounded-full shooting-star" style={{
          left: '0',
          top: '0',
          boxShadow: '0 0 20px 4px rgba(255,255,255,0.8), 0 0 40px 8px rgba(255,255,255,0.4)',
          filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.6))'
        }} />
      </div>

      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 z-0" />
      {/* Space Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] opacity-30" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 blur-[120px] rounded-full opacity-20 animate-pulse" />
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center space-y-8">
        {/* Logo and Typing Text */}
        <div className="text-center space-y-4">
          <h1 className="text-7xl font-bold tracking-tight text-white mb-2">Vaulty</h1>
          <div className="h-6 flex items-center justify-center">
            <p className="text-lg text-gray-400 font-medium">
              {displayText}
              <span className="inline-block w-0.5 h-5 bg-gray-400 ml-1 animate-pulse" />
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="w-full space-y-4 pt-4">
          <div className="space-y-3">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base"
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-white transition-colors" />
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-white transition-colors" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base"
              />
            </div>
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                placeholder="Promo Code (Optional)" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all text-base"
              />
            </div>
          </div>

          <button 
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-4 bg-white text-black font-bold rounded-full transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
          </button>

          {/* Other Options Accordion */}
          <div className="space-y-2">
            <button 
              onClick={() => setShowOtherOptions(!showOtherOptions)}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors py-2 text-sm font-medium"
            >
              Other options {showOtherOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {showOtherOptions && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-3"
                >
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-full flex items-center justify-center gap-3 transition-all"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    <span>Sign up with Google</span>
                  </button>
                  <button
                    disabled={loading}
                    className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-full flex items-center justify-center gap-3 transition-all"
                  >
                    <img src="https://www.svgrepo.com/show/445326/apple.svg" className="w-5 h-5 invert" alt="Apple" />
                    <span>Sign up with Apple</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full space-y-6 text-center">
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>
          )}
          
          <div className="space-y-2">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest leading-relaxed">
              By continuing you agree to the <span className="text-gray-300">Terms of Service</span> and <span className="text-gray-300">Privacy Policy</span>
            </p>
            <p className="text-gray-400 text-sm">
              Already have an account? <Link href="/login" className="text-white font-bold hover:underline underline-offset-4">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
