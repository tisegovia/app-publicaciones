import { NextRequest, NextResponse } from "next/server";
import { anthropic, buildPrompt } from "@/lib/anthropic";
import { Platform, ProductCondition } from "@/lib/types";

export const maxDuration = 60;

interface RequestBody {
  imageBase64: string;
  imageMimeType: string;
  platforms: Platform[];
  condition: ProductCondition;
  dollarType: "oficial" | "blue";
}

async function fetchDollarRate(type: "oficial" | "blue"): Promise<number> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    const key = type === "blue" ? "blue" : "oficial";
    const entry = data.find((d: { casa: string }) => d.casa === key);
    return entry?.venta ?? (type === "blue" ? 1200 : 1000);
  } catch {
    return type === "blue" ? 1200 : 1000;
  }
}

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { imageBase64, imageMimeType, platforms, condition, dollarType } = body;

  if (!imageBase64 || !platforms?.length) {
    return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
  }

  const dollarRate = await fetchDollarRate(dollarType);
  const prompt = buildPrompt(platforms, condition, dollarRate);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: imageMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";

  let parsed;
  try {
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Error al parsear respuesta de la IA", raw: rawText },
      { status: 500 }
    );
  }

  return NextResponse.json({ ...parsed, dollarRate });
}
