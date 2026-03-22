import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ResultPanel from "../../components/ui/ResultPanel";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Link as LinkIcon, 
  ArrowLeft, 
  Copy, 
  Check, 
  Globe, 
  Shield, 
  Sparkles, 
  FileCode,
  ExternalLink,
  Code
} from "lucide-react";

export default function ImageToUrl() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [base64Url, setBase64Url] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<"link" | "base64" | null>(null);
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
      // Progress simulation
      for (let i = 0; i <= 100; i += 20) {
        setProcessingProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      // 1. Generate a local Blob URL (works for current session)
      const blobUrl = URL.createObjectURL(file);
      setResultUrl(blobUrl);

      // 2. Generate a Base64 Data URL (works everywhere, but long)
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Url(reader.result as string);
        setStatus("success");
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const copyToClipboard = (text: string, type: "link" | "base64") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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
          <LinkIcon size={40} />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider text-amber-300">
          <Sparkles size={14} />
          <span>STEA Exclusive</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Image to <span className="text-amber-500 text-stroke-sm text-transparent">URL</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Convert your images into Data URLs (Base64) or local links for instant embedding and sharing.
        </p>
      </div>

      {!file && !resultUrl && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to generate URL"
        />
      )}

      {file && !resultUrl && status === "idle" && (
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
                <Globe size={20} className="text-amber-500" />
                Link Generation
              </h3>
              
              <div className="space-y-6">
                <div className="rounded-xl bg-zinc-950/50 p-4 border border-white/5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                      <Check size={12} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Local Blob URL</p>
                      <p className="mt-1 text-[10px] text-zinc-500">Temporary link for current session. Fast and lightweight.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                      <Check size={12} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Base64 Data URL</p>
                      <p className="mt-1 text-[10px] text-zinc-500">Permanent string representation. Embed directly in code.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">File Size</span>
                    <span className="font-mono text-white">{formatSize(file.size)}</span>
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
                <LinkIcon size={20} />
                Generate Links
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
              ? "Generating your secure links..."
              : "An error occurred during processing."
          }
        />
      )}

      {resultUrl && status === "success" && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                <Check size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Links Generated Successfully!</h2>
              <p className="text-zinc-400">Copy the link format that best suits your needs.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="group space-y-4 rounded-2xl bg-zinc-950/50 p-6 border border-white/5 transition hover:border-amber-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-bold text-white">
                    <Globe size={18} className="text-amber-500" />
                    Local Blob URL
                  </h3>
                  <span className="rounded-full bg-zinc-900 px-2 py-1 text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Session Only</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">A temporary URL that works only in your current browser session. Great for testing and local development.</p>
                <div className="flex items-center gap-2 rounded-xl bg-zinc-900 p-2 border border-white/5 group-hover:border-white/10 transition">
                  <input
                    readOnly
                    value={resultUrl}
                    className="flex-1 bg-transparent px-2 text-xs font-mono text-zinc-400 outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(resultUrl || "", "link")}
                    className="rounded-lg bg-amber-500 p-2 text-zinc-950 transition hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                  >
                    {copied === "link" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="group space-y-4 rounded-2xl bg-zinc-950/50 p-6 border border-white/5 transition hover:border-amber-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-bold text-white">
                    <Code size={18} className="text-amber-500" />
                    Base64 Data URL
                  </h3>
                  <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[8px] uppercase tracking-widest text-amber-500 font-bold">Permanent</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">A permanent string representation of your image. Can be embedded directly in HTML/CSS without external files.</p>
                <div className="flex items-center gap-2 rounded-xl bg-zinc-900 p-2 border border-white/5 group-hover:border-white/10 transition">
                  <input
                    readOnly
                    value={base64Url?.substring(0, 50) + "..."}
                    className="flex-1 bg-transparent px-2 text-xs font-mono text-zinc-400 outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(base64Url || "", "base64")}
                    className="rounded-lg bg-amber-500 p-2 text-zinc-950 transition hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                  >
                    {copied === "base64" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  setFile(null);
                  setResultUrl(null);
                  setBase64Url(null);
                  setStatus("idle");
                }}
                className="rounded-full border border-white/10 bg-white/5 px-8 py-3 font-bold text-white transition hover:bg-white/10"
              >
                Upload Another Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
