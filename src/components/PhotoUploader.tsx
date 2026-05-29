"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, User } from "lucide-react";

interface PhotoUploaderProps {
  token: string;
  photoUrl: string;
  onPhotoChange: (url: string) => void;
}

const ACCEPTED_TYPES = ".png,.jpg,.jpeg,.webp";

export function PhotoUploader({
  token,
  photoUrl,
  onPhotoChange,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`/api/profiles/${token}/photo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      onPhotoChange(data.photoUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to upload photo";
      setError(message);
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      {/* Photo preview */}
      <div className="relative shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Profile photo"
            className="h-24 w-24 rounded-full border-2 border-zinc-200 object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50">
            <User className="h-8 w-8 text-zinc-400" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Upload controls */}
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {photoUrl ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </button>

        <p className="text-xs text-zinc-400">PNG, JPEG, or WebP. Max 5 MB.</p>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
