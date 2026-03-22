import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Shield, 
  ArrowLeft, 
  Info, 
  Download, 
  Lock, 
  EyeOff, 
  MapPin, 
  Camera, 
  Calendar, 
  Cpu,
  CheckCircle2
} from "lucide-react";

export default function RemoveMetadata() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    
    // Scroll to workspace
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (file && previewUrl && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = previewUrl;
    }
  }, [file, previewUrl]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processImage = async () => {
    if (!file || !canvasRef.current) return;
    
    setStatus("processing");
    setProcessingProgress(0);

    try {
      // Progress simulation
      for (let i = 0; i <= 100; i += 25) {
        setProcessingProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      const canvas = canvasRef.current;
      // Drawing to canvas and then toBlob effectively strips EXIF/Metadata
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), file.type, 0.95);
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultSize(blob.size);
        setStatus("success");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="sticky top-4 z-50 mb-8">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 backdrop-blur-md transition hover:text-white border border-white/5"
        >
          <ArrowLeft size={18} />
          Back to Tools
        </Link>
      </div>

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
          <Shield size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Strip <span className="text-amber-500 text-stroke-sm text-transparent">Metadata</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Protect your privacy by removing EXIF data, GPS coordinates, and camera info from your photos.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to clean"
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
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Lock size={20} className="text-amber-500" />
                Privacy Protection
              </h3>
              
              <div className="space-y-6">
                <div className="rounded-xl bg-zinc-950/50 p-4 border border-white/5 space-y-4">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Data to be removed:</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <MapPin size={14} className="text-amber-500" />
                      GPS Location Data
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <Camera size={14} className="text-amber-500" />
                      Camera & Lens Info
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <Calendar size={14} className="text-amber-500" />
                      Creation Date & Time
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <Cpu size={14} className="text-amber-500" />
                      Software & Edit History
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
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
                Cancel
              </button>
              <button
                onClick={processImage}
                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
              >
                <Shield size={20} />
                Strip Metadata
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
              ? "Sanitizing image data..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="Metadata Stripped!"
          message="Your image is now clean and safe to share online. All hidden tracking data has been removed."
          previewUrl={resultUrl}
          downloadUrl={resultUrl}
          fileInfo={{
            originalSize: formatSize(file?.size || 0),
            newSize: formatSize(resultSize || 0),
            saved: formatSize(Math.max(0, (file?.size || 0) - (resultSize || 0)))
          }}
          onReset={() => {
            setFile(null);
            setResultUrl(null);
            setStatus("idle");
            setPreviewUrl(null);
            setResultSize(null);
          }}
        />
      )}
    </div>
  );
}
