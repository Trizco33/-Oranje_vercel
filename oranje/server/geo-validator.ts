/**
 * geo-validator.ts
 * Camada estrutural de confiabilidade geográfica do Oranje.
 *
 * Responsabilidades:
 *   1. Validação rápida (bounds + zona suspeita) — síncrona, zero latência
 *   2. Validação via geocodificação reversa Nominatim — assíncrona, opcional
 *   3. Auditoria batch de todos os lugares públicos
 *   4. Cálculo de offset sistemático para detecção de erros em grupo
 *
 * Regras derivadas da auditoria OSM de 2026-04 (Holambra):
 *   - Zona comercial central: lat [-22.645, -22.625], lng [-47.056, -47.040]
 *   - Zona suspeita histórica (erro de ~1.1km): lng < SUSPECT_LNG_THRESHOLD
 *   - Qualquer ponto fora dos bounds de Holambra → definitivamente errado
 */

export type GeoStatus = "ok" | "suspect" | "out_of_bounds" | "unverified" | "needs_review";

export interface GeoValidationResult {
  status: GeoStatus;
  reason?: string;
  distanceFromGeocodeM?: number;
  geocodedLat?: number;
  geocodedLng?: number;
}

// ─── Constantes derivadas de dados OSM reais de Holambra ─────────────────────

export const HOLAMBRA_BOUNDS = {
  minLat: -22.680,
  maxLat: -22.590,
  minLng: -47.090,
  maxLng: -47.025,
};

/** Longitude abaixo deste valor é historicamente a "zona de erro sistemático".
 *  Todos os lugares comerciais reais de Holambra têm lng > -47.057. */
export const SUSPECT_LNG_THRESHOLD = -47.057;

/** Lat range da área comercial central (Boulevard Holandês + entorno).
 *  Usado para identificar se um lugar "deveria" estar na zona correta. */
export const HOLAMBRA_COMMERCIAL_LAT = { min: -22.647, max: -22.624 };

/** Distância máxima aceitável entre coords salvas e resultado de geocodificação (metros).
 *  Acima disso → suspect. Nominatim para pt-BR normalmente retorna centroide da rua
 *  (±200m) então 600m é um threshold conservador. */
export const MAX_GEOCODE_DEVIATION_M = 600;

// ─── Funções utilitárias ──────────────────────────────────────────────────────

export function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ─── 1. Validação rápida (síncrona) ──────────────────────────────────────────

/**
 * Validação instantânea por bounds e zona suspeita histórica.
 * Não faz nenhuma chamada de rede. Use antes de salvar qualquer lugar.
 */
export function quickValidate(lat: number | null | undefined, lng: number | null | undefined): GeoValidationResult {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return { status: "unverified", reason: "Coordenadas ausentes" };
  }

  if (
    lat < HOLAMBRA_BOUNDS.minLat || lat > HOLAMBRA_BOUNDS.maxLat ||
    lng < HOLAMBRA_BOUNDS.minLng || lng > HOLAMBRA_BOUNDS.maxLng
  ) {
    return {
      status: "out_of_bounds",
      reason: `Ponto fora dos limites de Holambra (lat ${lat.toFixed(4)}, lng ${lng.toFixed(4)})`,
    };
  }

  const inCommercialLatZone =
    lat >= HOLAMBRA_COMMERCIAL_LAT.min && lat <= HOLAMBRA_COMMERCIAL_LAT.max;

  if (inCommercialLatZone && lng < SUSPECT_LNG_THRESHOLD) {
    return {
      status: "suspect",
      reason: `Longitude ${lng.toFixed(4)} fora da faixa comercial de Holambra — histórico de erro de ~1.1km (esperado > ${SUSPECT_LNG_THRESHOLD})`,
    };
  }

  return { status: "ok" };
}

// ─── 2. Validação via Nominatim (assíncrona) ─────────────────────────────────

/**
 * Geocodifica o endereço via Nominatim e compara com as coords salvas.
 * Retorna suspect se desvio > MAX_GEOCODE_DEVIATION_M.
 *
 * NOTA: Nominatim tem limite de 1 req/segundo. Use com throttling em batch.
 */
