import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { Minimize2, Download, Eye, RotateCcw, Settings2, AlertCircle, ArrowLeft, Info, CheckCircle2 } from "lucide-react";

const fmt = (bytes: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024, s = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${s[i]}`;
};

export default function CompressImage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);
  const [resultDims, setResultDims] = useState<{ w: number; h: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [showCompare, setShowCompare] = useState(false);
  const [quality, setQuality] = useState(0.75);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleUpload = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setResultUrl(null);
    setStatus("idle");
    setTimeout(() => workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const compress = useCallback(async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(20);

    try {
      const img = new Image();
      const src = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          setOriginalDims({ w: img.width, h: img.height });
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          setResultDims({ w: img.width, h: img.height });
          setProgress(50);
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Canvas context unavailable")); return; }
          ctx.drawImage(img, 0, 0);
          setProgress(75);
          canvas.toBlob((blob) => {
            if (!blob) { reject(new Error("Compression failed")); return; }
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            setResultSize(blob.size);
            setProgress(100);
            setStatus("success");
            resolve();
          }, format, quality);
          URL.revokeObjectURL(src);
        };
        img.onerror = () => reject(new Error("Could not load image"));
        img.src = src;
      });
    } catch (err) {
      console.error("[Compress]", err);
      setStatus("error");
    }
  }, [file, quality, format]);

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setPreviewUrl(null); setResultUrl(null);
    setStatus("idle"); setProgress(0); setShowCompare(false);
    setOriginalDims(null); setResultDims(null); setResultSize(0);
  };

  const savedBytes = file ? file.size - resultSize : 0;
  const savedPct = file && file.size > 0 ? Math.round((savedBytes / file.size) * 100) : 0;
  const actuallySmaller = savedBytes > 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link to="/tools" className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16} /> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <Minimize2 size={32} />
        </div>
        <h1 className="text-4xl font-black text-white">Compress Image</h1>
        <p className="mt-2 text-zinc-400">Reduce file size. 100% in your browser — nothing uploaded.</p>
      </div>

      <div ref={workspaceRef}>
        {/* Upload */}
        {!file && (
          <UploadDropzone onUpload={handleUpload} title="Upload image to compress" accept="image/jpeg,image/png,image/webp" />
        )}

        {/* Settings + preview */}
        {file && status === "idle" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
              <img src={previewUrl || ""} alt="Preview" className="mx-auto max-h-[60vh] w-auto rounded-xl object-contain" />
              {originalDims && (
                <div className="mt-3 flex gap-2 justify-center">
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-400">{originalDims.w} × {originalDims.h} px</span>
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">{fmt(file.size)}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                  <Settings2 size={18} className="text-amber-400" /> Settings
                </h3>

                {/* Format */}
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Output Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["image/jpeg", "image/webp"] as const).map((f) => (
                      <button key={f} onClick={() => setFormat(f)}
                        className={`rounded-xl border py-3 text-xs font-bold transition ${format === f ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"}`}>
                        {f.split("/")[1].toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div className="mb-6">
                  <div className="mb-2 flex justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Quality</label>
                    <span className="text-xs font-bold text-amber-400">{Math.round(quality * 100)}%</span>
                  </div>
                  <input type="range" min="0.1" max="1" step="0.05" value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer" />
                  <div className="mt-1 flex justify-between text-[10px] text-zinc-600 font-bold uppercase">
                    <span>Smaller</span><span>Better</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={reset} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white hover:bg-white/10">
                    Clear
                  </button>
                  <button onClick={compress} className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-zinc-950 shadow-lg hover:bg-amber-400">
                    <Minimize2 size={16} /> Compress
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4 flex gap-3">
                <Info size={16} className="shrink-0 text-amber-500 mt-0.5" />
                <p className="text-xs text-zinc-400 leading-relaxed">All processing happens locally in your browser. Your images never leave your device.</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing */}
        {status === "processing" && (
          <ProgressFeedback status="processing" processingProgress={progress} message="Compressing your image…" />
        )}

        {/* Error */}
        {status === "error" && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-8 text-center">
            <AlertCircle size={40} className="mx-auto mb-4 text-red-400" />
            <p className="font-bold text-white">Compression failed</p>
            <p className="mt-1 text-sm text-zinc-400">Try a different image or format.</p>
            <button onClick={reset} className="mt-4 rounded-xl bg-white/5 px-6 py-3 text-sm font-bold text-white border border-white/10 hover:bg-white/10">
              Try Again
            </button>
          </div>
        )}

        {/* Result */}
        {status === "success" && resultUrl && file && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Original", value: fmt(file.size), color: "text-white" },
                { label: "Compressed", value: fmt(resultSize), color: actuallySmaller ? "text-amber-400" : "text-red-400" },
                { label: "Saved", value: actuallySmaller ? fmt(savedBytes) : "—", color: actuallySmaller ? "text-emerald-400" : "text-zinc-500" },
                { label: "Reduction", value: actuallySmaller ? `${savedPct}%` : "0%", color: actuallySmaller ? "text-emerald-400" : "text-zinc-500" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{s.label}</p>
                  <p className={`mt-1 text-xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {!actuallySmaller && (
              <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-400">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">Settings didn't reduce size. Try lower quality or switching to WEBP.</p>
              </div>
            )}

            {actuallySmaller && (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400">
                <CheckCircle2 size={20} />
                <p className="text-sm font-bold">Successfully reduced by {savedPct}% — saved {fmt(savedBytes)}!</p>
              </div>
            )}

            {/* Image preview */}
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
              {showCompare ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <img src={previewUrl || ""} alt="Original" className="w-full rounded-xl object-contain max-h-[50vh]" />
                    <span className="absolute top-2 left-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">BEFORE</span>
                  </div>
                  <div className="relative">
                    <img src={resultUrl} alt="Compressed" className="w-full rounded-xl object-contain max-h-[50vh]" />
                    <span className="absolute top-2 right-2 rounded-full bg-amber-500/80 px-3 py-1 text-[10px] font-bold text-zinc-950 backdrop-blur-md">AFTER</span>
                  </div>
                </div>
              ) : (
                <img src={resultUrl} alt="Compressed" className="mx-auto max-h-[60vh] w-auto rounded-xl object-contain" />
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setShowCompare(!showCompare)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-4 font-bold transition ${showCompare ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/10 bg-white/5 text-white hover:bg-white/10"}`}>
                <Eye size={18} /> {showCompare ? "Hide Comparison" : "Compare Before/After"}
              </button>
              <a href={resultUrl} download={`compressed_${file.name.replace(/\.[^.]+$/, "")}.${format.split("/")[1]}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-zinc-950 shadow-lg hover:bg-emerald-400">
                <Download size={18} /> Download
              </a>
              <button onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 font-bold text-white hover:bg-white/10">
                <RotateCcw size={18} /> Compress Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
