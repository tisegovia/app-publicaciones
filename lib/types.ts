export type Platform = "mercadolibre" | "amazon" | "facebook" | "olx";
export type ProductCondition = "nuevo" | "usado" | "reacondicionado";
export type DollarType = "oficial" | "blue";

export interface MercadoLibreFields {
  titulo: string;
  descripcion: string;
  condicion: string;
  precio_ars: number;
  categoria: string;
  atributos: Record<string, string>;
  tags: string[];
}

export interface AmazonFields {
  title: string;
  bullet_points: string[];
  description: string;
  search_terms: string[];
  precio_usd: number;
  categoria: string;
}

export interface FacebookFields {
  titulo: string;
  descripcion: string;
  precio_ars: number;
  categoria: string;
  estado: string;
  ubicacion: string;
}

export interface OLXFields {
  titulo: string;
  descripcion: string;
  precio_ars: number;
  categoria: string;
}

export interface PriceReference {
  plataforma: string;
  precio_min: number;
  precio_max: number;
  precio_sugerido: number;
  moneda: string;
  justificacion: string;
}

export interface GenerateResponse {
  producto: {
    nombre: string;
    marca: string;
    modelo: string;
    descripcion_corta: string;
    caracteristicas: string[];
  };
  precios: PriceReference[];
  mercadolibre?: MercadoLibreFields;
  amazon?: AmazonFields;
  facebook?: FacebookFields;
  olx?: OLXFields;
}

export interface HistoryEntry {
  id: string;
  fecha: string;
  imageBase64: string;
  plataformas: Platform[];
  condicion: ProductCondition;
  resultado: GenerateResponse;
}
