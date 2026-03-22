import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Square, 
  ArrowLeft, 
  Settings2,
  CheckCircle2,
  Palette,
  Maximize,
  CornerUpRight,
  Monitor,
  Smartphone,
  Tablet,
  Frame
} from "lucide-react";

export default function ImageBorder() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [borderWidth, setBorderWidth] = useState(20);
  const [borderColor, setBorderColor] = useState("#FFFFFF");
  const [borderRadius, setBorderRadius] = useState(0);
  const [padding, setPadding] = useState(0);
  const [shadow, setShadow] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    
    // Scroll to workspace
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
        const totalBorder = borderWidth + padding;
        canvas.width = img.width + (totalBorder * 2);
        canvas.height = img.height + (totalBorder * 2);
        
        // Draw background/border
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw shadow if needed (simulated with a darker rect)
        if (shadow > 0) {
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = shadow;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = shadow / 2;
        }

        // Draw image with rounded corners if needed
        if (borderRadius > 0) {
          const x = totalBorder;
          const y = totalBorder;
          const w = img.width;
          const h = img.height;
          const r = Math.min(borderRadius, w / 2, h / 2);

          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.clip();
        }

        ctx.drawImage(img, totalBorder, totalBorder);

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
          <Square size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Image <span className="text-amber-500 text-stroke-sm text-transparent">Border</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Add professional frames, borders, and rounded corners to your images with ease.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to add border"
        />
      )}

      {file && !resultUrl && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[500px] items-center relative overflow-hidden">
                <canvas ref={canvasRef} className="hidden" />
                <div 
                  className="transition-all duration-300 shadow-2xl overflow-hidden"
                  style={{
                    padding: `${borderWidth}px`,
                    backgroundColor: borderColor,
                    borderRadius: `${borderRadius}px`,
                    boxShadow: shadow > 0 ? `0 ${shadow/2}px ${shadow}px rgba(0,0,0,0.5)` : 'none'
                  }}
                >
                  <img
                    src={previewUrl || ""}
                    alt="Preview"
                    className="max-h-[60vh] w-auto object-contain"
                    style={{
                      borderRadius: `${Math.max(0, borderRadius - borderWidth)}px`
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center px-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <Frame size={14} className="text-amber-500" />
                  Live Frame Preview
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
                <Settings2 size={20} className="text-amber-500" />
                Frame Controls
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <Maximize size={14} /> Border Width
                    </label>
                    <span className="text-xs font-mono text-amber-500">{borderWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Border Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="h-11 w-11 rounded-xl border border-white/5 bg-zinc-950 p-1 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="flex-1 rounded-xl border border-white/5 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <CornerUpRight size={14} /> Corner Radius
                    </label>
                    <span className="text-xs font-mono text-amber-500">{borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <Monitor size={14} /> Shadow Intensity
                    </label>
                    <span className="text-xs font-mono text-amber-500">{shadow}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={shadow}
                    onChange={(e) => setShadow(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setBorderWidth(20);
                  setBorderColor("#FFFFFF");
                  setBorderRadius(0);
                  setShadow(0);
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
                Apply Frame
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
              ? "Rendering frame and border..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="Frame Added!"
          message="Your image has been successfully framed with your custom settings."
          previewUrl={resultUrl}
          downloadUrl={resultUrl}
          onReset={() => {
            setFile(null);
            setResultUrl(null);
            setStatus("idle");
            setPreviewUrl(null);
            setBorderWidth(20);
            setBorderColor("#FFFFFF");
            setBorderRadius(0);
            setShadow(0);
          }}
        />
      )}
    </div>
  );
}
