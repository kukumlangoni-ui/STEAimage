import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import { 
  Minimize2, 
  Info, 
  Undo2, 
  Redo2, 
  RotateCcw, 
  Settings2, 
  Eye, 
  Download,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useHistory } from "../../hooks/useHistory";

interface CompressionSettings {
  quality: number;
  format: "image/jpeg" | "image/webp";
  maxWidth?: number;
  maxHeight?: number;
}

export default function CompressImage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [results, setResults] = useState<{ url: string; size: number; name: string }[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  const { 
    state: settings, 
    setState: setSettings, 
    undo, 
    redo, 
    reset, 
    canUndo, 
    canRedo 
  } = useHistory<CompressionSettings>({
    quality: 0.7,
    format: "image/jpeg",
  });

  const workspaceRef = useRef<HTMLDivElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const processImage = useCallback(async () => {
    if (!file) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        
        // Handle resizing if needed
        let targetWidth = img.width;
        let targetHeight = img.height;
        
        if (settings.maxWidth && targetWidth > settings.maxWidth) {
          const ratio = settings.maxWidth / targetWidth;
          targetWidth = settings.maxWidth;
          targetHeight = targetHeight * ratio;
        }
        
        if (settings.maxHeight && targetHeight > settings.maxHeight) {
          const ratio = settings.maxHeight / targetHeight;
          targetHeight = settings.maxHeight;
          targetWidth = targetWidth * ratio;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        setNewDimensions({ w: Math.round(targetWidth), h: Math.round(targetHeight) });

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          setProcessingProgress(50);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const dataUrl = URL.createObjectURL(blob);
              setResultUrl(dataUrl);
              setResultSize(blob.size);
              setStatus("success");
              setProcessingProgress(100);
            } else {
              setStatus("error");
            }
          }, settings.format, settings.quality);
        }
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [file, settings]);

  const savedSize = file ? file.size - resultSize : 0;
  const savedPercent = file ? Math.round((savedSize / file.size) * 100) : 0;
  const isActuallySmaller = savedSize > 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <BackToTools />

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
          <Minimize2 size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[0.9] mb-4 break-words">
          Compress <span className="text-amber-500 text-stroke-sm text-transparent">Image</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Reduce file size with real-time transparency. No hidden tricks, just optimized pixels.
        </p>
      </div>

      <div ref={workspaceRef} className="scroll-mt-24">
        {files.length === 0 && status === "idle" && (
          <UploadDropzone
            onUploadMultiple={handleUpload}
            multiple={true}
            title="Upload images to compress"
          />
        )}

        {file && !resultUrl && status === "idle" && (
          <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-8">
              <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
                <div className="relative flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[400px] items-center">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="max-h-[70vh] w-auto object-contain shadow-2xl rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-6 left-6 flex gap-2">
                    <div className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                      {originalDimensions?.w} × {originalDimensions?.h} px
                    </div>
                    <div className="rounded-full bg-amber-500/80 px-3 py-1 text-[10px] font-bold text-zinc-950 backdrop-blur-md">
                      {formatSize(file.size)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
                    <Settings2 size={20} className="text-amber-500" />
                    Settings
                  </h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={undo} 
                      disabled={!canUndo}
                      className="p-2 text-zinc-500 hover:text-white disabled:opacity-20 transition"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 size={18} />
                    </button>
                    <button 
                      onClick={redo} 
                      disabled={!canRedo}
                      className="p-2 text-zinc-500 hover:text-white disabled:opacity-20 transition"
                      title="Redo (Ctrl+Y)"
                    >
                      <Redo2 size={18} />
                    </button>
                    <button 
                      onClick={reset}
                      className="p-2 text-zinc-500 hover:text-white transition"
                      title="Reset"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Output Format</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["image/jpeg", "image/webp"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setSettings({ ...settings, format: fmt })}
                          className={`rounded-xl border py-3 text-xs font-bold transition ${
                            settings.format === fmt 
                              ? "border-amber-500 bg-amber-500/10 text-amber-400" 
                              : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                          }`}
                        >
                          {fmt.split("/")[1].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Quality: <span className="text-amber-500">{Math.round(settings.quality * 100)}%</span>
                      </label>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={settings.quality}
                      onChange={(e) => setSettings({ ...settings, quality: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-white/5"
                    />
                    <div className="mt-2 flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                      <span>Small File</span>
                      <span>High Quality</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFile(null)}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white transition hover:bg-white/10"
                      >
                        Clear
                      </button>
                      <button
                        onClick={processImage}
                        className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
                      >
                        <Minimize2 size={20} />
                        Compress
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-500/5 p-4 border border-amber-500/10">
                <div className="flex gap-3">
                  <Info size={18} className="shrink-0 text-amber-500" />
                  <p className="text-xs leading-relaxed text-zinc-400">
                    Compression is done entirely in your browser. Your images are never uploaded to our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(status === "processing" || status === "error") && (
          <ProgressFeedback
            status={status}
            processingProgress={processingProgress}
            message={
              status === "processing"
                ? "Optimizing pixels for maximum efficiency..."
                : "Something went wrong. Please try a different image or format."
            }
          />
        )}

        {resultUrl && status === "success" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Original</p>
                <p className="text-2xl font-black text-white">{formatSize(file?.size || 0)}</p>
                <p className="text-[10px] text-zinc-500 mt-1">{originalDimensions?.w} × {originalDimensions?.h} px</p>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Compressed</p>
                <p className={`text-2xl font-black ${isActuallySmaller ? 'text-amber-500' : 'text-red-400'}`}>
                  {formatSize(resultSize)}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">{newDimensions?.w} × {newDimensions?.h} px</p>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Reduction</p>
                <p className={`text-2xl font-black ${isActuallySmaller ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {isActuallySmaller ? `${savedPercent}%` : '0%'}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">Efficiency Gain</p>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Saved</p>
                <p className={`text-2xl font-black ${isActuallySmaller ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {isActuallySmaller ? formatSize(savedSize) : '0 KB'}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">Total Space</p>
              </div>
            </div>

            {!isActuallySmaller && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 p-4 border border-red-500/20 text-red-400">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">
                  Current settings did not reduce the image. Try lower quality or change format.
                </p>
              </div>
            )}

            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Original Size</p>
                <p className="mt-1 text-xl font-black text-white">{formatSize(file?.size || 0)}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">New Size</p>
                <p className="mt-1 text-xl font-black text-emerald-400">{formatSize(resultSize)}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Reduction</p>
                <p className="mt-1 text-xl font-black text-amber-500">
                  {Math.max(0, Math.round(((file?.size || 0) - resultSize) / (file?.size || 1) * 100))}%
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Dimensions</p>
                <p className="mt-1 text-xl font-black text-white">
                  {newDimensions?.w}x{newDimensions?.h}
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
                  <div className="relative flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[400px] items-center overflow-hidden">
                    {showComparison ? (
                      <div className="relative w-full h-full flex">
                        <div className="w-1/2 overflow-hidden border-r border-white/20 relative">
                          <img
                            src={URL.createObjectURL(file!)}
                            alt="Original"
                            className="max-h-[70vh] w-auto object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                            BEFORE
                          </div>
                        </div>
                        <div className="w-1/2 overflow-hidden relative">
                          <img
                            src={resultUrl}
                            alt="Compressed"
                            className="max-h-[70vh] w-auto object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-4 right-4 rounded-full bg-amber-500/80 px-3 py-1 text-[10px] font-bold text-zinc-950 backdrop-blur-md">
                            AFTER
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={resultUrl}
                        alt="Result"
                        className="max-h-[70vh] w-auto object-contain shadow-2xl rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-4 font-bold transition ${
                    showComparison 
                      ? "border-amber-500 bg-amber-500/10 text-amber-400" 
                      : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <Eye size={20} />
                  {showComparison ? "Hide Comparison" : "Compare Before/After"}
                </button>

                <a
                  href={resultUrl}
                  download={`compressed-${file?.name}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                >
                  <Download size={20} />
                  Download Optimized
                </a>

                <button
                  onClick={() => {
                    setFile(null);
                    setResultUrl(null);
                    setStatus("idle");
                    setShowComparison(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white transition hover:bg-white/10"
                >
                  <RotateCcw size={20} />
                  Process Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
