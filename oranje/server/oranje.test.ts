import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ─────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Restaurantes", slug: "restaurantes", icon: "🍽️" },
    { id: 2, name: "Cafés", slug: "cafes", icon: "☕" },
  ]),
  getPlaces: vi.fn().mockResolvedValue([
    {
      id: 1, name: "Restaurante Tulipa", shortDesc: "Culinária holandesa",
      coverImage: null, rating: 4.5, reviewCount: 120,
      tags: ["romântico", "tradicional"], isRecommended: true,
      isFeatured: false, isPartner: true, address: "Rua das Flores, 10",
      priceRange: "$$", categoryId: 1,
    },
  ]),
  getPlaceById: vi.fn().mockResolvedValue({
    id: 1, name: "Restaurante Tulipa", shortDesc: "Culinária holandesa",
    longDesc: "Descrição longa...", coverImage: null, rating: 4.5,
    reviewCount: 120, tags: ["romântico"], isRecommended: true,
    isFeatured: false, isPartner: true, address: "Rua das Flores, 10",
    openingHours: "Seg-Dom 11h-22h", whatsapp: "19999999999",
    instagram: "@tulipa", website: null, mapsUrl: null, lat: -22.93, lng: -47.06,
    priceRange: "$$",
  }),
  getPlacePhotos: vi.fn().mockResolvedValue([]),
  getVouchers: vi.fn().mockResolvedValue([
    { id: 1, placeId: 1, title: "10% OFF", description: "No almoço", code: "ORANJE10", discount: "10% OFF", isActive: true },
  ]),
  getEvents: vi.fn().mockResolvedValue([
    { id: 1, title: "Festa das Flores", startsAt: new Date("2026-09-01"), location: "Praça Central", isFeatured: true, price: "Gratuito" },
  ]),
  getEventById: vi.fn().mockResolvedValue({
    id: 1, title: "Festa das Flores", description: "O maior evento de Holambra",
    startsAt: new Date("2026-09-01"), endsAt: null, location: "Praça Central",
    isFeatured: true, price: "Gratuito", tags: ["família"],
  }),
  getPublicRoutes: vi.fn().mockResolvedValue([
    { id: 1, title: "Roteiro Romântico", theme: "Romântico", duration: "1 dia", placeIds: [1, 2], isPublic: true },
  ]),
  getUserRoutes: vi.fn().mockResolvedValue([]),
  getRouteById: vi.fn().mockResolvedValue({
    id: 1, title: "Roteiro Romântico", theme: "Romântico", duration: "1 dia", placeIds: [1], isPublic: true,
  }),
  getUserFavorites: vi.fn().mockResolvedValue([{ placeId: 1 }]),
  addFavorite: vi.fn().mockResolvedValue({ success: true }),
  removeFavorite: vi.fn().mockResolvedValue({ success: true }),
  getUserNotifications: vi.fn().mockResolvedValue([
    { id: 1, title: "Novo evento", content: "Festa das Flores", isRead: false, createdAt: new Date() },
  ]),
  markNotificationRead: vi.fn().mockResolvedValue({ success: true }),
  getAds: vi.fn().mockResolvedValue([
    { id: 1, title: "Anúncio Teste", description: "Descrição", placement: "home_banner", linkUrl: "https://example.com", isActive: true },
  ]),
  getPartners: vi.fn().mockResolvedValue([
    { id: 1, name: "Parceiro Teste", plan: "Premium", status: "active" },
  ]),
  getAdminStats: vi.fn().mockResolvedValue({ places: 30, events: 10, partners: 5, users: 100 }),
  getCategoryBySlug: vi.fn().mockResolvedValue({ id: 1, name: "Restaurantes", slug: "restaurantes" }),
  createPlace: vi.fn().mockResolvedValue({ insertId: 99 }),
  deletePlace: vi.fn().mockResolvedValue({ success: true }),
  createEvent: vi.fn().mockResolvedValue({ insertId: 99 }),
  deleteEvent: vi.fn().mockResolvedValue({ success: true }),
  broadcastEventNotification: vi.fn().mockResolvedValue(undefined),
  createVoucher: vi.fn().mockResolvedValue({ insertId: 99 }),
  updateVoucher: vi.fn().mockResolvedValue({ success: true }),
  createAd: vi.fn().mockResolvedValue({ insertId: 99 }),
  updateAd: vi.fn().mockResolvedValue({ success: true }),
  createPartner: vi.fn().mockResolvedValue({ insertId: 99 }),
  updatePartner: vi.fn().mockResolvedValue({ success: true }),
  createRoute: vi.fn().mockResolvedValue({ insertId: 99 }),
  updateRoute: vi.fn().mockResolvedValue({ success: true }),
  deleteRoute: vi.fn().mockResolvedValue({ success: true }),
  createCategory: vi.fn().mockResolvedValue({ insertId: 99 }),
  updateCategory: vi.fn().mockResolvedValue({ success: true }),
  deleteCategory: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

