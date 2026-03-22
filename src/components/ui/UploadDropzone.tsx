import React, { useCallback, useState } from "react";
import { UploadCloud, Image as ImageIcon, FileWarning } from "lucide-react";

interface UploadDropzoneProps {
  onUpload: (file: File) => void;
  onUploadMultiple?: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
}

export default function UploadDropzone({
  onUpload,
  onUploadMultiple,
  accept = "image/jpeg, image/png, image/webp",
  maxSizeMB = 10,
  multiple = false,
  title = "Drag and drop your image here",
  subtitle = "or tap the button below to browse your files",
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check type
      if (!file.type.startsWith("image/")) {
        setError("Please upload valid image files.");
        continue;
      }

      // Check size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size must be less than ${maxSizeMB}MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      if (multiple && onUploadMultiple) {
        onUploadMultiple(validFiles);
      } else {
        onUpload(validFiles[0]);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndUpload(e.dataTransfer.files);
  }, [multiple, onUpload, onUploadMultiple]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndUpload(e.target.files);
  }, [multiple, onUpload, onUploadMultiple]);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
          isDragging
            ? "border-amber-400 bg-amber-500/5"
            : "border-white/5 bg-zinc-900/40 hover:border-amber-500/30 hover:bg-zinc-900/80"
        }`}
      >

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
          <UploadCloud size={36} />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 mb-6">{subtitle}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <label className="cursor-pointer rounded-full bg-amber-500 px-8 py-4 font-bold text-zinc-950 transition hover:bg-amber-400 shadow-lg shadow-amber-500/20">
            Browse Files
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleChange}
              className="hidden"
            />
          </label>
          
          <label className="cursor-pointer rounded-full bg-zinc-800 px-8 py-4 font-bold text-white transition hover:bg-zinc-700">
            Take Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ImageIcon size={14} />
          <span>Supports JPG, PNG, WEBP up to {maxSizeMB}MB</span>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
          <FileWarning size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
