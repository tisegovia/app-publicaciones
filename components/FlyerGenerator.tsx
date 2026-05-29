"use client";

import { useEffect, useRef, useState } from "react";
import { FlyerData, ProductCondition } from "@/lib/types";

interface Props {
  flyerData: FlyerData;
  /** All product images as data URLs. [0]=main, [1]=detail1, [2]=detail2 */
  images: string[];
  condition: ProductCondition;
}

type TemplateType = "una-foto" | "tres-fotos";

/** Comprime una imagen a maxWidth px usando canvas */
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
    img.src = dataUrl;
  });
}

export default function FlyerGenerator({ flyerData, images, condition }: Props) {
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [flyerHtml, setFlyerHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-select template based on image count
  const template: TemplateType = images.length >= 3 ? "tres-fotos" : "una-foto";

  // Pre-fill contact from settings
  useEffect(() => {
    setContact(localStorage.getItem("publigen_contact") ?? "");
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
      // Comprimir todas las imágenes
      const compressed = await Promise.all(
        images.map((img) => compressImage(img, 800))
      );

      const res = await fetch("/api/flyer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          productData: {
            images: compressed,
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

      // Crear iframe oculto a tamaño real (1080×1920)
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;width:1080px;height:1920px;border:none;visibility:hidden;";
      document.body.appendChild(iframe);

      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        iframe.srcdoc = flyerHtml!;
        setTimeout(resolve, 3500); // fallback
      });

      // Esperar fuentes / render
      await new Promise((r) => setTimeout(r, 800));

      const node = iframe.contentDocument?.documentElement;
      if (!node) throw new Error("No se pudo acceder al contenido del flyer");

      const dataUrl = await toPng(node, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        style: { transform: "none" },
      });

      const slug = flyerData.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 30);
      const date = new Date().toISOString().split("T")[0];

      const link = document.createElement("a");
      link.download = `flyer-${slug}-${date}.png`;
      link.href = dataUrl;
      link.click();
      document.body.removeChild(iframe);
    } catch (e) {
      console.error("Download error:", e);
      // Fallback: descarga HTML
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

  // Escala para el preview visual
  const PREVIEW_WIDTH = 320;
  const previewScale = PREVIEW_WIDTH / 1080;
  const previewHeight = Math.round(1920 * previewScale);

  const templateLabel = template === "tres-fotos"
    ? `3 fotos (principal + 2 detalles)`
    : `1 foto (foto principal)`;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg">
          📸
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">
            Flyer para Instagram / WhatsApp
          </h3>
          <p className="text-xs text-gray-400">
            Template auto-seleccionado: <span className="text-purple-600 font-medium">{templateLabel}</span>
          </p>
        </div>
      </div>

      {/* Datos pre-cargados */}
      <div className="grid grid-cols-3 gap-2 mb-5 text-xs">
        {[
          { label: "Precio", value: flyerData.price },
          { label: "Título flyer", value: flyerData.title },
          { label: "Estado", value: conditionLabels[condition] },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-purple-100 rounded-xl px-3 py-2">
            <div className="text-gray-400 mb-0.5">{item.label}</div>
            <div className="font-semibold text-gray-700 truncate">{item.value}</div>
          </div>
        ))}
      </div>

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
          <div className="mb-4 flex justify-center">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-purple-200"
              style={{ width: PREVIEW_WIDTH, height: previewHeight }}
            >
              <iframe
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
          <div className="flex gap-3">
            <button
              onClick={() => setFlyerHtml(null)}
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
