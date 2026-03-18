/**
 * Mock data hooks - Replace tRPC queries with local mock data
 * Ensures the app works 100% without a backend
 */
import { useState, useCallback, useMemo } from "react";
import {
  mockCategories,
  mockPlaces,
  mockEvents,
  mockRoutes,
  mockPartners,
  mockVouchers,
  mockAds,
  mockDrivers,
  mockReviews,
  mockNotifications,
  mockArticles,
  mockArticleCategories,
  mockHeroContent,
  mockAboutContent,
  mockContactContent,
  mockServicesContent,
} from "@/data/mock";

// Standard return type matching react-query patterns
interface MockQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: null;
  refetch: () => void;
}

function useMockQuery<T>(data: T): MockQueryResult<T> {
  return { data, isLoading: false, error: null, refetch: () => {} };
}

function useMockQueryConditional<T>(data: T, enabled: boolean): MockQueryResult<T> {
  return { data: enabled ? data : undefined, isLoading: false, error: null, refetch: () => {} };
}

// ─── Categories ───
export function useCategoriesList() {
  return useMockQuery(mockCategories);
}

export function useCategoryBySlug(slug: string) {
  const category = mockCategories.find(c => c.slug === slug) || null;
  return useMockQuery(category);
}

// ─── Places ───
export function usePlacesList(params?: { categoryId?: number; limit?: number; offset?: number }) {
  const filtered = useMemo(() => {
    let result = [...mockPlaces];
    if (params?.categoryId) {
      result = result.filter(p => p.categoryId === params.categoryId);
    }
    const offset = params?.offset || 0;
    const limit = params?.limit || result.length;
    return result.slice(offset, offset + limit);
  }, [params?.categoryId, params?.limit, params?.offset]);
  return useMockQuery(filtered);
}

export function usePlaceById(id: number) {
  const place = mockPlaces.find(p => p.id === id) || null;
  return useMockQuery(place);
}

// ─── Events ───
export function useEventsList(_params?: { upcoming?: boolean }) {
  return useMockQuery(mockEvents);
}

export function useEventById(id: number) {
  const event = mockEvents.find(e => e.id === id) || null;
  return useMockQuery(event);
}

// ─── Routes ───
export function usePublicRoutes() {
  return useMockQuery(mockRoutes.filter(r => r.isPublic));
}

export function useMyRoutes(enabled: boolean) {
  // Mock: user has no custom routes
  return useMockQueryConditional([] as typeof mockRoutes, enabled);
}

export function useRouteById(id: number) {
  const route = mockRoutes.find(r => r.id === id) || null;
  // Enrich with places data
  const enrichedRoute = route ? {
    ...route,
    places: route.placeIds
      .map(pid => mockPlaces.find(p => p.id === pid))
      .filter(Boolean),
  } : null;
  return useMockQuery(enrichedRoute);
}

// ─── Favorites ───
export function useFavorites(enabled: boolean) {
  const [favIds, setFavIds] = useState<Set<number>>(new Set());

  const data = enabled ? Array.from(favIds).map(placeId => ({ placeId })) : undefined;

  const addFavorite = useCallback((placeId: number) => {
    setFavIds(prev => { const n = new Set(prev); n.add(placeId); return n; });
  }, []);

  const removeFavorite = useCallback((placeId: number) => {
    setFavIds(prev => {
      const next = new Set(prev);
      next.delete(placeId);
      return next;
    });
  }, []);

  return {
    data,
    isLoading: false,
    error: null,
    favoriteIds: favIds,
    addFavorite,
    removeFavorite,
  };
}

// ─── Reviews ───
export function useReviewsByPlace(placeId: number) {
  const reviews = mockReviews.filter(r => r.placeId === placeId);
  return useMockQuery(reviews);
}

// ─── Partners / Vouchers / Ads ───
export function useVouchersList() {
  return useMockQuery(mockVouchers);
}

export function usePartnersList(_params?: { status?: string }) {
  return useMockQuery(mockPartners.filter(p => p.isActive));
}

export function useAdsList(_params?: { placement?: string }) {
  return useMockQuery(mockAds);
}

// ─── Drivers ───
export function useDriversList() {
  return useMockQuery(mockDrivers);
}

export function useDriversListPublic() {
  return useMockQuery(mockDrivers);
}

// ─── Notifications ───
export function useNotificationsList(enabled: boolean) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  return {
    data: enabled ? notifications : undefined,
    isLoading: false,
    error: null,
    markRead,
  };
}

// ─── Articles ───
export function useArticlesListPublished(params?: { category?: string; limit?: number }) {
  const filtered = useMemo(() => {
    let result = mockArticles.filter(a => a.isPublished);
    if (params?.category) {
      result = result.filter(a => a.category === params.category);
    }
    if (params?.limit) {
      result = result.slice(0, params.limit);
    }
    return result;
  }, [params?.category, params?.limit]);
  return useMockQuery(filtered);
}

export function useArticleBySlug(slug: string) {
  const article = mockArticles.find(a => a.slug === slug) || null;
  return useMockQuery(article);
}

export function useArticleCategories() {
  return useMockQuery(mockArticleCategories);
}

// ─── Content ───
export function useHeroContent() {
  return useMockQuery(mockHeroContent);
}

export function useAboutContent() {
  return useMockQuery(mockAboutContent);
}

export function useContactContent() {
  return useMockQuery(mockContactContent);
}

export function useServicesContent() {
  return useMockQuery(mockServicesContent);
}

// ─── Mock mutation helpers ───
export function useMockMutation<TInput = unknown>() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback((_input: TInput, options?: { onSuccess?: () => void; onError?: () => void }) => {
    setIsPending(true);
    // Simulate quick success
    setTimeout(() => {
      setIsPending(false);
      options?.onSuccess?.();
    }, 300);
  }, []);

  return { mutate, isPending, isLoading: isPending };
}
