import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import { 
  RotateCw, 
  Settings2, 
  Download, 
  RotateCcw, 
  Undo2,
  Redo2,
  Eye
} from "lucide-react";
import { useHistory } from "../../hooks/useHistory";

interface RotateSettings {
  rotation: number;
}

export default function RotateImage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  
  const workspaceRef = useRef<HTMLDivElement>(null);

  const { 
    state: settings, 
    setState: setSettings, 
    undo, 
    redo, 
    reset, 
    canUndo, 
    canRedo 
  } = useHistory<RotateSettings>({
    rotation: 0,
  });

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
        const ctx = canvas.getContext("2d");
        
        const angle = (settings.rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(angle));
        const cos = Math.abs(Math.cos(angle));
        
        canvas.width = img.width * cos + img.height * sin;
        canvas.height = img.width * sin + img.height * cos;
        
        if (ctx) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(angle);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          
          setProcessingProgress(70);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const dataUrl = URL.createObjectURL(blob);
              setResultUrl(dataUrl);
              setResultSize(blob.size);
              setProcessingProgress(100);
              setStatus("success");
            }
          }, file.type, 0.95);
        }
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [file, settings]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <BackToTools />

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
          <RotateCw size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[0.9] mb-4 break-words">
          Rotate <span className="text-amber-500 text-stroke-sm text-transparent">Image</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Rotate your images to any angle. Fix orientation issues or create artistic tilts.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to rotate"
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
                  style={{ transform: `rotate(${settings.rotation}deg)` }}
                  className="max-h-[70vh] w-auto object-contain shadow-2xl rounded-lg transition-transform duration-300"
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
                  Rotate Settings
                </h3>
                <div className="flex gap-1">
                  <button onClick={undo} disabled={!canUndo} className="p-2 text-zinc-500 hover:text-white disabled:opacity-20 transition" title="Undo (Ctrl+Z)"><Undo2 size={18} /></button>
                  <button onClick={redo} disabled={!canRedo} className="p-2 text-zinc-500 hover:text-white disabled:opacity-20 transition" title="Redo (Ctrl+Y)"><Redo2 size={18} /></button>
                  <button onClick={reset} className="p-2 text-zinc-500 hover:text-white transition" title="Reset"><RotateCcw size={18} /></button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">Quick Rotation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "-90°", value: -90 },
                      { label: "90°", value: 90 },
                      { label: "180°", value: 180 },
                      { label: "0°", value: 0 },
                    ].map((rot) => (
                      <button
                        key={rot.label}
                        onClick={() => setSettings({ ...settings, rotation: (settings.rotation + rot.value) % 360 })}
                        className="rounded-xl border border-white/5 bg-zinc-950 py-3 text-xs font-bold text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                      >
                        {rot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Custom Angle: <span className="text-amber-500">{settings.rotation}°</span>
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={settings.rotation}
                    onChange={(e) => setSettings({ ...settings, rotation: parseInt(e.target.value) })}
                    className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-white/5"
                  />
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Original Size</span>
                    <span className="font-mono text-white">{formatSize(file.size)}</span>
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
                <RotateCw size={20} />
                Rotate & Save
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
              ? "Rotating your image locally..."
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
            </div>
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Rotated</p>
              <p className="text-2xl font-black text-amber-500">{formatSize(resultSize || 0)}</p>
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
                        <img src={resultUrl} alt="Rotated" className="max-h-[70vh] w-auto object-contain" referrerPolicy="no-referrer" />
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
                download={`rotated-${file?.name}`}
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
