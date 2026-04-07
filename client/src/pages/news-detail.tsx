import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Share2, Twitter, MessageCircle, Link as LinkIcon, Clock, User, ExternalLink } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export default function NewsDetail() {
  const [, params] = useRoute("/news/:slug");
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!params?.slug) return;
      try {
        const q = query(collection(db, "news"), where("slug", "==", params.slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setArticle(snapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-bold">Article Not Found</h1>
        <Link href="/news">
          <button className="px-4 py-2 bg-white/10 rounded-lg">Back to News</button>
        </Link>
      </div>
    );
  }

  const dateStr = article.createdAt?.seconds ? new Date(article.createdAt.seconds * 1000).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : "Recent";

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Article Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <Link href="/news">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
        </Link>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full text-gray-400">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="p-4 space-y-4">
          <span className="inline-block px-3 py-1 rounded-md bg-gray-600/20 text-gray-400 text-xs font-bold uppercase tracking-widest border border-gray-500/20">
            {article.category || "General"}
          </span>
          
          <h1 className="text-3xl font-bold leading-tight">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pb-4 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span className="font-semibold text-gray-200">{article.author}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Share2 size={14} className="text-gray-400" />
              <Twitter size={14} className="text-gray-400" />
              <MessageCircle size={14} className="text-green-400" />
              <LinkIcon size={14} className="text-purple-400" />
            </div>
          </div>
        </div>

        <div className="w-full aspect-video bg-gray-900 overflow-hidden">
          <img 
            src={article.imageUrl || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80"} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 space-y-6">
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-gray-200 whitespace-pre-wrap">
              {article.content}
            </p>
          </div>

          {article.sources && article.sources.length > 0 && (
            <div className="pt-8 space-y-3">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ExternalLink size={14} />
                Viri
              </h4>
              <div className="flex flex-wrap gap-2">
                {article.sources.map((source: string, i: number) => (
                  <a 
                    key={i} 
                    href={source.startsWith('http') ? source : '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-colors no-underline"
                  >
                    {source.replace(/^https?:\/\//, '').split('/')[0] || source}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
