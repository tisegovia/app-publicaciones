"use client";

import { useRef, useState } from "react";

export interface ImageFile {
  base64: string;
  mimeType: string;
  preview: string; // data URL for display
}

interface Props {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
}

const MAX_IMAGES = 3;

export default function ImageUploader({ images, onImagesChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [overLimit, setOverLimit] = useState(false);

  function processFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const slots = MAX_IMAGES - images.length;
    if (arr.length > slots) {
      setOverLimit(true);
      setTimeout(() => setOverLimit(false), 3000);
    }
    const toAdd = arr.slice(0, slots);
    if (!toAdd.length) return;

    const readers = toAdd.map(
      (file) =>
        new Promise<ImageFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            resolve({
              base64: dataUrl.split(",")[1],
              mimeType: file.type,
              preview: dataUrl,
            });
          };
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((newImgs) => {
      onImagesChange([...images, ...newImgs]);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  const hasImages = images.length > 0;
  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="space-y-3">
      {/* Drop zone — shown when no images OR as an "add more" button */}
      {!hasImages && (
        <div
          className={`border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${
            dragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 bg-gray-50"
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
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ""; }}
          />
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-gray-700 font-medium text-lg">
              Arrastrá o hacé clic para subir fotos
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Hasta 3 fotos · JPG, PNG, WEBP
            </p>
          </div>
        </div>
      )}

      {/* Image previews grid */}
      {hasImages && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
              <img
                src={img.preview}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Labels */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1 font-medium">
                {i === 0 ? "Principal" : `Detalle ${i}`}
              </div>
              {/* Remove button */}
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar"
              >
                ×
              </button>
            </div>
          ))}

          {/* Add more slot */}
          {canAddMore && (
            <div
              className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 cursor-pointer transition-colors flex flex-col items-center justify-center gap-1"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ""; }}
              />
              <span className="text-2xl text-gray-400">+</span>
              <span className="text-xs text-gray-400">Agregar foto</span>
            </div>
          )}
        </div>
      )}

      {/* Over-limit message */}
      {overLimit && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          Podés subir hasta 3 fotos
        </p>
      )}

      {/* Template auto-selection hint */}
      {hasImages && (
        <p className="text-xs text-gray-400 text-center">
          {images.length === 1 && "1 foto → template con foto principal grande"}
          {images.length === 2 && "2 fotos → se usa la foto principal"}
          {images.length === 3 && "3 fotos → template con foto principal + 2 detalles ✓"}
        </p>
      )}
    </div>
  );
}
