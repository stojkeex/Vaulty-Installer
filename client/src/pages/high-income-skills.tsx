import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Brain, Check, PlayCircle, Trophy, BookOpen } from "lucide-react";
import { Link } from "wouter";

const SKILLS = [
  {
    id: "freelance-upwork",
    title: "Land $500 Clients on Upwork",
    duration: "5 days",
    xp: 500,
    progress: 33,
    lessons: [
      { id: 1, title: "Setting up a top 1% profile", completed: true },
      { id: 2, title: "Writing the perfect proposal", completed: false },
      { id: 3, title: "Pricing your services", completed: false },
      { id: 4, title: "Handling the first interview", completed: false },
      { id: 5, title: "Delivering and getting 5 stars", completed: false },
    ]
  },
  {
    id: "copywriting",
    title: "Basics of Persuasive Copywriting",
    duration: "7 days",
    xp: 800,
    progress: 0,
    lessons: [
      { id: 1, title: "Understanding human psychology", completed: false },
      { id: 2, title: "The AIDA formula", completed: false },
    ]
  }
];

export default function HighIncomeSkills() {
  const [activeSkill] = useState(SKILLS[0]);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/home">
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">High-Income Skills</h1>
            <p className="text-xs text-sky-400 font-medium">Wealth Builder Phase</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Intro */}
        <div className="bg-gradient-to-br from-sky-900/40 to-black border border-sky-500/20 rounded-[32px] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full" />
          <div className="relative z-10 flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2">Build Your Value</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                You can only cut expenses so much. To truly build wealth, you need to increase your earning potential. Master these skills to generate new income streams.
              </p>
            </div>
          </div>
        </div>

        {/* Active Quest */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg px-1">Current Quest</h3>
          
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg">{activeSkill.title}</h4>
                <div className="flex gap-3 mt-2 text-xs font-medium text-gray-400">
                  <span className="flex items-center gap-1"><BookOpen size={14} /> {activeSkill.duration}</span>
                  <span className="flex items-center gap-1 text-sky-400"><Trophy size={14} /> {activeSkill.xp} XP</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                 <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-sky-500"
                      strokeDasharray={`${activeSkill.progress}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                 </svg>
                 <span className="text-[10px] font-bold">{activeSkill.progress}%</span>
              </div>
            </div>

            <div className="space-y-3">
              {activeSkill.lessons.map((lesson, idx) => (
                <div 
                  key={lesson.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    lesson.completed 
                      ? 'bg-sky-500/10 border-sky-500/20' 
                      : idx === 1 
                        ? 'bg-white/10 border-white/20' 
                        : 'bg-black/40 border-white/5 opacity-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    lesson.completed 
                      ? 'bg-sky-500 text-black' 
                      : idx === 1 
                        ? 'bg-white text-black' 
                        : 'bg-white/10 text-gray-500'
                  }`}>
                    {lesson.completed ? <Check size={16} /> : idx === 1 ? <PlayCircle size={16} /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${lesson.completed ? 'text-sky-400' : 'text-white'}`}>
                      {lesson.title}
                    </p>
                  </div>
                  {idx === 1 && (
                    <button className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full">
                      Start
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Locked Quests */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-lg px-1 text-gray-500">Upcoming Quests</h3>
          <div className="opacity-50 pointer-events-none bg-white/5 border border-white/10 rounded-[24px] p-5">
             <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <BookOpen className="text-gray-400" />
                </div>
                <div>
                   <h4 className="font-bold text-white mb-1">Basics of Persuasive Copywriting</h4>
                   <p className="text-xs text-gray-400">Unlock by completing current quest</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}