"use client";

import { useEffect, useState } from "react";
import { IconCheck } from "@/components/Icons";

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
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <p className="eyebrow" style={{ marginBottom: 16 }}>Preferencias</p>
      <h1 className="page-title" style={{ marginBottom: 8 }}>Configuración</h1>
      <p style={{ fontSize: 14, color: "var(--text-mute)", marginBottom: 36 }}>
        Se guarda localmente en este dispositivo.
      </p>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
          Número / texto de contacto
        </label>
        <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 14 }}>
          Se pre-llena en el generador de flyers automáticamente
        </p>
        <input
          className="field-input"
          value={contact}
          onChange={(e) => { setContact(e.target.value); setSaved(false); }}
          placeholder="Ej: Llamáme al 11-1234-5678 · WhatsApp disponible"
        />
      </div>

      <button
        onClick={handleSave}
        className={saved ? "btn-ghost" : "btn-primary full"}
        style={saved ? { width: "100%", color: "var(--ok)",
          boxShadow: "inset 0 0 0 1px oklch(0.78 0.13 165 / 0.35)" } : {}}
      >
        {saved ? <><IconCheck size={15} />Guardado</> : "Guardar"}
      </button>

      <div style={{ marginTop: 24, padding: "14px 18px", borderRadius: "var(--r-sm)",
        background: "oklch(0.72 0.15 245 / 0.06)", border: "1px solid oklch(0.72 0.15 245 / 0.12)" }}>
        <p style={{ fontSize: 12.5, color: "var(--text-faint)", lineHeight: 1.6 }}>
          <span style={{ color: "var(--accent-bright)", fontWeight: 600 }}>Privacidad —</span>{" "}
          Los datos se almacenan únicamente en tu navegador. Solo la imagen del producto
          se envía a la API de Anthropic para el análisis.
        </p>
      </div>
    </div>
  );
}
