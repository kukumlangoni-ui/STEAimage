import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ScanLine, Copy, ExternalLink, CheckCircle2, AlertCircle, RotateCcw, Upload, Loader2 } from "lucide-react";

declare global { interface Window { jsQR: any } }

// Pre-process canvas to improve detection of colored/dark QR codes
function prepareImageData(src: HTMLCanvasElement): ImageData {
  const ctx = src.getContext("2d")!;
  const raw = ctx.getImageData(0, 0, src.width, src.height);
  // Convert to grayscale with contrast boost
  const data = new Uint8ClampedArray(raw.data);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    // Luminance
    let lum = 0.299*r + 0.587*g + 0.114*b;
    // Contrast boost: stretch to 0-255
    lum = Math.min(255, Math.max(0, (lum - 128) * 1.4 + 128));
    data[i] = data[i+1] = data[i+2] = lum;
  }
  return new ImageData(data, src.width, src.height);
}

function invertImageData(d: ImageData): ImageData {
  const data = new Uint8ClampedArray(d.data);
  for (let i = 0; i < data.length; i += 4) {
    data[i]   = 255 - data[i];
    data[i+1] = 255 - data[i+1];
    data[i+2] = 255 - data[i+2];
  }
  return new ImageData(data, d.width, d.height);
}

export default function QRCodeScanner() {
  const [result,     setResult]     = useState<string|null>(null);
  const [copied,     setCopied]     = useState(false);
  const [error,      setError]      = useState<string|null>(null);
  const [scanning,   setScanning]   = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const libRef  = useRef(false);

  const loadLib = (): Promise<void> => new Promise((res, rej) => {
    if (window.jsQR) { res(); return; }
    if (libRef.current) {
      const t = setInterval(() => { if (window.jsQR) { clearInterval(t); res(); } }, 80);
      return;
    }
    libRef.current = true;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    s.onload = () => res();
    s.onerror = () => rej(new Error("Could not load scanner library"));
    document.head.appendChild(s);
  });

  const tryDecode = (imageData: ImageData): string | null => {
    // Attempt 1: normal
    let code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
    if (code) return code.data;
    // Attempt 2: inverted
    code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "onlyInvert" });
    if (code) return code.data;
    // Attempt 3: try both
    code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
    if (code) return code.data;
    return null;
  };

  const scan = async (file: File) => {
    setError(null); setResult(null); setScanning(true);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      await loadLib();

      const img = new Image();
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });

      // Try at multiple scales — large images sometimes fail
      const scales = [1, 0.5, 2];
      let found: string | null = null;

      for (const scale of scales) {
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Raw pixels
        const raw = ctx.getImageData(0, 0, canvas.width, canvas.height);
        found = tryDecode(raw);
        if (found) break;

        // Grayscale + contrast boost
        const processed = prepareImageData(canvas);
        found = tryDecode(processed);
        if (found) break;

        // Inverted grayscale (handles white-on-dark QR codes)
        const inverted = invertImageData(processed);
        found = tryDecode(inverted);
        if (found) break;
      }

      if (found) {
        setResult(found);
      } else {
        setError("No QR code detected. Tips: make sure the QR is clear, sharp, and fills most of the image. Colored or very small QR codes may need a cleaner photo.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to scan image.");
    } finally {
      setScanning(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) scan(f);
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setResult(null); setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const isUrl = (s: string) => /^https?:\/\//i.test(s);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link to="/tools" className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16}/> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <ScanLine size={32}/>
        </div>
        <h1 className="text-4xl font-black text-white">QR Code Scanner</h1>
        <p className="mt-2 text-zinc-400">Upload or take a photo of any QR code to decode it instantly.</p>
      </div>

      {/* Upload area — always visible so user can re-scan */}
      <div className="mb-6">
        <input ref={fileRef} type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"/>

        <div className="grid grid-cols-2 gap-3">
          {/* Camera button (mobile) */}
          <button
            onClick={() => { reset(); setTimeout(() => fileRef.current?.click(), 100); }}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 py-8 text-amber-400 transition hover:border-amber-500/60 hover:bg-amber-500/10">
            <ScanLine size={28}/>
            <span className="text-sm font-bold">Take Photo</span>
            <span className="text-xs text-zinc-500">Use camera</span>
          </button>

          {/* Gallery button */}
          <label
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-zinc-900/40 py-8 text-zinc-400 cursor-pointer transition hover:border-white/20 hover:bg-zinc-800">
            <Upload size={28}/>
            <span className="text-sm font-bold">Upload Image</span>
            <span className="text-xs text-zinc-500">From gallery</span>
            <input type="file" accept="image/*" onChange={handleFileInput} className="hidden"/>
          </label>
        </div>
      </div>

      {scanning && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/40 py-16">
          <Loader2 size={40} className="animate-spin text-amber-400"/>
          <p className="font-bold text-white">Scanning QR code…</p>
          <p className="text-sm text-zinc-500">Trying multiple detection methods</p>
        </div>
      )}

      {previewUrl && !scanning && (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <img src={previewUrl} alt="Scanned" className="mx-auto max-h-72 w-auto rounded-xl object-contain"/>
          </div>

          {result && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={20}/>
                <span className="font-bold">QR Code Decoded!</span>
              </div>
              <div className="rounded-xl bg-zinc-950 border border-white/5 p-4">
                <p className="break-all font-mono text-sm text-white leading-relaxed">{result}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={copy}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 font-bold transition
                    ${copied ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/5 text-white hover:bg-white/10"}`}>
                  {copied ? <><CheckCircle2 size={16}/> Copied!</> : <><Copy size={16}/> Copy Result</>}
                </button>
                {isUrl(result) && (
                  <a href={result} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-zinc-950 hover:bg-amber-400 transition">
                    <ExternalLink size={16}/> Open URL
                  </a>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-400 mt-0.5 shrink-0"/>
                <div>
                  <p className="font-bold text-amber-400">Not Detected</p>
                  <p className="mt-1 text-sm text-zinc-400">{error}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Best results: black QR on white background, good lighting, QR fills most of the frame.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button onClick={reset}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 font-bold text-white hover:bg-white/10 transition">
            <RotateCcw size={16}/> Scan Another Image
          </button>
        </div>
      )}
    </div>
  );
}
