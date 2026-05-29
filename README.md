# PubliGen — Generador de publicaciones con IA

Herramienta personal para generar publicaciones optimizadas de productos en Mercado Libre, Amazon, Facebook Marketplace y OLX Argentina usando Claude AI.

## Funcionalidades

- **Análisis de imagen**: sube una foto y la IA detecta automáticamente el producto
- **Multi-plataforma**: genera los campos específicos de cada plataforma simultáneamente
- **Precios**: sugiere precios en ARS/USD con justificación según el estado del producto
- **Historial**: guarda todas las publicaciones en localStorage para reutilizarlas
- **Copiar campos**: cada campo tiene su botón de copia individual

## Setup local

### 1. Clonar e instalar dependencias

```bash
git clone <repo>
cd publicaciones
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Editá `.env.local` y agregá tu API key de Anthropic:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Podés obtener una en [console.anthropic.com](https://console.anthropic.com).

### 3. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Deploy en Vercel

1. Importá el repositorio en [vercel.com](https://vercel.com)
2. En **Environment Variables**, agregá:
   - `ANTHROPIC_API_KEY` = tu API key
3. Deploy

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- Anthropic SDK (`claude-sonnet-4-5`)

## Estructura

```
app/
  api/generate/route.ts   → endpoint POST que llama a Claude
  history/page.tsx        → página de historial
  page.tsx                → flujo principal (subir foto → configurar → resultados)
components/
  ImageUploader.tsx       → drag & drop de imágenes
  PlatformSelector.tsx    → selector de plataformas, estado y tipo de dólar
  PublicationResult.tsx   → tabs con campos copiables por plataforma
  HistoryList.tsx         → lista del historial
  CopyButton.tsx          → botón de copiar al portapapeles
lib/
  types.ts                → tipos TypeScript
  anthropic.ts            → cliente Anthropic y construcción de prompts
```
