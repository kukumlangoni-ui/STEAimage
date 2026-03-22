import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Grid, 
  ArrowLeft, 
  Download, 
  Settings2,
  Info,
  CheckCircle2,
  LayoutGrid,
  Columns,
  Rows
} from "lucide-react";

export default function GridSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  
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
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        const urls: string[] = [];
        const cellWidth = img.width / columns;
        const cellHeight = img.height / rows;
        const totalCells = columns * rows;
        
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < columns; c++) {
            const canvas = document.createElement("canvas");
            canvas.width = cellWidth;
            canvas.height = cellHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(
                img,
                c * cellWidth, r * cellHeight, cellWidth, cellHeight,
                0, 0, cellWidth, cellHeight
              );
              urls.push(canvas.toDataURL(file.type));
            }
            setProcessingProgress(Math.round(((r * columns + c + 1) / totalCells) * 100));
            // Small delay to keep UI responsive
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        setResultUrls(urls);
        setStatus("success");
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const downloadAll = () => {
    resultUrls.forEach((url, index) => {
      const link = document.createElement("a");
      link.href = url;
      link.download = `split_${index + 1}.${file?.type.split('/')[1] || 'png'}`;
      link.click();
    });
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
          <Grid size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Grid <span className="text-amber-500 text-stroke-sm text-transparent">Splitter</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Split images into perfect grids for Instagram, banners, or creative layouts.
        </p>
      </div>

      {!file && resultUrls.length === 0 && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to split into grid"
        />
      )}

      {file && resultUrls.length === 0 && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[400px] items-center relative">
                <img
                  src={previewUrl || ""}
                  alt="Preview"
                  className="max-h-[70vh] w-auto object-contain shadow-2xl rounded-lg"
                  referrerPolicy="no-referrer"
                />
                
                {/* Grid Overlay */}
                <div className="absolute inset-4 pointer-events-none flex justify-center items-center">
                  <div 
                    className="grid border-2 border-amber-500/50"
                    style={{
                      width: '100%',
                      height: '100%',
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      gridTemplateRows: `repeat(${rows}, 1fr)`,
                      maxWidth: 'fit-content'
                    }}
                  >
                    {Array.from({ length: columns * rows }).map((_, i) => (
                      <div key={i} className="border border-amber-500/30 bg-amber-500/5" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Settings2 size={20} className="text-amber-500" />
                Grid Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">Grid Layout</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => { setColumns(3); setRows(3); }}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-[10px] font-bold transition ${
                        columns === 3 && rows === 3 ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <LayoutGrid size={16} />
                      3x3 Grid
                    </button>
                    <button
                      onClick={() => { setColumns(3); setRows(1); }}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-[10px] font-bold transition ${
                        columns === 3 && rows === 1 ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Columns size={16} />
                      3x1 Row
                    </button>
                    <button
                      onClick={() => { setColumns(1); setRows(3); }}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-[10px] font-bold transition ${
                        columns === 1 && rows === 3 ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Rows size={16} />
                      1x3 Col
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Columns</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={columns}
                      onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Rows</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={rows}
                      onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                  <div className="flex gap-3">
                    <Info size={16} className="shrink-0 text-amber-500" />
                    <p className="text-[10px] leading-relaxed text-zinc-400">
                      This will create {columns * rows} separate images. Perfect for Instagram profile grids.
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
                <Grid size={20} />
                Split Image
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
              ? `Splitting image into ${columns * rows} parts...`
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrls.length > 0 && status === "success" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Split Complete!</h2>
              <p className="text-zinc-400">Generated {resultUrls.length} images from your original file.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setResultUrls([]);
                  setStatus("idle");
                  setPreviewUrl(null);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Start Over
              </button>
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-zinc-950 shadow-lg transition hover:bg-amber-400"
              >
                <Download size={18} />
                Download All
              </button>
            </div>
          </div>

          <div 
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`
            }}
          >
            {resultUrls.map((url, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 p-2 shadow-xl backdrop-blur-md transition hover:border-amber-500/50">
                <img src={url} alt={`Split ${i + 1}`} className="w-full rounded-lg object-contain" />
                <div className="absolute inset-x-2 bottom-2 translate-y-full opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  <a
                    href={url}
                    download={`split_${i + 1}.${file?.type.split('/')[1] || 'png'}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950/90 py-2 text-[10px] font-bold text-white backdrop-blur-sm hover:bg-amber-500 hover:text-zinc-950"
                  >
                    <Download size={12} />
                    Part {i + 1}
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
