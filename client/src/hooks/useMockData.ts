/**
 * Real data hooks - Use tRPC to fetch from backend API
 * Falls back to curated local data when API returns empty
 */
import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { mockArticles, mockArticleCategories } from "@/data/mock/articles";

// ─── Categories ───
export function useCategoriesList() {
  const query = trpc.categories.list.useQuery(undefined, {
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
export function usePlacesList(params?: { categoryId?: number; limit?: number; offset?: number }) {
  const query = trpc.places.list.useQuery(
    {
      categoryId: params?.categoryId,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    },
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

  const addFavorite = useCallback((placeId: number) => {
    addMutation.mutate({ placeId }, {
      onSuccess: () => query.refetch(),
    });
  }, [addMutation, query]);

  const removeFavorite = useCallback((placeId: number) => {
    removeMutation.mutate({ placeId }, {
      onSuccess: () => query.refetch(),
    });
  }, [removeMutation, query]);

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
  });
  const markReadMutation = trpc.notifications.markRead.useMutation();

  const markRead = useCallback((id: number) => {
    markReadMutation.mutate({ id }, {
      onSuccess: () => query.refetch(),
    });
  }, [markReadMutation, query]);

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

// ─── Mock mutation helpers (still used for client-only actions) ───
export function useMockMutation<TInput = unknown>() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback((_input: TInput, options?: { onSuccess?: () => void; onError?: () => void }) => {
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      options?.onSuccess?.();
    }, 300);
  }, []);

  return { mutate, isPending, isLoading: isPending };
}
