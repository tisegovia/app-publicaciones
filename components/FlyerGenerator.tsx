"use client";

import { useEffect, useState } from "react";
import { FlyerData, ProductCondition } from "@/lib/types";
import { IconCamera, IconDownload, IconChevronLeft } from "./Icons";

interface Props {
  flyerData: FlyerData;
  images: string[];
  condition: ProductCondition;
}

async function compressImage(dataUrl: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const CONDITION_LABELS: Record<ProductCondition, string> = {
  nuevo: "Nuevo", usado: "Usado", reacondicionado: "Reacondicionado",
};

export default function FlyerGenerator({ flyerData, images, condition }: Props) {
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [flyerHtml, setFlyerHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const template = images.length >= 3 ? "tres-fotos" : "una-foto";
  const templateLabel = template === "tres-fotos"
    ? "Principal + 2 detalles" : "Foto principal";

  useEffect(() => {
    setContact(localStorage.getItem("publigen_contact") ?? "");
  }, []);

  async function handleGenerate() {
    setLoading(true); setError(null); setFlyerHtml(null);
    try {
      const compressed = await Promise.all(images.map((img) => compressImage(img, 800)));
      const res = await fetch("/api/flyer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          productData: {
            images: compressed,
            price: flyerData.price, title: flyerData.title,
            description: flyerData.description,
            contact: contact || "Escribime para consultar",
            condition: CONDITION_LABELS[condition], showConditionBadge: true,
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
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1080px;height:1920px;border:none;visibility:hidden;";
      document.body.appendChild(iframe);
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        iframe.srcdoc = flyerHtml!;
        setTimeout(resolve, 3500);
      });
      await new Promise((r) => setTimeout(r, 800));
      const node = iframe.contentDocument?.documentElement;
      if (!node) throw new Error("No se pudo acceder al contenido");
      const dataUrl = await toPng(node, { width: 1080, height: 1920, pixelRatio: 1, style: { transform: "none" } });
      const slug = flyerData.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 30);
      const link = document.createElement("a");
      link.download = `flyer-${slug}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl; link.click();
      document.body.removeChild(iframe);
    } catch (e) {
      console.error(e);
      const blob = new Blob([flyerHtml!], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `flyer-${Date.now()}.html`; link.href = url; link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  const PREVIEW_W = 300;
  const previewScale = PREVIEW_W / 1080;
  const previewH = Math.round(1920 * previewScale);

  return (
    <div className="flyer-card">
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: "var(--r-sm)",
          background: "linear-gradient(140deg, var(--accent-bright), var(--accent))",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "oklch(0.12 0.04 258)",
          boxShadow: "0 3px 14px oklch(0.50 0.15 245 / 0.35)", flexShrink: 0 }}>
          <IconCamera size={20} />
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.015em" }}>
            Flyer para Instagram / WhatsApp
          </p>
          <p className="mono" style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
            Template auto — {templateLabel}
          </p>
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 20 }}>
        {[
          { label: "PRECIO", val: flyerData.price },
          { label: "TÍTULO", val: flyerData.title },
          { label: "ESTADO", val: CONDITION_LABELS[condition] },
        ].map((item) => (
          <div key={item.label} style={{ padding: "8px 14px", borderRadius: "var(--r-sm)",
            background: "var(--surface-2)", border: "1px solid var(--border-soft)" }}>
            <p className="section-label" style={{ marginBottom: 3 }}>{item.label}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Contact input */}
      <div style={{ marginBottom: 20 }}>
        <label className="section-label" style={{ display: "block", marginBottom: 8 }}>
          Contacto (se mostrará en el flyer)
        </label>
        <input
          className="field-input"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Ej: Llamáme al 11-1234-5678"
        />
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: "var(--r-sm)",
          background: "var(--err-dim)", border: "1px solid oklch(0.72 0.18 20 / 0.25)",
          fontSize: 13, color: "var(--err)" }}>
          {error}
        </div>
      )}

      {!flyerHtml ? (
        <button onClick={handleGenerate} disabled={loading} className="btn-primary full">
          {loading
            ? <><div className="spinner" />Generando flyer…</>
            : <><IconCamera size={15} />Generar Flyer</>
          }
        </button>
      ) : (
        <div>
          {/* Preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: PREVIEW_W, height: previewH, borderRadius: "var(--r)",
              overflow: "hidden", border: "1px solid var(--border-soft)",
              boxShadow: "0 8px 40px oklch(0.05 0.04 258 / 0.7)" }}>
              <iframe
                srcDoc={flyerHtml}
                style={{ width: 1080, height: 1920, border: "none",
                  transform: `scale(${previewScale})`, transformOrigin: "top left",
                  pointerEvents: "none" }}
                title="Flyer preview"
              />
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setFlyerHtml(null)} className="btn-ghost"
              style={{ flex: 1 }}>
              <IconChevronLeft size={14} /> Editar
            </button>
            <button onClick={handleDownload} disabled={downloading}
              className="btn-primary" style={{ flex: 1 }}>
              {downloading
                ? <><div className="spinner" />Descargando…</>
                : <><IconDownload size={15} />Descargar PNG</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
