import { useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation, Redirect } from "wouter";
import { ChevronLeft, Image as ImageIcon, Send, Link as LinkIcon, Plus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function CreateNews() {
  const { user, userData } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    imageUrl: "", // For backward compatibility or primary image
    images: [] as string[], // Local base64 strings for preview/upload
    content: "",
    sources: [""],
  });

  if (userData?.role !== 'news_writer' && !userData?.isAdmin) {
    return <Redirect to="/discover" />;
  }

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, base64String]
        }));
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddSource = () => {
    setFormData({ ...formData, sources: [...formData.sources, ""] });
  };

  const handleSourceChange = (index: number, value: string) => {
    const newSources = [...formData.sources];
    newSources[index] = value;
    setFormData({ ...formData, sources: newSources });
  };

  const handleRemoveSource = (index: number) => {
    const newSources = formData.sources.filter((_, i) => i !== index);
    setFormData({ ...formData, sources: newSources });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !user) return;

    setLoading(true);
    try {
      // Create a clean object for Firestore
      const newsData = {
        title: formData.title,
        category: formData.category,
        imageUrl: formData.images[0] || "",
        images: formData.images,
        content: formData.content,
        slug: slugify(formData.title),
        author: userData?.displayName || user.displayName || "Anonymous",
        authorId: user.uid,
        createdAt: serverTimestamp(),
        sources: formData.sources.filter(s => s.trim() !== ""),
      };

      await addDoc(collection(db, "news"), newsData);
      toast({ title: "News article published!" });
      setLocation("/discover");
    } catch (error) {
      console.error("Error creating news:", error);
      toast({ 
        title: "Failed to publish news", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Create News</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400">Title</label>
          <Input 
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Article title..."
            className="bg-white/5 border-white/10 h-12 text-lg font-bold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">Category</label>
            <Input 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. KRIPTOMARKET"
              className="bg-white/5 border-white/10"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">Upload Images</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-white/5 border border-dashed border-white/20 rounded-xl h-10 cursor-pointer hover:bg-white/10 transition-all"
            >
              <Upload size={16} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Select files</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
            />
          </div>
        </div>

        {/* Image Preview Grid */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {formData.images.map((img, index) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400">Content</label>
          <Textarea 
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your article here..."
            className="bg-white/5 border-white/10 min-h-[300px] resize-none"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-400">Sources</label>
            <button 
              type="button" 
              onClick={handleAddSource}
              className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-300"
            >
              <Plus size={14} /> Add Source
            </button>
          </div>
          {formData.sources.map((source, index) => (
            <div key={index} className="flex gap-2">
              <Input 
                value={source}
                onChange={(e) => handleSourceChange(index, e.target.value)}
                placeholder="Source link or name..."
                className="bg-white/5 border-white/10"
              />
              {index > 0 && (
                <button type="button" onClick={() => handleRemoveSource(index)} className="p-2 text-gray-500 hover:text-red-400">
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white h-12 font-bold text-lg rounded-xl transition-all active:scale-95"
        >
          {loading ? "Publishing..." : "Publish Article"}
          <Send className="ml-2 w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
