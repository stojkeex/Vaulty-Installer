import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronLeft,
  Search,
  Sparkles,
  Clock3,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Play,
} from "lucide-react";

const courses = [
  {
    slug: "introduction-stocks",
    title: "Introduction to Stocks",
    category: "Investing",
    duration: "8 min",
    accent: "from-slate-600/50 via-slate-700/35 to-slate-900/80",
  },
  {
    slug: "understanding-bonds",
    title: "Understanding Bonds",
    category: "Income",
    duration: "6 min",
    accent: "from-zinc-500/45 via-slate-700/30 to-slate-950/80",
  },
  {
    slug: "pregelizality-primer",
    title: "Pregelizality Primer",
    category: "Basics",
    duration: "5 min",
    accent: "from-violet-500/30 via-slate-800/35 to-black/90",
  },
  {
    slug: "cryptocurrency-basics",
    title: "Cryptocurrency Basics",
    category: "Crypto",
    duration: "10 min",
    accent: "from-emerald-500/25 via-slate-800/35 to-black/90",
  },
  {
    slug: "tempel-bonds",
    title: "Tempel fully Bonds",
    category: "Strategy",
    duration: "7 min",
    accent: "from-sky-500/25 via-slate-900/40 to-black/90",
  },
  {
    slug: "printly-repmonality",
    title: "Printly repmonality",
    category: "Mindset",
    duration: "4 min",
    accent: "from-fuchsia-500/20 via-slate-900/40 to-black/90",
  },
  {
    slug: "payiety-sbages",
    title: "Payiety sbages",
    category: "Planning",
    duration: "9 min",
    accent: "from-amber-500/20 via-slate-900/40 to-black/90",
  },
  {
    slug: "cryptocurrency-basics-2",
    title: "Cryptocurrency Basics",
    category: "Crypto",
    duration: "11 min",
    accent: "from-cyan-500/20 via-slate-900/40 to-black/90",
  },
];

const quickStats = [
  { label: "Lessons", value: "24+" },
  { label: "Topics", value: "8" },
  { label: "Quick reads", value: "5-10 min" },
];

export default function Academy() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter((course) =>
    [course.title, course.category].some((value) =>
      value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const featuredCourse = filteredCourses[0] ?? courses[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black pb-28 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.16),transparent_24%),linear-gradient(180deg,#060606_0%,#09090b_45%,#000_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/8 via-white/0 to-transparent opacity-50" />

      <div className="sticky top-0 z-20 border-b border-white/8 bg-black/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <button
            onClick={() => setLocation("/")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
            data-testid="button-back"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-gray-500">Vaulty Learn</p>
            <h1 className="text-2xl font-black tracking-tight">Learn</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300">
            <BookOpen size={18} />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-6 px-4 pb-8 pt-5">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70" />
          <div className="relative space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-gray-300">
              <Sparkles size={12} className="text-white" />
              Smarter learning
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black leading-none tracking-tight text-white">
                Learn finance in a cleaner, more Vaulty way.
              </h2>
              <p className="max-w-[300px] text-sm leading-6 text-gray-300">
                Short lessons, clear topics and premium-style cards that feel native to the app.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-left"
                  data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-base font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search lessons, topics or articles"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.06] py-4 pl-11 pr-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl outline-none transition-all placeholder:text-gray-500 focus:border-white/20 focus:bg-white/[0.08]"
            data-testid="input-search"
          />
        </div>

        <Link href={`/academy/${featuredCourse.slug}`}>
          <div
            className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-slate-700/35 via-slate-900/30 to-black p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
            data-testid={`card-featured-course-${featuredCourse.slug}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_28%)]" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                  <TrendingUp size={12} />
                  Featured topic
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-300">{featuredCourse.category}</p>
                  <h3 className="mt-1 max-w-[220px] text-2xl font-black leading-tight text-white">
                    {featuredCourse.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={14} />
                    {featuredCourse.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen size={14} />
                    Beginner friendly
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 transition-colors group-hover:bg-white/15">
                <ChevronRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </Link>

        <div className="flex items-end justify-between px-1">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-500">Academy</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Explore topics</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-300" data-testid="text-search-results">
            {filteredCourses.length} results
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredCourses.map((course) => (
            <Link key={course.slug} href={`/academy/${course.slug}`}>
              <div
                className={`group relative flex min-h-[190px] cursor-pointer flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${course.accent} p-4 shadow-[0_16px_40px_rgba(0,0,0,0.32)] transition-transform duration-300 hover:-translate-y-0.5`}
                data-testid={`card-course-${course.slug}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%)] opacity-80" />
                <div className="relative z-10 flex items-start justify-between gap-2">
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-200">
                    {course.category}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-colors group-hover:bg-white/15">
                    <Play size={16} className="ml-0.5 fill-current" />
                  </span>
                </div>

                <div className="relative z-10 mt-6 space-y-3">
                  <h3 className="text-lg font-black leading-tight text-white">{course.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
                    <Clock3 size={12} />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
