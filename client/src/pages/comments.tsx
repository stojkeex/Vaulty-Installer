import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  replies: Reply[];
}

interface Video {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  views: string;
  likes: string;
  timestamp: string;
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Alex Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    content: 'This is amazing! Really helpful content. Thanks for sharing!',
    timestamp: '2 hours ago',
    likes: 342,
    liked: false,
    replies: [
      {
        id: 'r1',
        author: 'Creator',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Creator',
        content: 'Thanks so much! More videos coming soon!',
        timestamp: '1 hour ago',
        likes: 89,
        liked: false,
      },
      {
        id: 'r2',
        author: 'Emma Stone',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        content: 'I totally agree! This helped me a lot',
        timestamp: '45 minutes ago',
        likes: 34,
        liked: false,
      },
    ],
  },
  {
    id: '2',
    author: 'Sarah Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Can you do a tutorial on advanced techniques? Would be super helpful!',
    timestamp: '1 hour ago',
    likes: 156,
    liked: false,
    replies: [],
  },
  {
    id: '3',
    author: 'Mike Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    content: 'The editing on this is top-notch. The transitions are smooth!',
    timestamp: '45 minutes ago',
    likes: 98,
    liked: false,
    replies: [
      {
        id: 'r3',
        author: 'Creator',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Creator',
        content: 'Thank you! I use Adobe Premiere Pro for editing.',
        timestamp: '30 minutes ago',
        likes: 45,
        liked: false,
      },
    ],
  },
];

// Create a mock post based on ID
function getMockVideoData(postId: string): Video {
  return {
    id: postId,
    title: 'Interesting Content',
    author: 'Content Creator',
    thumbnail: 'https://via.placeholder.com/400x225',
    views: '1.2K',
    likes: '250',
    timestamp: '1 day ago',
  };
}

function ReplyComponent({ reply, onLike, onReply }: { reply: Reply; onLike: (id: string) => void; onReply: (id: string) => void }) {
  const [isLiked, setIsLiked] = useState(reply.liked);
  const [likeCount, setLikeCount] = useState(reply.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike(reply.id);
  };

  return (
    <div className="flex gap-3 pl-12 py-3 border-l border-gray-700">
      <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
        <AvatarImage src={reply.avatar} />
        <AvatarFallback>{reply.author[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm">{reply.author}</p>
          <span className="text-xs text-gray-400">{reply.timestamp}</span>
        </div>
        <p className="text-sm text-gray-200 break-words">{reply.content}</p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            data-testid={`reply-like-${reply.id}`}
          >
            <Heart
              size={14}
              className={cn('transition-colors', isLiked ? 'fill-red-500 text-red-500' : '')}
            />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={() => onReply(reply.id)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-400 transition-colors"
            data-testid={`reply-button-${reply.id}`}
          >
            <MessageCircle size={14} />
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentComponent({
  comment,
  onLike,
  onReply,
  onShowReplies,
  showingReplies,
}: {
  comment: Comment;
  onLike: (id: string) => void;
  onReply: (id: string) => void;
  onShowReplies: (id: string) => void;
  showingReplies: boolean;
}) {
  const [isLiked, setIsLiked] = useState(comment.liked);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike(comment.id);
  };

  return (
    <div className="border-b border-gray-800 py-4" data-testid={`comment-${comment.id}`}>
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={comment.avatar} />
          <AvatarFallback>{comment.author[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold">{comment.author}</p>
            <span className="text-sm text-gray-400">{comment.timestamp}</span>
          </div>
          <p className="text-sm text-gray-100 break-words mb-3">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              data-testid={`comment-like-${comment.id}`}
            >
              <Heart
                size={16}
                className={cn('transition-colors', isLiked ? 'fill-red-500 text-red-500' : '')}
              />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-400 transition-colors"
              data-testid={`comment-reply-${comment.id}`}
            >
              <MessageCircle size={16} />
              Reply
            </button>
            {comment.replies.length > 0 && (
              <button
                onClick={() => onShowReplies(comment.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                data-testid={`toggle-replies-${comment.id}`}
              >
                {showingReplies ? '▼' : '▶'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {showingReplies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {comment.replies.map((reply) => (
                <ReplyComponent
                  key={reply.id}
                  reply={reply}
                  onLike={onLike}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Comments() {
  const [match, params] = useRoute('/comments/:id');
  const [, setLocation] = useLocation();
  const postId = params?.id || 'post-1';
  const mockVideo = getMockVideoData(postId);

  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [showingReplies, setShowingReplies] = useState<Record<string, boolean>>({});

  const handleLike = (commentId: string) => {
    // Mock like functionality
    console.log('Liked comment:', commentId);
  };

  const handleReply = (commentId: string) => {
    console.log('Reply to comment:', commentId);
  };

  const handleToggleReplies = (commentId: string) => {
    setShowingReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: String(comments.length + 1),
        author: 'You',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        content: newComment,
        timestamp: 'now',
        likes: 0,
        liked: false,
        replies: [],
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  if (!match) return null;

  return (
    <div className="min-h-screen bg-black text-white pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => setLocation(-1 as any)}
            className="hover:bg-gray-900 rounded-full p-2 transition-colors"
            data-testid="back-button"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Comments</h1>
        </div>
      </div>

      {/* Video Preview */}
      <div className="max-w-2xl mx-auto px-4 py-4 border-b border-gray-800">
        <div className="flex gap-3">
          <div className="w-24 h-16 bg-gray-900 rounded-lg flex-shrink-0 flex items-center justify-center">
            <div className="text-gray-400 text-xs">Video</div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm line-clamp-2">{mockVideo.title}</p>
            <p className="text-xs text-gray-400 mt-1">
              {mockVideo.views} views • {mockVideo.timestamp}
            </p>
            <p className="text-xs text-gray-500 mt-1">by {mockVideo.author}</p>
          </div>
        </div>
      </div>

      {/* New Comment Form */}
      <div className="max-w-2xl mx-auto px-4 py-4 border-b border-gray-800">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 resize-none"
              rows={3}
              data-testid="comment-input"
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="outline"
                onClick={() => setNewComment('')}
                className="border-gray-700 text-gray-300 hover:bg-gray-900"
                disabled={!newComment.trim()}
                data-testid="cancel-comment"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePostComment}
                className="bg-gray-600 hover:bg-gray-700"
                disabled={!newComment.trim()}
                data-testid="post-comment"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="py-4">
          <p className="text-sm text-gray-400 mb-4">{comments.length} comments</p>
          <div className="space-y-0">
            {comments.map((comment) => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                onLike={handleLike}
                onReply={handleReply}
                onShowReplies={handleToggleReplies}
                showingReplies={showingReplies[comment.id] || false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
