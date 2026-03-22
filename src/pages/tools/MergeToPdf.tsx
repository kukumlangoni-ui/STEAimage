import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Download, Trash2, RotateCcw, GripVertical, Plus, CheckCircle2 } from "lucide-react";
import UploadDropzone from "../../components/ui/UploadDropzone";

const fmt = (b: number) => { if (!b) return "0 B"; const k=1024,s=["B","KB","MB"]; const i=Math.floor(Math.log(b)/Math.log(k)); return `${parseFloat((b/Math.pow(k,i)).toFixed(1))} ${s[i]}`; };

export default function MergeToPdf() {
  const [files, setFiles]       = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus]     = useState<"idle"|"processing"|"success"|"error">("idle");
  const [pdfUrl, setPdfUrl]     = useState<string|null>(null);
  const [pdfSize, setPdfSize]   = useState(0);
  const [pageSize, setPageSize] = useState<"A4"|"Letter"|"fit">("fit");
  const [orientation, setOrientation] = useState<"portrait"|"landscape">("portrait");

  const addFiles = (f: File) => {
    setFiles(prev => [...prev, f]);
    setPreviews(prev => [...prev, URL.createObjectURL(f)]);
    setPdfUrl(null);
  };

  const removeFile = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setFiles(prev => prev.filter((_,j) => j !== i));
    setPreviews(prev => prev.filter((_,j) => j !== i));
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    setFiles(prev => { const a=[...prev]; [a[i-1],a[i]]=[a[i],a[i-1]]; return a; });
    setPreviews(prev => { const a=[...prev]; [a[i-1],a[i]]=[a[i],a[i-1]]; return a; });
  };

  const generate = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    try {
      // Load jsPDF from CDN if not present
      if (!(window as any).jspdf) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          s.onload = () => res(); s.onerror = () => rej(new Error("jsPDF load failed"));
          document.head.appendChild(s);
        });
      }
      const { jsPDF } = (window as any).jspdf;

      const loadImg = (url: string): Promise<HTMLImageElement> => new Promise((res, rej) => {
        const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = url;
      });

      const imgs = await Promise.all(previews.map(loadImg));

      // Page dimensions
      const mmW = pageSize === "A4" ? 210 : pageSize === "Letter" ? 215.9 : null;
      const mmH = pageSize === "A4" ? 297  : pageSize === "Letter" ? 279.4 : null;

      const first = imgs[0];
      const pW = mmW ?? (orientation === "portrait" ? 210 : 297);
      const pH = mmH ?? (orientation === "portrait" ? 297 : 210);

      const pdf = new jsPDF({
        orientation: orientation === "landscape" ? "landscape" : "portrait",
        unit: "mm",
        format: pageSize === "fit" ? [pW, pH] : pageSize.toLowerCase(),
      });

      imgs.forEach((img, i) => {
        if (i > 0) pdf.addPage();
        let docW = pdf.internal.pageSize.getWidth();
        let docH = pdf.internal.pageSize.getHeight();

        if (pageSize === "fit") {
          // fit canvas to image aspect ratio
          const aspect = img.width / img.height;
          docW = orientation === "portrait" ? 210 : 297;
          docH = docW / aspect;
          pdf.internal.pageSize.width  = docW;
          pdf.internal.pageSize.height = docH;
        }

        // Scale image to fill page (contain)
        const scale = Math.min(docW / img.width * 3.7795, docH / img.height * 3.7795);
        const dw = img.width * scale / 3.7795;
        const dh = img.height * scale / 3.7795;
        const x  = (docW - dw) / 2;
        const y  = (docH - dh) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const ext = "JPEG";
        pdf.addImage(dataUrl, ext, x, y, dw, dh);
      });

      const blob = pdf.output("blob");
      const url  = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfSize(blob.size);
      setStatus("success");
    } catch (e) {
      console.error("[MergeToPDF]", e);
      setStatus("error");
    }
  };

  const reset = () => {
    previews.forEach(u => URL.revokeObjectURL(u));
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setFiles([]); setPreviews([]); setPdfUrl(null); setStatus("idle");
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link to="/tools" className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16}/> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <FileText size={32}/>
        </div>
        <h1 className="text-4xl font-black text-white">Merge Images to PDF</h1>
        <p className="mt-2 text-zinc-400">Combine multiple images into one PDF file. Drag to reorder.</p>
      </div>

      {/* Settings row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["fit","A4","Letter"] as const).map(s => (
          <button key={s} onClick={() => setPageSize(s)}
            className={`rounded-xl border py-2.5 text-sm font-bold transition ${pageSize===s?"border-amber-500 bg-amber-500/10 text-amber-400":"border-white/5 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800"}`}>
            {s === "fit" ? "Fit to Image" : s}
          </button>
        ))}
        <button onClick={() => setOrientation(o => o==="portrait"?"landscape":"portrait")}
          className="rounded-xl border border-white/5 bg-zinc-900/40 py-2.5 text-sm font-bold text-zinc-400 hover:bg-zinc-800 transition capitalize">
          {orientation} ↕
        </button>
      </div>

      <UploadDropzone onUpload={addFiles} title="Add images (tap to add more)" accept="image/jpeg,image/png,image/webp"/>

      {files.length > 0 && (
        <div className="mt-6 space-y-6">
          {/* Image list */}
          <div className="space-y-2">
            {files.map((f,i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                <button onClick={() => moveUp(i)} disabled={i===0}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/10 disabled:opacity-20 transition">
                  <GripVertical size={16}/>
                </button>
                <img src={previews[i]} alt={f.name} className="h-14 w-14 shrink-0 rounded-lg object-cover bg-zinc-800"/>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-white">{f.name}</p>
                  <p className="text-xs text-zinc-500">Page {i+1} · {fmt(f.size)}</p>
                </div>
                <button onClick={() => removeFile(i)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition">
                  <Trash2 size={15}/>
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3 text-center text-sm text-zinc-400">
            {files.length} image{files.length>1?"s":""} · Will create a {files.length}-page PDF
          </div>

          {status === "error" && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center text-sm text-red-400 font-bold">
              Failed to generate PDF. Try again.
            </div>
          )}

          {status === "success" && pdfUrl && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex flex-col sm:flex-row items-center gap-4">
              <CheckCircle2 size={28} className="text-emerald-400 shrink-0"/>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-bold text-white">PDF ready! ({fmt(pdfSize)}, {files.length} pages)</p>
                <p className="text-xs text-zinc-400 mt-1">Your PDF has been generated in the browser.</p>
              </div>
              <a href={pdfUrl} download={`merged_${Date.now()}.pdf`}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-zinc-950 hover:bg-emerald-400 transition">
                <Download size={18}/> Download PDF
              </a>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-white hover:bg-white/10 transition">
              <RotateCcw size={16}/> Clear All
            </button>
            <button onClick={generate} disabled={status==="processing" || files.length===0}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg hover:bg-amber-400 disabled:opacity-50 transition">
              {status==="processing" ? "Generating PDF…" : <><FileText size={18}/> Generate PDF</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
