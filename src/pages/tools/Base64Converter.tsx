import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Code, 
  ArrowLeft, 
  Copy, 
  Check, 
  Settings2,
  Info,
  FileCode,
  Globe
} from "lucide-react";

export default function Base64Converter() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [base64, setBase64] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<"raw" | "data-uri" | "css" | "html">("data-uri");
  
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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processImage = async () => {
    if (!file) return;
    setStatus("processing");
    setProcessingProgress(0);

    try {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setProcessingProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      reader.onload = () => {
        setBase64(reader.result as string);
        setProcessingProgress(100);
        setStatus("success");
      };
      reader.onerror = () => setStatus("error");
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const getFormattedOutput = () => {
    if (!base64) return "";
    const raw = base64.split(',')[1];
    switch (outputType) {
      case "raw": return raw;
      case "data-uri": return base64;
      case "css": return `background-image: url("${base64}");`;
      case "html": return `<img src="${base64}" alt="Base64 Image" />`;
      default: return base64;
    }
  };

  const copyToClipboard = () => {
    const text = getFormattedOutput();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <Code size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Base64 <span className="text-amber-500 text-stroke-sm text-transparent">Converter</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Convert images to Base64 strings for embedding directly into HTML, CSS, or JavaScript.
        </p>
      </div>

      {!file && !base64 && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to convert to Base64"
        />
      )}

      {file && !base64 && status === "idle" && (
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
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Settings2 size={20} className="text-amber-500" />
                Converter Info
              </h3>
              
              <div className="space-y-6">
                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">File Name</span>
                    <span className="font-mono text-white truncate max-w-[150px]">{file.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">File Type</span>
                    <span className="font-mono text-white uppercase">{file.type.split('/')[1]}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">File Size</span>
                    <span className="font-mono text-white">{formatSize(file.size)}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                  <div className="flex gap-3">
                    <Info size={16} className="shrink-0 text-amber-500" />
                    <p className="text-[10px] leading-relaxed text-zinc-400">
                      Base64 strings are ~33% larger than the original binary file. Use sparingly for small assets.
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
                <Code size={20} />
                Generate Base64
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
              ? "Generating Base64 string..."
              : "An error occurred during processing."
          }
        />
      )}

      {base64 && status === "success" && (
        <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Output String</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOutputType("data-uri")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${outputType === "data-uri" ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
                  >
                    Data URI
                  </button>
                  <button
                    onClick={() => setOutputType("raw")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${outputType === "raw" ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
                  >
                    Raw
                  </button>
                  <button
                    onClick={() => setOutputType("css")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${outputType === "css" ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
                  >
                    CSS
                  </button>
                  <button
                    onClick={() => setOutputType("html")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${outputType === "html" ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
                  >
                    HTML
                  </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                  readOnly
                  value={getFormattedOutput()}
                  className="h-96 w-full rounded-2xl border border-white/5 bg-zinc-950 p-6 font-mono text-xs leading-relaxed text-zinc-400 focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-zinc-950 shadow-lg transition hover:bg-amber-400"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "Copied!" : "Copy String"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <FileCode size={20} className="text-amber-500" />
                Usage Guide
              </h3>
              <div className="space-y-4 text-sm text-zinc-400">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-white">1</div>
                  <p>Choose the output format that fits your needs (Data URI is most common).</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-white">2</div>
                  <p>Copy the string and paste it directly into your code editor.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-white">3</div>
                  <p>No external hosting required—the image is embedded in the file.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setBase64(null);
                setStatus("idle");
                setPreviewUrl(null);
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white transition hover:bg-white/10"
            >
              Convert Another Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
