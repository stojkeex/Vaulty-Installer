import { useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { X, Send, Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

const API_KEY = "AIzaSyBDKu5u6ffhOJn4W_IaPlQyxf09duT5vY4";

export default function CreatePost() {
  const { user, userData } = useAuth();
  const [location, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [titleLength, setTitleLength] = useState(0);
  const [contentLength, setContentLength] = useState(0);

  if (!user) return null;

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = base64;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image too large (max 5MB)");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const compressed = await compressImage(base64);
        setSelectedImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIEdit = async () => {
    const content = contentRef.current?.innerText || "";
    if (!content.trim()) {
      alert("Please write something first");
      return;
    }

    setIsAILoading(true);
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Improve this text for a crypto community post. Make it more engaging, clear, and professional. Keep it under 100 words. Only return the improved text, nothing else:\n\n${content}`,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      
      if (data.contents && data.contents[0]?.parts?.[0]?.text) {
        const improvedText = data.contents[0].parts[0].text;
        if (contentRef.current) {
          contentRef.current.innerText = improvedText;
          setContentLength(improvedText.length);
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to improve text");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleCreatePost = async () => {
    const title = titleRef.current?.innerText || "";
    const content = contentRef.current?.innerText || "";

    if (!title.trim() || !content.trim()) {
      alert("Please fill in title and content");
      return;
    }

    setIsPosting(true);
    try {
      const postData: any = {
        userId: user.uid,
        userName: user.displayName || "User",
        userPhoto: user.photoURL || "",
        userXP: userData?.vaultyPoints || 0,
        title: title.substring(0, 25),
        content: content.substring(0, 100),
        likes: [],
        timestamp: new Date(),
      };

      if (selectedImage) {
        postData.imageURL = selectedImage;
      }

      await addDoc(collection(db, "posts"), postData);
      setLocation("/home");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <h1 className="text-xl font-bold">New Post</h1>
        <button
          onClick={() => setLocation("/home")}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          data-testid="button-close-create-post"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24 px-4 max-w-2xl mx-auto space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">
            Title ({titleLength}/25)
          </label>
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-gray-500/50 transition-all text-lg font-bold"
            data-testid="input-title"
            onInput={() => {
              const text = titleRef.current?.innerText || "";
              if (text.length > 25) {
                titleRef.current!.innerText = text.substring(0, 25);
                setTitleLength(25);
              } else {
                setTitleLength(text.length);
              }
            }}
            style={{ minHeight: "48px" }}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">
            Content ({contentLength}/100)
          </label>
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-gray-500/50 transition-all"
            data-testid="textarea-content"
            onInput={() => {
              const text = contentRef.current?.innerText || "";
              if (text.length > 100) {
                contentRef.current!.innerText = text.substring(0, 100);
                setContentLength(100);
              } else {
                setContentLength(text.length);
              }
            }}
            style={{ minHeight: "200px" }}
          />
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black p-1 rounded-full text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg transition-all flex items-center gap-2"
            data-testid="button-add-image"
          >
            <ImageIcon size={18} />
            Image
          </button>

          <button
            onClick={handleAIEdit}
            disabled={isAILoading}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            data-testid="button-ai-edit"
          >
            {isAILoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            AI Edit
          </button>
        </div>

        {/* Post Button */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setLocation("/home")}
            className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-all"
            data-testid="button-cancel-post"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePost}
            disabled={
              isPosting ||
              titleLength === 0 ||
              contentLength === 0
            }
            className="flex-1 py-3 px-6 bg-gradient-to-br from-[#00d8ff] via-[#8b00ff] to-[#ff00ea] hover:shadow-[0_0_20px_rgba(255,0,234,0.6)] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="button-post"
          >
            {isPosting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
            Post
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
}
