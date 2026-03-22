import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import { ArrowLeft, ScanLine, Copy, ExternalLink, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

declare global { interface Window { jsQR: any } }

export default function QRCodeScanner() {
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [libLoaded, setLibLoaded] = useState(false);
  const libLoadRef = useRef(false);

  const loadLib = (): Promise<void> => new Promise((resolve, reject) => {
    if (window.jsQR || libLoaded) { resolve(); return; }
    if (libLoadRef.current) { 
      const wait = setInterval(() => { if (window.jsQR) { clearInterval(wait); resolve(); } }, 100);
      return;
    }
    libLoadRef.current = true;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    s.onload = () => { setLibLoaded(true); resolve(); };
    s.onerror = () => reject(new Error("Could not load scanner library"));
    document.head.appendChild(s);
  });

  const scan = async (file: File) => {
    setError(null); setResult(null); setScanning(true);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    try {
      await loadLib();
      const img = new Image();
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = url; });
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
      if (code) { setResult(code.data); }
      else { setError("No QR code found in this image. Make sure the QR is clear and well-lit."); }
    } catch (e: any) {
      setError(e.message || "Failed to scan image.");
    } finally {
      setScanning(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = (s: string) => /^https?:\/\//i.test(s);

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setResult(null); setError(null);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link to="/tools" className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16} /> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <ScanLine size={32} />
        </div>
        <h1 className="text-4xl font-black text-white">QR Code Scanner</h1>
        <p className="mt-2 text-zinc-400">Upload an image containing a QR code to decode it instantly.</p>
      </div>

      {!previewUrl && !scanning && (
        <UploadDropzone onUpload={scan} title="Upload image with QR code"
          accept="image/jpeg,image/png,image/webp,image/gif" />
      )}

      {scanning && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/40 py-20">
          <ScanLine size={48} className="animate-pulse text-amber-400" />
          <p className="font-bold text-white">Scanning for QR code…</p>
        </div>
      )}

      {previewUrl && !scanning && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <img src={previewUrl} alt="Scanned" className="mx-auto max-h-64 w-auto rounded-xl object-contain" />
          </div>

          {result && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={20} />
                <span className="font-bold">QR Code Decoded!</span>
              </div>
              <div className="rounded-xl bg-zinc-950 border border-white/5 p-4">
                <p className="break-all font-mono text-sm text-white leading-relaxed">{result}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={copy}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 font-bold transition ${copied ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/5 text-white hover:bg-white/10"}`}>
                  {copied ? <><CheckCircle2 size={16} /> Copied!</> : <><Copy size={16} /> Copy Result</>}
                </button>
                {isUrl(result) && (
                  <a href={result} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-zinc-950 hover:bg-amber-400">
                    <ExternalLink size={16} /> Open URL
                  </a>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle size={20} />
                <span className="font-bold">Not Found</span>
              </div>
              <p className="text-sm text-zinc-400">{error}</p>
            </div>
          )}

          <button onClick={reset}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 font-bold text-white hover:bg-white/10">
            <RotateCcw size={16} /> Scan Another Image
          </button>
        </div>
      )}
    </div>
  );
}
