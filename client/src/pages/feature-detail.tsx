import { ChevronLeft } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { featuresData } from "@/lib/features-data";
import { motion } from "framer-motion";

export default function FeatureDetailPage() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const feature = featuresData.find(f => f.id === id);

  if (!feature) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Feature not found.</p>
        <button onClick={() => setLocation("/landing")} className="ml-4 text-indigo-400">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <button 
            onClick={() => setLocation("/landing")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">{feature.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-12 pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{feature.title}</h2>
          <p className="text-xl text-white/60 font-light leading-relaxed">
            {feature.shortDesc}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] flex items-center justify-center bg-black p-4 md:p-8"
        >
          <img 
            src={feature.image} 
            alt={feature.title} 
            className="max-h-[60vh] w-auto object-contain rounded-2xl drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <p className="text-white/80 font-light leading-loose text-lg">
            {feature.longDesc}
          </p>
        </motion.div>
      </div>
    </div>
  );
}