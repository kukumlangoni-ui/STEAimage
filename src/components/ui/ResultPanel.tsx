import React from "react";
import { Download, RefreshCw, Link as LinkIcon } from "lucide-react";

interface ResultPanelProps {
  title: string;
  message: string;
  onReset: () => void;
  onDownload?: () => void;
  downloadUrl?: string;
  copyUrl?: string;
  previewUrl?: string;
  fileInfo?: {
    originalSize: string;
    newSize: string;
    saved: string;
  };
}

export default function ResultPanel({
  title,
  message,
  onReset,
  onDownload,
  downloadUrl,
  copyUrl,
  previewUrl,
  fileInfo,
}: ResultPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (copyUrl) {
      navigator.clipboard.writeText(copyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-zinc-900/80 p-8 text-center shadow-2xl backdrop-blur-xl max-w-2xl mx-auto w-full">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 mb-8">{message}</p>

      {fileInfo && (
        <div className="mb-8 grid grid-cols-3 gap-4 rounded-2xl bg-zinc-950/50 p-4 border border-white/5">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Original</p>
            <p className="text-sm font-mono text-white">{fileInfo.originalSize}</p>
          </div>
          <div className="text-center border-x border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">New Size</p>
            <p className="text-sm font-mono text-amber-400">{fileInfo.newSize}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Saved</p>
            <p className="text-sm font-mono text-green-400">{fileInfo.saved}</p>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="mb-8 rounded-2xl border border-white/5 bg-zinc-950 p-2 overflow-hidden max-h-[500px] flex justify-center">
          <img
            src={previewUrl}
            alt="Preview"
            className="object-contain max-h-full w-auto rounded-xl"
          />
        </div>
      )}

      {copyUrl && (
        <div className="mb-8 flex items-center justify-between rounded-full border border-white/5 bg-zinc-950 p-4">
          <p className="truncate text-sm text-zinc-300 font-mono">{copyUrl}</p>
          <button
            onClick={handleCopy}
            className="ml-4 shrink-0 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-300 transition hover:bg-amber-500/20"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            onClick={onDownload}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-amber-400 px-8 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:scale-[1.02] hover:bg-amber-500"
          >
            <Download size={20} />
            Download Image
          </a>
        )}

        <button
          onClick={onReset}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/5 bg-zinc-900/40 px-8 py-4 font-bold text-white transition hover:bg-white/10"
        >
          <RefreshCw size={20} />
          Process Another
        </button>
      </div>
    </div>
  );
}
