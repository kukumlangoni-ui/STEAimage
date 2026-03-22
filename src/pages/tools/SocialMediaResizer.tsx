import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Share2, 
  ArrowLeft, 
  Download, 
  Layers,
  Maximize2,
  Minimize2,
  AlignJustify,
  Settings2,
  RotateCcw,
  CheckCircle2
} from "lucide-react";

// Platform icon emojis (avoids lucide brand icon dependency issues)
const IconInsta = () => <span className="text-base">📷</span>;
const IconFB = () => <span className="text-base">👍</span>;
const IconTW = () => <span className="text-base">🐦</span>;
const IconLI = () => <span className="text-base">💼</span>;
const IconYT = () => <span className="text-base">▶️</span>;
const IconTT = () => <span className="text-base">🎵</span>;
const IconPIN = () => <span className="text-base">📌</span>;
const IconWA = () => <span className="text-base">💬</span>;

const PLATFORMS = [
  { name: "Instagram Post", width: 1080, height: 1080, icon: IconInsta },
  { name: "Instagram Portrait", width: 1080, height: 1350, icon: IconInsta },
  { name: "Instagram Story", width: 1080, height: 1920, icon: IconInsta },
  { name: "Facebook Post", width: 1200, height: 630, icon: IconFB },
  { name: "Facebook Cover", width: 820, height: 312, icon: IconFB },
  { name: "X / Twitter Post", width: 1600, height: 900, icon: IconTW },
  { name: "X / Twitter Header", width: 1500, height: 500, icon: IconTW },
  { name: "LinkedIn Post", width: 1200, height: 627, icon: IconLI },
  { name: "LinkedIn Cover", width: 1584, height: 396, icon: IconLI },
  { name: "YouTube Thumbnail", width: 1280, height: 720, icon: IconYT },
  { name: "YouTube Banner", width: 2560, height: 1440, icon: IconYT },
  { name: "TikTok Cover", width: 1080, height: 1920, icon: IconTT },
  { name: "WhatsApp Status", width: 1080, height: 1920, icon: IconWA },
  { name: "Pinterest Pin", width: 1000, height: 1500, icon: IconPIN },
];

export default function SocialMediaResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0]);
  const [resizeMode, setResizeMode] = useState<"contain" | "cover" | "fill">("contain");
  const [bgColor, setBgColor] = useState("#000000");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (file && previewUrl && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.width = selectedPlatform.width;
        canvas.height = selectedPlatform.height;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          let drawWidth, drawHeight, x, y;

          if (resizeMode === "contain") {
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            drawWidth = img.width * scale;
            drawHeight = img.height * scale;
            x = (canvas.width - drawWidth) / 2;
            y = (canvas.height - drawHeight) / 2;
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
          } else if (resizeMode === "cover") {
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            drawWidth = img.width * scale;
            drawHeight = img.height * scale;
            x = (canvas.width - drawWidth) / 2;
            y = (canvas.height - drawHeight) / 2;
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
          } else {
            // Fill / Stretch
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
      };
      img.src = previewUrl;
    }
  }, [file, previewUrl, selectedPlatform, resizeMode, bgColor]);

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
          <Share2 size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Social <span className="text-amber-500 text-stroke-sm text-transparent">Resizer</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Resize your images perfectly for Instagram, Facebook, Twitter, and more with smart cropping.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to resize"
        />
      )}

      {file && !resultUrl && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[500px] items-center overflow-auto">
                <canvas
                  ref={canvasRef}
                  className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md max-h-[80vh] overflow-y-auto custom-scrollbar">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Layers className="h-5 w-5 text-amber-500" />
                Platform Presets
              </h3>
              
              <div className="space-y-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      selectedPlatform.name === platform.name
                        ? "border-amber-500 bg-amber-500/10 text-amber-400"
                        : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                    }`}
                  >
                    <platform.icon size={18} />
                    <div>
                      <p className="text-xs font-bold">{platform.name}</p>
                      <p className="text-[10px] opacity-60">{platform.width}x{platform.height}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-6 border-t border-white/5 pt-6">
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Resize Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "contain", icon: Minimize2, label: "Fit" },
                      { id: "cover", icon: Maximize2, label: "Fill" },
                      { id: "fill", icon: AlignJustify, label: "Stretch" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setResizeMode(mode.id as "contain" | "cover" | "fill")}
                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition ${
                          resizeMode === mode.id
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        <mode.icon size={16} />
                        <span className="text-[10px] font-bold uppercase">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {resizeMode === "contain" && (
                  <div>
                    <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-10 w-20 cursor-pointer rounded-lg bg-zinc-950 p-1 border border-white/10"
                      />
                      <span className="font-mono text-xs text-zinc-400 uppercase">{bgColor}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">Original Size</span>
                  <span className="font-mono text-white">{formatSize(file.size)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
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
                Resize
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
              ? "Adapting image for social media..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="Resizing Complete!"
          message={`Your image is now optimized for ${selectedPlatform.name}.`}
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
          }}
        />
      )}
    </div>
  );
}
