/**
 * Data hooks — all use real tRPC API calls.
 * 
 * NOTE: The filename "useMockData" is legacy. Every hook here hits the
 * live backend. The only fallback to local data is for articles/blog
 * content when the articles table is empty (curated seed content).
 */
import { useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { mockArticles, mockArticleCategories } from "@/data/mock/articles";

// ─── Categories ───
export function useCategoriesList() {
  const query = trpc.categories.list.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
    throwOnError: false,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCategoryBySlug(slug: string) {
  const query = trpc.categories.bySlug.useQuery({ slug }, {
    enabled: !!slug,
    staleTime: 60_000,
    retry: 1,
  });
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Places ───
export function usePlacesList(params?: {
  categoryId?: number;
  limit?: number;
  offset?: number;
  isFeatured?: boolean;
  isRecommended?: boolean;
  orderBy?: "featured" | "recommended";
}) {
  const query = trpc.places.list.useQuery(
    {
      categoryId: params?.categoryId,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      isFeatured: params?.isFeatured,
      isRecommended: params?.isRecommended,
      orderBy: params?.orderBy,
    },
    {
      staleTime: 30_000,
      retry: 1,
      throwOnError: false,
    }
  );
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Server-side search: substitui o filtro client-side da tela /app/buscar.
// Mandar `query=""` (sem categoryId/tags) devolve uma lista neutra paginada,
// então também serve pra exibir resultados quando a caixa de busca está vazia.
// `keepPreviousData` evita o flicker de "Buscando..." entre teclas digitadas.
export function usePlacesSearch(params: {
  query: string;
  categoryId?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params;
  const query = trpc.places.search.useQuery(
    {
      query: rest.query,
      categoryId: rest.categoryId,
      tags: rest.tags && rest.tags.length > 0 ? rest.tags : undefined,
      limit: rest.limit ?? 50,
      offset: rest.offset ?? 0,
    },
    {
      enabled,
      staleTime: 15_000,
      retry: 1,
      throwOnError: false,
      placeholderData: (prev) => prev,
    }
  );
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePlaceById(id: number) {
  const query = trpc.places.byId.useQuery({ id }, {
    enabled: !!id,
    staleTime: 30_000,
    retry: 1,
  });
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Events ───
export function useEventsList(params?: { upcoming?: boolean }) {
  const query = trpc.events.list.useQuery(
    params ? { upcoming: params.upcoming } : undefined,
    {
      staleTime: 30_000,
      retry: 1,
    }
  );
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useEventById(id: number) {
  const query = trpc.events.byId.useQuery({ id }, {
    enabled: !!id,
    staleTime: 30_000,
    retry: 1,
  });
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Routes ───
export function usePublicRoutes() {
  const query = trpc.routes.public.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMyRoutes(enabled: boolean) {
  const query = trpc.routes.mine.useQuery(undefined, {
    enabled,
    staleTime: 30_000,
    retry: 1,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useRouteById(id: number) {
  const query = trpc.routes.byId.useQuery({ id }, {
    enabled: !!id,
    staleTime: 30_000,
    retry: 1,
  });
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Favorites ───
export function useFavorites(enabled: boolean) {
  const query = trpc.favorites.list.useQuery(undefined, {
    enabled,
    staleTime: 10_000,
    retry: 1,
    throwOnError: false,
  });
  const addMutation = trpc.favorites.add.useMutation();
  const removeMutation = trpc.favorites.remove.useMutation();

  const favoriteIds = useMemo(() => {
    const ids = new Set<number>();
    if (query.data) {
      for (const fav of query.data as any[]) {
        ids.add(fav.placeId);
      }
    }
    return ids;
  }, [query.data]);

  // Use stable references: query.refetch is stable across renders in react-query
  const refetch = query.refetch;

  const addFavorite = useCallback((placeId: number) => {
    addMutation.mutate({ placeId }, {
      onSuccess: () => { refetch(); },
    });
  }, [addMutation.mutate, refetch]);

  const removeFavorite = useCallback((placeId: number) => {
    removeMutation.mutate({ placeId }, {
      onSuccess: () => { refetch(); },
    });
  }, [removeMutation.mutate, refetch]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    favoriteIds,
    addFavorite,
    removeFavorite,
  };
}

// ─── Reviews ───
export function useReviewsByPlace(placeId: number) {
  const query = trpc.reviews.listByPlace.useQuery({ placeId }, {
    enabled: !!placeId,
    staleTime: 30_000,
    retry: 1,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Partners / Vouchers / Ads ───
export function useVouchersList() {
  const query = trpc.vouchers.list.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePartnersList(params?: { status?: string }) {
  const query = trpc.partners.list.useQuery(
    params ? { status: params.status } : undefined,
    {
      staleTime: 60_000,
      retry: 1,
    }
  );
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAdsList(params?: { placement?: string }) {
  const query = trpc.ads.list.useQuery(
    params ? { placement: params.placement } : undefined,
    {
      staleTime: 60_000,
      retry: 1,
    }
  );
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Drivers ───
export function useDriversList() {
  const query = trpc.drivers.listPublic.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDriversListPublic() {
  return useDriversList();
}

// ─── Notifications ───
export function useNotificationsList(enabled: boolean) {
  const query = trpc.notifications.list.useQuery(undefined, {
    enabled,
    staleTime: 10_000,
    retry: 1,
    throwOnError: false,
  });
  const markReadMutation = trpc.notifications.markRead.useMutation();
  const refetch = query.refetch;

  const markRead = useCallback((id: number) => {
    markReadMutation.mutate({ id }, {
      onSuccess: () => { refetch(); },
    });
  }, [markReadMutation.mutate, refetch]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    markRead,
  };
}

// ─── Articles (with fallback to curated local content) ───
export function useArticlesListPublished(params?: { category?: string; limit?: number }) {
  const query = trpc.articles.listPublished.useQuery(
    {
      category: params?.category,
      limit: params?.limit ?? 10,
    },
    {
      staleTime: 60_000,
      retry: 1,
    }
  );

  // Fallback to curated local articles when API returns empty
  const data = useMemo(() => {
    if (query.data && query.data.length > 0) return query.data;
    // Use curated local articles as fallback
    let result = mockArticles.filter((a) => a.isPublished);
    if (params?.category) result = result.filter((a) => a.category === params.category);
    if (params?.limit) result = result.slice(0, params.limit);
    return result;
  }, [query.data, params?.category, params?.limit]);

  return {
    data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useArticleBySlug(slug: string) {
  const query = trpc.articles.bySlug.useQuery({ slug }, {
    enabled: !!slug,
    staleTime: 60_000,
    retry: 1,
  });

  const data = useMemo(() => {
    if (query.data) return query.data;
    // Fallback to curated local article
    return mockArticles.find((a) => a.slug === slug) || null;
  }, [query.data, slug]);

  return {
    data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useArticleCategories() {
  const query = trpc.articles.categories.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
  });

  const data = useMemo(() => {
    if (query.data && query.data.length > 0) return query.data;
    return mockArticleCategories;
  }, [query.data]);

  return {
    data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Content ───
export function useHeroContent() {
  const query = trpc.content.getHero.useQuery(undefined, {
    staleTime: 120_000,
    retry: 1,
  });
  return {
    data: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAboutContent() {
  const query = trpc.content.getAbout.useQuery(undefined, {
    staleTime: 120_000,
    retry: 1,
  });
  return {
    data: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useContactContent() {
  const query = trpc.content.getContact.useQuery(undefined, {
    staleTime: 120_000,
    retry: 1,
  });
  return {
    data: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useServicesContent() {
  const query = trpc.content.getServices.useQuery(undefined, {
    staleTime: 120_000,
    retry: 1,
  });
  return {
    data: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── (useMockMutation removed — was unused) ───
