import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import { 
  Droplet, 
  Info, 
  Download, 
  Type, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  RotateCcw, 
  Move,
  Layers,
  Settings2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Undo2,
  Redo2
} from "lucide-react";
import { useHistory } from "../../hooks/useHistory";

interface WatermarkLayer {
  id: string;
  type: "text" | "image";
  content: string; // text or image dataUrl
  x: number;
  y: number;
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

const FONTS = [
  "Inter", "Arial", "Verdana", "Times New Roman", "Georgia", "Courier New", "Impact", "Comic Sans MS"
];

const PRESET_COLORS = [
  "#ffffff", "#000000", "#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"
];

export default function WatermarkImage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { 
    state: layers, 
    setState: setLayers, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<WatermarkLayer[]>([]);

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    
    // Initial text layer
    const initialLayer: WatermarkLayer = {
      id: Math.random().toString(36).substr(2, 9),
      type: "text",
      content: "STEAimage",
      x: 50,
      y: 50,
      fontSize: 40,
      fontFamily: "Inter",
      color: "#ffffff",
      opacity: 0.5,
      rotation: 0,
      isBold: true,
      isItalic: false
    };
    setLayers([initialLayer]);
    setSelectedLayerId(initialLayer.id);
    
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const drawCanvas = useCallback(() => {
    if (!file || !previewUrl || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      layers.forEach(layer => {
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        
        const x = (layer.x / 100) * canvas.width;
        const y = (layer.y / 100) * canvas.height;
        
        ctx.translate(x, y);
        ctx.rotate((layer.rotation * Math.PI) / 180);

        if (layer.type === "text") {
          ctx.fillStyle = layer.color;
          ctx.font = `${layer.isItalic ? "italic " : ""}${layer.isBold ? "bold " : ""}${layer.fontSize}px ${layer.fontFamily}, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          // Shadow for visibility
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.fillText(layer.content, 0, 0);
        } else if (layer.type === "image") {
          const watermarkImg = new Image();
          watermarkImg.src = layer.content;
          if (watermarkImg.complete) {
            const w = (layer.width || 100);
            const h = (layer.height || 100);
            ctx.drawImage(watermarkImg, -w / 2, -h / 2, w, h);
          }
        }
        ctx.restore();
      });
    };
    img.src = previewUrl;
  }, [file, previewUrl, layers]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Convert a screen point to canvas-relative percentage (0-100)
  const screenToCanvasPct = (clientX: number, clientY: number): { px: number; py: number } => {
    const container = containerRef.current;
    if (!container) return { px: 50, py: 50 };
    const rect = container.getBoundingClientRect();
    return {
      px: ((clientX - rect.left) / rect.width) * 100,
      py: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!selectedLayerId) return;
    // Prevent page scroll while dragging on touch
    if ('touches' in e) e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const { px, py } = screenToCanvasPct(clientX, clientY);
    const layer = layers.find(l => l.id === selectedLayerId);
    if (layer) {
      setDragOffset({ x: px - layer.x, y: py - layer.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !selectedLayerId) return;
    if ('touches' in e) e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const { px, py } = screenToCanvasPct(clientX, clientY);
    setLayers(prev => prev.map(l => {
      if (l.id === selectedLayerId) {
        return {
          ...l,
          x: Math.max(0, Math.min(100, px - dragOffset.x)),
          y: Math.max(0, Math.min(100, py - dragOffset.y)),
        };
      }
      return l;
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const addTextLayer = () => {
    const newLayer: WatermarkLayer = {
      id: Math.random().toString(36).substr(2, 9),
      type: "text",
      content: "New Watermark",
      x: 50,
      y: 50,
      fontSize: 40,
      fontFamily: "Inter",
      color: "#ffffff",
      opacity: 0.5,
      rotation: 0,
      isBold: true,
      isItalic: false
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const addImageLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const newLayer: WatermarkLayer = {
          id: Math.random().toString(36).substr(2, 9),
          type: "image",
          content: dataUrl,
          x: 50,
          y: 50,
          fontSize: 0,
          fontFamily: "",
          color: "",
          opacity: 0.5,
          rotation: 0,
          isBold: false,
          isItalic: false,
          width: img.width / 4,
          height: img.height / 4
        };
        setLayers([...layers, newLayer]);
        setSelectedLayerId(newLayer.id);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const deleteLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const duplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      const newLayer = { ...layer, id: Math.random().toString(36).substr(2, 9), x: layer.x + 5, y: layer.y + 5 };
      setLayers([...layers, newLayer]);
      setSelectedLayerId(newLayer.id);
    }
  };

  const updateLayer = (id: string, updates: Partial<WatermarkLayer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
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
    
    setStatus("processing");
    setProcessingProgress(0);

    try {
      for (let i = 0; i <= 100; i += 25) {
        setProcessingProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      const canvas = canvasRef.current;
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), file.type, 0.95);
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
          <Droplet size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[0.9] mb-4 break-words">
          Watermark <span className="text-amber-500 text-stroke-sm text-transparent">Image</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Protect your creative work. Add custom text or image watermarks with precision control and free movement.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to watermark"
        />
      )}

      {file && !resultUrl && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
              <div 
                ref={containerRef}
                className="relative flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[500px] items-center overflow-auto cursor-crosshair"
                style={{ touchAction: "none" }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
              >
                <canvas
                  ref={canvasRef}
                  className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-lg"
                />
                
                {/* Draggable Overlay */}
                {selectedLayer && (
                  <div 
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                      width: canvasRef.current?.clientWidth,
                      height: canvasRef.current?.clientHeight,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div 
                      className="absolute pointer-events-auto cursor-move group"
                      style={{
                        left: `${selectedLayer.x}%`,
                        top: `${selectedLayer.y}%`,
                        transform: `translate(-50%, -50%) rotate(${selectedLayer.rotation}deg)`
                      }}
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleMouseDown}
                    >
                      <div className="rounded-lg border-2 border-amber-500 p-2 bg-amber-500/10 backdrop-blur-sm">
                        <Move size={20} className="text-amber-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                <div className="flex gap-2 mr-2">
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-zinc-950 text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-30"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 size={18} />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-zinc-950 text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-30"
                    title="Redo (Ctrl+Shift+Z)"
                  >
                    <Redo2 size={18} />
                  </button>
                </div>
                <button
                  onClick={addTextLayer}
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 border border-white/5"
                >
                  <Type size={18} className="text-amber-500" />
                  Add Text
                </button>
                <label className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 border border-white/5 cursor-pointer">
                  <ImageIcon size={18} className="text-amber-500" />
                  Add Logo
                  <input type="file" className="hidden" accept="image/*" onChange={addImageLayer} />
                </label>
                <button
                  onClick={() => setLayers([])}
                  className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20 border border-red-500/20"
                >
                  <RotateCcw size={18} />
                  Reset All
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md max-h-[80vh] overflow-y-auto custom-scrollbar">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Layers className="h-5 w-5 text-amber-500" />
                Watermark Layers
              </h3>

              <div className="space-y-3">
                {layers.map((layer) => (
                  <div 
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`group relative rounded-2xl border p-4 transition cursor-pointer ${
                      selectedLayerId === layer.id 
                        ? "border-amber-500 bg-amber-500/10" 
                        : "border-white/5 bg-zinc-950 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {layer.type === "text" ? <Type size={16} className="text-amber-500" /> : <ImageIcon size={16} className="text-amber-500" />}
                        <span className="truncate text-sm font-bold text-white">
                          {layer.type === "text" ? layer.content : "Image Watermark"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button 
                          onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                          className="p-1 text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {selectedLayerId === layer.id && (
                      <div className="mt-6 space-y-6 border-t border-white/5 pt-6 animate-in fade-in duration-300">
                        {layer.type === "text" && (
                          <>
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Text Content</label>
                              <input
                                type="text"
                                value={layer.content}
                                onChange={(e) => updateLayer(layer.id, { content: e.target.value })}
                                className="w-full rounded-xl border border-white/5 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Font Family</label>
                              <select
                                value={layer.fontFamily}
                                onChange={(e) => updateLayer(layer.id, { fontFamily: e.target.value })}
                                className="w-full rounded-xl border border-white/5 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                              >
                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Font Size ({layer.fontSize}px)</label>
                                <input
                                  type="range"
                                  min="10"
                                  max="500"
                                  value={layer.fontSize}
                                  onChange={(e) => updateLayer(layer.id, { fontSize: parseInt(e.target.value) })}
                                  className="w-full accent-amber-500"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Style</label>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateLayer(layer.id, { isBold: !layer.isBold })}
                                    className={`flex-1 rounded-lg border p-2 transition ${layer.isBold ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-900 text-zinc-500"}`}
                                  >
                                    <Bold size={16} className="mx-auto" />
                                  </button>
                                  <button
                                    onClick={() => updateLayer(layer.id, { isItalic: !layer.isItalic })}
                                    className={`flex-1 rounded-lg border p-2 transition ${layer.isItalic ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-900 text-zinc-500"}`}
                                  >
                                    <Italic size={16} className="mx-auto" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">Text Color</label>
                              <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map(c => (
                                  <button
                                    key={c}
                                    onClick={() => updateLayer(layer.id, { color: c })}
                                    className={`h-8 w-8 rounded-full border-2 transition ${layer.color === c ? "border-amber-500 scale-110" : "border-transparent"}`}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                                <input
                                  type="color"
                                  value={layer.color}
                                  onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                                  className="h-8 w-8 cursor-pointer rounded-full bg-transparent p-0 border-none"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {layer.type === "image" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Width ({Math.round(layer.width || 0)}px)</label>
                              <input
                                type="range"
                                min="20"
                                max="2000"
                                value={layer.width}
                                onChange={(e) => {
                                  const newW = parseInt(e.target.value);
                                  const ratio = (layer.height || 1) / (layer.width || 1);
                                  updateLayer(layer.id, { width: newW, height: newW * ratio });
                                }}
                                className="w-full accent-amber-500"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Rotation ({layer.rotation}°)</label>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={layer.rotation}
                                onChange={(e) => updateLayer(layer.id, { rotation: parseInt(e.target.value) })}
                                className="w-full accent-amber-500"
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Opacity ({Math.round(layer.opacity * 100)}%)</label>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.05"
                              value={layer.opacity}
                              onChange={(e) => updateLayer(layer.id, { opacity: parseFloat(e.target.value) })}
                              className="w-full accent-amber-500"
                            />
                          </div>
                          {layer.type === "text" && (
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Rotation ({layer.rotation}°)</label>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={layer.rotation}
                                onChange={(e) => updateLayer(layer.id, { rotation: parseInt(e.target.value) })}
                                className="w-full accent-amber-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {layers.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
                    <Plus className="mb-2 h-8 w-8 text-zinc-600" />
                    <p className="text-sm text-zinc-500">No watermarks added yet.</p>
                  </div>
                )}
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
                Cancel
              </button>
              <button
                onClick={processImage}
                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
              >
                <Download size={20} />
                Save Image
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
              ? "Applying custom watermarks..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="Watermark Applied!"
          message="Your image has been protected with custom watermarks."
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
