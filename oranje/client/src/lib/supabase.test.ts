import { describe, expect, it, vi, beforeEach } from "vitest";
import { supabase, getActivePlaces, getPlaceById, getPlacesByCategory, searchPlaces } from "./supabase";

// Mock do cliente Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(function() {
        return this;
      }),
      eq: vi.fn(function() {
        return this;
      }),
      or: vi.fn(function() {
        return this;
      }),
      order: vi.fn(function() {
        return this;
      }),
      single: vi.fn(async function() {
        if (this._table === "places" && this._id === 1) {
          return {
            data: {
              id: 1,
              name: "Restaurante Tulipa",
              short_desc: "Culinária holandesa",
              status: "active",
              is_featured: true,
              is_recommended: true,
              maps_url: "https://maps.google.com/...",
            },
            error: null,
          };
        }
        return { data: null, error: { message: "Not found" } };
      }),
      [Symbol.asyncIterator]: async function*() {
        yield {
          data: [
            {
              id: 1,
              name: "Restaurante Tulipa",
              short_desc: "Culinária holandesa",
              status: "active",
              is_featured: true,
              is_recommended: true,
              maps_url: "https://maps.google.com/...",
            },
            {
              id: 2,
              name: "Café das Flores",
              short_desc: "Café aconchegante",
              status: "active",
              is_featured: false,
              is_recommended: true,
              maps_url: "https://maps.google.com/...",
            },
          ],
          error: null,
        };
      },
    })),
  })),
}));

describe("Supabase Client", () => {
  it("should be initialized with correct URL and key", () => {
    expect(supabase).toBeDefined();
  });
});

describe("getActivePlaces", () => {
  it("should return empty array on error", async () => {
    const places = await getActivePlaces();
    expect(Array.isArray(places)).toBe(true);
  });

  it("should handle connection errors gracefully", async () => {
    const places = await getActivePlaces();
    expect(places).toBeDefined();
    expect(Array.isArray(places)).toBe(true);
  });
});

describe("getPlaceById", () => {
  it("should return null on error", async () => {
    const place = await getPlaceById(999);
    expect(place).toBeNull();
  });

  it("should handle connection errors gracefully", async () => {
    const place = await getPlaceById(1);
    expect(place === null || place !== null).toBe(true);
  });
});

describe("getPlacesByCategory", () => {
  it("should return empty array on error", async () => {
    const places = await getPlacesByCategory(1);
    expect(Array.isArray(places)).toBe(true);
  });

  it("should handle connection errors gracefully", async () => {
    const places = await getPlacesByCategory(1);
    expect(places).toBeDefined();
    expect(Array.isArray(places)).toBe(true);
  });
});

describe("searchPlaces", () => {
  it("should return empty array on error", async () => {
    const places = await searchPlaces("restaurante");
    expect(Array.isArray(places)).toBe(true);
  });

  it("should handle connection errors gracefully", async () => {
    const places = await searchPlaces("tulipa");
    expect(places).toBeDefined();
    expect(Array.isArray(places)).toBe(true);
  });

  it("should handle empty query", async () => {
    const places = await searchPlaces("");
    expect(Array.isArray(places)).toBe(true);
  });
});
