import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import { 
  Crop as CropIcon, 
  Settings2, 
  Download, 
  RotateCcw, 
  Maximize,
  Undo2,
  Redo2,
  Eye
} from "lucide-react";
import { useHistory } from "../../hooks/useHistory";

interface CropSettings {
  crop: Crop;
  aspect: number | undefined;
}

export default function CropImage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const { 
    state: settings, 
    setState: setSettings, 
    undo, 
    redo, 
    reset, 
    canUndo, 
    canRedo 
  } = useHistory<CropSettings>({
    crop: {
      unit: "%",
      width: 50,
      height: 50,
      x: 25,
      y: 25,
    },
    aspect: undefined,
  });

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        { unit: "%", width: 90 },
        settings.aspect || 1,
        width,
        height
      ),
      width,
      height
    );
    setSettings({ ...settings, crop: initialCrop });
  };

  const handleAspectChange = (aspect: number | undefined) => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          { unit: "%", width: 90 },
          aspect || 1,
          width,
          height
        ),
        width,
        height
      );
      setSettings({ ...settings, aspect, crop: newCrop });
    } else {
      setSettings({ ...settings, aspect });
    }
  };

  const processImage = useCallback(async () => {
    if (!file || !completedCrop || !imgRef.current) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      const canvas = document.createElement("canvas");
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          imgRef.current,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );
        
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
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [file, completedCrop]);

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
          <CropIcon size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[0.9] mb-4 break-words">
          Crop <span className="text-amber-500 text-stroke-sm text-transparent">Image</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Precision cropping with aspect ratio presets. Focus on what matters most in your photos.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to crop"
        />
      )}

      {file && !resultUrl && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[400px] items-center">
                <ReactCrop
                  crop={settings.crop}
                  onChange={(c) => setSettings({ ...settings, crop: c })}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={settings.aspect}
                  className="max-h-[70vh]"
                >
                  <img
                    ref={imgRef}
                    src={previewUrl || ""}
                    alt="To crop"
                    onLoad={onImageLoad}
                    className="max-h-[70vh] w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </ReactCrop>
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
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Free", value: undefined },
                      { label: "1:1", value: 1 },
                      { label: "4:3", value: 4/3 },
                      { label: "16:9", value: 16/9 },
                      { label: "3:2", value: 3/2 },
                      { label: "9:16", value: 9/16 },
                    ].map((ratio) => (
                      <button
                        key={ratio.label}
                        onClick={() => handleAspectChange(ratio.value)}
                        className={`rounded-xl border py-3 text-xs font-bold transition ${
                          settings.aspect === ratio.value ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Original Size</span>
                    <span className="font-mono text-white">{formatSize(file.size)}</span>
                  </div>
                  {completedCrop && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider">Crop Size</span>
                      <span className="font-mono text-amber-500">
                        {Math.round(completedCrop.width)} x {Math.round(completedCrop.height)}px
                      </span>
                    </div>
                  )}
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
                <Maximize size={20} />
                Crop & Save
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
              ? "Cropping your image locally..."
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
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Cropped</p>
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
                        <img src={resultUrl} alt="Cropped" className="max-h-[70vh] w-auto object-contain" referrerPolicy="no-referrer" />
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
                download={`cropped-${file?.name}`}
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
