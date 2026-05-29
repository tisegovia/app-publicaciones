"use client";

import { useRef, useState } from "react";
import { IconCamera, IconX, IconPlus } from "./Icons";

export interface ImageFile {
  base64: string;
  mimeType: string;
  preview: string;
}

interface Props {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
}

const MAX = 3;

export default function ImageUploader({ images, onImagesChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [overLimit, setOverLimit] = useState(false);

  function processFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const slots = MAX - images.length;
    if (arr.length > slots) { setOverLimit(true); setTimeout(() => setOverLimit(false), 3000); }
    const toAdd = arr.slice(0, slots);
    if (!toAdd.length) return;
    Promise.all(
      toAdd.map((f) => new Promise<ImageFile>((res) => {
        const r = new FileReader();
        r.onload = (e) => {
          const dataUrl = e.target?.result as string;
          res({ base64: dataUrl.split(",")[1], mimeType: f.type, preview: dataUrl });
        };
        r.readAsDataURL(f);
      }))
    ).then((n) => onImagesChange([...images, ...n]));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files);
  }

  const hasImages = images.length > 0;
  const canAdd = images.length < MAX;

  if (hasImages) {
    return (
      <div className="space-y-3">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: "relative", borderRadius: "var(--r-sm)",
              overflow: "hidden", background: "var(--surface)", border: "1px solid var(--border-soft)",
              aspectRatio: "1" }}
              className="group">
              <img src={img.preview} alt={`Foto ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {/* Label */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "4px 0", textAlign: "center",
                background: "linear-gradient(transparent, oklch(0.08 0.03 258 / 0.85))",
                fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-mute)" }}>
                {i === 0 ? "Principal" : `Detalle ${i}`}
              </div>
              {/* Remove */}
              <button
                onClick={() => onImagesChange(images.filter((_, j) => j !== i))}
                style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22,
                  borderRadius: "50%", border: "none", cursor: "pointer",
                  background: "oklch(0.08 0.03 258 / 0.75)",
                  color: "var(--text-mute)", display: "flex", alignItems: "center",
                  justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
                className="group-hover:opacity-100"
                title="Eliminar"
              >
                <IconX size={11} />
              </button>
            </div>
          ))}

          {canAdd && (
            <button
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{ aspectRatio: "1", borderRadius: "var(--r-sm)",
                border: `1.5px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
                background: dragging ? "oklch(0.45 0.10 250 / 0.10)" : "var(--surface)",
                cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.16s", color: "var(--text-faint)" }}
            >
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ""; }} />
              <IconPlus size={18} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase" }}>Agregar</span>
            </button>
          )}
        </div>

        {overLimit && (
          <div style={{ padding: "10px 14px", borderRadius: "var(--r-sm)",
            background: "oklch(0.72 0.18 20 / 0.10)", border: "1px solid oklch(0.72 0.18 20 / 0.22)",
            fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--err)" }}>
            Podés subir hasta 3 fotos
          </div>
        )}

        {/* Template hint */}
        <p className="mono" style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center" }}>
          {images.length === 1 && "1 foto — template una foto"}
          {images.length === 2 && "2 fotos — template una foto"}
          {images.length === 3 && "3 fotos — template principal + 2 detalles"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`dropzone ${dragging ? "dragging" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{ padding: "52px 32px" }}
    >
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ""; }} />

      {/* Corner ticks */}
      <span className="corner-tick tl" />
      <span className="corner-tick tr" />
      <span className="corner-tick bl" />
      <span className="corner-tick br" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        gap: 20, position: "relative", zIndex: 1 }}>
        <div className="icon-tile">
          <IconCamera size={24} />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
            Arrastrá o hacé clic para subir
          </p>
          <p className="mono" style={{ fontSize: 11.5, color: "var(--text-faint)", letterSpacing: "0.04em" }}>
            Hasta 3 fotos · JPG, PNG, WEBP
          </p>
        </div>
      </div>
    </div>
  );
}
