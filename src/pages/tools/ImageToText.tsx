import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../../components/ui/UploadDropzone";
import ProgressFeedback from "../../components/ui/ProgressFeedback";
import { 
  FileText, 
  ArrowLeft, 
  Copy, 
  Check, 
  Settings2,
  Info,
  Languages,
  Zap,
  Search,
  Download
} from "lucide-react";

export default function ImageToText() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState("eng");
  
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
      // Simulate OCR processing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProcessingProgress(i);
      }

      // Mock extracted text for demo
      const mockText = `EXTRACTED TEXT FROM: ${file.name}\n\nThis is a simulated OCR extraction result. In a production environment, this tool would use a library like Tesseract.js to perform real optical character recognition on your uploaded image.\n\nKey features of our OCR engine:\n- Support for multiple languages\n- High accuracy text detection\n- Preserves basic document structure\n- Fast client-side processing\n\nTo use real OCR, we would integrate Tesseract.js which runs entirely in your browser, ensuring your documents never leave your device.`;
      
      setExtractedText(mockText);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file?.name.split('.')[0] || 'extracted'}_text.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
          <FileText size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Image to <span className="text-amber-500 text-stroke-sm text-transparent">Text</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Extract text from images, scanned documents, and screenshots using advanced OCR technology.
        </p>
      </div>

      {!file && !extractedText && status === "idle" && (
        <UploadDropzone
          onUpload={handleUpload}
          title="Upload image to extract text"
        />
      )}

      {file && !extractedText && status === "idle" && (
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
                OCR Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">Document Language</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setLanguage("eng")}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition ${
                        language === "eng" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Languages size={14} />
                      English
                    </button>
                    <button
                      onClick={() => setLanguage("multi")}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition ${
                        language === "multi" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Languages size={14} />
                      Multi-Lang
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                  <div className="flex gap-3">
                    <Zap size={16} className="shrink-0 text-amber-500" />
                    <p className="text-[10px] leading-relaxed text-zinc-400">
                      High-contrast images with clear text work best for OCR extraction.
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
                Extract Text
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
              ? "Analyzing image and extracting text..."
              : "An error occurred during extraction."
          }
        />
      )}

      {extractedText && status === "success" && (
        <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Extracted Text</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={downloadText}
                    className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-500 transition hover:bg-amber-500/20"
                  >
                    <Download size={14} />
                    Download .txt
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={extractedText}
                className="h-96 w-full rounded-2xl border border-white/5 bg-zinc-950 p-6 font-mono text-sm leading-relaxed text-zinc-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
                <Info size={20} className="text-amber-500" />
                OCR Tips
              </h3>
              <div className="space-y-4 text-sm text-zinc-400">
                <p>• Ensure the text is not blurry or pixelated.</p>
                <p>• Good lighting and high contrast improve accuracy.</p>
                <p>• Handwritten text may have lower accuracy than printed text.</p>
                <p>• Large blocks of text are processed more efficiently.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setExtractedText(null);
                setStatus("idle");
                setPreviewUrl(null);
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 font-bold text-white transition hover:bg-white/10"
            >
              Extract from Another Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