function makeUserCtx(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1, openId: "test-user", email: "test@example.com",
      name: "Test User", loginMethod: "manus", role,
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("ORANJE — Categories", () => {
  it("lists categories publicly", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.categories.list();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Restaurantes");
  });
});

describe("ORANJE — Places", () => {
  it("lists places publicly", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.places.list({});
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Restaurante Tulipa");
  });

  it("returns place by id with photos and vouchers", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.places.byId({ id: 1 });
    expect(result.name).toBe("Restaurante Tulipa");
    expect(result.photos).toEqual([]);
    expect(result.vouchers).toHaveLength(1);
    expect(result.vouchers[0].code).toBe("ORANJE10");
  });

  it("blocks place creation for non-admin", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(caller.places.create({ name: "Novo Lugar" })).rejects.toThrow();
  });

  it("allows place creation for admin", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.places.create({ name: "Novo Lugar" });
    expect(result).toBeDefined();
  });
});

describe("ORANJE — Events", () => {
  it("lists events publicly", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.events.list({});
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Festa das Flores");
  });

  it("returns event by id", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.events.byId({ id: 1 });
    expect(result.title).toBe("Festa das Flores");
  });

  it("blocks event creation for non-admin", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(
      caller.events.create({ title: "Evento", startsAt: new Date() })
    ).rejects.toThrow();
  });
});

describe("ORANJE — Favorites", () => {
  it("blocks favorites for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.favorites.list()).rejects.toThrow();
  });

  it("returns favorites for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.favorites.list();
    expect(result).toHaveLength(1);
    expect(result[0].placeId).toBe(1);
  });

  it("adds a favorite", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.favorites.add({ placeId: 2 });
    expect(result).toBeDefined();
  });

  it("removes a favorite", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.favorites.remove({ placeId: 1 });
    expect(result).toBeDefined();
  });
});

describe("ORANJE — Routes", () => {
  it("lists public routes", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.routes.public();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Roteiro Romântico");
  });

  it("returns route by id with places", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.routes.byId({ id: 1 });
    expect(result.title).toBe("Roteiro Romântico");
    expect((result as any).places).toBeDefined();
  });

  it("blocks route creation for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.routes.create({ title: "Meu Roteiro", placeIds: [] })
    ).rejects.toThrow();
  });

  it("creates route for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.routes.create({ title: "Meu Roteiro", placeIds: [1] });
    expect(result).toBeDefined();
  });
});

describe("ORANJE — Notifications", () => {
  it("returns notifications for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.notifications.list();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Novo evento");
  });
});

describe("ORANJE — Admin", () => {
  it("returns stats for admin", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.admin.stats();
    expect(result.places).toBe(30);
    expect(result.events).toBe(10);
    expect(result.users).toBe(100);
  });

  it("blocks stats for non-admin", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(caller.admin.stats()).rejects.toThrow();
  });
});

describe("ORANJE — Auth", () => {
  it("returns null user when not authenticated", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user when authenticated", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.auth.me();
    expect(result?.name).toBe("Test User");
  });

  it("clears cookie on logout", async () => {
    const ctx = makeUserCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect((ctx.res.clearCookie as any).mock.calls).toHaveLength(1);
  });
});
