import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import {
  Droplet, Info, Download, Type, Image as ImageIcon, Trash2, Plus,
  RotateCcw, Move, Layers, Settings2, Bold, Italic, Copy, Undo2, Redo2,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from "lucide-react";
import { useHistory } from "../../hooks/useHistory";

interface WatermarkLayer {
  id: string;
  type: "text" | "image";
  content: string;
  x: number;   // 0-100 percent of canvas
  y: number;   // 0-100 percent of canvas
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  rotation: number;
  isBold: boolean;
  isItalic: boolean;
  width?: number;
  height?: number;
}

const FONTS = ["Inter","Arial","Verdana","Times New Roman","Georgia","Courier New","Impact","Comic Sans MS"];
const PRESET_COLORS = ["#ffffff","#000000","#f59e0b","#ef4444","#3b82f6","#10b981","#8b5cf6","#ec4899"];

export default function WatermarkImage() {
  const [file, setFile]             = useState<File | null>(null);
  const [status, setStatus]         = useState<"idle"|"uploading"|"processing"|"success"|"error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl]   = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const { state: layers, setState: setLayers, undo, redo, canUndo, canRedo } =
    useHistory<WatermarkLayer[]>([]);

  // ── Refs — synchronous, no stale-closure drag state ──────────────────────
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const workspaceRef   = useRef<HTMLDivElement>(null);
  const cachedImgRef   = useRef<HTMLImageElement | null>(null);  // cached bg image
  const isDragging     = useRef(false);
  const dragOffset     = useRef({ x: 0, y: 0 });
  const activeDragId   = useRef<string | null>(null);
  const layersRef      = useRef<WatermarkLayer[]>(layers); // mirror for drag reads

  // Keep layersRef in sync (used inside pointer handlers to avoid stale closure)
  useEffect(() => { layersRef.current = layers; }, [layers]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // ── Cache background image whenever file changes ──────────────────────────
  useEffect(() => {
    if (!previewUrl) return;
    const img = new Image();
    img.onload = () => {
      cachedImgRef.current = img;
      drawCanvas();
    };
    img.src = previewUrl;
  }, [previewUrl]); // eslint-disable-line

  // ── Draw canvas using CACHED image (no reload on every drag frame) ────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = cachedImgRef.current;
    if (!canvas || !img) return;

    canvas.width  = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    layersRef.current.forEach(layer => {
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      const x = (layer.x / 100) * canvas.width;
      const y = (layer.y / 100) * canvas.height;
      ctx.translate(x, y);
      ctx.rotate((layer.rotation * Math.PI) / 180);

      if (layer.type === "text") {
        ctx.fillStyle  = layer.color;
        ctx.font       = `${layer.isItalic ? "italic " : ""}${layer.isBold ? "bold " : ""}${layer.fontSize}px ${layer.fontFamily}, sans-serif`;
        ctx.textAlign  = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor  = "rgba(0,0,0,0.5)";
        ctx.shadowBlur   = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(layer.content, 0, 0);
      } else if (layer.type === "image") {
        const wImg = new Image();
        wImg.src = layer.content;
        if (wImg.complete) {
          const w = layer.width  || 100;
          const h = layer.height || 100;
          ctx.drawImage(wImg, -w / 2, -h / 2, w, h);
        }
      }
      ctx.restore();
    });
  }, []); // no deps — always reads from refs

  // Redraw when layers change (positions, styles)
  useEffect(() => { drawCanvas(); }, [layers, drawCanvas]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    const initialLayer: WatermarkLayer = {
      id: Math.random().toString(36).substr(2, 9),
      type: "text", content: "STEAimage",
      x: 50, y: 50, fontSize: 40, fontFamily: "Inter",
      color: "#ffffff", opacity: 0.5, rotation: 0,
      isBold: true, isItalic: false,
    };
    setLayers([initialLayer]);
    setSelectedLayerId(initialLayer.id);
    setTimeout(() => workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  // ── Pointer drag — fully on the HANDLE using setPointerCapture ────────────
  // This guarantees the handle keeps receiving events even when the pointer
  // moves outside it or outside the browser window edge, solving all stuck/freeze cases.

  const getCanvasPct = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { px: 50, py: 50 };
    const r = canvas.getBoundingClientRect();
    return {
      px: ((clientX - r.left)  / r.width)  * 100,
      py: ((clientY - r.top)   / r.height) * 100,
    };
  };

  const onHandlePointerDown = useCallback((e: React.PointerEvent, layerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Capture the pointer so ALL future move/up events come to this element
    // even when the finger or mouse leaves the handle or the viewport edge
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current  = true;
    activeDragId.current = layerId;
    const layer = layersRef.current.find(l => l.id === layerId);
    if (!layer) return;
    const { px, py } = getCanvasPct(e.clientX, e.clientY);
    dragOffset.current = { x: px - layer.x, y: py - layer.y };
  }, []);

  const onHandlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !activeDragId.current) return;
    e.preventDefault();
    const { px, py } = getCanvasPct(e.clientX, e.clientY);
    const newX = Math.max(2, Math.min(98, px - dragOffset.current.x));
    const newY = Math.max(2, Math.min(98, py - dragOffset.current.y));
    // Update layersRef immediately for the canvas draw (sync)
    layersRef.current = layersRef.current.map(l =>
      l.id === activeDragId.current ? { ...l, x: newX, y: newY } : l
    );
    // Redraw canvas directly (no state update needed mid-drag)
    drawCanvas();
    // Throttle React state update to every other frame for performance
    setLayers([...layersRef.current]);
  }, [drawCanvas, setLayers]);

  const onHandlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    isDragging.current   = false;
    activeDragId.current = null;
    // Final commit to history
    setLayers([...layersRef.current]);
  }, [setLayers]);

  // ── Nudge (keyboard-feel arrow buttons for precision) ────────────────────
  const nudge = (id: string, dx: number, dy: number) => {
    setLayers(layers.map(l => l.id === id
      ? { ...l, x: Math.max(0, Math.min(100, l.x + dx)), y: Math.max(0, Math.min(100, l.y + dy)) }
      : l
    ));
  };

  // ── Layer helpers ─────────────────────────────────────────────────────────
  const addTextLayer = () => {
    const nl: WatermarkLayer = {
      id: Math.random().toString(36).substr(2, 9), type: "text",
      content: "New Watermark", x: 50, y: 50, fontSize: 40,
      fontFamily: "Inter", color: "#ffffff", opacity: 0.5,
      rotation: 0, isBold: true, isItalic: false,
    };
    setLayers([...layers, nl]);
    setSelectedLayerId(nl.id);
  };

  const addImageLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const nl: WatermarkLayer = {
          id: Math.random().toString(36).substr(2, 9), type: "image",
          content: dataUrl, x: 50, y: 50, fontSize: 0,
          fontFamily: "", color: "", opacity: 0.5, rotation: 0,
          isBold: false, isItalic: false,
          width: img.width / 4, height: img.height / 4,
        };
        setLayers([...layers, nl]);
        setSelectedLayerId(nl.id);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
  };

  const deleteLayer  = (id: string) => { setLayers(layers.filter(l => l.id !== id)); if (selectedLayerId === id) setSelectedLayerId(null); };
  const duplicateLayer = (id: string) => {
    const l = layers.find(x => x.id === id);
    if (l) { const nl = { ...l, id: Math.random().toString(36).substr(2,9), x: l.x+5, y: l.y+5 }; setLayers([...layers, nl]); setSelectedLayerId(nl.id); }
  };
  const updateLayer  = (id: string, updates: Partial<WatermarkLayer>) =>
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));

  const formatSize = (bytes: number) => { const k=1024,s=["B","KB","MB"]; const i=Math.floor(Math.log(bytes||1)/Math.log(k)); return `${parseFloat((bytes/Math.pow(k,i)).toFixed(2))} ${s[i]}`; };

  const processImage = async () => {
    if (!file || !canvasRef.current) return;
    setStatus("processing"); setProcessingProgress(0);
    try {
      for (let i = 0; i <= 100; i += 25) { setProcessingProgress(i); await new Promise(r => setTimeout(r, 100)); }
      const blob = await new Promise<Blob|null>(resolve => canvasRef.current!.toBlob(b => resolve(b), file.type, 0.95));
      if (blob) { setResultUrl(URL.createObjectURL(blob)); setResultSize(blob.size); setStatus("success"); }
    } catch { setStatus("error"); }
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // Overlay size matched to displayed canvas size (CSS pixels)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const obs = new ResizeObserver(() => {
      const c = canvasRef.current;
      if (c) setCanvasSize({ w: c.clientWidth, h: c.clientHeight });
    });
    if (canvasRef.current) obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, [file]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-6">
      <BackToTools />

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <Droplet size={32} />
        </div>
        <h1 className="text-4xl font-black text-white">Watermark Image</h1>
        <p className="mt-2 text-zinc-400">Add text or logo watermarks. Drag them anywhere — phone or desktop.</p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone onUpload={handleUpload} title="Upload image to watermark" />
      )}

      {file && !resultUrl && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-6 lg:grid-cols-12">
          {/* ── Canvas area ── */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-3 shadow-2xl">
              {/* Canvas + overlay wrapper */}
              <div
                className="relative flex items-center justify-center rounded-xl bg-zinc-950/50"
                style={{ minHeight: 320 }}
              >
                {/* The actual canvas */}
                <canvas
                  ref={canvasRef}
                  className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-2xl"
                  style={{ display: "block" }}
                />

                {/* Drag overlay — exactly covers the canvas */}
                {selectedLayer && canvasSize.w > 0 && (
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      width:  canvasSize.w,
                      height: canvasSize.h,
                      left:   "50%",
                      top:    "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* Drag handle — pointer-events-auto so it gets events */}
                    <div
                      className="pointer-events-auto absolute"
                      style={{
                        left:      `${selectedLayer.x}%`,
                        top:       `${selectedLayer.y}%`,
                        transform: `translate(-50%, -50%) rotate(${selectedLayer.rotation}deg)`,
                        touchAction: "none",   // prevent scroll hijack on touch
                        cursor:    isDragging.current ? "grabbing" : "grab",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                      }}
                      onPointerDown={(e)  => onHandlePointerDown(e, selectedLayer.id)}
                      onPointerMove={onHandlePointerMove}
                      onPointerUp={onHandlePointerUp}
                      onPointerCancel={onHandlePointerUp}
                    >
                      {/* Visual handle */}
                      <div className="flex flex-col items-center gap-0.5 rounded-xl border-2 border-amber-500 bg-amber-500/20 p-2 shadow-lg backdrop-blur-sm">
                        <Move size={22} className="text-amber-400" />
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">drag</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Toolbar row */}
              <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
                <div className="flex gap-1">
                  <button onClick={undo} disabled={!canUndo} title="Undo"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30 transition">
                    <Undo2 size={16} />
                  </button>
                  <button onClick={redo} disabled={!canRedo} title="Redo"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30 transition">
                    <Redo2 size={16} />
                  </button>
                </div>
                <button onClick={addTextLayer}
                  className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm font-bold text-white hover:bg-white/10 transition">
                  <Type size={15} className="text-amber-400" /> Add Text
                </button>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm font-bold text-white hover:bg-white/10 transition">
                  <ImageIcon size={15} className="text-amber-400" /> Add Logo
                  <input type="file" className="hidden" accept="image/*" onChange={addImageLayer} />
                </label>
                <button onClick={() => { setLayers([]); setSelectedLayerId(null); }}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20 transition">
                  <RotateCcw size={15} /> Reset All
                </button>

                {/* Nudge arrows — shown when a layer is selected */}
                {selectedLayer && (
                  <div className="ml-auto flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-600">Nudge</span>
                    <button onClick={() => nudge(selectedLayer.id, 0, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition"><ChevronUp size={14}/></button>
                    <button onClick={() => nudge(selectedLayer.id, 0,  1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition"><ChevronDown size={14}/></button>
                    <button onClick={() => nudge(selectedLayer.id, -1, 0)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition"><ChevronLeft size={14}/></button>
                    <button onClick={() => nudge(selectedLayer.id,  1, 0)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition"><ChevronRight size={14}/></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Settings sidebar ── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-white/5 bg-zinc-900/40 p-5 shadow-xl">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                <Layers size={18} className="text-amber-400" /> Layers
              </h3>

              <div className="space-y-2">
                {layers.map(layer => (
                  <div key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`group cursor-pointer rounded-2xl border p-4 transition ${
                      selectedLayerId === layer.id
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-white/5 bg-zinc-950 hover:bg-zinc-900"
                    }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {layer.type === "text" ? <Type size={14} className="shrink-0 text-amber-400" /> : <ImageIcon size={14} className="shrink-0 text-amber-400" />}
                        <span className="truncate text-sm font-bold text-white">
                          {layer.type === "text" ? layer.content : "Image Watermark"}
                        </span>
                      </div>
                      <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                        <button onClick={e => { e.stopPropagation(); duplicateLayer(layer.id); }} className="p-1 text-zinc-500 hover:text-white"><Copy size={13}/></button>
                        <button onClick={e => { e.stopPropagation(); deleteLayer(layer.id); }} className="p-1 text-zinc-500 hover:text-red-400"><Trash2 size={13}/></button>
                      </div>
                    </div>

                    {selectedLayerId === layer.id && (
                      <div className="mt-5 space-y-5 border-t border-white/5 pt-5">
                        {layer.type === "text" && (
                          <>
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Text Content</label>
                              <input type="text" value={layer.content}
                                onChange={e => updateLayer(layer.id, { content: e.target.value })}
                                className="w-full rounded-xl border border-white/5 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Font Family</label>
                              <select value={layer.fontFamily}
                                onChange={e => updateLayer(layer.id, { fontFamily: e.target.value })}
                                className="w-full rounded-xl border border-white/5 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none">
                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Font Size ({layer.fontSize}px)</label>
                                <input type="range" min={10} max={500} value={layer.fontSize}
                                  onChange={e => updateLayer(layer.id, { fontSize: +e.target.value })}
                                  className="w-full accent-amber-500" />
                              </div>
                              <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Style</label>
                                <div className="flex gap-2">
                                  <button onClick={() => updateLayer(layer.id, { isBold: !layer.isBold })}
                                    className={`flex-1 rounded-lg border p-2 transition ${layer.isBold ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-900 text-zinc-500"}`}>
                                    <Bold size={15} className="mx-auto" />
                                  </button>
                                  <button onClick={() => updateLayer(layer.id, { isItalic: !layer.isItalic })}
                                    className={`flex-1 rounded-lg border p-2 transition ${layer.isItalic ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-900 text-zinc-500"}`}>
                                    <Italic size={15} className="mx-auto" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Text Color</label>
                              <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map(c => (
                                  <button key={c} onClick={() => updateLayer(layer.id, { color: c })}
                                    className={`h-8 w-8 rounded-full border-2 transition ${layer.color === c ? "border-amber-500 scale-110" : "border-transparent"}`}
                                    style={{ backgroundColor: c }} />
                                ))}
                                <input type="color" value={layer.color}
                                  onChange={e => updateLayer(layer.id, { color: e.target.value })}
                                  className="h-8 w-8 cursor-pointer rounded-full border-none bg-transparent p-0" />
                              </div>
                            </div>
                          </>
                        )}

                        {layer.type === "image" && (
                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Width ({Math.round(layer.width||0)}px)</label>
                            <input type="range" min={20} max={2000} value={layer.width||100}
                              onChange={e => {
                                const w = +e.target.value;
                                const ratio = (layer.height||1)/(layer.width||1);
                                updateLayer(layer.id, { width: w, height: w * ratio });
                              }}
                              className="w-full accent-amber-500" />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Opacity ({Math.round(layer.opacity*100)}%)</label>
                            <input type="range" min={0.05} max={1} step={0.05} value={layer.opacity}
                              onChange={e => updateLayer(layer.id, { opacity: +e.target.value })}
                              className="w-full accent-amber-500" />
                          </div>
                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Rotation ({layer.rotation}°)</label>
                            <input type="range" min={0} max={360} value={layer.rotation}
                              onChange={e => updateLayer(layer.id, { rotation: +e.target.value })}
                              className="w-full accent-amber-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {layers.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
                    <Plus className="mb-2 h-8 w-8 text-zinc-600" />
                    <p className="text-sm text-zinc-500">No watermarks yet. Tap "Add Text" above.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setFile(null); setPreviewUrl(null); setLayers([]); }}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white hover:bg-white/10 transition">
                Cancel
              </button>
              <button onClick={processImage}
                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg hover:bg-amber-400 transition">
                <Download size={18} /> Save Image
              </button>
            </div>
          </div>
        </div>
      )}

      {(status === "processing" || status === "error") && (
        <ProgressFeedback status={status} processingProgress={processingProgress}
          message={status === "processing" ? "Applying watermarks…" : "An error occurred."} />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="Watermark Applied!"
          message="Your image has been protected with custom watermarks."
          previewUrl={resultUrl}
          downloadUrl={resultUrl}
          fileInfo={{ originalSize: formatSize(file?.size||0), newSize: formatSize(resultSize||0), saved: "N/A" }}
          onReset={() => { setFile(null); setResultUrl(null); setStatus("idle"); setPreviewUrl(null); setResultSize(null); setLayers([]); }}
        />
      )}
    </div>
  );
}
