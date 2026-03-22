import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Download, RefreshCw, QrCode, Wifi, Phone,
  Mail, MessageSquare, Globe, Type, ImagePlus, X, Upload
} from "lucide-react";

type QRType = "url" | "text" | "phone" | "whatsapp" | "email" | "wifi";

const TYPES: { id: QRType; label: string; icon: React.ElementType; placeholder: string }[] = [
  { id: "url",      label: "URL",      icon: Globe,         placeholder: "https://example.com" },
  { id: "text",     label: "Text",     icon: Type,          placeholder: "Enter any text..." },
  { id: "phone",    label: "Phone",    icon: Phone,         placeholder: "+255712345678" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, placeholder: "+255712345678" },
  { id: "email",    label: "Email",    icon: Mail,          placeholder: "hello@example.com" },
  { id: "wifi",     label: "WiFi",     icon: Wifi,          placeholder: "NetworkName" },
];

function buildContent(type: QRType, value: string, wifiPass: string, wifiSec: string) {
  switch (type) {
    case "phone":    return `tel:${value}`;
    case "whatsapp": return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
    case "email":    return `mailto:${value}`;
    case "wifi":     return `WIFI:T:${wifiSec};S:${value};P:${wifiPass};;`;
    default:         return value;
  }
}

declare global { interface Window { QRCode: any } }

