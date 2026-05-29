"use client";

import { useState } from "react";
import ImageUploader, { ImageFile } from "@/components/ImageUploader";
import PlatformSelector from "@/components/PlatformSelector";
import PublicationResult from "@/components/PublicationResult";
import { GenerateResponse, HistoryEntry, Platform, ProductCondition, DollarType } from "@/lib/types";

type Step = "upload" | "configure" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>(["mercadolibre"]);
  const [condition, setCondition] = useState<ProductCondition>("nuevo");
  const [dollarType, setDollarType] = useState<DollarType>("blue");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleImagesChange(newImages: ImageFile[]) {
    setImages(newImages);
    // Avanzar al paso 2 automáticamente cuando se sube la primera foto
    if (newImages.length > 0 && step === "upload") {
      setStep("configure");
    }
    // Volver al paso 1 si se eliminan todas las fotos
    if (newImages.length === 0) {
      setStep("upload");
    }
  }

  async function handleGenerate() {
    if (!platforms.length) {
      setError("Seleccioná al menos una plataforma");
      return;
    }
    if (!images.length) {
      setError("Subí al menos una foto del producto");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const mainImage = images[0];
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: mainImage.base64,
          imageMimeType: mainImage.mimeType,
          platforms,
          condition,
          dollarType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar");

      setResult(data);

      // Guardar en historial
      const previews = images.map((img) => img.preview);
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        imageBase64: previews[0],
        imageBase64s: previews,
        plataformas: platforms,
        condicion: condition,
        resultado: data,
      };
      const history: HistoryEntry[] = JSON.parse(
        localStorage.getItem("publigen_history") ?? "[]"
      );
      localStorage.setItem("publigen_history", JSON.stringify([entry, ...history]));

      setStep("result");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("upload");
    setImages([]);
    setResult(null);
    setError(null);
    setPlatforms(["mercadolibre"]);
    setCondition("nuevo");
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["upload", "configure", "result"] as Step[]).map((s, i) => {
          const labels = ["Subir fotos", "Configurar", "Resultados"];
          const done = ["upload", "configure", "result"].indexOf(step) > i;
          const active = step === s;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-sm font-medium ${
                active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  active ? "bg-blue-600 text-white" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {done ? "✓" : i + 1}
                </span>
                {labels[i]}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${done ? "bg-green-300" : "bg-gray-200"}`} />}
            </div>
          );
        })}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Subí las fotos del producto</h1>
          <p className="text-gray-500 mb-6">
            La IA analiza la primera foto. Con 3 fotos el flyer incluye imágenes de detalle.
          </p>
          <ImageUploader images={images} onImagesChange={handleImagesChange} />
        </div>
      )}

      {/* Step: Configure */}
      {step === "configure" && (
        <div>
          <div className="flex items-start gap-4 mb-6">
            {/* Thumbnails de las fotos */}
            <div className="flex gap-2 flex-shrink-0">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.preview}
                  alt={`Foto ${i + 1}`}
                  className={`object-cover rounded-xl border border-gray-200 ${
                    i === 0 ? "w-20 h-20" : "w-12 h-12 opacity-75"
                  }`}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">Configurar publicación</h1>
              <button
                onClick={() => setStep("upload")}
                className="text-sm text-blue-500 hover:text-blue-700 mt-0.5"
              >
                ← Cambiar fotos
              </button>
            </div>
          </div>

          {/* Upload adicional inline */}
          {images.length < 3 && (
            <div className="mb-5">
              <ImageUploader images={images} onImagesChange={handleImagesChange} />
            </div>
          )}

          <PlatformSelector
            selected={platforms}
            condition={condition}
            dollarType={dollarType}
            onToggle={togglePlatform}
            onCondition={setCondition}
            onDollarType={setDollarType}
          />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !platforms.length}
            className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generando publicaciones…
              </>
            ) : (
              <>🚀 Generar publicaciones con IA</>
            )}
          </button>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && result && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Publicaciones generadas</h1>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              + Nueva
            </button>
          </div>
          <PublicationResult
            result={result}
            platforms={platforms}
            images={images.map((img) => img.preview)}
            condition={condition}
          />
        </div>
      )}
    </div>
  );
}
