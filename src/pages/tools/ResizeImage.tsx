import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import { 
  Maximize2, 
  Settings2, 
  Download, 
  Lock, 
  Unlock, 
  Percent, 
  Type,
  Info,
  Undo2,
  Redo2,
  RotateCcw,
  Eye
} from "lucide-react";
import { useHistory } from "../../hooks/useHistory";

interface ResizeSettings {
  mode: "pixels" | "percentage";
  width: number;
  height: number;
  percentage: number;
  maintainAspectRatio: boolean;
}

export default function ResizeImage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [originalRatio, setOriginalRatio] = useState<number>(1);
  const [showComparison, setShowComparison] = useState(false);
  
  const { 
    state: settings, 
    setState: setSettings, 
    undo, 
    redo, 
    reset, 
    canUndo, 
    canRedo 
  } = useHistory<ResizeSettings>({
    mode: "pixels",
    width: 0,
    height: 0,
    percentage: 50,
    maintainAspectRatio: true,
  });

  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    
    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setOriginalRatio(img.width / img.height);
      setSettings({
        ...settings,
        width: img.width,
        height: img.height,
      });
      
      setTimeout(() => {
        workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    };
    img.src = url;
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value) || 0;
    if (settings.maintainAspectRatio && originalRatio) {
      setSettings({
        ...settings,
        width: newWidth,
        height: Math.round(newWidth / originalRatio)
      });
    } else {
      setSettings({ ...settings, width: newWidth });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value) || 0;
    if (settings.maintainAspectRatio && originalRatio) {
      setSettings({
        ...settings,
        height: newHeight,
        width: Math.round(newHeight * originalRatio)
      });
    } else {
      setSettings({ ...settings, height: newHeight });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processImage = useCallback(async () => {
    if (!file) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        let finalWidth = settings.width;
        let finalHeight = settings.height;
        
        if (settings.mode === "percentage") {
          finalWidth = Math.round(originalWidth * (settings.percentage / 100));
          finalHeight = Math.round(originalHeight * (settings.percentage / 100));
        }
        
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
          canvas.toBlob((blob) => {
            if (blob) {
              const dataUrl = URL.createObjectURL(blob);
              setResultUrl(dataUrl);
              setResultSize(blob.size);
              setProcessingProgress(100);
              setStatus("success");
            }
          }, file.type, 0.9);
        }
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [file, settings, originalWidth, originalHeight]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <BackToTools />

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
          <Maximize2 size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[0.9] mb-4 break-words">
          Resize <span className="text-amber-500 text-stroke-sm text-transparent">Image</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Change dimensions by pixels or percentage. Perfect for web optimization and social media.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to resize"
        />
      )}

      {file && !resultUrl && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[400px] items-center">
                <img
                  src={previewUrl || ""}
                  alt="Preview"
                  className="max-h-[70vh] w-auto object-contain shadow-2xl rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Settings2 size={20} className="text-amber-500" />
                  Settings
                </h3>
                <div className="flex gap-1">
                  <button onClick={undo} disabled={!canUndo} className="p-2 text-zinc-500 hover:text-white disabled:opacity-20 transition" title="Undo (Ctrl+Z)"><Undo2 size={18} /></button>
                  <button onClick={redo} disabled={!canRedo} className="p-2 text-zinc-500 hover:text-white disabled:opacity-20 transition" title="Redo (Ctrl+Y)"><Redo2 size={18} /></button>
                  <button onClick={reset} className="p-2 text-zinc-500 hover:text-white transition" title="Reset"><RotateCcw size={18} /></button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">Resize Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, mode: "pixels" })}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                        settings.mode === "pixels" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Type size={16} />
                      By Pixels
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, mode: "percentage" })}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                        settings.mode === "percentage" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Percent size={16} />
                      By Percentage
                    </button>
                  </div>
                </div>

                {settings.mode === "pixels" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Width (px)</label>
                        <input
                          type="number"
                          value={settings.width}
                          onChange={handleWidthChange}
                          className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Height (px)</label>
                        <input
                          type="number"
                          value={settings.height}
                          onChange={handleHeightChange}
                          className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, maintainAspectRatio: !settings.maintainAspectRatio })}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl border p-2 text-[10px] font-bold uppercase tracking-widest transition ${
                        settings.maintainAspectRatio ? "border-amber-500/30 bg-amber-500/5 text-amber-500" : "border-white/5 bg-zinc-950 text-zinc-500"
                      }`}
                    >
                      {settings.maintainAspectRatio ? <Lock size={14} /> : <Unlock size={14} />}
                      {settings.maintainAspectRatio ? "Aspect Ratio Locked" : "Aspect Ratio Unlocked"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Scale: {settings.percentage}%</label>
                      <span className="font-mono text-xs text-amber-500">
                        {Math.round(originalWidth * (settings.percentage / 100))} x {Math.round(originalHeight * (settings.percentage / 100))}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={settings.percentage}
                      onChange={(e) => setSettings({ ...settings, percentage: parseInt(e.target.value) })}
                      className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-white/5"
                    />
                    <div className="mt-2 flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                      <span>1%</span>
                      <span>100%</span>
                      <span>200%</span>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Original Size</span>
                    <span className="font-mono text-white">{formatSize(file.size)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Original Dimensions</span>
                    <span className="font-mono text-white">{originalWidth} x {originalHeight}px</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white transition hover:bg-white/10"
              >
                Clear
              </button>
              <button
                onClick={processImage}
                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
              >
                <Download size={20} />
                Resize & Save
              </button>
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
              ? "Resizing your image locally..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Original</p>
              <p className="text-2xl font-black text-white">{formatSize(file?.size || 0)}</p>
              <p className="text-[10px] text-zinc-500 mt-1">{originalWidth} × {originalHeight} px</p>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Resized</p>
              <p className="text-2xl font-black text-amber-500">{formatSize(resultSize || 0)}</p>
              <p className="text-[10px] text-zinc-500 mt-1">
                {settings.mode === "pixels" ? `${settings.width} × ${settings.height}` : `${Math.round(originalWidth * (settings.percentage / 100))} × ${Math.round(originalHeight * (settings.percentage / 100))}`} px
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
                        <img src={previewUrl!} alt="Original" className="max-h-[70vh] w-auto object-contain" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">BEFORE</div>
                      </div>
                      <div className="w-1/2 overflow-hidden relative">
                        <img src={resultUrl} alt="Resized" className="max-h-[70vh] w-auto object-contain" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 right-4 rounded-full bg-amber-500/80 px-3 py-1 text-[10px] font-bold text-zinc-950 backdrop-blur-md">AFTER</div>
                      </div>
                    </div>
                  ) : (
                    <img src={resultUrl} alt="Result" className="max-h-[70vh] w-auto object-contain shadow-2xl rounded-lg" referrerPolicy="no-referrer" />
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-4 font-bold transition ${
                  showComparison ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <Eye size={20} />
                {showComparison ? "Hide Comparison" : "Compare Before/After"}
              </button>

              <a
                href={resultUrl}
                download={`resized-${file?.name}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
              >
                <Download size={20} />
                Download Image
              </a>

              <button
                onClick={() => {
                  setFile(null);
                  setResultUrl(null);
                  setStatus("idle");
                  setPreviewUrl(null);
                  setResultSize(null);
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
  );
}
