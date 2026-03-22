import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import BackToTools from "../../components/ui/BackToTools";
import { 
  FileText, 
  Info, 
  Download, 
  Plus, 
  X, 
  Settings2, 
  Layout, 
  Maximize, 
  Minimize,
  Trash2
} from "lucide-react";
import { jsPDF } from "jspdf";

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [orientation, setOrientation] = useState<"p" | "l">("p");
  const [margin, setMargin] = useState(10);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpload = (uploadedFile: File | File[]) => {
    const newFiles = Array.isArray(uploadedFile) ? uploadedFile : [uploadedFile];
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    
    if (files.length === 0) {
      setTimeout(() => {
        workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processImages = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4"
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const availableWidth = pdfWidth - (margin * 2);
            const availableHeight = pdfHeight - (margin * 2);
            
            const imgRatio = img.width / img.height;
            const availableRatio = availableWidth / availableHeight;

            let finalWidth = availableWidth;
            let finalHeight = availableHeight;

            if (imgRatio > availableRatio) {
              finalHeight = availableWidth / imgRatio;
            } else {
              finalWidth = availableHeight * imgRatio;
            }

            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            if (i > 0) {
              pdf.addPage();
            }

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
              pdf.addImage(dataUrl, "JPEG", x, y, finalWidth, finalHeight);
            }

            URL.revokeObjectURL(objectUrl);
            resolve();
          };
          img.onerror = reject;
          img.src = objectUrl;
        });

        setProcessingProgress(((i + 1) / files.length) * 100);
      }

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setResultUrl(pdfUrl);
      setResultSize(pdfBlob.size);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <BackToTools />

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
          <FileText size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white leading-[0.9] mb-4 break-words">
          Image to <span className="text-amber-500 text-stroke-sm text-transparent">PDF</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Combine multiple images into a single, professional PDF document. Perfect for documents, portfolios, and sharing.
        </p>
      </div>

      {files.length === 0 && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload images to convert to PDF"
          multiple
        />
      )}

      {files.length > 0 && !resultUrl && status === "idle" && (
        <div ref={workspaceRef} className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-md">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Layout className="h-5 w-5 text-amber-500" />
                  Selected Images ({files.length})
                </h3>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-amber-400 shadow-lg shadow-amber-500/20">
                  <Plus size={16} />
                  Add More
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setFiles((prev) => [...prev, ...newFiles]);
                        setPreviewUrls((prev) => [...prev, ...newFiles.map((f: File) => URL.createObjectURL(f))]);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {files.map((file, index) => (
                  <div key={index} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/5 bg-zinc-950 shadow-lg">
                    <img
                      src={previewUrls[index]}
                      alt={`Preview ${index}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition duration-300 group-hover:opacity-100" />
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(previewUrls[index]);
                        setFiles((prev) => prev.filter((_, i) => i !== index));
                        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600 scale-0 group-hover:scale-100"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="truncate text-[10px] font-medium text-white">{file.name}</p>
                      <p className="text-[8px] text-zinc-400">{formatSize(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Settings2 size={20} className="text-amber-500" />
                PDF Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">Page Orientation</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrientation("p")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                        orientation === "p" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Maximize size={16} className="rotate-90" />
                      Portrait
                    </button>
                    <button
                      onClick={() => setOrientation("l")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                        orientation === "l" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Maximize size={16} />
                      Landscape
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">Page Margin: {margin}mm</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                    <span>None</span>
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Total Images</span>
                    <span className="font-mono text-white">{files.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Combined Size</span>
                    <span className="font-mono text-white">{formatSize(totalOriginalSize)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setFiles([])}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white transition hover:bg-white/10"
              >
                Clear
              </button>
              <button
                onClick={processImages}
                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
              >
                <Download size={20} />
                Generate PDF
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
              ? `Generating PDF with ${files.length} images...`
              : "An error occurred during PDF generation."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <ResultPanel
          title="PDF Ready!"
          message={`Successfully combined ${files.length} images into a single PDF document.`}
          downloadUrl={resultUrl}
          previewUrl="" // PDF preview is tricky in iframe, better to just show download
          fileInfo={{
            originalSize: formatSize(totalOriginalSize),
            newSize: formatSize(resultSize || 0),
            saved: "N/A"
          }}
          onReset={() => {
            setFiles([]);
            setResultUrl(null);
            setStatus("idle");
            setResultSize(null);
          }}
        />
      )}
    </div>
  );
}
