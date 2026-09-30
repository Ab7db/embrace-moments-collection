import React, { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UploadCloud, Image as ImageIcon, X, Loader2, Check, ExternalLink, Copy } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  placeholder?: string;
  aspectRatio?: "square" | "portrait" | "video" | "auto";
  className?: string;
}

export function ImageUpload({
  value = "",
  onChange,
  label,
  folder = "uploads",
  placeholder = "Upload image or enter URL...",
  aspectRatio = "auto",
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop() || "jpg";
      const cleanBase = file.name
        .substring(0, file.name.lastIndexOf("."))
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const filePath = `${folder}/${Date.now()}_${cleanBase}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("portfolio-media")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        onChange(data.publicUrl);
      }
    } catch (err: any) {
      console.error("Error uploading image:", err);
      alert(`Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const copyToClipboard = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format image source
  const imageSrc = value
    ? value.startsWith("http") || value.startsWith("/") || value.startsWith("data:")
      ? value
      : `/${value}`
    : null;

  const aspectClass =
    aspectRatio === "portrait"
      ? "aspect-[3/4]"
      : aspectRatio === "video"
      ? "aspect-video"
      : aspectRatio === "square"
      ? "aspect-square"
      : "min-h-[140px]";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="type-meta text-muted-foreground block text-xs">
          {label}
        </label>
      )}

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Upload & Preview Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative group border border-dashed rounded-sm transition-all overflow-hidden bg-surface/40 flex flex-col justify-center items-center p-4 text-center ${
          dragActive
            ? "border-accent bg-accent/10"
            : "border-border hover:border-accent/40"
        } ${aspectClass}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 py-6 text-accent">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="type-meta text-xs">Uploading to Supabase Storage...</p>
          </div>
        ) : imageSrc ? (
          <div className="relative w-full h-full min-h-[120px] flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Preview"
              className="max-h-56 max-w-full object-contain rounded-sm shadow-md"
            />
            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface border border-border px-3 py-1.5 rounded-sm text-xs type-meta hover:text-accent flex items-center gap-1.5 text-foreground transition-colors"
                title="Change Image"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Change
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                className="bg-surface border border-border p-1.5 rounded-sm text-xs type-meta hover:text-accent text-foreground transition-colors"
                title="Copy Image URL"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
              <a
                href={imageSrc}
                target="_blank"
                rel="noreferrer"
                className="bg-surface border border-border p-1.5 rounded-sm text-xs type-meta hover:text-accent text-foreground transition-colors"
                title="Open full image"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={() => onChange("")}
                className="bg-surface border border-border p-1.5 rounded-sm text-xs type-meta text-red-400 hover:text-red-300 transition-colors"
                title="Remove Image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted-foreground group-hover:text-accent transition-colors">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="type-meta text-xs text-accent font-medium hover:underline inline-block"
              >
                اختيار صورة من الجهاز / Browse file
              </button>
              <p className="type-meta text-[11px] text-muted-foreground mt-0.5">
                Drag & drop or select PNG, JPG, WEBP
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual URL input fallback & quick buttons */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-background border border-border px-3 py-1.5 text-xs rounded-sm focus:border-accent focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-surface hover:bg-surface-2 border border-border text-foreground px-3 py-1.5 rounded-sm text-xs type-meta flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <UploadCloud className="h-3.5 w-3.5 text-accent" />
          رفع صورة
        </button>
      </div>
    </div>
  );
}

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  folder?: string;
  className?: string;
}

export function MultiImageUpload({
  values = [],
  onChange,
  label,
  folder = "campaigns",
  className = "",
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBatchUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        const fileExt = file.name.split(".").pop() || "jpg";
        const cleanBase = file.name
          .substring(0, file.name.lastIndexOf("."))
          .replace(/[^a-zA-Z0-9_-]/g, "_");
        const filePath = `${folder}/${Date.now()}_${i}_${cleanBase}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("portfolio-media")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("portfolio-media")
          .getPublicUrl(filePath);

        if (data?.publicUrl) {
          newUrls.push(data.publicUrl);
        }
      }

      onChange([...values, ...newUrls]);
    } catch (err: any) {
      console.error("Batch upload failed:", err);
      alert(`Batch upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeUrl = (index: number) => {
    const updated = [...values];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="type-meta text-muted-foreground text-xs block">
            {label} ({values.length})
          </label>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 px-3 py-1 rounded-sm text-xs type-meta flex items-center gap-1.5 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UploadCloud className="h-3.5 w-3.5" />
          )}
          {isUploading ? "Uploading..." : "اختيار صور متعددة من الجهاز"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) handleBatchUpload(e.target.files);
        }}
        className="hidden"
      />

      {/* Grid of images */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-52 overflow-y-auto p-2 bg-surface/30 border border-border rounded-sm">
          {values.map((url, idx) => {
            const formatted =
              url.startsWith("http") || url.startsWith("/") || url.startsWith("data:")
                ? url
                : `/${url}`;
            return (
              <div
                key={`${url}-${idx}`}
                className="relative group aspect-square rounded-sm overflow-hidden bg-background border border-border"
              >
                <img
                  src={formatted}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeUrl(idx)}
                  className="absolute top-1 right-1 bg-black/80 text-red-400 hover:text-red-300 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
