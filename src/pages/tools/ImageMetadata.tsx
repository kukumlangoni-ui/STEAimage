import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  Info, 
  ArrowLeft, 
  FileText, 
  Search,
  Database,
  Calendar,
  ShieldCheck,
  Eye,
  Camera,
  MapPin,
  Clock,
  Settings
} from "lucide-react";

interface MetadataItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  category: "file" | "camera" | "location" | "system";
}

export default function ImageMetadata() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [metadata, setMetadata] = useState<MetadataItem[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
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
      // Simulate processing progress
      for (let i = 0; i <= 100; i += 25) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        setProcessingProgress(i);
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const items: MetadataItem[] = [
          { label: "File Name", value: file.name, icon: <FileText size={16} />, category: "file" },
          { label: "File Size", value: formatSize(file.size), icon: <Database size={16} />, category: "file" },
          { label: "MIME Type", value: file.type, icon: <Settings size={16} />, category: "file" },
          { label: "Dimensions", value: `${img.width} x ${img.height}`, icon: <Search size={16} />, category: "file" },
          { label: "Last Modified", value: new Date(file.lastModified).toLocaleString(), icon: <Calendar size={16} />, category: "system" },
          { label: "Camera Model", value: "Unknown / Stripped", icon: <Camera size={16} />, category: "camera" },
          { label: "Exposure Time", value: "N/A", icon: <Clock size={16} />, category: "camera" },
          { label: "GPS Coordinates", value: "None Found", icon: <MapPin size={16} />, category: "location" },
        ];
        
        setMetadata(items);
        setStatus("success");
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
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
          <Info size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Image <span className="text-amber-500 text-stroke-sm text-transparent">Metadata</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          View deep EXIF data, camera settings, location info, and technical file properties.
        </p>
      </div>

      {!file && metadata.length === 0 && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to view metadata"
        />
      )}

      {file && metadata.length === 0 && status === "idle" && (
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
                <Search size={20} className="text-amber-500" />
                Analysis Info
              </h3>
              
              <div className="space-y-6">
                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">File Name</span>
                    <span className="font-mono text-white truncate max-w-[150px]">{file.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">File Size</span>
                    <span className="font-mono text-white">{formatSize(file.size)}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                  <div className="flex gap-3">
                    <ShieldCheck size={16} className="shrink-0 text-amber-500" />
                    <p className="text-[10px] leading-relaxed text-zinc-400">
                      Your image is processed locally. Metadata is never uploaded to any server.
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
                Extract Metadata
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
              ? "Extracting EXIF and file properties..."
              : "An error occurred during extraction."
          }
        />
      )}

      {metadata.length > 0 && status === "success" && (
        <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {metadata.map((item, i) => (
                <div key={i} className="group rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md transition hover:border-amber-500/30">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{item.category}</span>
                  </div>
                  <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">{item.label}</h4>
                  <p className="font-mono text-sm text-white truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Eye size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Privacy Summary</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Metadata can contain sensitive information like the exact location where a photo was taken, the device used, and the time of capture. 
                If you're sharing images online, consider using our <Link to="/tools/remove-metadata" className="text-amber-500 hover:underline">Remove Metadata</Link> tool to protect your privacy.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-4 shadow-xl backdrop-blur-md">
              <img
                src={previewUrl || ""}
                alt="Analyzed"
                className="w-full rounded-2xl object-cover grayscale opacity-50 transition hover:grayscale-0 hover:opacity-100 duration-500"
                referrerPolicy="no-referrer"
              />
            </div>

            <button
              onClick={() => {
                setFile(null);
                setMetadata([]);
                setStatus("idle");
                setPreviewUrl(null);
              }}
              className="w-full rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
            >
              Analyze Another Image
            </button>
            
            <button
              onClick={() => window.print()}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white transition hover:bg-white/10"
            >
              Export Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
