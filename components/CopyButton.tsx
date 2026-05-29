"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "./Icons";

interface Props { text: string; }

export default function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={copy} className={`copy-btn ${copied ? "copied" : ""}`}>
      {copied
        ? <><IconCheck size={11} /> Copiado</>
        : <><IconCopy size={11} /> Copiar</>
      }
    </button>
  );
}
