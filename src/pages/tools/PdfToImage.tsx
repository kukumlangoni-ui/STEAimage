import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileImage, Download, RotateCcw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const fmt = (b: number) => { if(!b) return "0 B"; const k=1024,s=["B","KB","MB"]; const i=Math.floor(Math.log(b)/Math.log(k)); return `${parseFloat((b/Math.pow(k,i)).toFixed(1))} ${s[i]}`; };

declare global { interface Window { pdfjsLib: any } }

export default function PdfToImage() {
  const [file, setFile]         = useState<File|null>(null);
  const [status, setStatus]     = useState<"idle"|"loading"|"success"|"error">("idle");
  const [pages, setPages]       = useState<string[]>([]);
  const [scale, setScale]       = useState(2.0); // render scale (higher = better quality)
  const [format, setFormat]     = useState<"jpeg"|"png">("jpeg");
  const [error, setError]       = useState("");
  const fileRef                 = useRef<HTMLInputElement>(null);

  const loadLib = (): Promise<void> => new Promise((res, rej) => {
    if (window.pdfjsLib) { res(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      res();
    };
    s.onerror = () => rej(new Error("Failed to load PDF library"));
    document.head.appendChild(s);
  });

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
      setError("Please upload a PDF file."); setStatus("error"); return;
    }
    setFile(f); setPages([]); setError(""); setStatus("loading");
    try {
      await loadLib();
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const rendered: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page     = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas   = document.createElement("canvas");
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
        rendered.push(canvas.toDataURL(`image/${format}`, format === "jpeg" ? 0.92 : undefined));
      }

      setPages(rendered);
      setStatus("success");
    } catch (e: any) {
      console.error("[PdfToImage]", e);
      setError(e.message || "Failed to convert PDF.");
      setStatus("error");
    }
  };

  const reset = () => { setFile(null); setPages([]); setStatus("idle"); setError(""); };

  const downloadAll = () => {
    pages.forEach((url, i) => {
      const a = document.createElement("a");
      a.href = url; a.download = `page_${i+1}.${format}`; a.click();
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link to="/tools" className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16}/> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <FileImage size={32}/>
        </div>
        <h1 className="text-4xl font-black text-white">PDF to Image</h1>
        <p className="mt-2 text-zinc-400">Convert every page of a PDF into a high-quality image.</p>
      </div>

      {/* Settings */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["jpeg","png"] as const).map(f => (
          <button key={f} onClick={() => setFormat(f)}
            className={`rounded-xl border py-2.5 text-sm font-bold uppercase transition ${format===f?"border-amber-500 bg-amber-500/10 text-amber-400":"border-white/5 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800"}`}>
            {f}
          </button>
        ))}
        {([1.5,2.0,3.0] as const).map(s => (
          <button key={s} onClick={() => setScale(s)}
            className={`rounded-xl border py-2.5 text-sm font-bold transition ${scale===s?"border-amber-500 bg-amber-500/10 text-amber-400":"border-white/5 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800"}`}>
            {s === 1.5 ? "Fast" : s === 2.0 ? "HD" : "Ultra HD"}
          </button>
        ))}
      </div>

      {/* Upload */}
      {status === "idle" && (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-white/10 bg-zinc-900/40 py-16 cursor-pointer hover:border-amber-500/40 transition">
          <FileImage size={48} className="text-zinc-600"/>
          <div className="text-center">
            <p className="font-bold text-white text-lg">Upload PDF File</p>
            <p className="mt-1 text-sm text-zinc-500">Tap to browse · PDF files only</p>
          </div>
          <div className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-zinc-950">Browse PDF</div>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf"
            onChange={e => { const f=e.target.files?.[0]; if(f) handleFile(f); }} className="hidden"/>
        </div>
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/40 py-20">
          <Loader2 size={40} className="animate-spin text-amber-400"/>
          <p className="font-bold text-white">Converting PDF pages to images…</p>
          <p className="text-sm text-zinc-500">This may take a moment for large PDFs</p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-red-400"/>
          <p className="font-bold text-white">Conversion failed</p>
          <p className="mt-1 text-sm text-zinc-400">{error}</p>
          <button onClick={reset} className="mt-4 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">Try Again</button>
        </div>
      )}

      {status === "success" && pages.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-400 shrink-0"/>
              <p className="font-bold text-white">{pages.length} page{pages.length>1?"s":""} converted from {file?.name}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={reset}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition">
                <RotateCcw size={14}/> New PDF
              </button>
              <button onClick={downloadAll}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition">
                <Download size={14}/> Download All
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((url, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 transition hover:border-amber-500/30">
                <img src={url} alt={`Page ${i+1}`} className="w-full object-cover"/>
                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-zinc-950/90 to-transparent p-3 transition-transform group-hover:translate-y-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-300">Page {i+1}</span>
                    <a href={url} download={`page_${i+1}.${format}`}
                      className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition">
                      <Download size={12}/> Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
