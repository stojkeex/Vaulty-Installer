import { Lock, X } from "lucide-react";
import { useLocation } from "wouter";

export default function ImageSave() {
  const [location] = useLocation();
  
  // Get image URL from search params
  const searchParams = new URLSearchParams(window.location.search);
  const imageUrl = searchParams.get("url") || "";

  // Prevent context menu (right click)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Prevent dragging
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  // Prevent touch long-press
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col select-none"
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Lock size={20} className="text-yellow-500" />
          <h1 className="text-lg font-bold text-white">Zaščitena slika</h1>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Image Preview - LOCKED */}
      <div 
        className="flex-1 flex items-center justify-center p-4 select-none pointer-events-none"
        onContextMenu={handleContextMenu}
      >
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Protected" 
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            draggable={false}
            onContextMenu={handleContextMenu}
          />
        )}
      </div>

      {/* Locked Message */}
      <div className="p-4 border-t border-white/10 text-center">
        <div className="inline-block px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-400 font-medium flex items-center justify-center gap-2">
            <Lock size={16} />
            Slika je zaščitena - Shranjevanje ni dovoljeno
          </p>
        </div>
      </div>
    </div>
  );
}
