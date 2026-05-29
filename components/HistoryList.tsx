"use client";

import { HistoryEntry } from "@/lib/types";

interface Props {
  entries: HistoryEntry[];
  onOpen: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

const PLATFORM_LABELS: Record<string, string> = {
  mercadolibre: "ML",
  amazon: "AMZ",
  facebook: "FB",
  olx: "OLX",
};

const CONDITION_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  usado: "Usado",
  reacondicionado: "Reacond.",
};

export default function HistoryList({ entries, onOpen, onDelete }: Props) {
  if (!entries.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-4">🗂️</div>
        <p className="text-lg font-medium">Sin publicaciones todavía</p>
        <p className="text-sm mt-1">Las publicaciones generadas aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {entries.map((entry) => {
        const precio = entry.resultado.precios[0];
        return (
          <div
            key={entry.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow"
          >
            <img
              src={entry.imageBase64.startsWith("data:") ? entry.imageBase64 : `data:image/jpeg;base64,${entry.imageBase64}`}
              alt={entry.resultado.producto.nombre}
              className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 truncate">{entry.resultado.producto.nombre}</h3>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 text-lg"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date(entry.fecha).toLocaleDateString("es-AR", {
                  day: "numeric", month: "short", year: "numeric",
                })}
                {" · "}
                {CONDITION_LABELS[entry.condicion]}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {entry.plataformas.map((p) => (
                  <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {PLATFORM_LABELS[p]}
                  </span>
                ))}
                {precio && (
                  <span className="text-sm font-bold text-green-700 ml-auto">
                    {precio.moneda === "USD" ? "USD " : "$ "}
                    {precio.precio_sugerido.toLocaleString("es-AR")}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onOpen(entry)}
              className="self-center text-blue-500 hover:text-blue-700 text-sm font-medium flex-shrink-0"
            >
              Ver →
            </button>
          </div>
        );
      })}
    </div>
  );
}
