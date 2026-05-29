"use client";

import { useState } from "react";
import { GenerateResponse, Platform, ProductCondition } from "@/lib/types";
import CopyButton from "./CopyButton";
import FlyerGenerator from "./FlyerGenerator";

interface Props {
  result: GenerateResponse;
  platforms: Platform[];
  imageBase64: string;
  condition: ProductCondition;
}

function Field({
  label,
  value,
  maxLen,
  multiline = false,
}: {
  label: string;
  value: string;
  maxLen?: number;
  multiline?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
          {maxLen && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              value.length > maxLen ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
            }`}>
              {value.length}/{maxLen}
            </span>
          )}
        </div>
        <CopyButton text={value} />
      </div>
      {multiline ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{value}</p>
      ) : (
        <p className="text-sm text-gray-800 font-medium">{value}</p>
      )}
    </div>
  );
}

function ArrayField({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <CopyButton text={items.join("\n")} />
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-400 font-bold mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KeyValueField({ label, data }: { label: string; data: Record<string, string> }) {
  const text = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <CopyButton text={text} />
      </div>
      <dl className="space-y-1">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex gap-2 text-sm">
            <dt className="text-gray-500 min-w-[80px]">{k}:</dt>
            <dd className="text-gray-800 font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PriceTag({ price, currency }: { price: number; currency: string }) {
  const formatted = currency === "USD"
    ? `USD ${price.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
    : `$ ${price.toLocaleString("es-AR")}`;
  return (
    <span className="text-2xl font-bold text-green-700">{formatted}</span>
  );
}

const PLATFORM_CONFIG: Record<Platform, { label: string; icon: string; color: string }> = {
  mercadolibre: { label: "Mercado Libre", icon: "🛒", color: "bg-yellow-50 border-yellow-300" },
  amazon: { label: "Amazon", icon: "📦", color: "bg-orange-50 border-orange-300" },
  facebook: { label: "Facebook Marketplace", icon: "👥", color: "bg-blue-50 border-blue-300" },
  olx: { label: "OLX Argentina", icon: "🏷️", color: "bg-green-50 border-green-300" },
};

export default function PublicationResult({ result, platforms, imageBase64, condition }: Props) {
  const [activeTab, setActiveTab] = useState<Platform>(platforms[0]);

  return (
    <div className="space-y-6">
      {/* Product Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{result.producto.nombre}</h2>
        <p className="text-gray-500 text-sm mb-3">{result.producto.descripcion_corta}</p>
        <div className="flex flex-wrap gap-2">
          {result.producto.caracteristicas.map((c, i) => (
            <span key={i} className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {result.precios.map((p, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">{p.plataforma}</div>
            <PriceTag price={p.precio_sugerido} currency={p.moneda} />
            <div className="text-xs text-gray-400 mt-1">
              Rango: {p.moneda === "USD" ? "USD " : "$ "}
              {p.precio_min.toLocaleString("es-AR")} – {p.precio_max.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">{p.justificacion}</p>
          </div>
        ))}
      </div>

      {/* Platform Tabs */}
      {platforms.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {platforms.map((p) => {
            const cfg = PLATFORM_CONFIG[p];
            return (
              <button
                key={p}
                onClick={() => setActiveTab(p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === p ? cfg.color + " shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span>{cfg.icon}</span>
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Platform Fields */}
      <div className="space-y-3">
        {activeTab === "mercadolibre" && result.mercadolibre && (
          <>
            <Field label="Título" value={result.mercadolibre.titulo} maxLen={60} />
            <Field label="Descripción" value={result.mercadolibre.descripcion} multiline />
            <Field label="Categoría" value={result.mercadolibre.categoria} />
            <KeyValueField label="Atributos" data={result.mercadolibre.atributos} />
            <ArrayField label="Tags / Palabras clave" items={result.mercadolibre.tags} />
          </>
        )}
        {activeTab === "amazon" && result.amazon && (
          <>
            <Field label="Product Title" value={result.amazon.title} maxLen={200} />
            <ArrayField label="Bullet Points" items={result.amazon.bullet_points} />
            <Field label="Product Description" value={result.amazon.description} multiline />
            <ArrayField label="Search Terms / Keywords" items={result.amazon.search_terms} />
            <Field label="Categoría" value={result.amazon.categoria} />
          </>
        )}
        {activeTab === "facebook" && result.facebook && (
          <>
            <Field label="Título" value={result.facebook.titulo} maxLen={100} />
            <Field label="Descripción" value={result.facebook.descripcion} multiline />
            <Field label="Categoría" value={result.facebook.categoria} />
            <Field label="Ubicación" value={result.facebook.ubicacion} />
          </>
        )}
        {activeTab === "olx" && result.olx && (
          <>
            <Field label="Título" value={result.olx.titulo} />
            <Field label="Descripción" value={result.olx.descripcion} multiline />
            <Field label="Categoría" value={result.olx.categoria} />
          </>
        )}
      </div>

      {/* Flyer Generator */}
      {result.flyerData && (
        <FlyerGenerator
          flyerData={result.flyerData}
          imageBase64={imageBase64}
          condition={condition}
        />
      )}
    </div>
  );
}
