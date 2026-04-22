import { useRef, useState, useEffect } from "react";
import { useFeed, FeedPost } from "@/contexts/feed-context";
import { Heart, MessageCircle, Share2, Plus, Music2, Volume2, VolumeX, Play, MoreVertical, Trash2, Loader2, Send, Reply } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

import LOGO from "@assets/1934AF6F-6D3D-49A5-A43E-F71984228AEC_1776900057983.png";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  timestamp: any;
  likes?: number;
  likedBy?: string[];
  replies?: Reply[];
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  timestamp: any;
  likes?: number;
} 

export default function Feed() {
  const { posts, toggleLike } = useFeed();
  const { userData, updateAudioPreference } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);

  useEffect(() => {
    // Show prompt if audioEnabled is not explicitly set
    if (userData && userData.audioEnabled === undefined) {
      setShowAudioPrompt(true);
    }
  }, [userData]);

  const handleAllowAudio = async () => {
    await updateAudioPreference(true);
    setShowAudioPrompt(false);
    // Reload to apply unmuted state or just let the next video handle it
    window.location.reload();
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full bg-black text-white overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      <AnimatePresence>
        {showAudioPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 z-50 p-6 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 bg-slate-500/20 rounded-full flex items-center justify-center">
                <Music2 className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Enable Video Sound?</h3>
                <p className="text-white/60 text-sm mt-1">Experience Vaulty Feed with original audio automatically enabled.</p>
              </div>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowAudioPrompt(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition font-bold text-sm"
                >
                  Later
                </button>
                <button 
                  onClick={handleAllowAudio}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-500 hover:bg-slate-600 transition font-bold text-sm shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                >
                  Allow Sound
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Overlay */}
      <div className="fixed top-0 left-0 w-full z-20 flex justify-between items-center p-4 pt-8 bg-gradient-to-b from-black/60 to-transparent">
        <Link href="/profile">
          <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-black/40 backdrop-blur-md cursor-pointer hover:bg-black/60 transition pointer-events-auto">
            <img 
              src={userData?.photoURL || "https://github.com/shadcn.png"} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          </div>
        </Link>
        
        <div className="w-12 h-12 pointer-events-auto absolute left-1/2 -translate-x-1/2">
           <img src={LOGO} alt="Vaulty" className="w-full h-full object-contain" />
        </div>

        <Link href="/create-post-feed">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition pointer-events-auto">
            <Plus className="w-5 h-5 text-white" />
          </div>
        </Link>
      </div>

      {posts.map((post) => (
        <FeedItem key={post.id} post={post} onLike={() => toggleLike(post.id)} />
      ))}
    </div>
  );
}

