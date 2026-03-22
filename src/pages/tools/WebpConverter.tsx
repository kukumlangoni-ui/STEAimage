import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Zap, 
  ArrowLeft, 
  Download, 
  Settings2,
  Info,
  CheckCircle2
} from "lucide-react";

export default function WebpConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  
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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processImage = async () => {
    if (!file) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      // Simulate processing progress
      for (let i = 0; i <= 90; i += 15) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setProcessingProgress(i);
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const dataUrl = URL.createObjectURL(blob);
              setResultUrl(dataUrl);
              setResultSize(blob.size);
              setProcessingProgress(100);
              setStatus("success");
            }
          }, "image/webp", quality);
        }
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
          <Zap size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          WEBP <span className="text-amber-500 text-stroke-sm text-transparent">Converter</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Convert any image to modern WEBP format for superior compression and web performance.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to convert to WEBP"
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
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Settings2 size={20} className="text-amber-500" />
                WEBP Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">WEBP Quality: {Math.round(quality * 100)}%</label>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                    <span>Smallest</span>
                    <span>Balanced</span>
                    <span>High Quality</span>
                    <span>Lossless-ish</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Source Format</span>
                    <span className="font-mono text-white uppercase">{file.type.split('/')[1]}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Target Format</span>
                    <span className="font-mono text-amber-500 font-bold uppercase">WEBP</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Original Size</span>
                    <span className="font-mono text-white">{formatSize(file.size)}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                  <div className="flex gap-3">
                    <Info size={16} className="shrink-0 text-amber-500" />
                    <p className="text-[10px] leading-relaxed text-zinc-400">
                      WEBP provides better compression than JPG and PNG while supporting transparency.
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
                <CheckCircle2 size={20} />
                Convert to WEBP
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
              ? "Converting your image to WEBP locally..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="Conversion Complete!"
          message="Your image has been successfully converted to WEBP format."
          previewUrl={resultUrl}
          downloadUrl={resultUrl}
          fileInfo={{
            originalSize: formatSize(file?.size || 0),
            newSize: formatSize(resultSize || 0),
            saved: file && resultSize ? `${Math.round((1 - resultSize / file.size) * 100)}%` : "N/A"
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
