import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, QrCode, Wifi, Phone, Mail, MessageSquare, Globe, Type } from "lucide-react";

type QRType = "url" | "text" | "phone" | "whatsapp" | "email" | "wifi";

const TYPES: { id: QRType; label: string; icon: React.ElementType; placeholder: string }[] = [
  { id: "url",       label: "URL",       icon: Globe,          placeholder: "https://example.com" },
  { id: "text",      label: "Text",      icon: Type,           placeholder: "Enter any text..." },
  { id: "phone",     label: "Phone",     icon: Phone,          placeholder: "+255712345678" },
  { id: "whatsapp",  label: "WhatsApp",  icon: MessageSquare,  placeholder: "+255712345678" },
  { id: "email",     label: "Email",     icon: Mail,           placeholder: "hello@example.com" },
  { id: "wifi",      label: "WiFi",      icon: Wifi,           placeholder: "NetworkName" },
];

function buildContent(type: QRType, value: string, wifiPass: string, wifiSec: string) {
  switch (type) {
    case "phone":     return `tel:${value}`;
    case "whatsapp":  return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
    case "email":     return `mailto:${value}`;
    case "wifi":      return `WIFI:T:${wifiSec};S:${value};P:${wifiPass};;`;
    default:          return value;
  }
}

declare global { interface Window { QRCode: any } }

export default function QRCodeGenerator() {
  const [qrType, setQrType]     = useState<QRType>("url");
  const [value, setValue]       = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiSec, setWifiSec]   = useState("WPA");
  const [size, setSize]         = useState(300);
  const [fg, setFg]             = useState("#fbbf24");
  const [bg, setBg]             = useState("#09090b");
  const [margin, setMargin]     = useState(2);
  const [libReady, setLibReady] = useState(!!window.QRCode);
  const [error, setError]       = useState("");
  const [hasQR, setHasQR]       = useState(false);

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const tmpDivRef  = useRef<HTMLDivElement | null>(null);

  // ── Load qrcodejs from CDN once ──────────────────────────────────────────
  useEffect(() => {
    if (window.QRCode) { setLibReady(true); return; }
    const s   = document.createElement("script");
    s.src     = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.onload  = () => setLibReady(true);
    s.onerror = () => setError("Failed to load QR library. Check your internet connection.");
    document.head.appendChild(s);
  }, []);

  // ── Core render function ──────────────────────────────────────────────────
  const renderQR = useCallback(() => {
    const canvas = canvasRef.current;
    if (!libReady || !canvas || !value.trim()) return;
    setError("");

    const content = buildContent(qrType, value.trim(), wifiPass, wifiSec);

    // Clean up previous hidden div
    if (tmpDivRef.current) {
      try { document.body.removeChild(tmpDivRef.current); } catch {}
    }

    // Create hidden container for qrcodejs to render into
    const tmp = document.createElement("div");
    tmp.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;";
    document.body.appendChild(tmp);
    tmpDivRef.current = tmp;

    try {
      new window.QRCode(tmp, {
        text:         content,
        width:        size,
        height:       size,
        colorDark:    fg,
        colorLight:   bg,
        correctLevel: window.QRCode.CorrectLevel.H,
      });

      // qrcodejs renders a <canvas> element (and later an <img>).
      // We copy the <canvas> it produced directly — no async timing needed.
      const srcCanvas = tmp.querySelector("canvas") as HTMLCanvasElement | null;
      if (srcCanvas) {
        // Wait one microtask for the library to finish drawing
        requestAnimationFrame(() => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const mPx = Math.round(margin * 4);          // 4px per margin unit
          const total = size + mPx * 2;
          canvas.width  = total;
          canvas.height = total;

          // Background fill (includes margin area)
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, total, total);

          // Draw the QR onto the centre
          ctx.drawImage(srcCanvas, mPx, mPx, size, size);

          setHasQR(true);

          // Clean up hidden div
          try { document.body.removeChild(tmp); tmpDivRef.current = null; } catch {}
        });
      } else {
        // Fallback: library used <img> path — wait for it
        const img = tmp.querySelector("img") as HTMLImageElement | null;
        if (img) {
          const finish = () => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const mPx  = Math.round(margin * 4);
            const total = size + mPx * 2;
            canvas.width  = total;
            canvas.height = total;
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, total, total);
            ctx.drawImage(img, mPx, mPx, size, size);
            setHasQR(true);
            try { document.body.removeChild(tmp); tmpDivRef.current = null; } catch {}
          };
          if (img.complete) finish();
          else img.onload = finish;
        } else {
          setError("QR render failed — no canvas or image produced.");
          try { document.body.removeChild(tmp); tmpDivRef.current = null; } catch {}
        }
      }
    } catch (e: any) {
      console.error("[QR]", e);
      setError("Could not generate QR. Check your input.");
      try { document.body.removeChild(tmp); tmpDivRef.current = null; } catch {}
    }
  }, [libReady, value, qrType, wifiPass, wifiSec, size, fg, bg, margin]);

  // Re-render whenever inputs change
  useEffect(() => {
    if (value.trim()) renderQR();
    else setHasQR(false);
  }, [renderQR]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (tmpDivRef.current) {
      try { document.body.removeChild(tmpDivRef.current); } catch {}
    }
  }, []);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Produce a white-safe PNG (toDataURL always works)
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
        <p className="mt-2 text-zinc-400">Generate custom QR codes for URLs, text, phone, WhatsApp, email &amp; WiFi.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Left: settings ── */}
        <div className="space-y-4">

          {/* Type selector */}
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

          {/* Content input */}
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
                  {["WPA", "WEP", "nopass"].map(s => (
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
            style={{ minHeight: "360px" }}>
            {!libReady ? (
              <div className="text-center">
                <RefreshCw size={32} className="mx-auto mb-3 animate-spin text-amber-400" />
                <p className="text-sm font-bold text-zinc-400">Loading QR library…</p>
              </div>
            ) : !value.trim() ? (
              <div className="text-center">
                <QrCode size={72} className="mx-auto mb-3 text-zinc-700" />
                <p className="text-sm font-bold text-zinc-600">Enter content to generate QR code</p>
              </div>
            ) : (
              /* Canvas is always mounted so renderQR can draw into it */
              <canvas ref={canvasRef}
                className="rounded-xl shadow-2xl"
                style={{ imageRendering: "pixelated", maxWidth: "100%", display: "block" }} />
            )}

            {/* Keep canvas in DOM even when showing placeholder (hidden) */}
            {value.trim() ? null : (
              <canvas ref={canvasRef} style={{ display: "none" }} />
            )}
          </div>

          {error && (
            <p className="w-full rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-center">
              {error}
            </p>
          )}

          {hasQR && (
            <div className="flex w-full gap-3">
              <button onClick={renderQR}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-white hover:bg-white/10 transition">
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
