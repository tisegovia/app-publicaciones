"use client";

import { Platform, ProductCondition, DollarType } from "@/lib/types";

const PLATFORMS: {
  id: Platform; label: string; abbr: string;
  badgeBg: string; badgeColor: string;
}[] = [
  { id: "mercadolibre", label: "Mercado Libre", abbr: "ML",
    badgeBg: "oklch(0.78 0.15 85 / 0.15)", badgeColor: "oklch(0.82 0.14 85)" },
  { id: "amazon", label: "Amazon", abbr: "AMZ",
    badgeBg: "oklch(0.75 0.14 55 / 0.15)", badgeColor: "oklch(0.80 0.13 55)" },
  { id: "facebook", label: "Facebook", abbr: "FB",
    badgeBg: "oklch(0.62 0.14 264 / 0.18)", badgeColor: "oklch(0.72 0.12 264)" },
  { id: "olx", label: "OLX Argentina", abbr: "OLX",
    badgeBg: "oklch(0.72 0.15 245 / 0.14)", badgeColor: "var(--accent-bright)" },
];

const CONDITIONS: { id: ProductCondition; label: string; sub: string }[] = [
  { id: "nuevo",          label: "Nuevo",         sub: "Precio referencia" },
  { id: "reacondicionado",label: "Reacondicionado",sub: "−10–20%" },
  { id: "usado",          label: "Usado",          sub: "−20–40%" },
];

interface Props {
  selected: Platform[];
  condition: ProductCondition;
  dollarType: DollarType;
  onToggle: (p: Platform) => void;
  onCondition: (c: ProductCondition) => void;
  onDollarType: (d: DollarType) => void;
}

export default function PlatformSelector({
  selected, condition, dollarType, onToggle, onCondition, onDollarType,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Platforms */}
      <div>
        <p className="section-label" style={{ marginBottom: 12 }}>Plataformas</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {PLATFORMS.map((p) => {
            const sel = selected.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id)}
                className={`platform-card ${sel ? "selected" : ""}`}
              >
                <div className="platform-badge mono"
                  style={{ background: p.badgeBg, color: p.badgeColor,
                    fontSize: p.abbr.length > 2 ? 9 : 10 }}>
                  {p.abbr}
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 500,
                  color: sel ? "var(--text)" : "var(--text-mute)" }}>
                  {p.label}
                </span>
                {sel && (
                  <div style={{ marginLeft: "auto", width: 18, height: 18,
                    borderRadius: "50%", background: "var(--accent-dim)",
                    border: "1px solid var(--accent)", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                      stroke="var(--accent-bright)" strokeWidth="2.8" strokeLinecap="round"
                      strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition */}
      <div>
        <p className="section-label" style={{ marginBottom: 12 }}>Estado del producto</p>
        <div style={{ display: "flex", gap: 10 }}>
          {CONDITIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => onCondition(c.id)}
              className={`condition-card ${condition === c.id ? "selected" : ""}`}
            >
              <div style={{ fontSize: 13.5, fontWeight: 600,
                color: condition === c.id ? "var(--accent-bright)" : "var(--text-mute)",
                marginBottom: 2 }}>
                {c.label}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--text-faint)" }}>
                {c.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dollar type (Amazon only) */}
      {selected.includes("amazon") && (
        <div>
          <p className="section-label" style={{ marginBottom: 12 }}>
            Cotización USD para Amazon
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {(["oficial", "blue"] as DollarType[]).map((d) => (
              <button
                key={d}
                onClick={() => onDollarType(d)}
                className={`condition-card ${dollarType === d ? "selected" : ""}`}
                style={{ flex: 1 }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 600,
                  color: dollarType === d ? "var(--accent-bright)" : "var(--text-mute)" }}>
                  Dólar {d === "oficial" ? "Oficial" : "Blue"}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