function FeedItem({ post, onLike }: { post: FeedPost; onLike: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user, userData } = useAuth();
  const { deletePost } = useFeed();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  
  // Use user preference for initial muted state
  const [isMuted, setIsMuted] = useState(userData?.audioEnabled !== true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  
  const isLiked = post.likedBy?.includes(user?.uid || "") || false;
  const isAuthor = user?.uid === post.userId;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(post.id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Load comments when section is opened
  useEffect(() => {
    if (!showComments) return;

    try {
      const q = query(
        collection(db, "posts", post.id, "comments"),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Comment));
        setComments(loadedComments);

        // Auto-scroll to latest comment
        setTimeout(() => {
          if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = 0;
          }
        }, 0);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  }, [showComments, post.id]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !user) return;
    setIsLoadingComment(true);

    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        userId: user.uid,
        userName: user.displayName || "User",
        userPhoto: user.photoURL || "https://github.com/shadcn.png",
        content: newComment,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        replies: [],
      });
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsLoadingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const commentRef = doc(db, "posts", post.id, "comments", commentId);
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      const likedBy = comment.likedBy || [];
      const isLiked = likedBy.includes(user.uid);

      if (isLiked) {
        likedBy.splice(likedBy.indexOf(user.uid), 1);
      } else {
        likedBy.push(user.uid);
      }

      await updateDoc(commentRef, {
        likedBy,
        likes: likedBy.length,
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim() || !user) return;

    try {
      const commentRef = doc(db, "posts", post.id, "comments", commentId);

      await updateDoc(commentRef, {
        replies: arrayUnion({
          id: Date.now().toString(),
          userId: user.uid,
          userName: user.displayName || "User",
          userPhoto: user.photoURL || "https://github.com/shadcn.png",
          content: replyText,
          timestamp: serverTimestamp(),
          likes: 0,
        }),
      });

      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  useEffect(() => {
    // Update mute state if userData changes (e.g. after prompt)
    if (userData?.audioEnabled === true) {
      setIsMuted(false);
    }
  }, [userData]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    // Synchronize audio with video if custom audio exists
    const syncAudio = () => {
      if (audio && post.audioUrl) {
        audio.currentTime = video.currentTime;
      }
    };

    video.addEventListener('play', () => {
      if (audio && post.audioUrl) audio.play().catch(() => {});
    });
    video.addEventListener('pause', () => {
      if (audio && post.audioUrl) audio.pause();
    });
    video.addEventListener('seeked', syncAudio);
    // When video loops, restart audio
    video.addEventListener('timeupdate', () => {
      if (audio && post.audioUrl && video.currentTime < 0.2 && audio.currentTime > 1) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });

    // Use direct properties for better policy handling
    video.muted = isMuted || !!post.audioUrl; // Mute video if custom audio exists
    video.playsInline = true;
    video.loop = true;
    
    if (video.muted) {
      video.setAttribute('muted', 'true');
    } else {
      video.removeAttribute('muted');
    }
    
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('loop', 'true');

    const playMedia = async () => {
      try {
        const currentAudio = audioRef.current;
        const currentVideo = videoRef.current;

        if (post.type === 'video' && currentVideo) {
          // Reset states for fresh visibility
          currentVideo.muted = isMuted || !!post.audioUrl;
          await currentVideo.play();
          
          if (currentAudio && post.audioUrl) {
            currentAudio.muted = isMuted;
            currentAudio.currentTime = currentVideo.currentTime;
            await currentAudio.play();
          }
          setIsPlaying(true);
          setShowControls(false);
        } else if ((post.type === 'image' || post.type === 'carousel') && currentAudio && post.audioUrl) {
          currentAudio.muted = false;
          currentAudio.volume = 1.0;
          currentAudio.currentTime = 0;
          
          // Try playing immediately, then with interaction if needed
          const attemptPlay = async () => {
            try {
              await currentAudio.play();
              setIsPlaying(true);
            } catch (err) {
              console.error("Audio play failed, adding interaction listener:", err);
              const playOnInteraction = async () => {
                try {
                  await currentAudio.play();
                  setIsPlaying(true);
                  window.removeEventListener('click', playOnInteraction);
                  window.removeEventListener('touchstart', playOnInteraction);
                } catch (e) {
                  console.error("Interaction play failed:", e);
                }
              };
              window.addEventListener('click', playOnInteraction);
              window.addEventListener('touchstart', playOnInteraction);
            }
          };
          
          attemptPlay();
        }
      } catch (e) {
        console.error("Playback error:", e);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Force reload if video is stuck or not showing
            if (video && video.readyState === 0) {
              video.load();
            }
            playMedia();
          } else {
            const currentVideo = videoRef.current;
            const currentAudio = audioRef.current;
            if (currentVideo) {
              currentVideo.pause();
              currentVideo.muted = true;
            }
            if (currentAudio) {
              currentAudio.pause();
              currentAudio.muted = true;
            }
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.8 }
    );

    const target = post.type === 'video' ? video : containerRef.current;
    if (target) observer.observe(target);
    
    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
      if (video) video.removeEventListener('seeked', syncAudio);
    };
  }, [post.videoUrl, post.audioUrl, isMuted, post.type]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const currentTime = videoRef.current.currentTime;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      if (audio) audio.pause();
      setShowControls(true);
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      if (audio) audio.play().catch(() => {});
      setShowControls(false);
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Explicitly update elements to avoid state lag
    if (post.audioUrl && audio) {
      audio.muted = newMuteState;
      video.muted = true;
    } else {
      video.muted = newMuteState;
    }
    
    // Force a small play attempt to ensure audio context is active
    if (!newMuteState) {
      if (audio) audio.play().catch(() => {});
      else video.play().catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen snap-start bg-zinc-900 flex items-center justify-center overflow-hidden">
      {/* Audio Element if custom music exists */}
      {post.audioUrl && (
        <audio ref={audioRef} src={post.audioUrl} loop muted={post.type === 'video' ? isMuted : false} className="hidden" />
      )}
      {/* Content Background */}
      <div className="absolute inset-0 z-0" onClick={togglePlay}>
        {post.type === 'video' ? (
          <video
            ref={videoRef}
            src={post.videoUrl}
            className="w-full h-full object-cover"
            loop
            muted={isMuted || !!post.audioUrl}
            playsInline
            onTimeUpdate={handleTimeUpdate}
          />
        ) : post.type === 'carousel' && post.images ? (
          <div className="w-full h-full relative overflow-hidden flex">
             <div 
               className="flex transition-transform duration-300 ease-out h-full"
               style={{ 
                 transform: `translateX(-${currentImageIndex * 100}%)`,
                 width: `${post.images.length * 100}%`
               }}
               onTouchStart={(e) => {
                 const touch = e.touches[0];
                 const startX = touch.clientX;
                 const handleTouchMove = (moveEvent: TouchEvent) => {
                   const moveX = moveEvent.touches[0].clientX;
                   const diff = startX - moveX;
                   if (Math.abs(diff) > 50) {
                     if (diff > 0 && currentImageIndex < (post.images?.length || 1) - 1) {
                        setCurrentImageIndex(prev => prev + 1);
                     } else if (diff < 0 && currentImageIndex > 0) {
                        setCurrentImageIndex(prev => prev - 1);
                     }
                     document.removeEventListener('touchmove', handleTouchMove);
                   }
                 };
                 document.addEventListener('touchmove', handleTouchMove);
                 document.addEventListener('touchend', () => {
                   document.removeEventListener('touchmove', handleTouchMove);
                 }, { once: true });
               }}
             >
               {post.images.map((img, idx) => (
                 <img key={idx} src={img} className="w-full h-full object-cover flex-shrink-0" alt={`slide-${idx}`} />
               ))}
             </div>
             {/* Carousel Indicator */}
             <div className="absolute top-20 right-4 bg-black/40 px-2 py-1 rounded-full text-[10px] font-bold">
                {currentImageIndex + 1}/{post.images.length}
             </div>
          </div>
        ) : (
          <img src={post.videoUrl} className="w-full h-full object-cover" alt={post.title} />
        )}
        
        {/* Custom Controls Overlay */}
        <AnimatePresence>
          {(showControls || !isPlaying) && post.type === 'video' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/20"
            >
              <div className="flex flex-col items-center gap-8">
                <button 
                  onClick={toggleMute}
                  className="p-3 bg-black/40 rounded-full backdrop-blur-md border border-white/20 hover:bg-black/60 transition active:scale-90 pointer-events-auto"
                >
                  {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="p-6 bg-white/20 rounded-full backdrop-blur-md border border-white/30 hover:bg-white/30 transition active:scale-90 pointer-events-auto"
                >
                  <Play className="w-10 h-10 text-white fill-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Sidebar Actions */}
      <div className="absolute right-2 bottom-20 z-10 flex flex-col gap-6 items-center">
        <div className="relative">
             <div className="w-10 h-10 rounded-full border border-white p-0.5 overflow-hidden bg-black shadow-lg">
                <img src={post.userAvatar} alt="user" className="w-full h-full rounded-full object-cover" />
             </div>
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-500 rounded-full w-4 h-4 flex items-center justify-center border-2 border-black">
                <Plus className="w-3 h-3 text-white" />
             </div>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); onLike(); }}>
          <div className={cn("p-2 rounded-full transition", isLiked ? "text-red-500" : "text-white")}>
            <Heart className={cn("w-8 h-8 drop-shadow-lg", isLiked && "fill-current")} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{post.likes || 0}</span>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setShowComments(!showComments)}>
          <div className={cn("p-2 rounded-full transition", showComments ? "text-gray-400" : "text-white")}>
            <MessageCircle className={cn("w-8 h-8 drop-shadow-lg", showComments ? "fill-cyan-400" : "fill-white/20")} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{post.comments || 0}</span>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="p-2 rounded-full text-white">
                <MoreVertical className="w-8 h-8 drop-shadow-lg" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900/90 border-white/10 text-white rounded-2xl">
              <DropdownMenuItem onClick={handleShare} className="focus:bg-white/10 cursor-pointer">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              {isAuthor && (
                <DropdownMenuItem onClick={handleDelete} className="focus:bg-red-500/20 text-red-500 cursor-pointer">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Rotating Music Disc */}
        <div className="mt-4 animate-[spin_5s_linear_infinite]">
             <div className="w-10 h-10 rounded-full bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                   <Music2 className="w-4 h-4 text-white" />
                </div>
             </div>
        </div>
      </div>

      {/* Bottom Info & Comments */}
      <div className="absolute left-0 bottom-0 w-full z-10 p-4 pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        {!showComments ? (
          <>
            <div className="mb-4 max-w-[80%]">
              <h3 className="text-white font-bold text-lg drop-shadow-md">@{post.username}</h3>
              <p className="text-white/90 text-sm mt-1 drop-shadow-md line-clamp-2">{post.title.replace(/#\w+/g, '').trim()}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {post.hashtags.map(tag => (
                  <span key={tag} className="text-white font-bold text-xs drop-shadow-sm">#{tag}</span>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mt-3 overflow-hidden">
                 <Music2 className="w-3 h-3 text-white" />
                 <div className="text-white text-xs whitespace-nowrap animate-marquee shadow-sm">
                   {post.audioTitle || `Original Sound - ${post.username}`} • {post.audioTitle || `Original Sound - ${post.username}`}
                 </div>
              </div>
            </div>
            
            {/* Progress Bar - Gradient Line */}
            {post.type === 'video' && (
                <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-slate-500 via-blue-500/50 to-purple-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
          </>
        ) : (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-bold text-sm">{comments.length} Comments</h3>
              <button 
                onClick={() => setShowComments(false)}
                className="text-white/60 hover:text-white text-lg transition"
              >
                ✕
              </button>
            </div>
            
            {/* Comments List */}
            <div 
              ref={commentsContainerRef}
              className="flex-1 overflow-y-auto space-y-4 py-4 px-4 scrollbar-hide"
            >
              {comments.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/50 text-sm">
                  No comments yet. Be the first!
                </div>
              ) : (
                comments.map((comment) => {
                  const isLiked = (comment.likedBy || []).includes(user?.uid || "");
                  const commentShowReplies = showReplies[comment.id] || false;
                  return (
                    <div key={comment.id} className="space-y-2">
                      {/* Main Comment */}
                      <div className="flex gap-3">
                        <img
                          src={comment.userPhoto}
                          alt={comment.userName}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 font-semibold text-sm truncate">
                                {comment.userName}
                              </span>
                              <span className="text-white/50 text-xs whitespace-nowrap">
                                {comment.timestamp
                                  ? formatDistanceToNow(
                                      comment.timestamp.toDate?.() ||
                                        new Date(comment.timestamp),
                                      { addSuffix: true }
                                    )
                                  : "just now"}
                              </span>
                            </div>
                            <p className="text-white text-sm mt-1 break-words leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                        
                        {/* Like & Reply Buttons - Right side */}
                        <div className="flex flex-col items-center gap-4 flex-shrink-0">
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className="flex flex-col items-center gap-1"
                          >
                            <Heart 
                              size={20} 
                              className={cn(
                                "transition",
                                isLiked ? "fill-pink-500 text-slate-500" : "text-white/60 hover:text-slate-400"
                              )} 
                            />
                            <span className="text-xs text-white/60">{comment.likes || 0}</span>
                          </button>
                          
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="flex flex-col items-center gap-1 text-white/60 hover:text-gray-400 transition"
                          >
                            <Reply size={20} />
                          </button>
                        </div>
                      </div>

                      {/* View Replies Button */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-13">
                          <button
                            onClick={() => setShowReplies({...showReplies, [comment.id]: !commentShowReplies})}
                            className="text-gray-400 text-xs hover:text-gray-300 transition font-semibold"
                          >
                            {commentShowReplies ? "Hide" : "View"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                          </button>
                        </div>
                      )}

                      {/* Replies */}
                      {commentShowReplies && comment.replies && comment.replies.length > 0 && (
                        <div className="ml-13 space-y-3 border-l-2 border-white/10 pl-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <img
                                src={reply.userPhoto}
                                alt={reply.userName}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 font-semibold text-xs truncate">
                                    {reply.userName}
                                  </span>
                                  <span className="text-white/50 text-[10px] whitespace-nowrap">
                                    just now
                                  </span>
                                </div>
                                <p className="text-white text-xs mt-1 break-words">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="ml-13 flex gap-2 items-start mt-2">
                          <img
                            src={user?.photoURL || "https://github.com/shadcn.png"}
                            alt="You"
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 bg-transparent border-b border-white/20 px-0 py-1 text-sm text-white placeholder-white/50 focus:outline-none focus:border-gray-400"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleReply(comment.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyText.trim()}
                            className="text-gray-400 hover:text-gray-300 transition disabled:opacity-50 flex-shrink-0 font-semibold text-xs"
                          >
                            Post
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input - Bottom */}
            <div className="border-t border-white/10 bg-black px-4 py-4 flex gap-3 items-start">
              <img
                src={user?.photoURL || "https://github.com/shadcn.png"}
                alt="You"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 flex gap-2 items-center">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent border-b border-white/20 px-0 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-gray-400 resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                />
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim() || isLoadingComment}
                  className="text-gray-400 hover:text-gray-300 transition disabled:opacity-50 flex-shrink-0 font-semibold text-sm"
                >
                  {isLoadingComment ? "..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
