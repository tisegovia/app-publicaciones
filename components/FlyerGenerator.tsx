"use client";

import { useEffect, useRef, useState } from "react";
import { FlyerData, ProductCondition } from "@/lib/types";

interface Props {
  flyerData: FlyerData;
  imageBase64: string;       // foto principal (data URL o base64 puro)
  condition: ProductCondition;
}

type TemplateType = "una-foto" | "tres-fotos";

/** Comprime una imagen a max 800px de ancho usando canvas */
async function compressImage(dataUrl: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl.startsWith("data:") ? dataUrl : `data:image/jpeg;base64,${dataUrl}`;
  });
}

/** Componente de upload para fotos de detalle */
function DetailUpload({
  label, onSelect, preview,
}: {
  label: string;
  onSelect: (dataUrl: string) => void;
  preview: string | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => onSelect(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div
      className={`flex-1 border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden ${drag ? "border-purple-400 bg-purple-50" : "border-gray-300 hover:border-purple-300 bg-gray-50"}`}
      style={{ minHeight: 140 }}
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {preview ? (
        <img src={preview} alt={label} className="w-full h-full object-cover" style={{ minHeight: 140 }} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-6 px-3 text-center" style={{ minHeight: 140 }}>
          <span className="text-2xl mb-1">📸</span>
          <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}

/** Thumbnail visual para selección de template */
function TemplateThumbnail({ type, selected, onClick }: { type: TemplateType; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-2xl border-2 p-4 transition-all text-left ${selected ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
    >
      {/* Mini preview visual */}
      <div className="rounded-xl overflow-hidden mb-3 bg-gray-900" style={{ aspectRatio: "9/16" }}>
        {type === "una-foto" ? (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 bg-gray-700 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <span className="text-white text-2xl">🖼</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3"
                style={{ background: "linear-gradient(to bottom, transparent, #111827)" }} />
            </div>
            <div className="bg-gray-900 px-2 py-2 flex flex-col gap-1">
              <div className="h-2 bg-red-500 rounded-full w-3/4" />
              <div className="h-1.5 bg-gray-600 rounded-full w-full" />
              <div className="h-1 bg-gray-700 rounded-full w-5/6 mt-1" />
              <div className="h-2 bg-gray-800 border border-gray-700 rounded-lg mt-2 px-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                <div className="h-1 bg-gray-600 rounded flex-1" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            <div className="bg-gray-700 relative" style={{ flex: "0 0 42%" }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <span className="text-white text-xl">🖼</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/4"
                style={{ background: "linear-gradient(to bottom, transparent, #111827)" }} />
            </div>
            <div className="flex gap-1 px-1 py-1" style={{ flex: "0 0 22%" }}>
              <div className="flex-1 bg-gray-600 rounded-lg flex items-center justify-center opacity-60">
                <span className="text-white text-xs">📷</span>
              </div>
              <div className="flex-1 bg-gray-600 rounded-lg flex items-center justify-center opacity-60">
                <span className="text-white text-xs">📷</span>
              </div>
            </div>
            <div className="flex-1 bg-gray-900 px-2 py-1 flex flex-col gap-1">
              <div className="h-2 bg-red-500 rounded-full w-2/3" />
              <div className="h-1.5 bg-gray-600 rounded-full w-full" />
              <div className="h-1 bg-gray-700 rounded-full w-5/6" />
              <div className="h-2 bg-gray-800 border border-gray-700 rounded-lg mt-1 px-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                <div className="h-1 bg-gray-600 rounded flex-1" />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {selected && <span className="text-purple-500 text-sm font-bold">✓</span>}
        <span className="text-sm font-semibold text-gray-800">
          {type === "una-foto" ? "1 foto" : "3 fotos"}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-0.5">
        {type === "una-foto" ? "Foto principal grande" : "Principal + 2 detalles"}
      </p>
    </button>
  );
}

export default function FlyerGenerator({ flyerData, imageBase64, condition }: Props) {
  const [template, setTemplate] = useState<TemplateType>("una-foto");
  const [detail1, setDetail1] = useState<string | null>(null);
  const [detail2, setDetail2] = useState<string | null>(null);
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [flyerHtml, setFlyerHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Pre-fill contact from settings
  useEffect(() => {
    const saved = localStorage.getItem("publigen_contact") ?? "";
    setContact(saved);
  }, []);

  const conditionLabels: Record<ProductCondition, string> = {
    nuevo: "Nuevo",
    usado: "Usado",
    reacondicionado: "Reacondicionado",
  };

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setFlyerHtml(null);

    try {
      // Comprimir imagen principal
      const mainDataUrl = imageBase64.startsWith("data:")
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
      const compressed = await compressImage(mainDataUrl, 800);
      const d1 = detail1 ? await compressImage(detail1, 800) : undefined;
      const d2 = detail2 ? await compressImage(detail2, 800) : undefined;

      const res = await fetch("/api/flyer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          productData: {
            imageBase64: compressed,
            imageDetail1Base64: d1,
            imageDetail2Base64: d2,
            price: flyerData.price,
            title: flyerData.title,
            description: flyerData.description,
            contact: contact || "Escribime para consultar",
            condition: conditionLabels[condition],
            showConditionBadge: true,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar");
      setFlyerHtml(data.html);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!flyerHtml) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");

      // Crear iframe oculto a tamaño real
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;width:1080px;height:1920px;border:none;visibility:hidden;";
      document.body.appendChild(iframe);

      await new Promise<void>((resolve, reject) => {
        iframe.onload = () => resolve();
        iframe.onerror = reject;
        iframe.srcdoc = flyerHtml!;
        setTimeout(resolve, 3000); // timeout fallback
      });

      // Esperar fuentes
      await new Promise((r) => setTimeout(r, 800));

      const node = iframe.contentDocument?.documentElement;
      if (!node) throw new Error("No se pudo acceder al contenido del flyer");

      const dataUrl = await toPng(node, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        style: { transform: "none" },
      });

      const productSlug = flyerData.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 30);
      const date = new Date().toISOString().split("T")[0];

      const link = document.createElement("a");
      link.download = `flyer-${productSlug}-${date}.png`;
      link.href = dataUrl;
      link.click();

      document.body.removeChild(iframe);
    } catch (e) {
      console.error("Download error:", e);
      // Fallback: descargar el HTML
      const blob = new Blob([flyerHtml!], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `flyer-${Date.now()}.html`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  // Calcular escala del preview
  const PREVIEW_WIDTH = 320;
  const previewScale = PREVIEW_WIDTH / 1080;
  const previewHeight = Math.round(1920 * previewScale);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg">
          📸
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">Flyer para Instagram / WhatsApp</h3>
          <p className="text-xs text-gray-400">Generá un Story listo para compartir</p>
        </div>
      </div>

      {/* Template selector */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Template</p>
        <div className="flex gap-3">
          <TemplateThumbnail type="una-foto" selected={template === "una-foto"} onClick={() => setTemplate("una-foto")} />
          <TemplateThumbnail type="tres-fotos" selected={template === "tres-fotos"} onClick={() => setTemplate("tres-fotos")} />
        </div>
      </div>

      {/* Detail photos (solo para 3 fotos) */}
      {template === "tres-fotos" && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fotos de detalle</p>
          <p className="text-xs text-gray-400 mb-3">Si no subís fotos se repetirá la foto principal</p>
          <div className="flex gap-3">
            <DetailUpload label="Detalle izquierda" onSelect={setDetail1} preview={detail1} />
            <DetailUpload label="Detalle derecha" onSelect={setDetail2} preview={detail2} />
          </div>
        </div>
      )}

      {/* Contact field */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
          ¿Cómo te contactan? (se mostrará en el flyer)
        </label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Ej: Llamáme: 11-1234-5678"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
        />
      </div>

      {/* Datos pre-cargados (readonly) */}
      <div className="grid grid-cols-3 gap-2 mb-5 text-xs">
        {[
          { label: "Precio", value: flyerData.price },
          { label: "Título", value: flyerData.title },
          { label: "Estado", value: conditionLabels[condition] },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-purple-100 rounded-xl px-3 py-2">
            <div className="text-gray-400 mb-0.5">{item.label}</div>
            <div className="font-semibold text-gray-700 truncate">{item.value}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      {/* Generate button */}
      {!flyerHtml && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generando flyer…
            </>
          ) : (
            <>✨ Generar Flyer</>
          )}
        </button>
      )}

      {/* Preview + download */}
      {flyerHtml && (
        <div>
          {/* Preview iframe */}
          <div className="mb-4 flex justify-center">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-purple-200"
              style={{ width: PREVIEW_WIDTH, height: previewHeight }}
            >
              <iframe
                ref={iframeRef}
                srcDoc={flyerHtml}
                style={{
                  width: 1080,
                  height: 1920,
                  border: "none",
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  pointerEvents: "none",
                }}
                title="Flyer preview"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { setFlyerHtml(null); }}
              className="flex-1 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Editar
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Descargando…
                </>
              ) : (
                <>⬇️ Descargar PNG</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
