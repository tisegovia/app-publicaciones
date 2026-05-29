"use client";

import { useState } from "react";
import { GenerateResponse, Platform, ProductCondition } from "@/lib/types";
import CopyButton from "./CopyButton";
import FlyerGenerator from "./FlyerGenerator";

interface Props {
  result: GenerateResponse;
  platforms: Platform[];
  images: string[];
  condition: ProductCondition;
}

/* ── Field components ───────────────────────────────────────── */
function Field({ label, value, maxLen, multiline = false }:
  { label: string; value: string; maxLen?: number; multiline?: boolean }) {
  return (
    <div className="field-card">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="field-label">{label}</span>
          {maxLen && (
            <span className={`char-counter ${value.length > maxLen ? "over" : ""}`}>
              {value.length}/{maxLen}
            </span>
          )}
        </div>
        <CopyButton text={value} />
      </div>
      {multiline
        ? <p style={{ fontSize: 13.5, color: "var(--text-mute)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{value}</p>
        : <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>{value}</p>
      }
    </div>
  );
}

function ArrayField({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="field-card">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="field-label">{label}</span>
        <CopyButton text={items.join("\n")} />
      </div>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2"
            style={{ fontSize: 13.5, color: "var(--text-mute)", lineHeight: 1.5 }}>
            <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)",
              fontSize: 10, marginTop: 4, flexShrink: 0 }}>—</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function KeyValueField({ label, data }: { label: string; data: Record<string, string> }) {
  const text = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
  return (
    <div className="field-card">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="field-label">{label}</span>
        <CopyButton text={text} />
      </div>
      <dl style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex gap-3" style={{ fontSize: 13.5 }}>
            <dt className="mono" style={{ color: "var(--text-faint)", fontSize: 11.5,
              minWidth: 90, paddingTop: 2 }}>{k}</dt>
            <dd style={{ color: "var(--text)", fontWeight: 500 }}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── Platform config ────────────────────────────────────────── */
const TABS: { id: Platform; label: string; abbr: string }[] = [
  { id: "mercadolibre", label: "Mercado Libre", abbr: "ML" },
  { id: "amazon",       label: "Amazon",         abbr: "AMZ" },
  { id: "facebook",     label: "Facebook",        abbr: "FB" },
  { id: "olx",          label: "OLX",             abbr: "OLX" },
];

/* ── Main component ─────────────────────────────────────────── */
export default function PublicationResult({ result, platforms, images, condition }: Props) {
  const [activeTab, setActiveTab] = useState<Platform>(platforms[0]);
  const firstPrice = result.precios[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Product summary */}
      <div className="card" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
        {/* Top accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent 5%, var(--accent-dim) 25%, var(--accent) 50%, var(--accent-dim) 75%, transparent 95%)" }} />
        <div className="flex items-start gap-4">
          {images[0] && (
            <img src={images[0]} alt="Producto"
              style={{ width: 72, height: 72, objectFit: "cover", borderRadius: "var(--r-sm)",
                border: "1px solid var(--border-soft)", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em",
              marginBottom: 4, color: "var(--text)" }}>
              {result.producto.nombre}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--text-mute)", marginBottom: 12 }}>
              {result.producto.descripcion_corta}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.producto.caracteristicas.map((c, i) => (
                <span key={i} className="chip chip-mute">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Price cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {result.precios.map((p, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <p className="section-label" style={{ marginBottom: 8 }}>{p.plataforma}</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="price-display">
                {p.moneda === "USD" ? "USD " : "$ "}
                {p.precio_sugerido.toLocaleString("es-AR")}
              </span>
            </div>
            <p className="mono" style={{ fontSize: 10.5, color: "var(--text-faint)", marginBottom: 6 }}>
              Rango: {p.moneda === "USD" ? "USD " : "$ "}
              {p.precio_min.toLocaleString("es-AR")} – {p.precio_max.toLocaleString("es-AR")}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-faint)", fontStyle: "italic" }}>
              {p.justificacion}
            </p>
          </div>
        ))}
      </div>

      {/* Platform tabs */}
      {platforms.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {TABS.filter((t) => platforms.includes(t.id)).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`platform-tab ${activeTab === t.id ? "active" : ""}`}
            >
              <span className="mono" style={{ fontSize: 9.5, fontWeight: 700 }}>{t.abbr}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {activeTab === "mercadolibre" && result.mercadolibre && (<>
          <Field label="Título" value={result.mercadolibre.titulo} maxLen={60} />
          <Field label="Descripción" value={result.mercadolibre.descripcion} multiline />
          <Field label="Categoría" value={result.mercadolibre.categoria} />
          <KeyValueField label="Atributos" data={result.mercadolibre.atributos} />
          <ArrayField label="Tags / Palabras clave" items={result.mercadolibre.tags} />
        </>)}
        {activeTab === "amazon" && result.amazon && (<>
          <Field label="Product Title" value={result.amazon.title} maxLen={200} />
          <ArrayField label="Bullet Points" items={result.amazon.bullet_points} />
          <Field label="Product Description" value={result.amazon.description} multiline />
          <ArrayField label="Search Terms" items={result.amazon.search_terms} />
          <Field label="Categoría" value={result.amazon.categoria} />
        </>)}
        {activeTab === "facebook" && result.facebook && (<>
          <Field label="Título" value={result.facebook.titulo} maxLen={100} />
          <Field label="Descripción" value={result.facebook.descripcion} multiline />
          <Field label="Categoría" value={result.facebook.categoria} />
          <Field label="Ubicación" value={result.facebook.ubicacion} />
        </>)}
        {activeTab === "olx" && result.olx && (<>
          <Field label="Título" value={result.olx.titulo} />
          <Field label="Descripción" value={result.olx.descripcion} multiline />
          <Field label="Categoría" value={result.olx.categoria} />
        </>)}
      </div>

      {/* Flyer generator */}
      {result.flyerData && (
        <FlyerGenerator flyerData={result.flyerData} images={images} condition={condition} />
      )}
    </div>
  );
}
