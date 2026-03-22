import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ScanLine, Copy, ExternalLink, CheckCircle2,
  AlertCircle, RotateCcw, Upload, Loader2, Camera
} from "lucide-react";

declare global { interface Window { jsQR: any } }

// ── Safe image loader — guarantees width/height are non-zero ─────────────────
// Uses img.decode() which waits for full decode, not just onload.
// Falls back to onload for browsers without decode().
async function loadImageSafe(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      // Some mobile browsers fire onload before dimensions are ready.
      // img.decode() ensures full decode is complete.
      try {
        if (typeof img.decode === "function") {
          await img.decode();
        }
      } catch {
        // decode() failed — still continue, dimensions should be available
      }
      // Final guard: dimensions must be positive
      if (!img.width || !img.height || img.width <= 0 || img.height <= 0) {
        reject(new Error(`Image decoded with zero dimensions (${img.width}×${img.height}). The file may be corrupt or unsupported.`));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error("Image failed to load. Check the file format."));
    img.src = src;
  });
}

// ── Render image to canvas safely ────────────────────────────────────────────
function renderToCanvas(img: HTMLImageElement, scale: number): HTMLCanvasElement | null {
  const w = Math.round(img.width  * scale);
  const h = Math.round(img.height * scale);
  // Guard against degenerate dimensions
  if (w < 1 || h < 1 || !isFinite(w) || !isFinite(h)) return null;
  const canvas = document.createElement("canvas");
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

// ── Image preprocessing ───────────────────────────────────────────────────────
function toGrayscaleContrast(canvas: HTMLCanvasElement): ImageData | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  let raw: ImageData;
  try {
    raw = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch {
    return null;
  }
  const data = new Uint8ClampedArray(raw.data);
  for (let i = 0; i < data.length; i += 4) {
    let lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    lum = Math.min(255, Math.max(0, (lum - 128) * 1.5 + 128));
    data[i] = data[i+1] = data[i+2] = lum;
  }
  return new ImageData(data, canvas.width, canvas.height);
}

function invertImageData(d: ImageData): ImageData {
  const data = new Uint8ClampedArray(d.data);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]; data[i+1] = 255 - data[i+1]; data[i+2] = 255 - data[i+2];
  }
  return new ImageData(data, d.width, d.height);
}

// ── Safe jsQR call — never crashes on bad input ───────────────────────────────
function safeJsQR(imageData: ImageData, opts: object): string | null {
  try {
    if (!imageData || !imageData.data || imageData.width <= 0 || imageData.height <= 0) return null;
    const result = window.jsQR(imageData.data, imageData.width, imageData.height, opts);
    return result?.data ?? null;
  } catch {
    return null;
  }
}

