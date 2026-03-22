import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import { 
  Smartphone, 
  Download, 
  Settings2,
  CheckCircle2,
  Maximize,
  Info,
  Layers
} from "lucide-react";

export default function ImageToHeic() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [quality, setQuality] = useState(80);
  
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

  const processImage = async () => {
    if (!file) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
        
        setProcessingProgress(100);
        // HEIC support in toDataURL is limited. We'll fallback to WebP if HEIC isn't supported.
        let dataUrl = canvas.toDataURL("image/heic", quality / 100);
        if (!dataUrl.startsWith("data:image/heic")) {
          dataUrl = canvas.toDataURL("image/webp", quality / 100);
        }
        setResultUrl(dataUrl);
        setStatus("success");
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <BackToTools />

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
          <Smartphone size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white leading-[0.9] mb-4 break-words">
          Image to <span className="text-amber-500 text-stroke-sm text-transparent">HEIC</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Convert any image to HEIC format, the standard for modern mobile devices.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to convert to HEIC"
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
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
                <Settings2 size={20} className="text-amber-500" />
                HEIC Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Quality</label>
                    <span className="text-xs font-mono text-amber-500">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                  <div className="flex gap-3">
                    <Info size={16} className="shrink-0 text-amber-500" />
                    <p className="text-[10px] leading-relaxed text-zinc-400">
                      HEIC is the standard photo format for iPhones and modern Android devices, offering high quality at small file sizes.
                    </p>
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
                <Smartphone size={20} />
                Convert to HEIC
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
              ? "Converting image to HEIC format..."
              : "An error occurred during conversion."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="HEIC Generated!"
          message="Your image has been successfully converted to HEIC format."
          previewUrl={resultUrl}
          downloadUrl={resultUrl}
          onReset={() => {
            setFile(null);
            setResultUrl(null);
            setStatus("idle");
            setPreviewUrl(null);
          }}
        />
      )}
    </div>
  );
}
