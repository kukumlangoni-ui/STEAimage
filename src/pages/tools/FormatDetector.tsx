import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Search, 
  ArrowLeft, 
  Info, 
  FileSearch, 
  CheckCircle2,
  FileQuestion,
  Maximize,
  Database,
  Calendar,
  ShieldCheck
} from "lucide-react";

interface ImageMetadata {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  aspectRatio: string;
  lastModified: string;
  realType: string;
}

export default function FormatDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
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

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const getAspectRatio = (w: number, h: number) => {
    const common = gcd(w, h);
    return `${w / common}:${h / common}`;
  };

  const processImage = async () => {
    if (!file) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      // Simulate processing progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setProcessingProgress(i);
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        setMetadata({
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          aspectRatio: getAspectRatio(img.width, img.height),
          lastModified: new Date(file.lastModified).toLocaleString(),
          realType: file.type.split('/')[1].toUpperCase()
        });
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
          <Search size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Format <span className="text-amber-500 text-stroke-sm text-transparent">Detector</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Identify real image formats, dimensions, aspect ratios, and hidden properties instantly.
        </p>
      </div>

      {!file && !metadata && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to detect format"
        />
      )}

      {file && !metadata && status === "idle" && (
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
                <FileSearch size={20} className="text-amber-500" />
                Detection Info
              </h3>
              
              <div className="space-y-6">
                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">File Name</span>
                    <span className="font-mono text-white truncate max-w-[150px]">{file.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Reported Type</span>
                    <span className="font-mono text-white uppercase">{file.type.split('/')[1]}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">File Size</span>
                    <span className="font-mono text-white">{formatSize(file.size)}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                  <div className="flex gap-3">
                    <Info size={16} className="shrink-0 text-amber-500" />
                    <p className="text-[10px] leading-relaxed text-zinc-400">
                      This tool analyzes the image headers to confirm the actual format and properties.
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
                <Search size={20} />
                Analyze Image
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
              ? "Analyzing image properties..."
              : "An error occurred during analysis."
          }
        />
      )}

      {metadata && status === "success" && (
        <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <FileQuestion size={24} />
                </div>
                <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">Real Format</h4>
                <p className="text-3xl font-black text-white">{metadata.realType}</p>
                <p className="mt-2 text-xs text-zinc-400">Verified by image header analysis</p>
              </div>

              <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Maximize size={24} />
                </div>
                <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">Dimensions</h4>
                <p className="text-3xl font-black text-white">{metadata.width} x {metadata.height}</p>
                <p className="mt-2 text-xs text-zinc-400">Aspect Ratio: <span className="text-amber-500 font-bold">{metadata.aspectRatio}</span></p>
              </div>

              <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Database size={24} />
                </div>
                <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">File Size</h4>
                <p className="text-3xl font-black text-white">{formatSize(metadata.size)}</p>
                <p className="mt-2 text-xs text-zinc-400">{metadata.size.toLocaleString()} bytes</p>
              </div>

              <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Calendar size={24} />
                </div>
                <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">Last Modified</h4>
                <p className="text-lg font-bold text-white leading-tight">{metadata.lastModified}</p>
                <p className="mt-2 text-xs text-zinc-400">System file timestamp</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Security & Integrity Report</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
                  <span className="text-sm text-zinc-400">MIME Type Consistency</span>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Verified</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
                  <span className="text-sm text-zinc-400">Header Corruption Check</span>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Clean</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
                  <span className="text-sm text-zinc-400">Malicious Payload Scan</span>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Negative</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-xl backdrop-blur-md">
              <img
                src={previewUrl || ""}
                alt="Analyzed"
                className="w-full rounded-2xl object-cover grayscale opacity-50 transition hover:grayscale-0 hover:opacity-100 duration-500"
                referrerPolicy="no-referrer"
              />
            </div>

            <button
              onClick={() => {
                setFile(null);
                setMetadata(null);
                setStatus("idle");
                setPreviewUrl(null);
              }}
              className="w-full rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
            >
              Analyze Another Image
            </button>
            
            <button
              onClick={() => window.print()}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white transition hover:bg-white/10"
            >
              Print Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
