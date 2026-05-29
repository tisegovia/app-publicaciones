"use client";

import { useRef, useState } from "react";

interface Props {
  onImageSelected: (base64: string, mimeType: string, preview: string) => void;
  preview: string | null;
}

export default function ImageUploader({ onImageSelected, preview }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      onImageSelected(base64, file.type, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 bg-gray-50"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full max-h-80 object-contain rounded-2xl" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-2xl flex items-center justify-center">
            <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
              Cambiar imagen
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-gray-700 font-medium text-lg">Arrastrá o hacé clic para subir una foto</p>
          <p className="text-gray-400 text-sm mt-2">JPG, PNG, WEBP — máx 10 MB</p>
        </div>
      )}
    </div>
  );
}
