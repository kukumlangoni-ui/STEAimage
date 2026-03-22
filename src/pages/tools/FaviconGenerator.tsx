import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Globe, 
  ArrowLeft, 
  Download, 
  Settings2,
  CheckCircle2,
  Monitor,
  Smartphone,
  Tablet,
  Layout,
  Info
} from "lucide-react";

interface FaviconSize {
  size: number;
  label: string;
  icon: React.ReactNode;
}

const FAVICON_SIZES: FaviconSize[] = [
  { size: 16, label: "Classic (16x16)", icon: <Monitor size={14} /> },
  { size: 32, label: "Modern (32x32)", icon: <Monitor size={14} /> },
  { size: 48, label: "Desktop (48x48)", icon: <Monitor size={14} /> },
  { size: 180, label: "Apple (180x180)", icon: <Smartphone size={14} /> },
  { size: 192, label: "Android (192x192)", icon: <Smartphone size={14} /> },
  { size: 512, label: "PWA (512x512)", icon: <Globe size={14} /> },
];

export default function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<{ url: string; size: number; label: string }[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 180]);
  
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

  const toggleSize = (size: number) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const processImage = async () => {
    if (!file || selectedSizes.length === 0) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        const results: { url: string; size: number; label: string }[] = [];
        
        for (let i = 0; i < selectedSizes.length; i++) {
          const size = selectedSizes[i];
          const label = FAVICON_SIZES.find(s => s.size === size)?.label || `${size}x${size}`;
          
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Draw image centered and square
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
            results.push({ url: canvas.toDataURL("image/png"), size, label });
          }
          setProcessingProgress(Math.round(((i + 1) / selectedSizes.length) * 100));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setResultUrls(results);
        setStatus("success");
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const downloadAll = () => {
    resultUrls.forEach((res) => {
      const link = document.createElement("a");
      link.href = res.url;
      link.download = `favicon-${res.size}x${res.size}.png`;
      link.click();
    });
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
          <Globe size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Favicon <span className="text-amber-500 text-stroke-sm text-transparent">Generator</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Generate a complete set of favicons for all platforms, from classic browsers to modern mobile devices.
        </p>
      </div>

      {!file && resultUrls.length === 0 && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to generate favicons"
        />
      )}

      {file && resultUrls.length === 0 && status === "idle" && (
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
                Select Sizes
              </h3>
              
              <div className="space-y-3">
                {FAVICON_SIZES.map((res) => (
                  <button
                    key={res.size}
                    onClick={() => toggleSize(res.size)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 transition ${
                      selectedSizes.includes(res.size) ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${selectedSizes.includes(res.size) ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-500"}`}>
                        {res.icon}
                      </div>
                      <span className="text-sm font-bold">{res.label}</span>
                    </div>
                    {selectedSizes.includes(res.size) && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                <div className="flex gap-3">
                  <Info size={16} className="shrink-0 text-amber-500" />
                  <p className="text-[10px] leading-relaxed text-zinc-400">
                    Images will be automatically cropped to a square aspect ratio for the best favicon results.
                  </p>
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
                disabled={selectedSizes.length === 0}
                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Layout size={20} />
                Generate Set
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
              ? `Generating ${selectedSizes.length} favicon sizes...`
              : "An error occurred during generation."
          }
        />
      )}

      {resultUrls.length > 0 && status === "success" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Favicons Generated!</h2>
              <p className="text-zinc-400">Your complete favicon set is ready for download.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setResultUrls([]);
                  setStatus("idle");
                  setPreviewUrl(null);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Generate New
              </button>
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-zinc-950 shadow-lg transition hover:bg-amber-400"
              >
                <Download size={18} />
                Download All (.png)
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resultUrls.map((res, i) => (
              <div key={i} className="group rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md transition hover:border-amber-500/30">
                <div className="mb-6 flex justify-center bg-zinc-950/50 rounded-2xl p-8 min-h-[150px] items-center">
                  <img 
                    src={res.url} 
                    alt={res.label} 
                    className="shadow-2xl" 
                    style={{ width: Math.min(res.size, 100), height: Math.min(res.size, 100) }} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{res.label}</h4>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{res.size}x{res.size}px</p>
                  </div>
                  <a
                    href={res.url}
                    download={`favicon-${res.size}x${res.size}.png`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition hover:bg-amber-500 hover:text-zinc-950"
                  >
                    <Download size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
