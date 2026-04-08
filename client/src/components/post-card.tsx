import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Flag, Send, Loader2, CircleDollarSign, X } from "lucide-react";
import verifiedBadge from '@assets/IMG_1076_1775576984427.png';
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { db } from "@/lib/firebase";
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  getDocs,
  where
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Username } from "@/components/shared/Username";
import { getRank } from "@/lib/ranks";
import { isVerifiedEmail } from "@/lib/admins";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  userXP?: number;
  content: string;
  timestamp: any;
}

interface PostCardProps {
  post: any;
  currentUser: any;
  currentUserData?: any; // Added to get XP for comments
  onDelete?: (id: string) => void;
  onReport?: (id: string) => void;
  isDetailView?: boolean;
  isAdmin?: boolean;
}

export function PostCard({ post, currentUser, currentUserData, onDelete, onReport, isDetailView = false, isAdmin = false }: PostCardProps) {
  const postId = typeof post?.id === "string" ? post.id : "";
  const authorId = typeof post?.userId === "string" ? post.userId : "";
  const [commentsOpen, setCommentsOpen] = useState(isDetailView);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [authorCurrentXP, setAuthorCurrentXP] = useState<number>(post?.userXP || 0);
  const [authorBadges, setAuthorBadges] = useState<string[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Tipping State
  const [tipOpen, setTipOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState(10);
  const [isTipping, setIsTipping] = useState(false);
  const [totalTipped, setTotalTipped] = useState(0);

  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const isLiked = Array.isArray(post?.likes) && !!currentUser?.uid ? post.likes.includes(currentUser.uid) : false;

  // Fetch author's current XP and badges to show correct rank
  useEffect(() => {
    if (!authorId) return;

    try {
      const authorRef = doc(db, "users", authorId);
      const unsubscribe = onSnapshot(authorRef, (snapshot) => {
        if (snapshot.exists()) {
          const authorData = snapshot.data();
          const badges = authorData.badges || [];
          setAuthorCurrentXP(authorData.xp || 0);
          setAuthorBadges(isVerifiedEmail(authorData.email) && !badges.includes("verified") ? [...badges, "verified"] : badges);
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching author XP:", error);
    }
  }, [authorId]);

  // Calculate rank for post author to determine if we should show icon
  const authorRank = getRank(authorCurrentXP);
  const showRankIcon = authorRank.minXP >= 5000; // Ruby (5000) and above

  // Load comments if open
  useEffect(() => {
    if (!commentsOpen || !postId) return;

    const q = query(
      collection(db, "posts", postId, "comments"), 
      orderBy("timestamp", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Comment)));
    });

    return () => unsubscribe();
  }, [commentsOpen, postId]);

  // Load total tips for this post
  useEffect(() => {
    if (!postId) {
      setTotalTipped(0);
      return;
    }

    const loadTotalTips = async () => {
      try {
        const tipsQuery = query(collection(db, "posts", postId, "tips"));
        const tipsSnap = await getDocs(tipsQuery);
        const total = tipsSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        setTotalTipped(total);
      } catch (error) {
        console.error("Error loading tips:", error);
      }
    };
    loadTotalTips();
  }, [postId]);

  const handleLike = async () => {
    if (!currentUser || !postId) return;
    const postRef = doc(db, "posts", postId);
    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
    }
  };

  const handleShare = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !currentUser || !postId) return;
    setCommentLoading(true);
    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        userId: currentUser.uid,
        userName: currentUser.displayName || "User",
        userPhoto: currentUser.photoURL || "",
        userXP: currentUserData?.vaultyPoints || 0,
        content: newComment,
        timestamp: serverTimestamp()
      });
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleTip = async () => {
    if (!currentUser || !currentUserData || !postId) {
      toast({ title: "Error", description: "You must be logged in to tip.", variant: "destructive" });
      return;
    }

    if (tipAmount < 10 || tipAmount > 50000) {
      toast({ title: "Invalid Amount", description: "Tip amount must be between 10 and 50,000.", variant: "destructive" });
      return;
    }

    if ((currentUserData?.vaultyPoints || 0) < tipAmount) {
      toast({ title: "Insufficient Funds", description: "You don't have enough Vaulty Credits to send this tip.", variant: "destructive" });
      return;
    }
    
    setIsTipping(true);
    
    try {
      // Add tip to Firebase
      await addDoc(collection(db, "posts", postId, "tips"), {
        userId: currentUser.uid,
        userName: currentUser.displayName || "User",
        userPhoto: currentUser.photoURL || "",
        amount: tipAmount,
        timestamp: serverTimestamp(),
      });

      // Deduct from user's Vaulty Points
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        vaultyPoints: (currentUserData?.vaultyPoints || 0) - tipAmount
      });

      // Update total tipped locally
      setTotalTipped(totalTipped + tipAmount);
      setTipOpen(false);
      setTipAmount(10);

      toast({
        title: "Tip Sent!",
        description: `You tipped ${tipAmount} Vaulty Credits!`,
      });
    } catch (error) {
      console.error("Error sending tip:", error);
      toast({
        title: "Error",
        description: "Failed to send tip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTipping(false);
    }
  };

  return (
    <div className="perspective-1000 mb-6">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full [transform-style:preserve-3d] cursor-pointer min-h-[200px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <div 
          className={cn(
            "w-full h-full bg-zinc-900/60 border border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl hover:border-gray-500/30 transition-all duration-300 [backface-visibility:hidden]",
            isFlipped ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-gray-400/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="p-5 relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentUser?.uid === post.userId) {
                      toast({ title: "This is you!", description: "You are already viewing your own content." });
                    } else {
                      setLocation(`/user/${post.userId}`);
                    }
                  }}
                  className="relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-400 to-gray-500 rounded-full opacity-70 blur-sm hover:opacity-100 transition-opacity" />
                  <img 
                    src={post.userPhoto || "https://github.com/shadcn.png"} 
                    className="relative w-11 h-11 rounded-full object-cover border-2 border-black"
                    alt={post.userName}
                  />
                </div>
                <div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentUser?.uid === post.userId) {
                        toast({ title: "This is you!", description: "You are already viewing your own content." });
                      } else {
                        setLocation(`/user/${post.userId}`);
                      }
                    }}
                    className="cursor-pointer flex items-center gap-1"
                  >
                    <Username 
                      name={post.userName} 
                      xp={authorCurrentXP} 
                      className="text-base hover:opacity-80" 
                      showRankIcon={showRankIcon} 
                      useDefaultColor={true}
                    />
                    {authorBadges?.includes("verified") && (
                      <img src={verifiedBadge} alt="Verified" className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    {post.timestamp ? formatDistanceToNow(post.timestamp.toDate?.() || new Date(post.timestamp), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border-white/10 text-white shadow-2xl rounded-xl p-1">
                  <DropdownMenuItem onClick={() => onReport?.(post.id)} className="text-red-400 focus:text-red-400 focus:bg-white/5 cursor-pointer rounded-lg">
                    <Flag className="mr-2 h-4 w-4" /> Report Post
                  </DropdownMenuItem>
                  {(currentUser?.uid === post.userId || isAdmin) && (
                    <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-red-400 focus:text-red-400 focus:bg-white/5 cursor-pointer rounded-lg">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title */}
            {post.title && (
              <div className="mb-3 pl-[56px]">
                <p className="text-white text-lg font-bold">
                  {post.title}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="mb-5 pl-[56px]">
              {post.textStyle ? (
                <div
                  className={`${
                    post.textStyle.size === "sm"
                      ? "text-sm"
                      : post.textStyle.size === "md"
                      ? "text-base"
                      : post.textStyle.size === "lg"
                      ? "text-lg"
                      : "text-xl"
                  } ${post.textStyle.bold ? "font-bold" : "font-light"} ${
                    post.textStyle.italic ? "italic" : ""
                  } whitespace-pre-wrap leading-relaxed tracking-wide`}
                  style={{ color: post.textStyle.color }}
                >
                  {post.content}
                </div>
              ) : (
                <p className="text-gray-200 text-[15px] whitespace-pre-wrap leading-relaxed font-light tracking-wide">
                  {post.content}
                </p>
              )}
              {post.imageURL && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(post.imageURL);
                  }}
                  className="mt-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-gray-900/20 transition-all cursor-pointer"
                >
                  <img 
                    src={post.imageURL} 
                    className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-500"
                    alt="Post content"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pl-[56px] border-t border-white/5 pt-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 text-sm font-medium",
                    isLiked 
                      ? "text-slate-500 bg-slate-500/10" 
                      : "text-gray-500 hover:text-slate-400 hover:bg-white/5"
                  )}
                >
                  <Heart size={18} className={cn("transition-transform group-active:scale-75", isLiked ? "fill-current" : "")} />
                  <span>{Array.isArray(post?.likes) ? post.likes.length : 0}</span>
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCommentsOpen(!commentsOpen);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 text-sm font-medium",
                    commentsOpen 
                      ? "text-gray-400 bg-gray-400/10" 
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  )}
                  title="Comments"
                  data-testid={`comments-button-${post.id}`}
                >
                  <MessageCircle size={18} />
                  {comments.length > 0 && <span className="text-xs">{comments.length}</span>}
                </button>

                {/* TIP BUTTON */}
                <Dialog open={tipOpen} onOpenChange={(open) => {
                  setTipOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 text-sm font-medium text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10"
                      title="Send Tip"
                    >
                      <CircleDollarSign size={18} />
                    </button>
                  </DialogTrigger>
                <DialogContent onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border-white/10 text-white sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Send a Tip</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Support {post.userName} with Vaulty Credits.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center py-6 space-y-4">
                    <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      Total Tipped: {totalTipped.toLocaleString()} VC
                    </div>
                    <div className="w-full max-w-xs space-y-2">
                      <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Amount (10 - 50,000)</label>
                      <Input 
                        type="number" 
                        min={10} 
                        max={50000} 
                        value={tipAmount} 
                        onChange={(e) => setTipAmount(Number(e.target.value))}
                        className="bg-white/5 border-white/10 text-white text-center text-lg font-mono focus:border-yellow-500/50 focus:ring-yellow-500/20"
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col gap-3 sm:flex-col items-center">
                     <p className="text-[10px] text-gray-500 text-center w-full">
                        By clicking Send Tip you agree to Vaulty TOS rules.
                     </p>
                     <Button 
                       onClick={(e) => {
                         e.stopPropagation();
                         handleTip();
                       }}
                       disabled={isTipping}
                       className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold"
                     >
                       {isTipping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Send Tip
                     </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 text-sm font-medium text-gray-500 hover:text-green-400 hover:bg-white/5"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side (QR Code) */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]",
            !isFlipped ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-20"
          >
            <X size={18} />
          </button>
          
          <div className="flex flex-col items-center justify-center w-full h-full space-y-2 py-2">
            <h2 className="text-lg sm:text-2xl font-bold text-white bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent line-clamp-1">
              Share This Post
            </h2>
            <p className="text-gray-400 text-[10px] sm:text-sm uppercase tracking-wider font-medium">
              With Friends!
            </p>
            
            <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] shadow-2xl relative group shrink min-h-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-400/20 to-gray-300/20 rounded-2xl sm:rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white p-1.5 rounded-lg sm:rounded-xl">
                <QRCodeSVG 
                  value={`${window.location.origin}/post/${post.id}`} 
                  size={Math.min(140, 180)}
                  className="w-24 h-24 sm:w-44 sm:h-44"
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
            
            <div className="space-y-0.5 mt-1">
              <p className="text-[8px] sm:text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Scan to view post</p>
              <p className="text-[7px] sm:text-[8px] font-mono text-gray-600">Vaulty • Feedstream</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Image Fullscreen Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Full size" 
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Section */}
      {commentsOpen && !isFlipped && (
        <div className="bg-black/40 border border-white/5 border-t-0 rounded-b-3xl -mt-6 pt-10 pb-5 px-5 sm:px-[76px] backdrop-blur-md">
          {/* Comment List */}
          <div className="space-y-4 mb-4">
            {comments.map((comment) => {
              // Calculate rank for comment author too
              const commentRank = getRank(comment.userXP || 0);
              const showCommentIcon = commentRank.minXP >= 5000;
              
              return (
                <div key={comment.id} className="flex gap-3 group">
                  <img 
                    src={comment.userPhoto || "https://github.com/shadcn.png"} 
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                    alt={comment.userName}
                  />
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 border border-white/5">
                      <div className="flex justify-between items-baseline mb-1">
                        <Link href={`/user/${comment.userId}`}>
                          <div className="cursor-pointer">
                            <Username 
                              name={comment.userName} 
                              xp={comment.userXP} 
                              className="text-xs hover:opacity-80" 
                              showRankIcon={showCommentIcon}
                            />
                          </div>
                        </Link>
                        <span className="text-[10px] text-gray-500">
                          {comment.timestamp ? formatDistanceToNow(comment.timestamp.toDate?.() || new Date(comment.timestamp), { addSuffix: true }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {comments.length === 0 && (
              <p className="text-center text-gray-600 py-4 text-sm font-medium italic">No comments yet. Be the first to join the conversation!</p>
            )}
          </div>

          {/* New Comment Input */}
          <div className="flex gap-3 items-end pt-4 border-t border-white/5">
            <div className="relative flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none min-h-[42px] max-h-32"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>
            <button
              onClick={handlePostComment}
              disabled={commentLoading || !newComment.trim()}
              className="p-2.5 bg-gradient-to-tr from-[#00d8ff] via-[#8b00ff] to-[#ff00ea] rounded-xl text-white hover:opacity-90 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-[#ff00ea]/20"
            >
              {commentLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="fill-current" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
