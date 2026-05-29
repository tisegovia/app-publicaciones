import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const maxDuration = 30;

interface ProductData {
  imageBase64: string;
  imageDetail1Base64?: string;
  imageDetail2Base64?: string;
  price: string;
  title: string;
  description: string;
  contact: string;
  condition: string;
  showConditionBadge: boolean;
}

interface RequestBody {
  template: "una-foto" | "tres-fotos";
  productData: ProductData;
}

/** Resize an image (base64) client-side is handled before calling this endpoint.
 *  Here we just ensure the data URL prefix is present. */
function ensureDataUrl(base64: string, fallback: string): string {
  if (!base64) return fallback;
  if (base64.startsWith("data:")) return base64;
  return `data:image/jpeg;base64,${base64}`;
}

/** Extract inner HTML from a template file.
 *  Supports two formats:
 *  1. Files with <script type="__bundler/template">{"html":"..."}</script>
 *  2. Plain HTML files (used directly)
 */
function extractTemplateHtml(filePath: string): string {
  const raw = readFileSync(filePath, "utf-8");
  const match = raw.match(/<script[^>]+type="__bundler\/template"[^>]*>([\s\S]*?)<\/script>/i);
  if (match) {
    try {
      const parsed = JSON.parse(match[1].trim());
      return parsed.html ?? parsed;
    } catch {
      return raw;
    }
  }
  return raw;
}

/** Inject product data into the template HTML using token replacement */
function injectData(html: string, data: ProductData, template: string): string {
  const mainImg = ensureDataUrl(data.imageBase64, "");
  const detail1 = ensureDataUrl(data.imageDetail1Base64 ?? data.imageBase64, mainImg);
  const detail2 = ensureDataUrl(data.imageDetail2Base64 ?? data.imageBase64, mainImg);

  const conditionDisplay = data.showConditionBadge ? "inline-flex" : "none";
  const conditionLabel = {
    nuevo: "Nuevo",
    usado: "Usado",
    reacondicionado: "Reacond.",
  }[data.condition.toLowerCase()] ?? data.condition;

  let result = html;

  // Images
  result = result.replace(/%%IMAGE_MAIN_SRC%%/g, mainImg);
  result = result.replace(/%%IMAGE_MAIN_DISPLAY%%/g, mainImg ? "block" : "none");

  if (template === "tres-fotos") {
    result = result.replace(/%%IMAGE_DETAIL_1_SRC%%/g, detail1);
    result = result.replace(/%%IMAGE_DETAIL_2_SRC%%/g, detail2);
  }

  // Text fields
  result = result.replace(/%%PRICE%%/g, escapeHtml(data.price));
  result = result.replace(/%%TITLE%%/g, escapeHtml(data.title.toUpperCase()));
  result = result.replace(/%%DESCRIPTION%%/g, escapeHtml(data.description));
  result = result.replace(/%%CONTACT%%/g, escapeHtml(data.contact));

  // Condition badge
  result = result.replace(/%%CONDITION_DISPLAY%%/g, conditionDisplay);
  result = result.replace(/%%CONDITION%%/g, escapeHtml(conditionLabel));

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { template, productData } = body;

  if (!template || !productData) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const templateFile = template === "tres-fotos" ? "flyer-tres-fotos.html" : "flyer-una-foto.html";
  const templatePath = join(process.cwd(), "public", "templates", templateFile);

  let html: string;
  try {
    html = extractTemplateHtml(templatePath);
  } catch {
    return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
  }

  const injected = injectData(html, productData, template);

  return NextResponse.json({ html: injected });
}
