import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Type, 
  ArrowLeft, 
  Download, 
  Settings2,
  Plus,
  Trash2,
  Move,
  RotateCw,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  CheckCircle2
} from "lucide-react";

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  rotation: number;
  opacity: number;
  textAlign: "left" | "center" | "right";
}

export default function AddText() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    
    const img = new Image();
    img.onload = () => {
      setCanvasSize({ width: img.width, height: img.height });
      // Add initial text layer
      addLayer(img.width / 2, img.height / 2);
      
      // Scroll to workspace
      setTimeout(() => {
        workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    };
    img.src = url;
  };

  const addLayer = (x?: number, y?: number) => {
    const newLayer: TextLayer = {
      id: Math.random().toString(36).substr(2, 9),
      text: "Double click to edit",
      x: x || canvasSize.width / 2,
      y: y || canvasSize.height / 2,
      fontSize: Math.round(canvasSize.width / 15),
      color: "#FFFFFF",
      fontFamily: "Inter",
      isBold: true,
      isItalic: false,
      rotation: 0,
      opacity: 1,
      textAlign: "center"
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<TextLayer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const processImage = async () => {
    if (!file || !canvasRef.current) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        layers.forEach(layer => {
          ctx.save();
          ctx.translate(layer.x, layer.y);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.globalAlpha = layer.opacity;
          
          const fontStyle = `${layer.isItalic ? "italic " : ""}${layer.isBold ? "bold " : ""}`;
          ctx.font = `${fontStyle}${layer.fontSize}px ${layer.fontFamily}`;
          ctx.fillStyle = layer.color;
          ctx.textAlign = layer.textAlign;
          ctx.textBaseline = "middle";
          
          ctx.fillText(layer.text, 0, 0);
          ctx.restore();
        });

        setResultUrl(canvas.toDataURL(file.type, 0.9));
        setProcessingProgress(100);
        setStatus("success");
      };
      img.src = previewUrl || "";
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="sticky top-4 z-50 mb-8">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 backdrop-blur-md transition hover:text-white border border-white/5"
        >
          <ArrowLeft size={18} />
          Back to Tools
        </Link>
      </div>

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
          <Type size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Add <span className="text-amber-500 text-stroke-sm text-transparent">Text</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Add beautiful typography, captions, and quotes to your images with professional controls.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to add text"
        />
      )}

      {file && !resultUrl && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[500px] items-center relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="hidden"
                />
                <div className="relative">
                  <img
                    src={previewUrl || ""}
                    alt="Preview"
                    className="max-h-[70vh] w-auto object-contain shadow-2xl rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Text Layers Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {layers.map((layer) => (
                      <div
                        key={layer.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLayerId(layer.id);
                        }}
                        className={`absolute cursor-move pointer-events-auto select-none transition-shadow ${
                          selectedLayerId === layer.id ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-zinc-950" : ""
                        }`}
                        style={{
                          left: `${(layer.x / canvasSize.width) * 100}%`,
                          top: `${(layer.y / canvasSize.height) * 100}%`,
                          transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                          color: layer.color,
                          fontSize: `${(layer.fontSize / canvasSize.width) * 100}vw`,
                          fontFamily: layer.fontFamily,
                          fontWeight: layer.isBold ? "bold" : "normal",
                          fontStyle: layer.isItalic ? "italic" : "normal",
                          opacity: layer.opacity,
                          textAlign: layer.textAlign,
                          whiteSpace: "nowrap"
                        }}
                      >
                        {layer.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center px-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Canvas: {canvasSize.width}x{canvasSize.height}px
                </p>
                <button
                  onClick={() => addLayer()}
                  className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-500 transition hover:bg-amber-500/20"
                >
                  <Plus size={14} />
                  Add New Layer
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Settings2 size={20} className="text-amber-500" />
                Text Controls
              </h3>
              
              {selectedLayer ? (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Content</label>
                    <textarea
                      value={selectedLayer.text}
                      onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                      className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Font Size</label>
                      <input
                        type="number"
                        value={selectedLayer.fontSize}
                        onChange={(e) => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) || 10 })}
                        className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedLayer.color}
                          onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                          className="h-11 w-11 rounded-xl border border-white/5 bg-zinc-950 p-1 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedLayer.color}
                          onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                          className="flex-1 rounded-xl border border-white/5 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { isBold: !selectedLayer.isBold })}
                      className={`flex-1 flex items-center justify-center h-10 rounded-lg border transition ${
                        selectedLayer.isBold ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-white/5 bg-zinc-950 text-zinc-500"
                      }`}
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { isItalic: !selectedLayer.isItalic })}
                      className={`flex-1 flex items-center justify-center h-10 rounded-lg border transition ${
                        selectedLayer.isItalic ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-white/5 bg-zinc-950 text-zinc-500"
                      }`}
                    >
                      <Italic size={16} />
                    </button>
                    <div className="w-px h-10 bg-white/5 mx-1" />
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { textAlign: "left" })}
                      className={`flex-1 flex items-center justify-center h-10 rounded-lg border transition ${
                        selectedLayer.textAlign === "left" ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-white/5 bg-zinc-950 text-zinc-500"
                      }`}
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { textAlign: "center" })}
                      className={`flex-1 flex items-center justify-center h-10 rounded-lg border transition ${
                        selectedLayer.textAlign === "center" ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-white/5 bg-zinc-950 text-zinc-500"
                      }`}
                    >
                      <AlignCenter size={16} />
                    </button>
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { textAlign: "right" })}
                      className={`flex-1 flex items-center justify-center h-10 rounded-lg border transition ${
                        selectedLayer.textAlign === "right" ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-white/5 bg-zinc-950 text-zinc-500"
                      }`}
                    >
                      <AlignRight size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Rotation: {selectedLayer.rotation}°</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedLayer.rotation}
                        onChange={(e) => updateLayer(selectedLayer.id, { rotation: parseInt(e.target.value) })}
                        className="w-full accent-amber-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Opacity: {Math.round(selectedLayer.opacity * 100)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedLayer.opacity}
                        onChange={(e) => updateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <button
                      onClick={() => removeLayer(selectedLayer.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-3 text-xs font-bold text-red-500 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={14} />
                      Remove Layer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-zinc-950 p-4 text-zinc-600">
                    <Move size={32} />
                  </div>
                  <p className="text-sm font-medium text-zinc-500">Select a layer to edit its properties</p>
                </div>
              )}
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
                <CheckCircle2 size={20} />
                Apply & Save
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
              ? "Applying text layers to image..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="Text Added!"
          message="Your image has been successfully updated with the text layers."
          previewUrl={resultUrl}
          downloadUrl={resultUrl}
          onReset={() => {
            setFile(null);
            setResultUrl(null);
            setStatus("idle");
            setPreviewUrl(null);
            setLayers([]);
          }}
        />
      )}
    </div>
  );
}