export async function geocodeValidate(
  lat: number,
  lng: number,
  address: string,
): Promise<GeoValidationResult> {
  try {
    const query = `${address}, Holambra, SP, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`;
    const res = await fetch(url, {
      headers: { "User-Agent": "OranjeGeoValidator/1.0 (oranjeapp.com.br)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { status: "unverified", reason: `Nominatim HTTP ${res.status}` };

    const data = await res.json();
    if (!data || data.length === 0) {
      return { status: "unverified", reason: "Endereço não encontrado no Nominatim" };
    }

    const geocodedLat = parseFloat(data[0].lat);
    const geocodedLng = parseFloat(data[0].lon);
    const distM = haversineM(lat, lng, geocodedLat, geocodedLng);

    if (distM > MAX_GEOCODE_DEVIATION_M) {
      return {
        status: "suspect",
        reason: `Coords salvas estão ${distM}m do endereço geocodificado (máx ${MAX_GEOCODE_DEVIATION_M}m)`,
        distanceFromGeocodeM: distM,
        geocodedLat,
        geocodedLng,
      };
    }

    return { status: "ok", distanceFromGeocodeM: distM, geocodedLat, geocodedLng };
  } catch (err: any) {
    return { status: "unverified", reason: `Geocodificação falhou: ${err.message}` };
  }
}

// ─── 3. Validação combinada para uso no router ────────────────────────────────

/**
 * Valida coords de um lugar novo/editado.
 * - quickValidate imediato (sempre)
 * - geocodeValidate assíncrono (se address disponível e quickValidate passou)
 *
 * Retorna: { geoStatus, geoNote } para persistir no banco.
 */
export async function validatePlaceCoords(
  lat: number | null | undefined,
  lng: number | null | undefined,
  address?: string | null,
): Promise<{ geoStatus: GeoStatus; geoNote: string | null }> {
  const quick = quickValidate(lat, lng);

  if (quick.status !== "ok") {
    return { geoStatus: quick.status, geoNote: quick.reason ?? null };
  }

  if (address && lat != null && lng != null) {
    const geo = await geocodeValidate(lat, lng, address);
    if (geo.status === "suspect") {
      return {
        geoStatus: "suspect",
        geoNote: geo.reason ?? null,
      };
    }
  }

  return { geoStatus: "ok", geoNote: null };
}

// ─── 4. Auditoria batch ───────────────────────────────────────────────────────

export interface PlaceAuditResult {
  id: number;
  name: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  currentGeoStatus: string | null;
  auditStatus: GeoStatus;
  reason?: string;
}

/**
 * Audita uma lista de lugares e classifica cada um.
 * Usa apenas quickValidate (sem rede) para ser executável a qualquer momento.
 */
export function auditPlaces(
  places: Array<{ id: number; name: string; lat: any; lng: any; address?: string | null; geoStatus?: string | null }>
): PlaceAuditResult[] {
  return places.map((p) => {
    const lat = p.lat != null ? parseFloat(String(p.lat)) : null;
    const lng = p.lng != null ? parseFloat(String(p.lng)) : null;
    const result = quickValidate(lat, lng);
    return {
      id: p.id,
      name: p.name,
      lat,
      lng,
      address: p.address ?? null,
      currentGeoStatus: p.geoStatus ?? null,
      auditStatus: result.status,
      reason: result.reason,
    };
  });
}

/**
 * Detecta offset sistemático em um grupo de lugares da mesma rua.
 * Retorna o offset médio se for consistente (desvio padrão baixo).
 */
export function detectSystematicOffset(
  places: Array<{ lat: number; lng: number; osmLat: number; osmLng: number }>
): { deltaLat: number; deltaLng: number; consistencyScore: number } | null {
  if (places.length < 2) return null;

  const deltas = places.map((p) => ({
    lat: p.osmLat - p.lat,
    lng: p.osmLng - p.lng,
  }));

  const avgLat = deltas.reduce((s, d) => s + d.lat, 0) / deltas.length;
  const avgLng = deltas.reduce((s, d) => s + d.lng, 0) / deltas.length;

  const stdLat = Math.sqrt(deltas.reduce((s, d) => s + (d.lat - avgLat) ** 2, 0) / deltas.length);
  const stdLng = Math.sqrt(deltas.reduce((s, d) => s + (d.lng - avgLng) ** 2, 0) / deltas.length);

  const consistencyScore = 1 - (stdLat + stdLng) / (Math.abs(avgLat) + Math.abs(avgLng) + 0.0001);

  return { deltaLat: avgLat, deltaLng: avgLng, consistencyScore };
}
