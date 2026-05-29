import Anthropic from "@anthropic-ai/sdk";
import { Platform, ProductCondition } from "./types";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function buildPrompt(
  platforms: Platform[],
  condition: ProductCondition,
  dollarRate: number,
  extraInfo?: string,
): string {
  const platformInstructions = platforms
    .map((p) => {
      switch (p) {
        case "mercadolibre":
          return `- mercadolibre: título (máx 60 chars), descripción larga en texto plano (sin HTML, sin markdown, solo texto y saltos de línea \\n), condición, precio_ars, categoría sugerida MercadoLibre Argentina, atributos (marca/modelo/etc como objeto clave-valor), array de tags`;
        case "amazon":
          return `- amazon: title (máx 200 chars), array de 5 bullet_points, description, array de search_terms, precio_usd (usar cotización ARS/USD = ${dollarRate}), categoría Amazon`;
        case "facebook":
          return `- facebook: título (máx 100 chars), descripción informal y directa en texto plano (sin HTML), precio_ars, categoría Facebook Marketplace, estado del producto, ubicacion (default "Argentina")`;
        case "olx":
          return `- olx: título, descripción en texto plano (sin HTML), precio_ars, categoría OLX Argentina`;
      }
    })
    .join("\n");

  const conditionDiscount =
    condition === "usado"
      ? "El producto es USADO: aplica un descuento del 20-40% sobre el precio de referencia."
      : condition === "reacondicionado"
      ? "El producto es REACONDICIONADO: aplica un descuento del 10-20% sobre el precio de referencia."
      : "El producto es NUEVO: usa el precio de referencia del mercado.";

  const extraSection = extraInfo
    ? `\nINFORMACIÓN ADICIONAL DEL VENDEDOR (tenela muy en cuenta al generar el contenido):\n${extraInfo}\n`
    : "";

  return `Eres un experto en ventas online en Argentina. Analiza la imagen del producto y genera publicaciones optimizadas para las plataformas seleccionadas.

${conditionDiscount}${extraSection}

Platforms requeridas: ${platforms.join(", ")}

INSTRUCCIONES:
1. Identifica el producto: nombre completo, marca, modelo, características clave
2. Busca precios actuales de referencia en Argentina para este producto usando web search
3. Genera los campos específicos para cada plataforma

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta:
{
  "producto": {
    "nombre": "nombre completo del producto",
    "marca": "marca",
    "modelo": "modelo",
    "descripcion_corta": "descripción en 1-2 oraciones",
    "caracteristicas": ["característica 1", "característica 2", ...]
  },
  "precios": [
    {
      "plataforma": "nombre plataforma",
      "precio_min": 0,
      "precio_max": 0,
      "precio_sugerido": 0,
      "moneda": "ARS" o "USD",
      "justificacion": "por qué este precio"
    }
  ],
  ${platforms.includes("mercadolibre") ? `"mercadolibre": {
    "titulo": "título máx 60 chars",
    "descripcion": "descripción larga en texto plano, sin HTML ni markdown, usando \\n para saltos de línea",
    "condicion": "${condition}",
    "precio_ars": 0,
    "categoria": "categoría sugerida",
    "atributos": {"Marca": "...", "Modelo": "...", "...": "..."},
    "tags": ["tag1", "tag2", ...]
  },` : ""}
  ${platforms.includes("amazon") ? `"amazon": {
    "title": "Product Title",
    "bullet_points": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
    "description": "descripción completa",
    "search_terms": ["keyword1", "keyword2", ...],
    "precio_usd": 0,
    "categoria": "categoría Amazon"
  },` : ""}
  ${platforms.includes("facebook") ? `"facebook": {
    "titulo": "título máx 100 chars",
    "descripcion": "descripción informal y directa",
    "precio_ars": 0,
    "categoria": "categoría",
    "estado": "${condition}",
    "ubicacion": "Argentina"
  },` : ""}
  ${platforms.includes("olx") ? `"olx": {
    "titulo": "título",
    "descripcion": "descripción",
    "precio_ars": 0,
    "categoria": "categoría OLX"
  },` : ""}
  "flyerData": {
    "title": "TÍTULO CORTO EN MAYÚSCULAS (máx 4 palabras clave del producto)",
    "description": "Descripción atractiva ultra corta para flyer (máx 15 palabras)",
    "price": "$XX.XXX (precio sugerido formateado, sin decimales, con puntos de miles, moneda ARS)"
  }
}

Instrucciones específicas por plataforma:
${platformInstructions}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional, sin markdown code blocks.`;
}
