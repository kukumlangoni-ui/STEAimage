import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import { ArrowLeft, Download, RotateCcw, CropIcon, Move } from "lucide-react";

const PRESETS = [
  { label: "YouTube", sub: "Thumbnail", w: 1280, h: 720, color: "#ff0000" },
  { label: "YouTube", sub: "Short", w: 1080, h: 1920, color: "#ff0000" },
  { label: "TikTok", sub: "Cover", w: 1080, h: 1920, color: "#010101" },
  { label: "Instagram", sub: "Post (1:1)", w: 1080, h: 1080, color: "#c13584" },
  { label: "Instagram", sub: "Portrait (4:5)", w: 1080, h: 1350, color: "#c13584" },
  { label: "Instagram", sub: "Story", w: 1080, h: 1920, color: "#c13584" },
  { label: "Facebook", sub: "Post", w: 1200, h: 630, color: "#1877f2" },
  { label: "Facebook", sub: "Cover", w: 820, h: 312, color: "#1877f2" },
  { label: "WhatsApp", sub: "Status", w: 1080, h: 1920, color: "#25d366" },
  { label: "X / Twitter", sub: "Post", w: 1600, h: 900, color: "#1d9bf0" },
  { label: "X / Twitter", sub: "Header", w: 1500, h: 500, color: "#1d9bf0" },
  { label: "LinkedIn", sub: "Post", w: 1200, h: 627, color: "#0a66c2" },
  { label: "LinkedIn", sub: "Cover", w: 1584, h: 396, color: "#0a66c2" },
  { label: "Pinterest", sub: "Pin", w: 1000, h: 1500, color: "#e60023" },
  { label: "Full HD", sub: "16:9", w: 1920, h: 1080, color: "#fbbf24" },
  { label: "Square", sub: "1:1", w: 1080, h: 1080, color: "#fbbf24" },
  { label: "Portrait", sub: "4:5", w: 1080, h: 1350, color: "#fbbf24" },
  { label: "Wide", sub: "16:9", w: 1280, h: 720, color: "#fbbf24" },
  { label: "Vertical", sub: "9:16", w: 1080, h: 1920, color: "#fbbf24" },
];