// ── Try all detection strategies on one canvas ────────────────────────────────
function detectOnCanvas(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let raw: ImageData;
  try {
    raw = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch {
    return null;
  }
  if (!raw || raw.width <= 0 || raw.height <= 0) return null;

  // Pass 1: raw, all inversion modes
  for (const inv of ["dontInvert", "onlyInvert", "attemptBoth"] as const) {
    const r = safeJsQR(raw, { inversionAttempts: inv });
    if (r) return r;
  }

  // Pass 2: grayscale + contrast boost
  const gray = toGrayscaleContrast(canvas);
  if (gray) {
    for (const inv of ["dontInvert", "onlyInvert", "attemptBoth"] as const) {
      const r = safeJsQR(gray, { inversionAttempts: inv });
      if (r) return r;
    }
    // Pass 3: inverted grayscale (handles light-on-dark QR codes)
    const inv = invertImageData(gray);
    for (const mode of ["dontInvert", "onlyInvert", "attemptBoth"] as const) {
      const r = safeJsQR(inv, { inversionAttempts: mode });
      if (r) return r;
    }
  }

  return null;
}

// ── Load jsQR library from CDN ─────────────────────────────────────────────
const loadJsQR = (() => {
  let promise: Promise<void> | null = null;
  return () => {
    if (window.jsQR) return Promise.resolve();
    if (promise) return promise;
    promise = new Promise<void>((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
      s.onload  = () => res();
      s.onerror = () => rej(new Error("Could not load QR scanner library. Check internet connection."));
      document.head.appendChild(s);
    });
    return promise;
  };
})();

export default function QRCodeScanner() {
  const [result,      setResult]      = useState<string | null>(null);
  const [copied,      setCopied]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [scanning,    setScanning]    = useState(false);
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);

  const cameraInputRef  = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const scan = async (file: File) => {
    // Reset previous results
    setError(null); setResult(null); setScanning(true);

    // Show preview immediately
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // 1. Load library
      await loadJsQR();

      // 2. Load image safely — guarantees valid dimensions before we touch canvas
      const img = await loadImageSafe(url);

      // 3. Try at multiple scales: 1× first, then 0.5× (speed), then 2× (clarity for small QR)
      const scales = [1, 0.5, 2, 1.5];
      let found: string | null = null;

      for (const scale of scales) {
        const canvas = renderToCanvas(img, scale);
        if (!canvas) continue;                // skip degenerate canvas
        found = detectOnCanvas(canvas);
        if (found) break;
      }

      if (found) {
        setResult(found);
      } else {
        setError(
          "No QR code found in this image.\n\n" +
          "Tips for better results:\n" +
          "• Make sure the QR code is clear and sharp\n" +
          "• The QR code should fill most of the image\n" +
          "• Avoid blurry or very small QR codes\n" +
          "• For colored QR codes, try better lighting"
        );
      }
    } catch (e: any) {
      // Catch ALL errors — no crash, always show user-friendly message
      console.error("[QRScanner]", e);
      setError(e?.message || "Failed to process image. Please try a different photo.");
    } finally {
      setScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      // Reset input so same file can be selected again
      e.target.value = "";
      scan(f);
    }
  };

  const copy = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(result); } catch { /* fallback ok */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setResult(null); setError(null);
  };

  const isUrl = (s: string) => /^https?:\/\//i.test(s);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link to="/tools"
        className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16} /> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <ScanLine size={32} />
        </div>
        <h1 className="text-4xl font-black text-white">QR Code Scanner</h1>
        <p className="mt-2 text-zinc-400">Upload a photo or take one — any QR code decoded instantly.</p>
      </div>

      {/* ── Upload buttons — always visible ─── */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {/* Camera (mobile-first: opens camera app directly) */}
        <button
          onClick={() => { reset(); cameraInputRef.current?.click(); }}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 py-8 text-amber-400 transition active:scale-95 hover:border-amber-500/60 hover:bg-amber-500/10">
          <Camera size={28} />
          <span className="text-sm font-bold">Take Photo</span>
          <span className="text-xs text-zinc-500">Open camera</span>
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Gallery */}
        <button
          onClick={() => { reset(); galleryInputRef.current?.click(); }}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-zinc-900/40 py-8 text-zinc-400 transition active:scale-95 hover:border-white/20 hover:bg-zinc-800">
          <Upload size={28} />
          <span className="text-sm font-bold">Upload Image</span>
          <span className="text-xs text-zinc-500">From gallery</span>
        </button>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* ── Scanning state ─── */}
      {scanning && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/40 py-16">
          <Loader2 size={40} className="animate-spin text-amber-400" />
          <p className="font-bold text-white">Scanning QR code…</p>
          <p className="text-sm text-zinc-500">Trying multiple detection methods</p>
        </div>
      )}

      {/* ── Results ─── */}
      {previewUrl && !scanning && (
        <div className="space-y-4">
          {/* Preview image */}
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <img src={previewUrl} alt="Scanned image"
              className="mx-auto max-h-64 w-auto rounded-xl object-contain" />
          </div>

          {/* Success */}
          {result && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={20} />
                <span className="font-bold">QR Code Decoded!</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-zinc-950 p-4">
                <p className="break-all font-mono text-sm leading-relaxed text-white">{result}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={copy}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 font-bold transition
                    ${copied
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 bg-white/5 text-white hover:bg-white/10"}`}>
                  {copied ? <><CheckCircle2 size={16} /> Copied!</> : <><Copy size={16} /> Copy Result</>}
                </button>
                {isUrl(result) && (
                  <a href={result} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-zinc-950 hover:bg-amber-400 transition">
                    <ExternalLink size={16} /> Open URL
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Failure — friendly, not a crash */}
          {error && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-400" />
                <div>
                  <p className="font-bold text-amber-400">Not Detected</p>
                  <p className="mt-2 whitespace-pre-line text-sm text-zinc-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button onClick={reset}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 font-bold text-white hover:bg-white/10 transition">
            <RotateCcw size={16} /> Scan Another Image
          </button>
        </div>
      )}
    </div>
  );
}
