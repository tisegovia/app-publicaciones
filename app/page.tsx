"use client";

import { useState } from "react";
import ImageUploader, { ImageFile } from "@/components/ImageUploader";
import PlatformSelector from "@/components/PlatformSelector";
import PublicationResult from "@/components/PublicationResult";
import { IconCheck, IconSparkle, IconChevronLeft } from "@/components/Icons";
import { GenerateResponse, HistoryEntry, Platform, ProductCondition, DollarType } from "@/lib/types";

type Step = "upload" | "configure" | "result";
const STEPS: Step[] = ["upload", "configure", "result"];
const STEP_LABELS = ["Subir fotos", "Configurar", "Resultados"];

function Stepper({ current }: { current: Step }) {
  const ci = STEPS.indexOf(current);
  return (
    <div className="stepper mb-10">
      {STEPS.map((s, i) => {
        const state = ci > i ? "done" : ci === i ? "active" : "pending";
        return (
          <div key={s} className="flex items-center" style={{ flex: i < 2 ? 1 : undefined }}>
            <div className="flex items-center gap-2">
              <div className={`stepper-dot ${state}`}>
                {state === "done"
                  ? <IconCheck size={13} />
                  : <span className="mono">{i + 1}</span>
                }
              </div>
              <span className={`stepper-label ${state}`}>{STEP_LABELS[i]}</span>
            </div>
            {i < 2 && (
              <div className={`stepper-connector ${ci > i ? "filled" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>(["mercadolibre"]);
  const [condition, setCondition] = useState<ProductCondition>("nuevo");
  const [dollarType, setDollarType] = useState<DollarType>("blue");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  function handleImagesChange(next: ImageFile[]) {
    setImages(next);
    if (next.length > 0 && step === "upload") setStep("configure");
    if (next.length === 0) setStep("upload");
  }

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  async function handleGenerate() {
    if (!platforms.length) { setError("Seleccioná al menos un destino"); return; }
    if (!images.length)    { setError("Subí al menos una foto del producto"); return; }
    setLoading(true); setError(null);
    try {
      const main = images[0];
      // "flyer" is a UI-only destination; filter it before sending to the API
      const apiPlatforms = platforms.filter((p) => p !== "flyer");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: main.base64, imageMimeType: main.mimeType,
          platforms: apiPlatforms, condition, dollarType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar");
      setResult(data);

      const previews = images.map((i) => i.preview);
      const entry: HistoryEntry = {
        id: Date.now().toString(), fecha: new Date().toISOString(),
        imageBase64: previews[0], imageBase64s: previews,
        plataformas: platforms, condicion: condition, resultado: data,
      };
      const history: HistoryEntry[] = JSON.parse(localStorage.getItem("publigen_history") ?? "[]");
      localStorage.setItem("publigen_history", JSON.stringify([entry, ...history]));
      setStep("result");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("upload"); setImages([]); setResult(null); setError(null);
    setPlatforms(["mercadolibre"]); setCondition("nuevo");
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <Stepper current={step} />

      {/* ── STEP 1: Upload ─────────────────────────────────────────── */}
      {step === "upload" && (
        <div>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Paso 1 de 3</p>
          <h1 className="page-title" style={{ marginBottom: 8 }}>
            Subí las <span className="gradient-text">fotos</span> del producto
          </h1>
          <p style={{ fontSize: 14.5, color: "var(--text-mute)", marginBottom: 32 }}>
            La IA analiza la primera foto. Con 3 fotos el flyer incluye imágenes de detalle.
          </p>
          <ImageUploader images={images} onImagesChange={handleImagesChange} />
        </div>
      )}

      {/* ── STEP 2: Configure ──────────────────────────────────────── */}
      {step === "configure" && (
        <div>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Paso 2 de 3</p>
          <h1 className="page-title" style={{ marginBottom: 24 }}>
            Configurar <span className="gradient-text">publicación</span>
          </h1>

          {/* Image thumbnails row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            {images.map((img, i) => (
              <img key={i} src={img.preview} alt={`Foto ${i+1}`}
                style={{ width: i === 0 ? 64 : 44, height: i === 0 ? 64 : 44,
                  objectFit: "cover", borderRadius: "var(--r-sm)",
                  border: "1px solid var(--border-soft)", opacity: i === 0 ? 1 : 0.7,
                  flexShrink: 0 }} />
            ))}
            <button onClick={() => setStep("upload")}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "none",
                border: "none", cursor: "pointer", color: "var(--text-faint)",
                fontSize: 13, padding: "6px 10px", borderRadius: "var(--r-sm)",
                transition: "color 0.14s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-bright)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}>
              <IconChevronLeft size={14} /> Cambiar fotos
            </button>
          </div>

          {/* Add more photos inline */}
          {images.length < 3 && (
            <div style={{ marginBottom: 28 }}>
              <ImageUploader images={images} onImagesChange={handleImagesChange} />
            </div>
          )}

          <PlatformSelector
            selected={platforms} condition={condition} dollarType={dollarType}
            onToggle={togglePlatform} onCondition={setCondition} onDollarType={setDollarType}
          />

          {error && (
            <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: "var(--r-sm)",
              background: "var(--err-dim)", border: "1px solid oklch(0.72 0.18 20 / 0.25)",
              fontSize: 13.5, color: "var(--err)" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !platforms.length}
            className="btn-primary full"
            style={{ marginTop: 28 }}
          >
            {loading ? (
              <><div className="spinner" />Generando publicaciones…</>
            ) : (
              <><IconSparkle size={16} />Generar con IA</>
            )}
          </button>
        </div>
      )}

      {/* ── STEP 3: Result ─────────────────────────────────────────── */}
      {step === "result" && result && (
        <div>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Paso 3 de 3</p>
          <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
            <h1 className="page-title">
              <span className="gradient-text">Publicaciones</span> generadas
            </h1>
            <button onClick={reset} className="btn-ghost">
              Nueva
            </button>
          </div>
          <PublicationResult
            result={result} platforms={platforms}
            images={images.map((i) => i.preview)} condition={condition}
          />
        </div>
      )}
    </div>
  );
}
