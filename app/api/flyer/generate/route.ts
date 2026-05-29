import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const maxDuration = 30;

interface ProductData {
  images: string[];          // [0]=main, [1]=detail1, [2]=detail2 — all data URLs
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

function ensureDataUrl(s: string): string {
  if (!s) return "";
  return s.startsWith("data:") ? s : `data:image/jpeg;base64,${s}`;
}

/**
 * Extract the inner HTML string from a bundler-wrapped template file.
 * The wrapper format is:
 *   <script type="__bundler/template">JSON_STRING</script>
 * where JSON_STRING is a JSON-encoded HTML string (not an object).
 * Falls back to returning the raw file if the script tag isn't found.
 */
function extractTemplateHtml(filePath: string): string {
  const raw = readFileSync(filePath, "utf-8");
  const match = raw.match(/<script[^>]+type="__bundler\/template"[^>]*>([\s\S]*?)<\/script>/i);
  if (match) {
    try {
      // The content is a JSON-encoded string (not an object)
      return JSON.parse(match[1].trim()) as string;
    } catch {
      return raw;
    }
  }
  return raw;
}

/**
 * Replace the src attribute of an <img> whose class contains `cls`.
 * Also removes any style="display:none" from that specific img tag
 * so the image becomes visible.
 */
function replaceImgSrc(html: string, cls: string, newSrc: string): string {
  if (!newSrc) return html;
  // Works regardless of attribute order; handles self-closing and non-self-closing img tags
  return html.replace(
    new RegExp(
      `(<img(?=[^>]*\\bclass="[^"]*\\b${cls}\\b)[^>]*)` +   // capture <img ... up to >
      `(\\s*(?:src|style)="[^"]*")*` +                        // skip any src/style attrs already
      `([^>]*>)`,
      "g"
    ),
    (match) => {
      // Remove old src and display:none style, inject new src
      let t = match
        .replace(/\s*src="[^"]*"/g, "")
        .replace(/\s*style="[^"]*display\s*:\s*none[^"]*"/gi, "");
      // Insert src before the closing > or />
      t = t.replace(/(\s*\/?>)$/, ` src="${newSrc}"$1`);
      return t;
    }
  );
}

/**
 * Replace the visible text content of the first element whose class contains `cls`.
 * Handles both <tag class="cls">text</tag> and nested-but-only-text cases.
 * Does NOT recurse into child elements to avoid replacing text in wrong places.
 */
function replaceElementText(html: string, cls: string, newText: string): string {
  // Match opening tag with class, then capture everything up to the first child tag or close tag
  return html.replace(
    new RegExp(
      `(<[a-zA-Z][^>]*\\bclass="[^"]*\\b${cls}\\b[^"]*"[^>]*>)` + // opening tag
      `([^<]*)`,                                                      // text node (no children)
      "g"
    ),
    (_, openTag, _oldText) => `${openTag}${newText}`
  );
}

/**
 * For the condition badge: change display:none → display:inline-block on
 * the element with class product-condition-badge, and set its text.
 */
function injectConditionBadge(html: string, text: string): string {
  // Change style="...display:none..." to display:inline-block on the badge element
  html = html.replace(
    /(<[^>]*\bclass="[^"]*\bproduct-condition-badge\b[^"]*"[^>]*\bstyle=")([^"]*)(")/gi,
    (_, pre, style, post) => {
      const newStyle = style.replace(/display\s*:\s*none/gi, "display:inline-block");
      return `${pre}${newStyle}${post}`;
    }
  );
  // Update the text content
  return replaceElementText(html, "product-condition-badge", text);
}

function injectData(html: string, data: ProductData, template: string): string {
  const [main = "", detail1 = "", detail2 = ""] = data.images.map(ensureDataUrl);
  const fallback = main;

  const conditionLabel =
    { nuevo: "Nuevo", usado: "Usado", reacondicionado: "Reacond." }[
      data.condition.toLowerCase()
    ] ?? data.condition;

  // ── Images ──────────────────────────────────────────────────────────────────
  html = replaceImgSrc(html, "product-image-main", main || fallback);

  if (template === "tres-fotos") {
    html = replaceImgSrc(html, "product-image-detail-1", detail1 || fallback);
    html = replaceImgSrc(html, "product-image-detail-2", detail2 || fallback);
  }

  // ── Text fields ──────────────────────────────────────────────────────────────
  html = replaceElementText(html, "product-price", data.price);
  html = replaceElementText(html, "product-title", data.title.toUpperCase());
  html = replaceElementText(html, "product-description", data.description);
  html = replaceElementText(html, "product-contact", data.contact);

  // ── Condition badge ──────────────────────────────────────────────────────────
  if (data.showConditionBadge) {
    html = injectConditionBadge(html, conditionLabel);
  }

  return html;
}

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { template, productData } = body;

  if (!template || !productData) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const templateFile =
    template === "tres-fotos" ? "flyer-tres-fotos.html" : "flyer-una-foto.html";
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
