import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import { 
  Layers, 
  X, 
  Plus, 
  Download, 
  MoveHorizontal, 
  MoveVertical, 
  Grid as GridIcon,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Maximize,
  AlignCenter,
  AlignLeft,
  AlignRight
} from "lucide-react";

type FitMode = "contain" | "cover" | "original" | "stretch";
type LayoutMode = "horizontal" | "vertical" | "grid";
type Alignment = "start" | "center" | "end";

export default function MergeImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  
  const [layout, setLayout] = useState<LayoutMode>("horizontal");
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [alignment, setAlignment] = useState<Alignment>("center");
  const [spacing, setSpacing] = useState(10);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [gridColumns, setGridColumns] = useState(2);
  
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpload = (uploadedFile: File) => {
    addFiles([uploadedFile]);
  };

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newUrls]);
    
    // Scroll to workspace if it's the first upload
    if (files.length === 0) {
      setTimeout(() => {
        workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    const newFiles = [...files];
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    setFiles(newFiles);

    const newUrls = [...previewUrls];
    [newUrls[index], newUrls[newIndex]] = [newUrls[newIndex], newUrls[index]];
    setPreviewUrls(newUrls);
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (files.length > 0 && previewUrls.length === files.length && canvasRef.current) {
      const drawPreview = async () => {
        const images = await Promise.all(
          previewUrls.map((url) => {
            return new Promise<HTMLImageElement>((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.src = url;
            });
          })
        );

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let canvasWidth = 0;
        let canvasHeight = 0;

          if (layout === "horizontal") {
            if (fitMode === "original") {
              canvasWidth = images.reduce((sum, img) => sum + img.width, 0) + spacing * (images.length - 1);
              canvasHeight = Math.max(...images.map((img) => img.height));
            } else {
              const targetHeight = 800;
              canvasHeight = targetHeight;
              canvasWidth = images.reduce((sum, img) => {
                if (fitMode === "stretch") return sum + 800;
                const ratio = img.width / img.height;
                return sum + targetHeight * ratio;
              }, 0) + spacing * (images.length - 1);
            }
          } else if (layout === "vertical") {
            if (fitMode === "original") {
              canvasWidth = Math.max(...images.map((img) => img.width));
              canvasHeight = images.reduce((sum, img) => sum + img.height, 0) + spacing * (images.length - 1);
            } else {
              const targetWidth = 800;
              canvasWidth = targetWidth;
              canvasHeight = images.reduce((sum, img) => {
                if (fitMode === "stretch") return sum + 800;
                const ratio = img.height / img.width;
                return sum + targetWidth * ratio;
              }, 0) + spacing * (images.length - 1);
            }
          } else if (layout === "grid") {
          const rows = Math.ceil(images.length / gridColumns);
          const cellWidth = 800;
          const cellHeight = 800;
          canvasWidth = cellWidth * gridColumns + spacing * (gridColumns - 1);
          canvasHeight = cellHeight * rows + spacing * (rows - 1);
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let currentX = 0;
        let currentY = 0;

        images.forEach((img, i) => {
          let drawWidth = img.width;
          let drawHeight = img.height;
          let x = 0;
          let y = 0;

          if (layout === "horizontal") {
            if (fitMode === "stretch") {
              drawHeight = canvasHeight;
              drawWidth = (canvasWidth - spacing * (images.length - 1)) / images.length;
            } else if (fitMode !== "original") {
              drawHeight = canvasHeight;
              drawWidth = canvasHeight * (img.width / img.height);
            }
            x = currentX;
            if (alignment === "center") y = (canvasHeight - drawHeight) / 2;
            else if (alignment === "end") y = canvasHeight - drawHeight;
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
            currentX += drawWidth + spacing;
          } else if (layout === "vertical") {
            if (fitMode === "stretch") {
              drawWidth = canvasWidth;
              drawHeight = (canvasHeight - spacing * (images.length - 1)) / images.length;
            } else if (fitMode !== "original") {
              drawWidth = canvasWidth;
              drawHeight = canvasWidth * (img.height / img.width);
            }
            y = currentY;
            if (alignment === "center") x = (canvasWidth - drawWidth) / 2;
            else if (alignment === "end") x = canvasWidth - drawWidth;
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
            currentY += drawHeight + spacing;
          } else if (layout === "grid") {
            const row = Math.floor(i / gridColumns);
            const col = i % gridColumns;
            const cellW = (canvasWidth - spacing * (gridColumns - 1)) / gridColumns;
            const cellH = (canvasHeight - spacing * (Math.ceil(images.length / gridColumns) - 1)) / Math.ceil(images.length / gridColumns);
            
            x = col * (cellW + spacing);
            y = row * (cellH + spacing);

            if (fitMode === "contain") {
              const ratio = Math.min(cellW / img.width, cellH / img.height);
              drawWidth = img.width * ratio;
              drawHeight = img.height * ratio;
              x += (cellW - drawWidth) / 2;
              y += (cellH - drawHeight) / 2;
              ctx.drawImage(img, x, y, drawWidth, drawHeight);
            } else if (fitMode === "cover") {
              const ratio = Math.max(cellW / img.width, cellH / img.height);
              drawWidth = img.width * ratio;
              drawHeight = img.height * ratio;
              const offsetX = (drawWidth - cellW) / 2;
              const offsetY = (drawHeight - cellH) / 2;
              ctx.drawImage(img, offsetX, offsetY, img.width - (offsetX * 2 / ratio), img.height - (offsetY * 2 / ratio), x, y, cellW, cellH);
            } else {
              ctx.drawImage(img, x, y, cellW, cellH);
            }
          }
        });
      };

      drawPreview();
    }
  }, [files, previewUrls, layout, fitMode, alignment, spacing, bgColor, gridColumns]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processImage = async () => {
    if (files.length < 2 || !canvasRef.current) return;
    
    setStatus("processing");
    setProcessingProgress(0);

    try {
      for (let i = 0; i <= 100; i += 25) {
        setProcessingProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      const canvas = canvasRef.current;
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png");
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

  const clearAll = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviewUrls([]);
    setResultUrl(null);
    setStatus("idle");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <BackToTools />

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
          <Layers size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Merge <span className="text-amber-500 text-stroke-sm text-transparent">Images</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Combine multiple images into a single composition. Side-by-side, vertical, or grid.
        </p>
      </div>

      {!resultUrl && status === "idle" && (
        <div className="space-y-8">
          <UploadDropzone
            onUpload={handleUpload}
            onUploadMultiple={addFiles}
            multiple={true}
            title={files.length > 0 ? "Add more images" : "Upload images to merge"}
          />

          {files.length > 0 && (
            <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="lg:col-span-8">
                <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
                  <div className="flex justify-center bg-zinc-950/50 rounded-2xl p-4 min-h-[600px] items-center overflow-auto">
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
                    <Plus size={20} className="text-amber-500" />
                    Merge Settings
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Layout Mode
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "horizontal", icon: MoveHorizontal, label: "Horizontal" },
                          { id: "vertical", icon: MoveVertical, label: "Vertical" },
                          { id: "grid", icon: GridIcon, label: "Grid" },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setLayout(mode.id as LayoutMode)}
                            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition ${
                              layout === mode.id
                                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                                : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                            }`}
                          >
                            <mode.icon size={20} />
                            <span className="text-[10px] font-bold uppercase">{mode.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {layout === "grid" && (
                      <div>
                        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Grid Columns: {gridColumns}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={gridColumns}
                          onChange={(e) => setGridColumns(parseInt(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Fit Mode
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "contain", icon: Minimize2, label: "Contain" },
                          { id: "cover", icon: Maximize2, label: "Cover" },
                          { id: "stretch", icon: Maximize, label: "Stretch" },
                          { id: "original", icon: Layers, label: "Original" },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setFitMode(mode.id as FitMode)}
                            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition ${
                              fitMode === mode.id
                                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                                : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                            }`}
                          >
                            <mode.icon size={18} />
                            <span className="text-[10px] font-bold uppercase">{mode.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "start", icon: AlignLeft, label: "Start" },
                          { id: "center", icon: AlignCenter, label: "Center" },
                          { id: "end", icon: AlignRight, label: "End" },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setAlignment(mode.id as Alignment)}
                            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition ${
                              alignment === mode.id
                                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                                : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                            }`}
                          >
                            <mode.icon size={18} />
                            <span className="text-[10px] font-bold uppercase">{mode.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Spacing: {spacing}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={spacing}
                        onChange={(e) => setSpacing(parseInt(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

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

                    <div className="pt-4 border-t border-white/5">
                      <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Manage Images ({files.length})
                      </label>
                      <div className="space-y-2">
                        {previewUrls.map((url, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-xl bg-zinc-950 p-2 border border-white/5 group">
                            <img src={url} className="h-10 w-10 object-cover rounded-lg" />
                            <span className="flex-1 truncate text-xs text-zinc-400">{files[i].name}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={() => moveFile(i, 'up')} className="p-1 text-zinc-500 hover:text-white"><ChevronUp size={14} /></button>
                              <button onClick={() => moveFile(i, 'down')} className="p-1 text-zinc-500 hover:text-white"><ChevronDown size={14} /></button>
                              <button onClick={() => removeFile(i)} className="p-1 text-red-500 hover:text-red-400"><X size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/5 py-3 text-xs font-bold text-zinc-400 transition hover:bg-white/10 hover:text-white">
                          <Plus size={14} />
                          Add More
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                addFiles(Array.from(e.target.files));
                              }
                            }}
                          />
                        </label>
                        <button
                          onClick={() => {
                            previewUrls.forEach(url => URL.revokeObjectURL(url));
                            setFiles([]);
                            setPreviewUrls([]);
                          }}
                          className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
                        >
                          <X size={14} />
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={processImage}
                    disabled={files.length < 2}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={20} />
                    Merge
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(status === "processing" || status === "error") && (
        <ProgressFeedback
          status={status}
          processingProgress={processingProgress}
          message={
            status === "processing"
              ? "Stitching images together..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="Merge Complete!"
          message="Your images have been successfully combined into one."
          previewUrl={resultUrl}
          downloadUrl={resultUrl}
          fileInfo={{
            originalSize: formatSize(files.reduce((acc, f) => acc + f.size, 0)),
            newSize: formatSize(resultSize || 0),
            saved: "N/A"
          }}
          onReset={() => {
            setFiles([]);
            setResultUrl(null);
            setStatus("idle");
            setPreviewUrls([]);
            setResultSize(null);
          }}
        />
      )}
    </div>
  );
}
