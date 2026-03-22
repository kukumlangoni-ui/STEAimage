import React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ProgressFeedbackProps {
  status: "idle" | "uploading" | "processing" | "success" | "error";
  uploadProgress?: number; // 0 to 100
  processingProgress?: number; // 0 to 100
  message?: string;
}

export default function ProgressFeedback({
  status,
  uploadProgress = 0,
  processingProgress = 0,
  message,
}: ProgressFeedbackProps) {
  if (status === "idle") return null;

  const getPercentage = () => {
    if (status === "uploading") return uploadProgress;
    if (status === "processing") return processingProgress;
    if (status === "success") return 100;
    return 0;
  };

  const percentage = getPercentage();

  return (
    <div className="w-full rounded-3xl border border-white/5 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status === "success" ? (
            <CheckCircle2 className="text-emerald-400" size={24} />
          ) : status === "error" ? (
            <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              !
            </div>
          ) : (
            <Loader2 className="animate-spin text-amber-400" size={24} />
          )}
          <h3 className="text-lg font-bold text-white">
            {status === "uploading" && "Uploading File..."}
            {status === "processing" && "Processing Image..."}
            {status === "success" && "Complete!"}
            {status === "error" && "Error"}
          </h3>
        </div>
        <span className="font-mono text-xl font-bold text-amber-400">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-950">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out ${
            status === "success"
              ? "bg-emerald-400"
              : status === "error"
              ? "bg-red-400"
              : "bg-amber-400"
          }`}
          style={{ width: `${percentage}%` }}
        >
          {status !== "success" && status !== "error" && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </div>
      </div>

      {message && (
        <p className="mt-4 text-center text-sm text-zinc-400">{message}</p>
      )}
    </div>
  );
}
