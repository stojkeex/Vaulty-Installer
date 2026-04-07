import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';

export interface FeedPost {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  videoUrl?: string;
  images?: string[];
  type: 'video' | 'image' | 'carousel';
  title: string;
  description?: string;
  likes: number;
  comments: number;
  shares: number;
  hashtags: string[];
  createdAt: any;
  likedBy?: string[]; // Array of user IDs who liked the post
  audioUrl?: string; // New field for custom music
  audioTitle?: string; // New field for music title
}

interface FeedContextType {
  posts: FeedPost[];
  addPost: (post: Omit<FeedPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares'>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  loading: boolean;
  toggleLike: (postId: string) => Promise<void>;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Listen for real posts from Firebase
  useEffect(() => {
    const q = query(collection(db, "feed_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedPost[];
      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching feed posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPost = async (postData: Omit<FeedPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares'>) => {
    try {
      await addDoc(collection(db, 'feed_posts'), {
        ...postData,
        likes: 0,
        comments: 0,
        shares: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to add post to Firebase:", error);
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'feed_posts', postId));
    } catch (error) {
      console.error("Failed to delete post:", error);
      throw error;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const postRef = doc(db, "feed_posts", postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) return;
    
    const postData = postSnap.data() as FeedPost;
    const likedBy = postData.likedBy || [];
    const isLiked = likedBy.includes(user.uid);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(user.uid),
          likes: increment(-1)
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(user.uid),
          likes: increment(1)
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <FeedContext.Provider value={{ posts, addPost, deletePost, loading, toggleLike }}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
}
