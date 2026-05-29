"use client";

import { useState } from "react";

interface Props {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
        copied
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
      } ${className}`}
    >
      {copied ? "✓ Copiado" : "📋 Copiar"}
    </button>
  );
}
