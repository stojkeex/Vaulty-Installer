import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, X, Image as ImageIcon, Video, Type, Check, Upload, Loader2, RotateCcw, Sticker, Sparkles, Filter, Crop, ChevronDown, Music2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFeed } from "@/contexts/feed-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function CreatePostFeed() {
  const [location, setLocation] = useLocation();
  const { addPost } = useFeed();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaBlobs, setMediaBlobs] = useState<Blob[]>([]);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMusic, setSelectedMusic] = useState<{ url: string; title: string } | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [overlayText, setOverlayText] = useState("");
  const [isEditingText, setIsEditingText] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<{ id: string, url: string, type: 'image' | 'video', blob?: Blob }[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [galleryPermission, setGalleryPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async (mode: "user" | "environment") => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode }, 
        audio: true 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({ title: "Camera error", description: "Could not access camera.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!mediaUrl) {
      startCamera(facingMode);
    }
    return () => {
      cameraStream?.getTracks().forEach(track => track.stop());
    };
  }, [mediaUrl, facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      setIsRecording(false);
    } else {
      if (!cameraStream) return;
      
      const localChunks: Blob[] = [];
      const recorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) localChunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(localChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        setMediaBlob(blob);
        setMediaBlobs([]); 
        cameraStream?.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  const musicOptions = [
    { id: '1', title: 'Ti I Ja', url: '/music/Ti_i_Ja.mp3' },
    { id: '2', title: 'Noćna Furija', url: '/music/Nocna_Furija.mp3' }
  ];

  const handleMusicSelect = (music: { url: string; title: string }) => {
    if (selectedMusic?.url === music.url) {
      setSelectedMusic(null);
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
    } else {
      setSelectedMusic(music);
      if (audioPreviewRef.current) {
        audioPreviewRef.current.src = music.url;
        audioPreviewRef.current.play();
      }
    }
  };

  const handleSubmit = async () => {
    if (mediaBlobs.length === 0 && !mediaBlob) {
       toast({ title: "No media", description: "Please record or upload media.", variant: "destructive" });
       return;
    }
    if (!title) {
       toast({ title: "No title", description: "Please add a title/caption.", variant: "destructive" });
       return;
    }

    setIsUploading(true);
    try {
      let finalMediaUrl = "";
      let finalImages: string[] = [];
      const blobsToUpload = mediaBlobs.length > 0 ? mediaBlobs : [mediaBlob!];
      const type = blobsToUpload.length > 1 ? 'carousel' : (blobsToUpload[0].type.startsWith('video') ? 'video' : 'image');

      for (let i = 0; i < blobsToUpload.length; i++) {
        const blob = blobsToUpload[i];
        const storageRef = ref(storage, `feed_media/${Date.now()}_${i}_${user?.uid || 'guest'}`);
        const uploadTask = await uploadBytesResumable(storageRef, blob);
        const downloadUrl = await getDownloadURL(uploadTask.ref);
        
        if (i === 0) finalMediaUrl = downloadUrl;
        finalImages.push(downloadUrl);
        setUploadProgress(((i + 1) / blobsToUpload.length) * 100);
      }
      
      await addPost({
        userId: user?.uid || 'guest',
        username: user?.displayName || 'Guest User',
        userAvatar: user?.photoURL || 'https://github.com/shadcn.png',
        videoUrl: finalMediaUrl,
        images: finalImages,
        type: type as any,
        title: title,
        description: title,
        hashtags: title.split(' ').filter(word => word.startsWith('#')).map(word => word.slice(1)),
        audioUrl: selectedMusic?.url || null,
        audioTitle: selectedMusic?.title || null,
      });

      toast({ title: "Posted!", description: "Your post is now live." });
      setIsUploading(false);
      setLocation("/feed");
    } catch (error: any) {
      console.error("Failed to post:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsUploading(false);
    }
  };

  const togglePlaying = () => {
    if (previewVideoRef.current) {
      if (isPlaying) {
        previewVideoRef.current.pause();
      } else {
        previewVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleGallerySelect = (file: { url: string, type: 'image' | 'video', blob?: Blob }) => {
    setMediaUrl(file.url);
    setMediaUrls([file.url]);
    
    if (file.blob) {
      setMediaBlob(file.blob);
      setMediaBlobs([file.blob]);
    } else {
      fetch(file.url).then(res => res.blob()).then(blob => {
        setMediaBlob(blob);
        setMediaBlobs([blob]);
      });
    }
    setShowGallery(false);
  };

  const requestGalleryPermission = () => {
    setGalleryPermission('granted');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newGalleryFiles = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
        blob: file
      }));
      
      setGalleryFiles(prev => [...newGalleryFiles, ...prev]);
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col relative overflow-hidden font-sans">
      <audio ref={audioPreviewRef} loop className="hidden" />
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full z-50 flex justify-between items-center p-4 pt-8">
        <div 
          onClick={() => {
            if (mediaUrl) {
              setMediaUrl(null);
              setMediaUrls([]);
              setMediaBlob(null);
              setMediaBlobs([]);
              setOverlayText("");
            } else {
              setLocation("/feed");
            }
          }}
          className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-white/10 transition"
        >
          {mediaUrl ? <ArrowLeft className="w-6 h-6 text-white" /> : <X className="w-6 h-6 text-white" />}
        </div>
        
        <div 
          onClick={() => setShowMusicPicker(true)}
          className="bg-zinc-900/60 backdrop-blur-xl px-5 py-2 rounded-full flex items-center gap-2 cursor-pointer border border-white/10 hover:bg-zinc-800/80 transition shadow-xl"
        >
            <Music2 className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold tracking-tight">{selectedMusic ? selectedMusic.title : "Add sound"}</span>
        </div>

        <div 
          onClick={toggleCamera}
          className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-white/10 transition"
        >
          <RotateCcw className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {isUploading && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
            <Loader2 className="w-16 h-16 text-slate-500 animate-spin mb-6" />
            <h2 className="text-2xl font-black mb-4 tracking-tighter italic">UPLOADING...</h2>
            <div className="w-72 h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-[#00d8ff] via-[#8b00ff] to-[#ff00ea] transition-all duration-300 shadow-[0_0_15px_rgba(255,0,234,0.5)]" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-lg font-bold text-white/60 mt-4 tabular-nums">{Math.round(uploadProgress)}%</span>
          </div>
        )}

        <div className="w-full h-full relative flex items-center justify-center">
          {!mediaUrl ? (
               <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={cn(
                    "w-full h-full object-cover",
                    facingMode === "user" && "transform scale-x-[-1]"
                  )}
               />
          ) : (
            <div className="w-full h-full relative group" onClick={togglePlaying}>
              {/* Media Preview */}
              { (mediaBlobs[0]?.type.startsWith('image') || mediaBlob?.type.startsWith('image') || (mediaUrl && !mediaUrl.includes('blob') && !mediaUrl.includes('video'))) ? (
                <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar bg-zinc-950">
                  {(mediaUrls.length > 0 ? mediaUrls : [mediaUrl]).map((url, i) => (
                    <img key={i} src={url} className="h-full w-full object-contain flex-shrink-0 snap-center" alt="preview" />
                  ))}
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <video 
                      ref={previewVideoRef}
                      src={mediaUrl} 
                      className="w-full h-full object-contain bg-zinc-950"
                      playsInline
                      autoPlay
                      loop
                      muted={!!selectedMusic}
                  />
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Overlay Text */}
              <AnimatePresence>
                {overlayText && (
                  <motion.div 
                    drag
                    dragConstraints={{ left: -150, right: 150, top: -300, bottom: 300 }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="pointer-events-auto bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-2xl">
                      <span className="text-3xl font-black italic tracking-tighter text-white drop-shadow-2xl">{overlayText}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full z-40 p-6 pb-12 bg-gradient-to-t from-black via-black/40 to-transparent">
        {mediaUrl && (
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
             >
                <div className="relative">
                  <Input 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Add caption & hashtags..."
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/40 h-14 rounded-2xl px-6 text-lg focus:ring-pink-500/50"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">@</div>
                </div>
             </motion.div>
        )}

        <div className="flex justify-between items-center gap-8 max-w-md mx-auto">
             <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setShowGallery(true)}>
                 <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition shadow-xl border border-white/5 relative overflow-hidden">
                     {galleryFiles.length > 0 ? (
                       <img src={galleryFiles[0].url} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                     ) : (
                       <ImageIcon className="w-6 h-6 text-white relative z-10" />
                     )}
                 </div>
                 <span className="text-xs font-black tracking-tighter text-white/60 group-hover:text-white transition italic">UPLOAD</span>
             </div>

             {mediaUrl ? (
                 <Button 
                    onClick={handleSubmit}
                    disabled={isUploading}
                    className="flex-1 bg-white hover:bg-zinc-200 text-black rounded-3xl h-16 font-black text-xl tracking-tighter italic shadow-2xl transition-all active:scale-95"
                 >
                    {isUploading ? "POSTING..." : "POST FEED"}
                 </Button>
             ) : (
                 <motion.div 
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleRecording}
                    className="relative cursor-pointer"
                 >
                     <div className={cn(
                         "w-20 h-20 rounded-full border-[6px] flex items-center justify-center transition-all duration-500",
                         isRecording ? "border-red-500/40 scale-125" : "border-white"
                     )}>
                         <div className={cn(
                             "transition-all duration-500 shadow-2xl",
                             isRecording ? "w-8 h-8 bg-red-600 rounded-lg animate-pulse" : "w-16 h-16 bg-red-500 rounded-full"
                         )} />
                     </div>
                 </motion.div>
             )}

             <div className="flex flex-col items-center gap-2 group cursor-pointer opacity-40">
                 <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center shadow-xl border border-white/5">
                     <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00d8ff] via-[#8b00ff] to-[#ff00ea]" />
                 </div>
                 <span className="text-xs font-black tracking-tighter italic">TEMPLATES</span>
             </div>
        </div>
      </div>

      {/* Custom Gallery Picker */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-zinc-950 flex flex-col"
          >
            <div className="p-6 pt-10 flex justify-between items-center border-b border-white/5">
              <h2 className="text-3xl font-black italic tracking-tighter">GALLERY</h2>
              <div className="flex gap-4">
                <div 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5" />
                </div>
                <div 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
                  onClick={() => setShowGallery(false)}
                >
                  <X className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {galleryPermission === 'prompt' ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <ImageIcon className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="text-xl font-black italic mb-2">ALLOW ACCESS</h3>
                  <p className="text-white/40 text-sm mb-8">Vaulty needs access to your library to upload photos and videos.</p>
                  <Button 
                    onClick={requestGalleryPermission}
                    className="bg-slate-500 hover:bg-slate-600 text-white rounded-2xl px-10 h-14 font-black italic tracking-tighter shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                  >
                    ALLOW ACCESS
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {galleryFiles.map((file) => (
                    <div 
                      key={file.id} 
                      onClick={() => handleGallerySelect(file)}
                      className="aspect-square relative group cursor-pointer overflow-hidden rounded-xl bg-zinc-900"
                    >
                      <img src={file.url} className="w-full h-full object-cover transition group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                      {file.type === 'video' && (
                        <div className="absolute bottom-2 right-2">
                          <Video className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Plus button to add more from system picker */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-zinc-900 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-slate-500/50 transition cursor-pointer"
                  >
                    <Plus className="w-8 h-8 text-white/20 mb-1" />
                    <span className="text-[10px] font-black italic text-white/20 uppercase">Add more</span>
                  </div>
                </div>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple
              accept="video/*,image/*" 
              onChange={handleFileUpload} 
            />

            <div className="p-6 pb-12 bg-zinc-900/50 backdrop-blur-md">
              <Button 
                onClick={() => setShowGallery(false)}
                className="w-full bg-white text-black h-16 rounded-3xl font-black text-xl italic"
              >
                CANCEL
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMusicPicker && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-10 pt-4">
              <h2 className="text-3xl font-black italic tracking-tighter">ADD SOUND</h2>
              <button 
                onClick={() => setShowMusicPicker(false)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 overflow-y-auto pb-20">
              {musicOptions.map((music) => (
                <div 
                  key={music.id}
                  onClick={() => handleMusicSelect(music)}
                  className={cn(
                    "p-5 rounded-3xl flex items-center justify-between border transition-all active:scale-[0.98]",
                    selectedMusic?.url === music.url 
                      ? "bg-slate-500/20 border-slate-500/50" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00d8ff] via-[#8b00ff] to-[#ff00ea] flex items-center justify-center shadow-[0_0_15px_rgba(255,0,234,0.4)]">
                      <Music2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-lg tracking-tight">{music.title}</p>
                      <p className="text-sm text-white/40 italic font-medium">Original Track</p>
                    </div>
                  </div>
                  {selectedMusic?.url === music.url && (
                    <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button 
              onClick={() => setShowMusicPicker(false)}
              className="mt-auto bg-white text-black hover:bg-zinc-200 rounded-3xl h-16 font-black text-xl tracking-tighter italic shadow-2xl"
            >
              DONE
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditingText && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
             <input 
                autoFocus
                value={overlayText}
                onChange={e => setOverlayText(e.target.value)}
                className="bg-transparent text-center text-4xl font-black italic tracking-tighter text-white border-none focus:outline-none placeholder:text-white/20 w-full"
                placeholder="TYPE SOMETHING..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingText(false);
                }}
             />
             <Button 
                onClick={() => setIsEditingText(false)}
                className="mt-12 bg-white text-black rounded-full px-12 py-6 font-black tracking-tighter italic"
             >
               DONE
             </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={onClick}>
        <div className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition shadow-[0_0_15px_rgba(255,0,234,0.4)]">
            {icon}
        </div>
        {label && <span className="text-[10px] font-black tracking-tighter text-white/60 group-hover:text-white transition italic uppercase">{label}</span>}
    </div>
  );
}
