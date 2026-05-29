"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HistoryEntry } from "@/lib/types";
import HistoryList from "@/components/HistoryList";
import PublicationResult from "@/components/PublicationResult";
import { IconChevronLeft, IconPlus } from "@/components/Icons";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const router = useRouter();

  useEffect(() => {
    setEntries(JSON.parse(localStorage.getItem("publigen_history") ?? "[]"));
  }, []);

  function handleDelete(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("publigen_history", JSON.stringify(updated));
    if (selected?.id === id) setSelected(null);
  }

  if (selected) {
    const thumb = selected.imageBase64.startsWith("data:")
      ? selected.imageBase64
      : `data:image/jpeg;base64,${selected.imageBase64}`;
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <button onClick={() => setSelected(null)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none",
            border: "none", cursor: "pointer", color: "var(--text-faint)",
            fontSize: 13.5, padding: "6px 0", marginBottom: 24, transition: "color 0.14s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-bright)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}>
          <IconChevronLeft size={15} /> Volver al historial
        </button>

        <div className="flex items-center gap-4" style={{ marginBottom: 28 }}>
          <img src={thumb} alt={selected.resultado.producto.nombre}
            style={{ width: 64, height: 64, objectFit: "cover", borderRadius: "var(--r-sm)",
              border: "1px solid var(--border-soft)", flexShrink: 0 }} />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em",
              color: "var(--text)", marginBottom: 4 }}>
              {selected.resultado.producto.nombre}
            </h1>
            <p className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
              {new Date(selected.fecha).toLocaleDateString("es-AR",
                { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <PublicationResult
          result={selected.resultado}
          platforms={selected.plataformas}
          images={selected.imageBase64s ?? [selected.imageBase64]}
          condition={selected.condicion}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 12 }}>Archivo</p>
          <h1 className="page-title">Historial</h1>
          <p className="mono" style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 6 }}>
            {entries.length} publicación{entries.length !== 1 ? "es" : ""} guardada{entries.length !== 1 ? "s" : ""}
          </p>
        </div>
        {entries.length > 0 && (
          <button onClick={() => router.push("/")} className="btn-ghost">
            <IconPlus size={14} /> Nueva
          </button>
        )}
      </div>
      <HistoryList entries={entries} onOpen={setSelected} onDelete={handleDelete} />
    </div>
  );
}