export default function QRCodeGenerator() {
  const [qrType, setQrType]         = useState<QRType>("url");
  const [value, setValue]           = useState("");
  const [wifiPass, setWifiPass]     = useState("");
  const [wifiSec, setWifiSec]       = useState("WPA");
  const [size, setSize]             = useState(300);
  const [fg, setFg]                 = useState("#000000");
  const [bg, setBg]                 = useState("#ffffff");
  const [margin, setMargin]         = useState(2);
  const [libReady, setLibReady]     = useState(!!window.QRCode);
  const [error, setError]           = useState("");
  const [hasQR, setHasQR]           = useState(false);

  // Logo overlay state
  const [logoFile, setLogoFile]     = useState<File | null>(null);
  const [logoSrc, setLogoSrc]       = useState<string | null>(null);
  const [logoSize, setLogoSize]     = useState(22); // % of QR size
  const logoInputRef                = useRef<HTMLInputElement>(null);

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const hiddenRef  = useRef<HTMLDivElement | null>(null);

  // Load qrcodejs from CDN
  useEffect(() => {
    if (window.QRCode) { setLibReady(true); return; }
    const s = document.createElement("script");
    s.src     = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.onload  = () => setLibReady(true);
    s.onerror = () => setError("Failed to load QR library. Check internet connection.");
    document.head.appendChild(s);
  }, []);

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    const url = URL.createObjectURL(f);
    setLogoSrc(url);
  };

  const removeLogo = () => {
    if (logoSrc) URL.revokeObjectURL(logoSrc);
    setLogoFile(null);
    setLogoSrc(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // Overlay logo on centre of QR canvas
  const overlayLogo = useCallback((qrCanvas: HTMLCanvasElement): Promise<void> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas || !logoSrc) { resolve(); return; }

      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(); return; }

      const logoImg = new Image();
      logoImg.onload = () => {
        const lSize = Math.round(canvas.width * (logoSize / 100));
        const lx    = Math.round((canvas.width  - lSize) / 2);
        const ly    = Math.round((canvas.height - lSize) / 2);
        const pad   = 6;

        // White rounded background behind logo
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(lx - pad, ly - pad, lSize + pad * 2, lSize + pad * 2, 10);
        ctx.fill();

        // Draw logo
        ctx.drawImage(logoImg, lx, ly, lSize, lSize);
        resolve();
      };
      logoImg.onerror = () => resolve(); // skip if logo fails
      logoImg.src = logoSrc;
    });
  }, [logoSrc, logoSize]);

  const renderQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!libReady || !canvas || !value.trim()) return;
    setError("");

    const content = buildContent(qrType, value.trim(), wifiPass, wifiSec);

    // Clean up previous hidden div
    if (hiddenRef.current) {
      try { document.body.removeChild(hiddenRef.current); } catch {}
    }

    const tmp = document.createElement("div");
    tmp.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;";
    document.body.appendChild(tmp);
    hiddenRef.current = tmp;

    try {
      new window.QRCode(tmp, {
        text:         content,
        width:        size,
        height:       size,
        colorDark:    fg,
        colorLight:   bg,
        correctLevel: window.QRCode.CorrectLevel.H, // H = 30% error correction — needed for logo overlay
      });

      requestAnimationFrame(async () => {
        const srcCanvas = tmp.querySelector("canvas") as HTMLCanvasElement | null;

        const drawToDisplay = (source: CanvasImageSource) => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const mPx  = margin * 4;
          const total = size + mPx * 2;
          canvas.width  = total;
          canvas.height = total;
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, total, total);
          ctx.drawImage(source, mPx, mPx, size, size);
        };

        if (srcCanvas) {
          drawToDisplay(srcCanvas);
          if (logoSrc) await overlayLogo(srcCanvas);
          setHasQR(true);
        } else {
          // Fallback img path
          const img = tmp.querySelector("img") as HTMLImageElement | null;
          if (img) {
            const finish = async () => {
              drawToDisplay(img);
              if (logoSrc) await overlayLogo(img as any);
              setHasQR(true);
            };
            if (img.complete) await finish();
            else img.onload = finish;
          } else {
            setError("QR render failed.");
          }
        }

        try { document.body.removeChild(tmp); hiddenRef.current = null; } catch {}
      });
    } catch (e: any) {
      setError("Could not generate QR. Check your input.");
      try { document.body.removeChild(tmp); hiddenRef.current = null; } catch {}
    }
  }, [libReady, value, qrType, wifiPass, wifiSec, size, fg, bg, margin, logoSrc, overlayLogo]);

  useEffect(() => {
    if (value.trim()) renderQR();
    else setHasQR(false);
  }, [renderQR]);

  useEffect(() => () => {
    if (hiddenRef.current) try { document.body.removeChild(hiddenRef.current); } catch {}
    if (logoSrc) URL.revokeObjectURL(logoSrc);
  }, []);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href     = canvas.toDataURL("image/png");
    a.download = `STEAimage_QR_${Date.now()}.png`;
    a.click();
  };

  const currentType = TYPES.find(t => t.id === qrType)!;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link to="/tools"
        className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16} /> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <QrCode size={32} />
        </div>
        <h1 className="text-4xl font-black text-white">QR Code Generator</h1>
        <p className="mt-2 text-zinc-400">Generate custom QR codes — with optional logo/image in the center.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Left: settings ── */}
        <div className="space-y-4">

          {/* QR Type */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">QR Type</h3>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => (
                <button key={t.id} onClick={() => { setQrType(t.id); setValue(""); setHasQR(false); }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-bold transition
                    ${qrType === t.id
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"}`}>
                  <t.icon size={18} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Content</h3>
            {qrType === "wifi" ? (
              <div className="space-y-3">
                <input value={value} onChange={e => setValue(e.target.value)}
                  placeholder="Network name (SSID)"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none" />
                <input value={wifiPass} onChange={e => setWifiPass(e.target.value)}
                  placeholder="Password" type="password"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none" />
                <div className="grid grid-cols-3 gap-2">
                  {["WPA","WEP","nopass"].map(s => (
                    <button key={s} onClick={() => setWifiSec(s)}
                      className={`rounded-xl border py-2 text-xs font-bold transition
                        ${wifiSec === s ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 text-zinc-400 hover:bg-zinc-900"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : qrType === "text" ? (
              <textarea value={value} onChange={e => setValue(e.target.value)}
                placeholder={currentType.placeholder} rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none" />
            ) : (
              <input value={value} onChange={e => setValue(e.target.value)}
                placeholder={currentType.placeholder}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none" />
            )}
          </div>

          {/* ── Logo / Image overlay ── */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <h3 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <ImagePlus size={14} /> Logo / Image (optional)
            </h3>
            <p className="mb-3 text-[11px] text-zinc-500">
              Upload your brand logo or any image — it will appear in the center of the QR code.
            </p>

            {!logoFile ? (
              <button onClick={() => logoInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-500/30 bg-zinc-950/50 py-5 text-sm font-bold text-amber-400 transition hover:border-amber-500/60 hover:bg-amber-500/5">
                <Upload size={18} /> Upload Logo / Image
              </button>
            ) : (
              <div className="space-y-3">
                {/* Logo preview */}
                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-950 px-3 py-2">
                  <img src={logoSrc || ""} alt="Logo"
                    className="h-10 w-10 rounded-lg object-contain bg-white/5" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-white">{logoFile.name}</p>
                    <p className="text-xs text-zinc-500">Centered on QR code</p>
                  </div>
                  <button onClick={removeLogo}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition">
                    <X size={16} />
                  </button>
                </div>

                {/* Logo size control */}
                <div>
                  <div className="mb-1.5 flex justify-between">
                    <label className="text-xs font-bold text-zinc-500">Logo Size</label>
                    <span className="text-xs font-bold text-amber-400">{logoSize}% of QR</span>
                  </div>
                  <input type="range" min={10} max={35} step={1} value={logoSize}
                    onChange={e => setLogoSize(+e.target.value)}
                    className="w-full accent-amber-500 cursor-pointer" />
                  <div className="mt-1 flex justify-between text-[10px] text-zinc-600 font-bold uppercase">
                    <span>Smaller</span><span>Larger</span>
                  </div>
                </div>
              </div>
            )}

            <input ref={logoInputRef} type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              onChange={handleLogoUpload} className="hidden" />
          </div>

          {/* Appearance */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Appearance</h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Foreground", val: fg, set: setFg },
                { label: "Background", val: bg, set: setBg },
              ].map(c => (
                <div key={c.label}>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-500">{c.label}</label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2">
                    <input type="color" value={c.val} onChange={e => c.set(e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" />
                    <span className="font-mono text-xs text-zinc-400">{c.val}</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-1.5 flex justify-between">
                <label className="text-xs font-bold text-zinc-500">Size</label>
                <span className="text-xs font-bold text-amber-400">{size}px</span>
              </div>
              <input type="range" min={150} max={600} step={50} value={size}
                onChange={e => setSize(+e.target.value)}
                className="w-full accent-amber-500 cursor-pointer" />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between">
                <label className="text-xs font-bold text-zinc-500">Margin</label>
                <span className="text-xs font-bold text-amber-400">{margin}</span>
              </div>
              <input type="range" min={0} max={8} step={1} value={margin}
                onChange={e => setMargin(+e.target.value)}
                className="w-full accent-amber-500 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* ── Right: QR preview ── */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full flex-1 items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/40 p-8"
            style={{ minHeight: "380px" }}>
            {!libReady ? (
              <div className="text-center">
                <RefreshCw size={32} className="mx-auto mb-3 animate-spin text-amber-400" />
                <p className="text-sm font-bold text-zinc-400">Loading QR library…</p>
              </div>
            ) : !value.trim() ? (
              <div className="text-center">
                <QrCode size={80} className="mx-auto mb-4 text-zinc-700" />
                <p className="text-sm font-bold text-zinc-600">Enter content above to generate</p>
                {logoFile && (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2">
                    <ImagePlus size={14} className="text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">Logo ready — add content to generate</span>
                  </div>
                )}
              </div>
            ) : (
              <canvas ref={canvasRef}
                className="rounded-xl shadow-2xl"
                style={{ imageRendering: "pixelated", maxWidth: "100%", display: "block" }} />
            )}
            {/* keep canvas mounted for drawing even when showing placeholder */}
            {!value.trim() && <canvas ref={canvasRef} style={{ display: "none" }} />}
          </div>

          {error && (
            <p className="w-full rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-center">
              {error}
            </p>
          )}

          {logoFile && hasQR && (
            <div className="flex w-full items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <ImagePlus size={16} className="text-emerald-400 shrink-0" />
              <p className="text-xs font-bold text-emerald-400">Logo embedded in QR center ✓</p>
            </div>
          )}

          {hasQR && (
            <div className="flex w-full gap-3">
              <button onClick={renderQR}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-white hover:bg-white/10 transition"
                title="Regenerate">
                <RefreshCw size={18} />
              </button>
              <button onClick={download}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg hover:bg-amber-400 transition">
                <Download size={18} /> Download PNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
