import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import { 
  Youtube, 
  Type, 
  Layout, 
  Download, 
  Sparkles, 
  Palette, 
  Move, 
  RotateCw, 
  Trash2, 
  Plus,
  Instagram,
  Twitter,
  Video,
  Monitor,
  Undo2,
  Redo2
} from "lucide-react";
import { useHistory } from "../../hooks/useHistory";

interface TextLayer {
  id: string;
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  font: string;
  bold: boolean;
  italic: boolean;
  shadow: boolean;
  outline: boolean;
  outlineColor: string;
}

const PRESETS = [
  { name: "YouTube", width: 1280, height: 720, icon: Youtube },
  { name: "TikTok", width: 1080, height: 1920, icon: Video },
  { name: "Instagram", width: 1080, height: 1080, icon: Instagram },
  { name: "Twitter", width: 1200, height: 675, icon: Twitter },
  { name: "Full HD", width: 1920, height: 1080, icon: Monitor },
];

const FONTS = [
  "Inter", "Oswald", "Montserrat", "Bebas Neue", "Playfair Display", "JetBrains Mono"
];

const PRESET_COLORS = [
  "#ffffff", "#000000", "#facc15", "#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f97316"
];

export default function ThumbnailGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  
  const [preset, setPreset] = useState(PRESETS[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { 
    state: layers, 
    setState: setLayers, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<TextLayer[]>([]);

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      // Add initial text layer
      if (layers.length === 0) {
        addTextLayer();
      }
    };
    img.src = url;

    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: Math.random().toString(36).substr(2, 9),
      content: "NEW TEXT",
      x: preset.width / 2,
      y: preset.height / 2,
      size: 80,
      color: "#ffffff",
      rotation: 0,
      font: "Inter",
      bold: true,
      italic: false,
      shadow: true,
      outline: true,
      outlineColor: "#000000"
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateLayer = (id: string, updates: Partial<TextLayer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = preset.width;
    canvas.height = preset.height;

    // Draw background image
    const img = imageRef.current;
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    // Draw layers
    layers.forEach(layer => {
      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      
      const fontStyle = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.size}px ${layer.font}, sans-serif`;
      ctx.font = fontStyle;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (layer.shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
      }

      if (layer.outline) {
        ctx.strokeStyle = layer.outlineColor;
        ctx.lineWidth = layer.size / 10;
        ctx.strokeText(layer.content, 0, 0);
      }

      ctx.fillStyle = layer.color;
      ctx.fillText(layer.content, 0, 0);

      // Draw selection box if selected
      if (layer.id === selectedLayerId && status === "idle") {
        const metrics = ctx.measureText(layer.content);
        const padding = 20;
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(
          -metrics.width / 2 - padding,
          -layer.size / 2 - padding,
          metrics.width + padding * 2,
          layer.size + padding * 2
        );
      }

      ctx.restore();
    });
  }, [layers, preset, selectedLayerId, status]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (status !== "idle") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    // Check if clicked on a layer (reverse order to pick top one)
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      const dist = Math.sqrt(Math.pow(mouseX - layer.x, 2) + Math.pow(mouseY - layer.y, 2));
      if (dist < layer.size) {
        setSelectedLayerId(layer.id);
        setIsDragging(true);
        setDragOffset({ x: mouseX - layer.x, y: mouseY - layer.y });
        return;
      }
    }
    setSelectedLayerId(null);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !selectedLayerId || status !== "idle") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    updateLayer(selectedLayerId, {
      x: mouseX - dragOffset.x,
      y: mouseY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processImage = async () => {
    if (!file || !canvasRef.current) return;
    
    setSelectedLayerId(null);
    setStatus("processing");
    setProcessingProgress(0);

    try {
      for (let i = 0; i <= 100; i += 25) {
        setProcessingProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      const canvas = canvasRef.current;
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92);
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultSize(blob.size);
        setStatus("success");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <BackToTools />

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
          <Youtube size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[0.9] mb-4 break-words">
          Thumbnail <span className="text-amber-500 text-stroke-sm text-transparent">Generator</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Professional thumbnails with draggable text, effects, and platform presets.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload background image"
        />
      )}

      {file && !resultUrl && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
              <div className="relative flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[500px] items-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                  className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-lg cursor-move"
                />
                <div className="absolute bottom-6 left-6 rounded-full bg-black/60 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/10">
                  Drag text to reposition
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Palette size={20} className="text-amber-500" />
                  Editor
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-zinc-950 text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-30"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 size={14} />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-zinc-950 text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-30"
                    title="Redo (Ctrl+Shift+Z)"
                  >
                    <Redo2 size={14} />
                  </button>
                  <div className="h-4 w-px bg-white/5 mx-1" />
                  <button
                    onClick={addTextLayer}
                    className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
                  >
                    <Plus size={14} />
                    Add Text
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Platform Preset
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => setPreset(p)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-2 transition ${
                          preset.name === p.name
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                        }`}
                        title={p.name}
                      >
                        <p.icon size={16} />
                        <span className="text-[8px] font-bold uppercase truncate w-full text-center">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedLayer ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Edit Text
                        </label>
                        <button 
                          onClick={() => removeLayer(selectedLayer.id)}
                          className="text-red-500 hover:text-red-400 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <textarea
                        value={selectedLayer.content}
                        onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })}
                        className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Font Size: {selectedLayer.size}
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="400"
                          value={selectedLayer.size}
                          onChange={(e) => updateLayer(selectedLayer.id, { size: parseInt(e.target.value) })}
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Rotation: {selectedLayer.rotation}°
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={selectedLayer.rotation}
                          onChange={(e) => updateLayer(selectedLayer.id, { rotation: parseInt(e.target.value) })}
                          className="w-full accent-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Font Family
                      </label>
                      <select
                        value={selectedLayer.font}
                        onChange={(e) => updateLayer(selectedLayer.id, { font: e.target.value })}
                        className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                      >
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Color Presets
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => updateLayer(selectedLayer.id, { color: c })}
                            className={`h-8 w-8 rounded-full border-2 transition ${selectedLayer.color === c ? 'border-amber-500 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input
                          type="color"
                          value={selectedLayer.color}
                          onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                          className="h-8 w-8 cursor-pointer rounded-full bg-zinc-950 p-0 overflow-hidden border-2 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateLayer(selectedLayer.id, { bold: !selectedLayer.bold })}
                        className={`rounded-xl border p-2 text-xs font-bold transition ${selectedLayer.bold ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/5 bg-zinc-950 text-zinc-500'}`}
                      >
                        Bold
                      </button>
                      <button
                        onClick={() => updateLayer(selectedLayer.id, { italic: !selectedLayer.italic })}
                        className={`rounded-xl border p-2 text-xs font-bold transition ${selectedLayer.italic ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/5 bg-zinc-950 text-zinc-500'}`}
                      >
                        Italic
                      </button>
                      <button
                        onClick={() => updateLayer(selectedLayer.id, { shadow: !selectedLayer.shadow })}
                        className={`rounded-xl border p-2 text-xs font-bold transition ${selectedLayer.shadow ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/5 bg-zinc-950 text-zinc-500'}`}
                      >
                        Shadow
                      </button>
                      <button
                        onClick={() => updateLayer(selectedLayer.id, { outline: !selectedLayer.outline })}
                        className={`rounded-xl border p-2 text-xs font-bold transition ${selectedLayer.outline ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/5 bg-zinc-950 text-zinc-500'}`}
                      >
                        Outline
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-white/10 bg-zinc-950/30">
                    <Type size={32} className="text-zinc-700 mb-4" />
                    <p className="text-sm text-zinc-500">Select a text layer on the canvas<br/>or add a new one to edit.</p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Original Size</span>
                    <span className="font-mono text-white">{formatSize(file.size)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setLayers([]);
                }}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white transition hover:bg-white/10"
              >
                Reset
              </button>
              <button
                onClick={processImage}
                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
              >
                <Download size={20} />
                Generate
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
              ? "Rendering thumbnail..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="Thumbnail Ready!"
          message="Your custom thumbnail has been generated successfully."
          previewUrl={resultUrl}
          downloadUrl={resultUrl}
          fileInfo={{
            originalSize: formatSize(file?.size || 0),
            newSize: formatSize(resultSize || 0),
            saved: "N/A"
          }}
          onReset={() => {
            setFile(null);
            setResultUrl(null);
            setStatus("idle");
            setPreviewUrl(null);
            setResultSize(null);
            setLayers([]);
          }}
        />
      )}
    </div>
  );
}
