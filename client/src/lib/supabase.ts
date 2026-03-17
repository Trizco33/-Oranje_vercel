import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yjpsdotluykhrmccsblz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JDhL4d63zU6FmRvdegwkRA_UqG3SSFl";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabasePlace {
  id: number;
  name: string;
  short_desc?: string | null;
  long_desc?: string | null;
  cover_image?: string | null;
  rating?: number | null;
  review_count?: number | null;
  tags?: string[] | null;
  is_recommended?: boolean;
  is_featured?: boolean;
  address?: string | null;
  maps_url?: string | null;
  status?: string;
  category_id?: number | null;
  partner_id?: number | null;
  price_range?: string | null;
  opening_hours?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  website?: string | null;
  lat?: number | null;
  lng?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Busca todos os lugares ativos do Supabase
 * Ordenado por: is_featured DESC, is_recommended DESC, created_at DESC
 */
export async function getActivePlaces() {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("is_recommended", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] Erro ao buscar lugares:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[Supabase] Erro na conexão:", err);
    return [];
  }
}

/**
 * Busca um lugar específico por ID
 */
export async function getPlaceById(id: number) {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[Supabase] Erro ao buscar lugar:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[Supabase] Erro na conexão:", err);
    return null;
  }
}

/**
 * Busca lugares por categoria
 */
export async function getPlacesByCategory(categoryId: number) {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("category_id", categoryId)
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("is_recommended", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] Erro ao buscar lugares por categoria:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[Supabase] Erro na conexão:", err);
    return [];
  }
}

/**
 * Busca lugares com filtro de texto (nome ou descrição)
 */
export async function searchPlaces(query: string) {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("status", "active")
      .or(`name.ilike.%${query}%,short_desc.ilike.%${query}%`)
      .order("is_featured", { ascending: false })
      .order("is_recommended", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] Erro ao buscar lugares:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[Supabase] Erro na conexão:", err);
    return [];
  }
}

/**
 * Listener em tempo real para mudanças em lugares
 * Retorna um unsubscribe function para limpar o listener
 */
export function subscribeToPlaces(
  onUpdate: (places: SupabasePlace[]) => void,
  onError?: (error: Error) => void
) {
  const subscription = supabase
    .channel("places-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "places",
      },
      (payload: any) => {
        getActivePlaces()
          .then(onUpdate)
          .catch((err) => {
            console.error("[Supabase] Erro ao recarregar lugares:", err);
            if (onError) onError(err);
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

/**
 * Listener em tempo real para mudanças em um lugar específico
 */
export function subscribeToPlace(
  placeId: number,
  onUpdate: (place: SupabasePlace) => void,
  onError?: (error: Error) => void
) {
  const subscription = supabase
    .channel(`place-${placeId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "places",
        filter: `id=eq.${placeId}`,
      },
      (payload: any) => {
        getPlaceById(placeId)
          .then((place) => {
            if (place) onUpdate(place);
          })
          .catch((err) => {
            console.error("[Supabase] Erro ao recarregar lugar:", err);
            if (onError) onError(err);
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}
