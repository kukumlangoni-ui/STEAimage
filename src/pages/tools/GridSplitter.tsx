import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { Grid, ArrowLeft, Download, Settings2, Info, Minus, Plus, RotateCcw } from "lucide-react";

const QUICK_PRESETS = [
  { label: "3×3 Grid", cols: 3, rows: 3, desc: "Instagram grid" },
  { label: "2×2", cols: 2, rows: 2, desc: "4 equal parts" },
  { label: "3×1 Strip", cols: 3, rows: 1, desc: "Panoramic row" },
  { label: "1×3 Strip", cols: 1, rows: 3, desc: "Vertical stack" },
  { label: "4×4", cols: 4, rows: 4, desc: "16 parts" },
  { label: "2×3", cols: 2, rows: 3, desc: "6 parts" },
];

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-white transition hover:bg-zinc-800 disabled:opacity-30 active:scale-95"
        >
          <Minus size={14} />
        </button>
        <div className="flex h-10 min-w-[52px] items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/5 text-xl font-black text-amber-400">
          {value}
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-white transition hover:bg-zinc-800 disabled:opacity-30 active:scale-95"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function GridSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleUpload = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setResultUrls([]);
    setStatus("idle");
    setTimeout(() => workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const applyPreset = (p: typeof QUICK_PRESETS[0]) => { setColumns(p.cols); setRows(p.rows); };

  const processImage = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(0);
    try {
      const img = new Image();
      const src = URL.createObjectURL(file);
      img.onload = async () => {
        const urls: string[] = [];
        const cellW = img.width / columns;
        const cellH = img.height / rows;
        const total = columns * rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < columns; c++) {
            const canvas = document.createElement("canvas");
            canvas.width = cellW;
            canvas.height = cellH;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, c * cellW, r * cellH, cellW, cellH, 0, 0, cellW, cellH);
              urls.push(canvas.toDataURL("image/jpeg", 0.92));
            }
            setProgress(Math.round(((r * columns + c + 1) / total) * 100));
            await new Promise(r => setTimeout(r, 20));
          }
        }
        setResultUrls(urls);
        setStatus("success");
        URL.revokeObjectURL(src);
      };
      img.onerror = () => setStatus("error");
      img.src = src;
    } catch { setStatus("error"); }
  };

  const downloadAll = () => {
    resultUrls.forEach((url, i) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `grid_part_${i + 1}.jpg`;
      a.click();
    });
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null); setPreviewUrl(null); setResultUrls([]);
    setStatus("idle"); setProgress(0);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link to="/tools" className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16} /> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <Grid size={32} />
        </div>
        <h1 className="text-4xl font-black text-white">Grid Splitter</h1>
        <p className="mt-2 text-zinc-400">Split any image into a perfect grid. Great for Instagram profiles.</p>
      </div>

      {!file && (
        <UploadDropzone onUpload={handleUpload} title="Upload image to split into grid" />
      )}

      {file && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-6 lg:grid-cols-3">
          {/* Preview with grid overlay */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-3">
              <div className="relative flex items-center justify-center rounded-xl bg-zinc-950/50 p-3" style={{ minHeight: "340px" }}>
                <img src={previewUrl || ""} alt="Preview"
                  className="max-h-[55vh] w-auto max-w-full rounded-lg object-contain" />
                {/* Grid overlay */}
                <div className="pointer-events-none absolute inset-3 flex items-center justify-center">
                  <div className="h-full w-full"
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      gridTemplateRows: `repeat(${rows}, 1fr)`,
                      border: "2px solid rgba(251,191,36,0.6)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}>
                    {Array.from({ length: columns * rows }).map((_, i) => (
                      <div key={i} style={{ border: "1px solid rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.03)" }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
                  {columns} × {rows} = {columns * rows} parts
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Quick presets */}
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Quick Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PRESETS.map((p) => (
                  <button key={p.label} onClick={() => applyPreset(p)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${columns === p.cols && rows === p.rows ? "border-amber-500 bg-amber-500/10" : "border-white/5 bg-zinc-950 hover:bg-zinc-900"}`}>
                    <div className={`text-xs font-bold ${columns === p.cols && rows === p.rows ? "text-amber-400" : "text-white"}`}>{p.label}</div>
                    <div className="text-[10px] text-zinc-500">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Steppers */}
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <Settings2 size={14} /> Custom Grid
              </h3>
              <div className="flex gap-6 justify-center">
                <Stepper value={columns} min={1} max={10} onChange={setColumns} label="Columns" />
                <div className="flex items-end pb-2 text-zinc-700 font-bold">×</div>
                <Stepper value={rows} min={1} max={10} onChange={setRows} label="Rows" />
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 flex gap-2">
              <Info size={14} className="shrink-0 text-amber-500 mt-0.5" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">Creates {columns * rows} separate images. Post parts 1→{columns * rows} to build your Instagram grid.</p>
            </div>

            <div className="flex gap-2">
              <button onClick={reset} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white hover:bg-white/10">
                Clear
              </button>
              <button onClick={processImage}
                className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-zinc-950 shadow-lg hover:bg-amber-400">
                <Grid size={16} /> Split Now
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "processing" && (
        <ProgressFeedback status="processing" processingProgress={progress} message={`Splitting into ${columns * rows} parts…`} />
      )}

      {status === "error" && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-8 text-center">
          <p className="font-bold text-white">Split failed</p>
          <button onClick={reset} className="mt-4 rounded-xl bg-white/5 px-6 py-3 text-sm font-bold text-white border border-white/10 hover:bg-white/10">Try Again</button>
        </div>
      )}

      {resultUrls.length > 0 && status === "success" && (
        <div>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Split Complete!</h2>
              <p className="text-zinc-400">{resultUrls.length} images ready to download.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={reset}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                <RotateCcw size={16} /> Start Over
              </button>
              <button onClick={downloadAll}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-zinc-950 shadow-lg hover:bg-amber-400">
                <Download size={16} /> Download All ({resultUrls.length})
              </button>
            </div>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {resultUrls.map((url, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 transition hover:border-amber-500/40">
                <img src={url} alt={`Part ${i + 1}`} className="w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-zinc-950 to-transparent p-2 transition-transform group-hover:translate-y-0">
                  <a href={url} download={`part_${i + 1}.jpg`}
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-amber-500 py-2 text-[10px] font-bold text-zinc-950 hover:bg-amber-400">
                    <Download size={10} /> Part {i + 1}
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
