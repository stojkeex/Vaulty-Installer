import { useState, useMemo, useEffect } from "react";
import { useCurrency } from "@/contexts/currency-context";
import { useQuery } from "@tanstack/react-query";
import { Search, TrendingUp, ChevronRight, ArrowUpRight, ArrowDownRight, Users, Film, Play, Newspaper, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useFeed } from "@/contexts/feed-context";
import { useAuth } from "@/contexts/auth-context";

export default function Discover() {
  const { currency, format } = useCurrency();
  const { posts } = useFeed();
  const { userData } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortFilter, setSortFilter] = useState("market_cap_desc");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch latest news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const q = query(collection(db, "news"), orderBy("createdAt", "desc"), limit(5));
        const snapshot = await getDocs(q);
        setLatestNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, []);

  // Search users in Firebase
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setLoadingUsers(true);
      try {
        const q = query(collection(db, "users"), where("displayName", ">=", debouncedSearch.toLowerCase()), where("displayName", "<=", debouncedSearch.toLowerCase() + "~"));
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSearchResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  // Search Posts from Feed Context
  const filteredPosts = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) return [];

    const normalizedQuery = debouncedSearch.toLowerCase();

    return posts.filter((post) => {
      const title = typeof post?.title === "string" ? post.title : "";
      const hashtags = Array.isArray(post?.hashtags) ? post.hashtags : [];

      return (
        title.toLowerCase().includes(normalizedQuery) ||
        hashtags.some((tag) => String(tag).toLowerCase().includes(normalizedQuery))
      );
    });
  }, [posts, debouncedSearch]);


  // Fetch coins using React Query with search functionality
  const { data: coins, isLoading: loadingCoins } = useQuery({
    queryKey: ["coins", debouncedSearch, currency],
    queryFn: async () => {
      // If searching, use the search endpoint
      if (debouncedSearch && debouncedSearch.length > 2) {
        const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${debouncedSearch}`);
        const data = await res.json();
        const searchCoins = Array.isArray(data?.coins) ? data.coins : [];

        const coinIds = searchCoins.slice(0, 20).map((c: any) => c.id).join(",");
        if (!coinIds) return [];

        const marketRes = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.toLowerCase()}&ids=${coinIds}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`);
        if (!marketRes.ok) return [];
        return marketRes.json();
      }
      
      // Default: fetch top market cap coins
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.toLowerCase()}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`);
      if (!res.ok) throw new Error("Failed to fetch coins");
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const sortedCoins = useMemo(() => {
    if (!coins) return [];
    let sorted = [...coins];
    if (sortFilter === "price_asc") sorted.sort((a: any, b: any) => a.current_price - b.current_price);
    if (sortFilter === "price_desc") sorted.sort((a: any, b: any) => b.current_price - a.current_price);
    if (sortFilter === "market_cap_asc") sorted.sort((a: any, b: any) => a.market_cap - b.market_cap);
    if (sortFilter === "market_cap_desc") sorted.sort((a: any, b: any) => b.market_cap - a.market_cap);
    return sorted;
  }, [coins, sortFilter]);

  // Check if search is active
  const isSearching = debouncedSearch && debouncedSearch.length > 2;

  return (
    <div className="min-h-screen pb-24 bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <Link href="/profile">
          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 cursor-pointer">
            <img 
              src={userData?.photoURL || "https://github.com/shadcn.png"} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          </div>
        </Link>
        
        <div className="flex-1 flex justify-center px-4">
          {/* Search */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..." 
              className="pl-10 h-10 bg-white/5 border-white/10 rounded-xl focus:bg-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="w-10 h-10 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {isSearching ? (
          <>
            {/* Feed/Video Results */}
            {filteredPosts.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-slate-500" />
                    <h2 className="text-lg font-bold">Videos</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {filteredPosts.map(post => (
                            <Link key={post.id} href="/feed">
                                <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-900 group cursor-pointer">
                                    {post.type === 'video' ? (
                                        <video src={post.videoUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={post.videoUrl} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <Play className="fill-white text-white w-8 h-8" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent">
                                        <p className="text-xs font-bold line-clamp-1">{post.title}</p>
                                        <p className="text-[10px] text-gray-300">@{post.username}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Users Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  <h2 className="text-lg font-bold">Users</h2>
                </div>
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <Link key={user.id} href={`/user/${user.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer active:scale-98 duration-100">
                        <div className="flex items-center gap-3">
                          <img src={user.photoURL || "https://github.com/shadcn.png"} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="font-bold text-sm">{user.displayName || "Unknown User"}</div>
                            <div className="text-xs text-gray-400">@{user.username || user.id.slice(0, 8)}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Coins Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  Coins
                </h2>
              </div>

              <div className="space-y-2">
                {loadingCoins ? (
                  <div className="text-center py-8 text-gray-500">Loading market data...</div>
                ) : sortedCoins.length > 0 ? (
                  sortedCoins.map((coin: any) => (
                    <Link key={coin.id} href={`/coin/${coin.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer active:scale-98 duration-100">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-bold text-sm">{coin.symbol.toUpperCase()}</div>
                            <div className="text-xs text-gray-400">{coin.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{format(coin.current_price)}</div>
                          <div className={cn("text-xs flex items-center justify-end gap-1", coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400")}>
                            {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No coins found</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Trending Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  Top Coins
                </h2>
                <select 
                  value={sortFilter}
                  onChange={(e) => setSortFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg text-xs p-1 outline-none"
                >
                  <option value="market_cap_desc">Market Cap</option>
                  <option value="price_desc">Price (High-Low)</option>
                  <option value="price_asc">Price (Low-High)</option>
                </select>
              </div>

              <div className="space-y-2">
                {loadingCoins ? (
                  <div className="text-center py-8 text-gray-500">Loading market data...</div>
                ) : (
                  sortedCoins.map((coin: any) => (
                    <Link key={coin.id} href={`/coin/${coin.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer active:scale-98 duration-100">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-bold text-sm">{coin.symbol.toUpperCase()}</div>
                            <div className="text-xs text-gray-400">{coin.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{format(coin.current_price)}</div>
                          <div className={cn("text-xs flex items-center justify-end gap-1", coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400")}>
                            {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
            
            {/* News Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-purple-400" />
                    Latest News
                  </h2>
                  <div className="flex gap-2">
                    {userData?.role === 'news_writer' && (
                      <Link href="/create-news">
                        <button className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                          <Plus size={14} />
                          Make News
                        </button>
                      </Link>
                    )}
                    <Link href="/news">
                      <button className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                        View All <ChevronRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  {latestNews.length > 0 ? (
                    latestNews.map((article) => (
                      <Link key={article.id} href={`/news/${article.slug}`}>
                        <div className="group relative aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer active:scale-[0.99] transition-all">
                          <img 
                            src={article.imageUrl || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80"} 
                            alt={article.title}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4 space-y-2 w-full">
                            <span className="inline-block px-2 py-1 rounded bg-gray-600/80 text-[10px] font-bold uppercase tracking-wider text-white">
                              {article.category || "General"}
                            </span>
                            <h3 className="text-lg font-bold leading-tight group-hover:text-gray-400 transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span>3 comments</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 text-gray-500">
                      No news articles yet.
                    </div>
                  )}
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
