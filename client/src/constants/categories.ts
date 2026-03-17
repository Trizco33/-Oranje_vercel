/**
 * SINGLE SOURCE OF TRUTH para categorias
 * - Slugs oficiais
 * - Covers (imagens)
 * - Icons (emojis/ícones)
 * - Aliases (mapeamento de slugs antigos/alternativos)
 * - Normalização de slug
 */

export const CATEGORY_SLUGS = [
  "restaurantes",
  "pizzarias",
  "bares",
  "cafes",
  "pontos-turisticos",
  "hospedagem",
  "eventos",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/**
 * Mapa único de covers (imagens)
 */
export const CATEGORY_COVERS: Record<CategorySlug, string> = {
  restaurantes: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop",
  pizzarias: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=200&fit=crop",
  bares: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=200&fit=crop",
  cafes: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=200&fit=crop",
  "pontos-turisticos": "https://images.unsplash.com/photo-1490750967868-88df5691cc4c?w=400&h=200&fit=crop",
  hospedagem: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
  eventos: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop",
};

/**
 * Mapa único de ícones (emojis)
 */
export const CATEGORY_ICONS: Record<CategorySlug, string> = {
  restaurantes: "🍽️",
  pizzarias: "🍕",
  bares: "🍷",
  cafes: "☕",
  "pontos-turisticos": "🌷",
  hospedagem: "🏨",
  eventos: "🎪",
};

/**
 * Aliases: mapeamento de slugs alternativos/antigos para o slug oficial
 * Exemplo: "turistico" -> "pontos-turisticos"
 */
export const CATEGORY_SLUG_ALIASES: Record<string, CategorySlug> = {
  turistico: "pontos-turisticos",
  "pontos-turisticos": "pontos-turisticos",
  turismo: "pontos-turisticos",
};

/**
 * Normaliza slug:
 * - trim
 * - lowercase
 * - substitui espaços por hífen
 * - remove acentos
 * - aplica alias se existir
 */
export function normalizeSlug(slug: string): CategorySlug | null {
  if (!slug) return null;

  // Trim e lowercase
  let normalized = slug.trim().toLowerCase();

  // Remover acentos
  normalized = normalized
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Substituir espaços por hífen
  normalized = normalized.replace(/\s+/g, "-");

  // Aplicar alias
  const aliased = CATEGORY_SLUG_ALIASES[normalized];
  if (aliased) return aliased;

  // Verificar se é um slug válido
  if (CATEGORY_SLUGS.includes(normalized as CategorySlug)) {
    return normalized as CategorySlug;
  }

  return null;
}

/**
 * Obtém cover para um slug (com fallback)
 */
export function getCategorycover(slug: string | null | undefined): string {
  if (!slug) return CATEGORY_COVERS.restaurantes;
  const normalized = normalizeSlug(slug);
  if (!normalized) return CATEGORY_COVERS.restaurantes;
  return CATEGORY_COVERS[normalized];
}

/**
 * Obtém ícone para um slug (com fallback)
 */
export function getCategoryIcon(slug: string | null | undefined): string {
  if (!slug) return "📍";
  const normalized = normalizeSlug(slug);
  if (!normalized) return "📍";
  return CATEGORY_ICONS[normalized];
}

/**
 * Verifica se um slug é válido
 */
export function isValidCategorySlug(slug: string | null | undefined): slug is CategorySlug {
  if (!slug) return false;
  return normalizeSlug(slug) !== null;
}
