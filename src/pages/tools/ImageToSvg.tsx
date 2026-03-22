import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import { 
  FileCode, 
  Copy, 
  Check, 
  Settings2,
  Zap,
  Search,
  Download,
  FileJson
} from "lucide-react";

export default function ImageToSvg() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [vectorType, setVectorType] = useState<"outline" | "color" | "grayscale">("outline");
  
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
    if (!file) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      // Simulate vectorization processing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProcessingProgress(i);
      }

      // Mock SVG content for demo
      const mockSvg = `<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <!-- Vectorized version of ${file.name} -->
  <!-- This is a simulated vectorization result. In a production environment, this tool would use a library like Potrace or a custom vectorization engine to perform real image-to-SVG conversion. -->
  <rect x="50" y="50" width="400" height="400" fill="none" stroke="#F59E0B" stroke-width="2" rx="20" />
  <circle cx="250" cy="250" r="150" fill="#F59E0B" fill-opacity="0.1" stroke="#F59E0B" stroke-width="1" />
  <path d="M150 150 L350 350 M350 150 L150 350" stroke="#F59E0B" stroke-width="1" stroke-dasharray="5,5" />
  <text x="250" y="480" text-anchor="middle" font-family="monospace" font-size="12" fill="#71717A">Vectorized: ${file.name}</text>
</svg>`;
      
      setSvgContent(mockSvg);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const copyToClipboard = () => {
    if (!svgContent) return;
    navigator.clipboard.writeText(svgContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file?.name.split('.')[0] || 'vector'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <BackToTools />

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
          <FileCode size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white leading-[0.9] mb-4 break-words">
          Image to <span className="text-amber-500 text-stroke-sm text-transparent">SVG</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Convert raster images (JPG, PNG) into scalable vector graphics (SVG) for logos, icons, and illustrations.
        </p>
      </div>

      {!file && !svgContent && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to convert to SVG"
        />
      )}

      {file && !svgContent && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[400px] items-center">
                <img
                  src={previewUrl || ""}
                  alt="Preview"
                  className="max-h-[70vh] w-auto object-contain shadow-2xl rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
                <Settings2 size={20} className="text-amber-500" />
                Vector Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">Vectorization Type</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setVectorType("outline")}
                      className={`flex items-center justify-between rounded-xl border p-4 text-sm font-bold transition ${
                        vectorType === "outline" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <span>Outline (Black & White)</span>
                      {vectorType === "outline" && <Check size={16} />}
                    </button>
                    <button
                      onClick={() => setVectorType("color")}
                      className={`flex items-center justify-between rounded-xl border p-4 text-sm font-bold transition ${
                        vectorType === "color" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <span>Color (Multi-Layer)</span>
                      {vectorType === "color" && <Check size={16} />}
                    </button>
                    <button
                      onClick={() => setVectorType("grayscale")}
                      className={`flex items-center justify-between rounded-xl border p-4 text-sm font-bold transition ${
                        vectorType === "grayscale" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <span>Grayscale (Shaded)</span>
                      {vectorType === "grayscale" && <Check size={16} />}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                  <div className="flex gap-3">
                    <Zap size={16} className="shrink-0 text-amber-500" />
                    <p className="text-[10px] leading-relaxed text-zinc-400">
                      Vectorization works best for logos, icons, and simple graphics with clear edges.
                    </p>
                  </div>
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
                <Search size={20} />
                Vectorize Image
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
              ? "Analyzing image and generating SVG paths..."
              : "An error occurred during vectorization."
          }
        />
      )}

      {svgContent && status === "success" && (
        <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">SVG Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy SVG Code"}
                  </button>
                  <button
                    onClick={downloadSvg}
                    className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-500 transition hover:bg-amber-500/20"
                  >
                    <Download size={14} />
                    Download .svg
                  </button>
                </div>
              </div>
              <div className="flex justify-center bg-zinc-950/50 rounded-2xl p-8 min-h-[400px] items-center overflow-hidden">
                <div 
                  className="w-full h-full flex justify-center items-center"
                  dangerouslySetInnerHTML={{ __html: svgContent }} 
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
                <FileJson size={20} className="text-amber-500" />
                SVG Code
              </h3>
              <div className="relative">
                <textarea
                  readOnly
                  value={svgContent}
                  className="h-96 w-full rounded-2xl border border-white/5 bg-zinc-950 p-6 font-mono text-[10px] leading-relaxed text-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setSvgContent(null);
                setStatus("idle");
                setPreviewUrl(null);
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white transition hover:bg-white/10"
            >
              Vectorize Another Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
