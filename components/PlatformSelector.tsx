"use client";

import { Platform, ProductCondition, DollarType } from "@/lib/types";

const PLATFORMS: { id: Platform; label: string; icon: string; color: string }[] = [
  { id: "mercadolibre", label: "Mercado Libre", icon: "🛒", color: "yellow" },
  { id: "amazon", label: "Amazon", icon: "📦", color: "orange" },
  { id: "facebook", label: "Facebook Marketplace", icon: "👥", color: "blue" },
  { id: "olx", label: "OLX Argentina", icon: "🏷️", color: "green" },
];

const CONDITIONS: { id: ProductCondition; label: string; desc: string }[] = [
  { id: "nuevo", label: "Nuevo", desc: "Precio completo de mercado" },
  { id: "reacondicionado", label: "Reacondicionado", desc: "Descuento 10-20%" },
  { id: "usado", label: "Usado", desc: "Descuento 20-40%" },
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
  const colorMap: Record<string, string> = {
    yellow: "border-yellow-400 bg-yellow-50 text-yellow-800",
    orange: "border-orange-400 bg-orange-50 text-orange-800",
    blue: "border-blue-400 bg-blue-50 text-blue-800",
    green: "border-green-400 bg-green-50 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Plataformas
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map((p) => {
            const isSelected = selected.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? colorMap[p.color]
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="font-medium text-sm">{p.label}</span>
                {isSelected && <span className="ml-auto text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Estado del producto
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => onCondition(c.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                condition === c.id
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <div className="font-medium text-sm">{c.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {selected.includes("amazon") && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Cotización USD (para Amazon)
          </h3>
          <div className="flex gap-3">
            {(["oficial", "blue"] as DollarType[]).map((d) => (
              <button
                key={d}
                onClick={() => onDollarType(d)}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  dollarType === d
                    ? "border-green-500 bg-green-50 text-green-800"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                Dólar {d === "oficial" ? "Oficial" : "Blue"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
