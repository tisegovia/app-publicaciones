"use client";

import { HistoryEntry } from "@/lib/types";
import { IconX, IconArrowRight, IconImage } from "./Icons";

const PLATFORM_ABBR: Record<string, string> = {
  mercadolibre: "ML", amazon: "AMZ", facebook: "FB", olx: "OLX",
};
const CONDITION_LABELS: Record<string, string> = {
  nuevo: "Nuevo", usado: "Usado", reacondicionado: "Reacond.",
};

interface Props {
  entries: HistoryEntry[];
  onOpen: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

export default function HistoryList({ entries, onOpen, onDelete }: Props) {
  if (!entries.length) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: "var(--r)",
          background: "var(--surface)", border: "1px solid var(--border-soft)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", color: "var(--text-faint)" }}>
          <IconImage size={28} />
        </div>
        <p style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
          Sin publicaciones todavía
        </p>
        <p style={{ fontSize: 14, color: "var(--text-faint)" }}>
          Las publicaciones generadas aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {entries.map((entry) => {
        const precio = entry.resultado.precios[0];
        const thumb = entry.imageBase64.startsWith("data:")
          ? entry.imageBase64
          : `data:image/jpeg;base64,${entry.imageBase64}`;
        return (
          <div key={entry.id} className="card"
            style={{ padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
            <img src={thumb} alt={entry.resultado.producto.nombre}
              style={{ width: 68, height: 68, objectFit: "cover",
                borderRadius: "var(--r-sm)", border: "1px solid var(--border-soft)",
                flexShrink: 0, background: "var(--surface-2)" }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-start justify-between gap-2" style={{ marginBottom: 4 }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  letterSpacing: "-0.01em" }}>
                  {entry.resultado.producto.nombre}
                </h3>
                <button onClick={() => onDelete(entry.id)}
                  style={{ background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-faint)", padding: 4, borderRadius: 6,
                    display: "flex", transition: "color 0.14s", flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--err)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}
                  title="Eliminar">
                  <IconX size={14} />
                </button>
              </div>

              <p className="mono" style={{ fontSize: 10.5, color: "var(--text-faint)", marginBottom: 8 }}>
                {new Date(entry.fecha).toLocaleDateString("es-AR", {
                  day: "numeric", month: "short", year: "numeric" })}
                {" · "}{CONDITION_LABELS[entry.condicion]}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                {entry.plataformas.map((p) => (
                  <span key={p} className="chip chip-mute mono" style={{ fontSize: 9.5 }}>
                    {PLATFORM_ABBR[p]}
                  </span>
                ))}
                {precio && (
                  <span className="mono" style={{ marginLeft: "auto", fontSize: 14,
                    fontWeight: 700, color: "var(--text)" }}>
                    {precio.moneda === "USD" ? "USD " : "$ "}
                    {precio.precio_sugerido.toLocaleString("es-AR")}
                  </span>
                )}
              </div>
            </div>

            <button onClick={() => onOpen(entry)}
              style={{ background: "none", border: "none", cursor: "pointer",
                color: "var(--accent)", padding: "8px 4px", display: "flex",
                alignItems: "center", flexShrink: 0, transition: "color 0.14s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-bright)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--accent)")}>
              <IconArrowRight size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
