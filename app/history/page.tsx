"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HistoryEntry } from "@/lib/types";
import HistoryList from "@/components/HistoryList";
import PublicationResult from "@/components/PublicationResult";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("publigen_history") ?? "[]");
    setEntries(data);
  }, []);

  function handleDelete(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("publigen_history", JSON.stringify(updated));
    if (selected?.id === id) setSelected(null);
  }

  if (selected) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 mb-6"
        >
          ← Volver al historial
        </button>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={selected.imageBase64.startsWith("data:") ? selected.imageBase64 : `data:image/jpeg;base64,${selected.imageBase64}`}
            alt={selected.resultado.producto.nombre}
            className="w-16 h-16 object-cover rounded-xl border border-gray-200"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{selected.resultado.producto.nombre}</h1>
            <p className="text-sm text-gray-400">
              {new Date(selected.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <PublicationResult result={selected.resultado} platforms={selected.plataformas} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial</h1>
          <p className="text-gray-400 text-sm mt-0.5">{entries.length} publicaciones guardadas</p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            + Nueva
          </button>
        )}
      </div>
      <HistoryList entries={entries} onOpen={setSelected} onDelete={handleDelete} />
    </div>
  );
}
