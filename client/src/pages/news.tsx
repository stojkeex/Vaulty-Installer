import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, Search, Newspaper, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";

export default function NewsPage() {
  const { userData } = useAuth();
  const [news, setNews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Ali si prepričan, da želiš izbrisati to novico?")) return;

    try {
      await deleteDoc(doc(db, "news", articleId));
      setNews(news.filter(n => n.id !== articleId));
      toast({ title: "Novica uspešno izbrisana" });
    } catch (error) {
      console.error("Error deleting news:", error);
      toast({ title: "Napaka pri brisanju novice", variant: "destructive" });
    }
  };

  const filteredNews = news.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/discover">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">News</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news articles..." 
            className="pl-10 bg-white/5 border-white/10 rounded-xl focus:bg-white/10 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span>Loading articles...</span>
          </div>
        ) : filteredNews.length > 0 ? (
          filteredNews.map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`}>
              <div className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                  <img src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex flex-col justify-center flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{article.category || "General"}</span>
                    {(userData?.isAdmin || userData?.role === 'news_writer') && (
                      <button 
                        onClick={(e) => handleDelete(e, article.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <h3 className="font-bold leading-tight line-clamp-2 group-hover:text-gray-400 transition-colors">{article.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span>{new Date(article.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
            <Newspaper size={48} className="opacity-20" />
            <span>No articles found</span>
          </div>
        )}
      </div>
    </div>
  );
}
