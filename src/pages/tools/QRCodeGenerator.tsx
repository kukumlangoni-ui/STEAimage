import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, QrCode, Wifi, Phone, Mail, MessageSquare, Globe, Type } from "lucide-react";

type QRType = "url" | "text" | "phone" | "whatsapp" | "email" | "wifi";

const TYPES: { id: QRType; label: string; icon: React.ElementType; placeholder: string }[] = [
  { id: "url", label: "URL", icon: Globe, placeholder: "https://example.com" },
  { id: "text", label: "Text", icon: Type, placeholder: "Enter any text..." },
  { id: "phone", label: "Phone", icon: Phone, placeholder: "+255712345678" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, placeholder: "+255712345678" },
  { id: "email", label: "Email", icon: Mail, placeholder: "hello@example.com" },
  { id: "wifi", label: "WiFi", icon: Wifi, placeholder: "NetworkName" },
];

function buildQRContent(type: QRType, value: string, wifiPass: string, wifiSec: string) {
  switch (type) {
    case "phone": return `tel:${value}`;
    case "whatsapp": return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
    case "email": return `mailto:${value}`;
    case "wifi": return `WIFI:T:${wifiSec};S:${value};P:${wifiPass};;`;
    default: return value;
  }
}

// Pure-canvas QR generation using a minimal Reed-Solomon / QR algorithm
// We use a script tag approach to load qrcode.js from CDN at runtime
declare global { interface Window { QRCode: any } }

export default function QRCodeGenerator() {
  const [qrType, setQrType] = useState<QRType>("url");
  const [value, setValue] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiSec, setWifiSec] = useState("WPA");
  const [size, setSize] = useState(300);
  const [fg, setFg] = useState("#fbbf24");
  const [bg, setBg] = useState("#09090b");
  const [margin, setMargin] = useState(2);
  const [qrReady, setQrReady] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrRef = useRef<any>(null);

  // Load qrcode library from CDN
  useEffect(() => {
    if (window.QRCode) { setQrReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.onload = () => setQrReady(true);
    s.onerror = () => setError("Failed to load QR library. Check your internet connection.");
    document.head.appendChild(s);
  }, []);

  const generateQR = useCallback(() => {
    if (!qrReady || !value.trim()) return;
    setError("");
    const content = buildQRContent(qrType, value.trim(), wifiPass, wifiSec);
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use a hidden div for QRCode library then draw to our canvas
    const tmp = document.createElement("div");
    tmp.style.position = "absolute";
    tmp.style.opacity = "0";
    tmp.style.pointerEvents = "none";
    document.body.appendChild(tmp);

    try {
      if (qrRef.current) { qrRef.current.clear(); qrRef.current = null; }
      const qr = new window.QRCode(tmp, {
        text: content,
        width: size,
        height: size,
        colorDark: fg,
        colorLight: bg,
        correctLevel: window.QRCode.CorrectLevel.H,
      });
      qrRef.current = qr;
      setTimeout(() => {
        const img = tmp.querySelector("img") as HTMLImageElement | null;
        if (img && img.complete) {
          ctx.clearRect(0, 0, size, size);
          // Background
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, size, size);
          // Add margin
          const mPx = margin * (size / (21 + margin * 2));
          ctx.drawImage(img, mPx, mPx, size - mPx * 2, size - mPx * 2);
        }
        document.body.removeChild(tmp);
      }, 200);
    } catch (e) {
      console.error("[QR]", e);
      setError("Could not generate QR code. Check your input.");
      document.body.removeChild(tmp);
    }
  }, [qrReady, value, qrType, wifiPass, wifiSec, size, fg, bg, margin]);

  useEffect(() => {
    if (value.trim()) generateQR();
  }, [generateQR]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr_code_${Date.now()}.png`;
    a.click();
  };

  const type = TYPES.find((t) => t.id === qrType)!;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link to="/tools" className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 border border-white/5 backdrop-blur-md transition hover:text-white">
        <ArrowLeft size={16} /> Back to Tools
      </Link>

      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <QrCode size={32} />
        </div>
        <h1 className="text-4xl font-black text-white">QR Code Generator</h1>
        <p className="mt-2 text-zinc-400">Generate custom QR codes for URLs, text, phone, WhatsApp, email & WiFi.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: settings */}
        <div className="space-y-4">
          {/* Type selector */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">QR Type</h3>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button key={t.id} onClick={() => { setQrType(t.id); setValue(""); }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-bold transition ${qrType === t.id ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"}`}>
                  <t.icon size={18} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Content</h3>
            {qrType === "wifi" ? (
              <div className="space-y-3">
                <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Network name (SSID)"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none text-sm" />
                <input value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder="Password"
                  type="password"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none text-sm" />
                <div className="grid grid-cols-3 gap-2">
                  {["WPA", "WEP", "nopass"].map((s) => (
                    <button key={s} onClick={() => setWifiSec(s)}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${wifiSec === s ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 text-zinc-400 hover:bg-zinc-900"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : qrType === "text" ? (
              <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder={type.placeholder} rows={4}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none text-sm resize-none" />
            ) : (
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={type.placeholder}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none text-sm" />
            )}
          </div>

          {/* Customization */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Appearance</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-500">Foreground</label>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2">
                  <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" />
                  <span className="font-mono text-xs text-zinc-400">{fg}</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-500">Background</label>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2">
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" />
                  <span className="font-mono text-xs text-zinc-400">{bg}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex justify-between">
                <label className="text-xs font-bold text-zinc-500">Size</label>
                <span className="text-xs font-bold text-amber-400">{size}px</span>
              </div>
              <input type="range" min="150" max="600" step="50" value={size} onChange={(e) => setSize(+e.target.value)}
                className="w-full accent-amber-500 cursor-pointer" />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between">
                <label className="text-xs font-bold text-zinc-500">Margin</label>
                <span className="text-xs font-bold text-amber-400">{margin}</span>
              </div>
              <input type="range" min="0" max="5" step="1" value={margin} onChange={(e) => setMargin(+e.target.value)}
                className="w-full accent-amber-500 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Right: QR preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/40 p-8" style={{ minHeight: "340px" }}>
            {!value.trim() ? (
              <div className="text-center">
                <QrCode size={64} className="mx-auto mb-3 text-zinc-700" />
                <p className="text-sm text-zinc-600 font-bold">Enter content to generate QR code</p>
              </div>
            ) : (
              <canvas ref={canvasRef} className="rounded-xl max-w-full" style={{ imageRendering: "pixelated" }} />
            )}
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          {value.trim() && (
            <div className="flex w-full gap-3">
              <button onClick={generateQR}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-white hover:bg-white/10">
                <RefreshCw size={18} />
              </button>
              <button onClick={download}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg hover:bg-amber-400">
                <Download size={18} /> Download PNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