export default function ThumbnailGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [preset, setPreset] = useState(PRESETS[0]);
  const [fit, setFit] = useState<"contain" | "cover">("cover");
  const [bgColor, setBgColor] = useState("#000000");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  // pan offset in pixels (canvas space)
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleUpload = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewSrc(url);
    setResultUrl(null);
    setOffset({ x: 0, y: 0 });
    const img = new Image();
    img.onload = () => { imgRef.current = img; drawPreview(img, 0, 0); };
    img.src = url;
  };

  const getScales = useCallback((img: HTMLImageElement) => {
    const { w, h } = preset;
    const scaleX = w / img.width;
    const scaleY = h / img.height;
    const scale = fit === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    return { drawW, drawH, scale };
  }, [preset, fit]);

  const drawPreview = useCallback((img: HTMLImageElement, ox: number, oy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = preset;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    const { drawW, drawH } = getScales(img);
    const baseX = (w - drawW) / 2;
    const baseY = (h - drawH) / 2;
    ctx.drawImage(img, baseX + ox, baseY + oy, drawW, drawH);
  }, [preset, bgColor, getScales]);

  useEffect(() => {
    if (imgRef.current) drawPreview(imgRef.current, offset.x, offset.y);
  }, [preset, fit, bgColor, offset, drawPreview]);

  // Pointer drag for repositioning
  const onPointerDown = (e: React.PointerEvent) => {
    if (!file) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    // scale mouse delta to canvas coords
    const container = previewContainerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const scale = canvas.width / container.clientWidth;
    setOffset({ x: dragStart.current.ox + dx * scale, y: dragStart.current.oy + dy * scale });
  };
  const onPointerUp = () => setIsDragging(false);

  const generate = async () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    setGenerating(true);
    drawPreview(img, offset.x, offset.y);
    await new Promise<void>((res) => {
      canvas.toBlob((blob) => {
        if (blob) { setResultUrl(URL.createObjectURL(blob)); }
        setGenerating(false);
        res();
      }, "image/jpeg", 0.92);
    });
  };

  const reset = () => {
    if (previewSrc) URL.revokeObjectURL(previewSrc);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setPreviewSrc(null); setResultUrl(null);
    setOffset({ x: 0, y: 0 }); imgRef.current = null;
  };

  const aspectLabel = `${preset.w}×${preset.h}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link to="/tools" className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16} /> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <CropIcon size={32} />
        </div>
        <h1 className="text-4xl font-black text-white">Thumbnail Generator</h1>
        <p className="mt-2 text-zinc-400">Choose a platform preset → reposition → download. That's it.</p>
      </div>

      {!file && (
        <UploadDropzone onUpload={handleUpload} title="Upload your image" />
      )}

      {file && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: preview canvas */}
          <div className="lg:col-span-2 space-y-3">
            <div ref={previewContainerRef}
              className={`relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 cursor-move select-none ${isDragging ? "border-amber-500/50" : ""}`}
              style={{ aspectRatio: `${preset.w}/${preset.h}`, maxHeight: "55vh" }}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
              <canvas ref={canvasRef}
                className="w-full h-full object-contain"
                style={{ display: "block" }} />
              <div className="pointer-events-none absolute top-3 left-3 flex gap-2">
                <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">{preset.label} — {preset.sub}</span>
                <span className="rounded-full bg-amber-500/80 px-3 py-1 text-[10px] font-bold text-zinc-950">{aspectLabel}</span>
              </div>
              <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md">
                <Move size={12} className="text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-400">Drag to reposition</span>
              </div>
            </div>
            {resultUrl && (
              <div className="flex gap-3">
                <a href={resultUrl}
                  download={`thumbnail_${preset.label.replace(/\s/g,'_')}_${aspectLabel}.jpg`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-zinc-950 shadow-lg hover:bg-emerald-400">
                  <Download size={18} /> Download {aspectLabel}
                </a>
                <button onClick={() => setResultUrl(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-white hover:bg-white/10">
                  <RotateCcw size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Right: settings */}
          <div className="space-y-4">
            {/* Platform presets */}
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Platform Preset</h3>
              <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                {PRESETS.map((p, i) => (
                  <button key={i} onClick={() => { setPreset(p); setOffset({ x: 0, y: 0 }); setResultUrl(null); }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${preset === p ? "border-amber-500 bg-amber-500/10" : "border-transparent bg-zinc-900/40 hover:bg-zinc-800"}`}>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <div>
                        <span className="text-sm font-bold text-white">{p.label}</span>
                        <span className="ml-1.5 text-xs text-zinc-500">{p.sub}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600">{p.w}×{p.h}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fit mode */}
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Fit Mode</h3>
              <div className="grid grid-cols-2 gap-2">
                {(["cover", "contain"] as const).map((m) => (
                  <button key={m} onClick={() => { setFit(m); setResultUrl(null); }}
                    className={`rounded-xl border py-2.5 text-sm font-bold capitalize transition ${fit === m ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"}`}>
                    {m === "cover" ? "Fill & Crop" : "Fit Inside"}
                  </button>
                ))}
              </div>
            </div>

            {/* Background color (for contain mode) */}
            {fit === "contain" && (
              <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Background</h3>
                <div className="flex items-center gap-3">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent" />
                  <div className="flex gap-2 flex-wrap">
                    {["#000000", "#ffffff", "#1a1a1a", "#fbbf24"].map((c) => (
                      <button key={c} onClick={() => setBgColor(c)}
                        className="h-8 w-8 rounded-lg border-2 transition hover:scale-110"
                        style={{ backgroundColor: c, borderColor: bgColor === c ? "#fbbf24" : "transparent" }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generate button */}
            <button onClick={generate} disabled={generating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg hover:bg-amber-400 disabled:opacity-50 transition">
              {generating ? "Generating…" : `Generate ${aspectLabel}`}
            </button>

            <button onClick={reset}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white hover:bg-white/10">
              <RotateCcw size={16} /> Upload Different Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
