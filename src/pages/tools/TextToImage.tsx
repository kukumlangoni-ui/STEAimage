import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Type, RotateCcw } from "lucide-react";

const FONTS = ["Inter", "Arial", "Georgia", "Impact", "Courier New", "Verdana", "Times New Roman", "Comic Sans MS"];
const SIZES = [
  { label: "Square 1:1", w: 1080, h: 1080 },
  { label: "Story 9:16", w: 1080, h: 1920 },
  { label: "Wide 16:9", w: 1920, h: 1080 },
  { label: "Twitter Post", w: 1600, h: 900 },
  { label: "Facebook Post", w: 1200, h: 630 },
  { label: "A4 Landscape", w: 1123, h: 794 },
  { label: "Custom", w: 0, h: 0 },
];
const PRESETS = [
  { name: "STEA Black", bg: "#09090b", text: "#fbbf24" },
  { name: "Gold", bg: "#fbbf24", text: "#09090b" },
  { name: "White", bg: "#ffffff", text: "#09090b" },
  { name: "Dark Blue", bg: "#0f172a", text: "#e2e8f0" },
  { name: "Emerald", bg: "#064e3b", text: "#6ee7b7" },
  { name: "Red", bg: "#450a0a", text: "#fca5a5" },
];

export default function TextToImage() {
  const [text, setText] = useState("STEAimage");
  const [font, setFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(120);
  const [textColor, setTextColor] = useState("#fbbf24");
  const [bgColor, setBgColor] = useState("#09090b");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [sizePreset, setSizePreset] = useState(SIZES[0]);
  const [customW, setCustomW] = useState(1080);
  const [customH, setCustomH] = useState(1080);
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasW = sizePreset.label === "Custom" ? customW : sizePreset.w;
  const canvasH = sizePreset.label === "Custom" ? customH : sizePreset.h;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Text
    const weight = bold ? "900" : "400";
    const style = italic ? "italic" : "";
    ctx.font = `${style} ${weight} ${fontSize}px "${font}"`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = textAlign;

    const padding = 60;
    const x = textAlign === "left" ? padding : textAlign === "right" ? canvasW - padding : canvasW / 2;
    const maxWidth = canvasW - padding * 2;
    const lineH = fontSize * 1.3;

    // Word-wrap
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth || !current) { current = test; }
      else { lines.push(current); current = word; }
    }
    if (current) lines.push(current);

    const totalH = lines.length * lineH;
    const startY = (canvasH - totalH) / 2 + lineH / 2;
    lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lineH, maxWidth));
  }, [canvasW, canvasH, bgColor, textColor, text, font, fontSize, textAlign, bold, italic]);

  useEffect(() => { draw(); setResultUrl(null); }, [draw]);

  const generate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw();
    canvas.toBlob((blob) => {
      if (blob) setResultUrl(URL.createObjectURL(blob));
    }, "image/png");
  };

  const applyPreset = (p: typeof PRESETS[0]) => { setBgColor(p.bg); setTextColor(p.text); };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link to="/tools" className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16} /> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <Type size={32} />
        </div>
        <h1 className="text-4xl font-black text-white">Text to Image</h1>
        <p className="mt-2 text-zinc-400">Turn any text into a shareable image in seconds.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-4 flex items-center justify-center" style={{ minHeight: "320px" }}>
            <canvas ref={canvasRef} className="max-w-full max-h-[55vh] rounded-xl object-contain" style={{ display: "block" }} />
          </div>
          <div className="flex gap-3">
            <button onClick={generate}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg hover:bg-amber-400">
              Generate Image
            </button>
            {resultUrl && (
              <a href={resultUrl} download={`text_image_${Date.now()}.png`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-zinc-950 shadow-lg hover:bg-emerald-400">
                <Download size={18} /> Download PNG
              </a>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Text input */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Text</h3>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none text-sm resize-none" />
          </div>

          {/* Color presets */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Color Preset</h3>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className="flex flex-col items-center gap-1 rounded-xl border border-white/5 p-2.5 hover:border-amber-500/50 transition">
                  <div className="flex h-6 w-full rounded-lg overflow-hidden">
                    <div className="flex-1" style={{ background: p.bg }} />
                    <div className="flex-1" style={{ background: p.text }} />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-bold text-zinc-500">Background</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" />
                <span className="font-mono text-xs text-zinc-400">{bgColor}</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-zinc-500">Text Color</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" />
                <span className="font-mono text-xs text-zinc-400">{textColor}</span>
              </div>
            </div>
          </div>

          {/* Font */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Font</h3>
            <select value={font} onChange={(e) => setFont(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white focus:border-amber-500 focus:outline-none text-sm">
              {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setBold(!bold)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-black transition ${bold ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 text-zinc-400 hover:bg-zinc-900"}`}>B</button>
              <button onClick={() => setItalic(!italic)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-bold italic transition ${italic ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 text-zinc-400 hover:bg-zinc-900"}`}>I</button>
              {(["left", "center", "right"] as const).map((a) => (
                <button key={a} onClick={() => setTextAlign(a)}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition ${textAlign === a ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 text-zinc-400 hover:bg-zinc-900"}`}>
                  {a[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Font Size</label>
              <span className="text-xs font-bold text-amber-400">{fontSize}px</span>
            </div>
            <input type="range" min="20" max="300" step="5" value={fontSize} onChange={(e) => setFontSize(+e.target.value)}
              className="w-full accent-amber-500 cursor-pointer" />
          </div>

          {/* Canvas size */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Canvas Size</h3>
            <div className="grid grid-cols-2 gap-2">
              {SIZES.map((s) => (
                <button key={s.label} onClick={() => setSizePreset(s)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition ${sizePreset.label === s.label ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 text-zinc-400 hover:bg-zinc-900"}`}>
                  {s.label}
                  {s.w > 0 && <div className="font-mono text-[10px] opacity-60">{s.w}×{s.h}</div>}
                </button>
              ))}
            </div>
            {sizePreset.label === "Custom" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input type="number" value={customW} onChange={(e) => setCustomW(+e.target.value)} placeholder="Width"
                  className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
                <input type="number" value={customH} onChange={(e) => setCustomH(+e.target.value)} placeholder="Height"
                  className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
