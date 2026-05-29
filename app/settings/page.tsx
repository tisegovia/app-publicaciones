"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [contact, setContact] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setContact(localStorage.getItem("publigen_contact") ?? "");
  }, []);

  function handleSave() {
    localStorage.setItem("publigen_contact", contact);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Configuración</h1>
      <p className="text-gray-400 text-sm mb-8">Tus preferencias se guardan localmente en este dispositivo</p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        {/* Contact */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Número / texto de contacto
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Se pre-llena automáticamente en el generador de flyers
          </p>
          <input
            type="text"
            value={contact}
            onChange={(e) => { setContact(e.target.value); setSaved(false); }}
            placeholder="Ej: Llamáme al 11-1234-5678 · WhatsApp disponible"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3 font-semibold rounded-xl transition-all ${
            saved
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {saved ? "✓ Guardado" : "Guardar"}
        </button>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-700">
          <strong>Nota de privacidad:</strong> todos los datos se almacenan únicamente en tu
          navegador (localStorage). No se envía ningún dato personal a ningún servidor externo,
          excepto la imagen a la API de Anthropic para el análisis.
        </p>
      </div>
    </div>
  );
}
