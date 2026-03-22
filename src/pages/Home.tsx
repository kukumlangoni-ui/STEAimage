import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Link as LinkIcon,
  FileText,
  Minimize2,
  Maximize2,
  Crop,
  RotateCw,
  FlipHorizontal,
  FileType2,
  Image as ImageIcon,
  Share2,
  Youtube,
  Droplet,
  Layers,
  Wand2,
  Sparkles,
  ScanText,
  EyeOff,
  Eraser,
  Smartphone,
  Zap,
  ShieldCheck,
  UserCheck,
  Globe,
  Send,
  Code,
  FileSearch,
  Type,
  Loader2
} from "lucide-react";

const ToolCard = ({ tool, disabled = false }: { tool: any, disabled?: boolean }) => (
  <Link
    to={disabled ? "#" : tool.path || "#"}
    className={`flex items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/50 p-4 transition ${
      disabled 
        ? "opacity-60 grayscale cursor-not-allowed" 
        : "hover:bg-zinc-800 hover:border-amber-500/30"
    }`}
  >
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${disabled ? 'bg-zinc-800 text-zinc-500' : 'bg-amber-500/10 text-amber-400'}`}>
      <tool.icon size={24} />
    </div>
    <div>
      <h3 className="font-bold text-white flex items-center gap-2">
        {tool.name}
        {disabled && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Coming Soon</span>}
      </h3>
      <p className="text-sm text-zinc-400 truncate max-w-[200px]">{tool.desc}</p>
    </div>
  </Link>
);

export default function Home() {
  const [feedback, setFeedback] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recentFiles, setRecentFiles] = useState<{ name: string; date: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("recentFiles");
    if (saved) {
      setRecentFiles(JSON.parse(saved));
    }
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('feedback').insert([
        {
          name: feedback.name || null,
          email: feedback.email || null,
          message: feedback.message,
          created_at: new Date()
        }
      ]);

      if (error) throw error;

      setSubmitted(true);
      setFeedback({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Error sending feedback:", err);
      alert("Samahani, imetokea hitilafu. Tafadhali jaribu tena baadae.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const coreTools = [
    { name: "Image to URL", desc: "Pata direct public link", icon: LinkIcon, path: "/tools/image-to-url" },
    { name: "Image to PDF", desc: "Badilisha picha kuwa PDF", icon: FileText, path: "/tools/image-to-pdf" },
    { name: "Merge to PDF", desc: "Unganisha picha kwenye PDF", icon: FileText, path: "/tools/image-to-pdf" },
    { name: "Compress Image", desc: "Punguza ukubwa wa picha", icon: Minimize2, path: "/tools/compress" },
    { name: "Bulk Compress", desc: "Punguza picha nyingi kwa pamoja", icon: Minimize2, path: "/tools/compress" },
    { name: "Resize Image", desc: "Badilisha vipimo vya picha", icon: Maximize2, path: "/tools/resize" },
    { name: "Resize by KB", desc: "Punguza picha kwa KB", icon: Maximize2, path: "/tools/resize" },
    { name: "Passport Photo", desc: "Tengeneza picha ya passport", icon: Crop, path: "/tools/crop" },
    { name: "Crop Image", desc: "Kata picha kwa usahihi", icon: Crop, path: "/tools/crop" },
    { name: "Rotate Image", desc: "Zungusha picha yako", icon: RotateCw, path: "/tools/rotate" },
    { name: "Flip Image", desc: "Geuza picha yako", icon: FlipHorizontal, path: "/tools/flip" },
    { name: "Convert to JPG", desc: "Badilisha kuwa format ya JPG", icon: FileType2, path: "/tools/convert-to-jpg" },
    { name: "Convert from JPG", desc: "Badilisha kutoka format ya JPG", icon: ImageIcon, path: "/tools/convert-from-jpg" },
    { name: "WEBP Converter", desc: "Badilisha picha kuwa WEBP", icon: FileType2, path: "/tools/convert-to-jpg" },
  ];

  const businessTools = [
    { name: "Social Media Resize", desc: "Kwa Instagram, Facebook, Twitter", icon: Share2, path: "/tools/social-media" },
    { name: "Instagram Grid", desc: "Kata picha kwa grid", icon: Crop, path: "/tools" },
    { name: "Thumbnail Generator", desc: "Tengeneza thumbnail ya YouTube", icon: Youtube, path: "/tools/thumbnail" },
    { name: "Watermark Image", desc: "Weka alama kwenye picha", icon: Droplet, path: "/tools/watermark" },
    { name: "Product Optimizer", desc: "Boresha picha za biashara", icon: Sparkles, path: "/tools" },
  ];

  const developerTools = [
    { name: "Favicon Generator", desc: "Tengeneza icon ya website", icon: Code, path: "/tools" },
    { name: "Base64 Converter", desc: "Badilisha picha kuwa Base64", icon: Code, path: "/tools" },
    { name: "Metadata Remover", desc: "Futa taarifa za siri", icon: ShieldCheck, path: "/tools/remove-metadata" },
    { name: "Format Detector", desc: "Tambua aina ya picha", icon: FileSearch, path: "/tools" },
  ];

  const generalTools = [
    { name: "Merge Images", desc: "Unganisha picha pamoja", icon: Layers, path: "/tools/merge" },
    { name: "Image Splitter", desc: "Gawa picha vipande vipande", icon: Crop, path: "/tools" },
    { name: "Add Text", desc: "Andika maneno kwenye picha", icon: Type, path: "/tools" },
  ];

  const aiTools = [
    { name: "Remove Background", desc: "Toa background ya picha", icon: Wand2 },
    { name: "AI Upscale", desc: "Ongeza ubora wa picha", icon: Sparkles },
    { name: "Image to Text (OCR)", desc: "Soma maneno kwenye picha", icon: ScanText },
    { name: "Blur Face", desc: "Ficha sura kwenye picha", icon: EyeOff },
    { name: "Smart Eraser", desc: "Futa vitu usivyotaka", icon: Eraser },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 bg-zinc-950 py-20 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">
            STEAimage Mobile: Every Image Tool You Need
          </h1>
          
          <div className="mt-10">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-4 font-bold text-zinc-950 transition hover:bg-amber-500 shadow-lg shadow-amber-500/20"
            >
              Tazama Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Files Section */}
      {recentFiles.length > 0 && (
        <section className="px-6 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Files</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentFiles.map((file, index) => (
              <div key={index} className="rounded-xl border border-white/5 bg-zinc-900/50 p-4">
                <p className="font-medium text-white truncate">{file.name}</p>
                <p className="text-sm text-zinc-400">{file.date}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tools Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 space-y-16">
        
        {/* Core Tools */}
        <div>
          <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3">
            <span className="text-amber-400">🔥 Core Tools</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {coreTools.map((tool) => <div key={tool.name}><ToolCard tool={tool} /></div>)}
          </div>
        </div>

        {/* Business Tools */}
        <div>
          <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3">
            <span className="text-amber-400">📊 Business Tools</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {businessTools.map((tool) => <div key={tool.name}><ToolCard tool={tool} /></div>)}
          </div>
        </div>

        {/* Developer Tools */}
        <div>
          <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3">
            <span className="text-amber-400">💻 Developer Tools</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {developerTools.map((tool) => <div key={tool.name}><ToolCard tool={tool} /></div>)}
          </div>
        </div>

        {/* General Tools */}
        <div>
          <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3">
            <span className="text-amber-400">🧠 General Tools</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {generalTools.map((tool) => <div key={tool.name}><ToolCard tool={tool} /></div>)}
          </div>
        </div>

        {/* Coming Soon (AI Tools) */}
        <div>
          <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3">
            <span className="text-amber-400">🚀 AI Tools</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {aiTools.map((tool) => <div key={tool.name}><ToolCard tool={tool} disabled /></div>)}
          </div>
        </div>

      </section>

      {/* About & Why Section */}
      <section className="border-y border-white/5 bg-zinc-900/30 py-20">
        <div className="mx-auto max-w-5xl px-6 grid gap-16 md:grid-cols-2">
          
          <div>
            <h2 className="text-3xl font-black text-white mb-6">STEAimage ni nini?</h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              STEAimage ni jukwaa la tools za picha kwa Kiswahili linalowasaidia Watanzania kubadilisha, kupunguza, na kuboresha picha kwa urahisi bila kutumia software nzito.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-black text-white mb-6">Kwanini STEAimage?</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-zinc-300">
                <Smartphone className="text-amber-400" size={20} /> Inafanya kazi kwenye simu
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <Zap className="text-amber-400" size={20} /> Haina gharama
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <UserCheck className="text-amber-400" size={20} /> Hahitaji login
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <ShieldCheck className="text-amber-400" size={20} /> Ni rahisi kutumia
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <Globe className="text-amber-400" size={20} /> Imetengenezwa kwa Watanzania
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white">Tuma Maoni yako</h2>
            <p className="mt-2 text-zinc-400">Maoni yako yanatusaidia kuboresha STEAimage.</p>
          </div>
          
          <form onSubmit={handleFeedbackSubmit} className="space-y-4 rounded-3xl border border-white/5 bg-zinc-900/50 p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Asante!</h3>
                <p className="text-zinc-400">Maoni yako yamepokelewa vizuri.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Jina (optional)"
                      value={feedback.name}
                      onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={feedback.email}
                      onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <textarea
                    required
                    placeholder="Maoni yako..."
                    rows={4}
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 font-bold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                  {isSubmitting ? 'Inatuma...' : 'Tuma Maoni'}
                </button>
              </>
            )}
          </form>
        </div>
      </section>

    </div>
  );
}
