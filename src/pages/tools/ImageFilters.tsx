import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Sparkles, 
  ArrowLeft, 
  Settings2,
  CheckCircle2,
  Sun,
  Contrast,
  Droplets,
  Zap,
  RotateCcw,
  Palette,
  Eye,
  Image as ImageIcon
} from "lucide-react";

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  blur: number;
  invert: number;
}

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  blur: 0,
  invert: 0
};

export default function ImageFilters() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  
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

  const updateFilter = (key: keyof FilterSettings, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getFilterString = () => {
    return `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturation}%) 
      grayscale(${filters.grayscale}%) 
      sepia(${filters.sepia}%) 
      hue-rotate(${filters.hueRotate}deg) 
      blur(${filters.blur}px) 
      invert(${filters.invert}%)
    `.trim();
  };

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
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.filter = getFilterString();
        ctx.drawImage(img, 0, 0);

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

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
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
          <Sparkles size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Image <span className="text-amber-500 text-stroke-sm text-transparent">Filters</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Enhance your photos with professional-grade filters, color correction, and artistic effects.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to apply filters"
        />
      )}

      {file && !resultUrl && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[500px] items-center relative overflow-hidden">
                <canvas ref={canvasRef} className="hidden" />
                <img
                  src={previewUrl || ""}
                  alt="Preview"
                  className="max-h-[70vh] w-auto object-contain shadow-2xl rounded-lg transition-all duration-300"
                  style={{ filter: getFilterString() }}
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="mt-4 flex justify-between items-center px-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <Eye size={14} className="text-amber-500" />
                  Live Preview Active
                </div>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                >
                  <RotateCcw size={14} />
                  Reset All
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
                <Settings2 size={20} className="text-amber-500" />
                Adjustments
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <Sun size={14} /> Brightness
                    </label>
                    <span className="text-xs font-mono text-amber-500">{filters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.brightness}
                    onChange={(e) => updateFilter("brightness", parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <Contrast size={14} /> Contrast
                    </label>
                    <span className="text-xs font-mono text-amber-500">{filters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.contrast}
                    onChange={(e) => updateFilter("contrast", parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <Droplets size={14} /> Saturation
                    </label>
                    <span className="text-xs font-mono text-amber-500">{filters.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.saturation}
                    onChange={(e) => updateFilter("saturation", parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <Palette size={14} /> Hue Rotate
                    </label>
                    <span className="text-xs font-mono text-amber-500">{filters.hueRotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={filters.hueRotate}
                    onChange={(e) => updateFilter("hueRotate", parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Grayscale</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.grayscale}
                      onChange={(e) => updateFilter("grayscale", parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sepia</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.sepia}
                      onChange={(e) => updateFilter("sepia", parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Blur (px)</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={filters.blur}
                      onChange={(e) => updateFilter("blur", parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Invert</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.invert}
                      onChange={(e) => updateFilter("invert", parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setFilters(DEFAULT_FILTERS);
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
                Apply Filters
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
              ? "Applying filters and rendering..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="Filters Applied!"
          message="Your image has been successfully enhanced with your custom filters."
          previewUrl={resultUrl}
          downloadUrl={resultUrl}
          onReset={() => {
            setFile(null);
            setResultUrl(null);
            setStatus("idle");
            setPreviewUrl(null);
            setFilters(DEFAULT_FILTERS);
          }}
        />
      )}
    </div>
  );
}
