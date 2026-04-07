import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Play } from "lucide-react";

export default function Academy() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const courses = [
    { slug: "introduction-stocks", title: "Introduction to Stocks" },
    { slug: "understanding-bonds", title: "Understanding Bonds" },
    { slug: "pregelizality-primer", title: "Pregelizality Primer" },
    { slug: "cryptocurrency-basics", title: "Cryptocurrency Basics" },
    { slug: "tempel-bonds", title: "Tempel fully Bonds" },
    { slug: "printly-repmonality", title: "Printly repmonality" },
    { slug: "payiety-sbages", title: "Payiety sbages" },
    { slug: "cryptocurrency-basics-2", title: "Cryptocurrency Basics" },
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white pb-24 relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-2xl border-b border-white/10 p-4 flex items-center justify-center relative">
        <button 
          onClick={() => setLocation("/")}
          className="absolute left-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          data-testid="button-back"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-2xl">Learn</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Search Bar - Glass Effect */}
        <div className="relative mt-6">
          <input
            type="text"
            placeholder="Search courses or articles"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
            data-testid="input-search"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 via-transparent to-purple-500/0 pointer-events-none" />
        </div>

        {/* Academy Section */}
        <div className="flex items-center justify-between mt-8 mb-6 px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Academy</h2>
            <span className="text-gray-400">›</span>
          </div>
          <Link href="/search">
            <span className="text-gray-300 hover:text-white cursor-pointer transition-colors text-sm">Search</span>
          </Link>
        </div>

        {/* Courses Grid - Glass Cards */}
        <div className="grid grid-cols-2 gap-4">
          {filteredCourses.map((course) => (
            <Link key={course.slug} href={`/academy/${course.slug}`}>
              <div 
                className="group relative bg-gray-700/60 backdrop-blur-lg border border-gray-600/40 rounded-3xl px-5 py-6 cursor-pointer hover:bg-gray-700/70 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-32"
                data-testid={`card-course-${course.slug}`}
              >
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-3xl pointer-events-none" />
                
                <h3 className="font-bold text-white text-base leading-tight group-hover:text-gray-100 transition-colors relative z-10">
                  {course.title}
                </h3>

                <div className="flex justify-end mt-auto relative z-10">
                  <div className="w-9 h-9 bg-gray-600/60 rounded-full flex items-center justify-center">
                    <Play 
                      size={18} 
                      className="fill-gray-300 text-gray-300 ml-0.5"
                    />
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
