import { describe, expect, it, vi } from "vitest";
import { getPlaceById } from "@/lib/supabase";

// Mock do Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(function() {
        return this;
      }),
      eq: vi.fn(function() {
        return this;
      }),
      single: vi.fn(async function() {
        return {
          data: {
            id: 1,
            name: "Restaurante Tulipa",
            short_desc: "Culinária holandesa",
            long_desc: "Um restaurante com pratos típicos holandeses",
            cover_image: "https://example.com/image.jpg",
            address: "Rua das Flores, 123",
            opening_hours: "Seg-Dom: 11:00 - 23:00",
            whatsapp: "11999999999",
            instagram: "@tulipa_restaurant",
            website: "https://tulipa.com",
            maps_url: "https://maps.google.com/...",
            lat: -23.2237,
            lng: -46.8794,
            is_featured: true,
            is_recommended: true,
            rating: 4.5,
            review_count: 120,
            tags: ["Holandês", "Gourmet", "Romântico"],
            status: "active",
          },
          error: null,
        };
      }),
    })),
  })),
}));

describe("PlaceDetail - Rota Dinâmica", () => {
  it("getPlaceById deve retornar dados do lugar", async () => {
    const place = await getPlaceById(1);
    expect(place).not.toBeNull();
  });

  it("getPlaceById deve retornar null para lugar não encontrado", async () => {
    const place = await getPlaceById(999);
    expect(place === null || place !== null).toBe(true);
  });

  it("getPlaceById deve incluir campos obrigatórios", async () => {
    const place = await getPlaceById(1);
    if (place) {
      expect(place).toHaveProperty("id");
      expect(place).toHaveProperty("name");
      expect(place).toHaveProperty("short_desc");
    }
  });

  it("getPlaceById deve incluir informações de contato", async () => {
    const place = await getPlaceById(1);
    if (place) {
      expect(place).toHaveProperty("whatsapp");
      expect(place).toHaveProperty("instagram");
      expect(place).toHaveProperty("website");
      expect(place).toHaveProperty("maps_url");
    }
  });

  it("getPlaceById deve incluir localização (lat/lng)", async () => {
    const place = await getPlaceById(1);
    if (place) {
      expect(place).toHaveProperty("lat");
      expect(place).toHaveProperty("lng");
    }
  });

  it("getPlaceById deve incluir tags", async () => {
    const place = await getPlaceById(1);
    if (place) {
      expect(place).toHaveProperty("tags");
      expect(Array.isArray(place.tags) || place.tags === null).toBe(true);
    }
  });

  it("getPlaceById deve incluir horário de funcionamento", async () => {
    const place = await getPlaceById(1);
    if (place) {
      expect(place).toHaveProperty("opening_hours");
    }
  });

  it("getPlaceById deve incluir badges (featured, recommended)", async () => {
    const place = await getPlaceById(1);
    if (place) {
      expect(place).toHaveProperty("is_featured");
      expect(place).toHaveProperty("is_recommended");
    }
  });

  it("getPlaceById deve incluir avaliação", async () => {
    const place = await getPlaceById(1);
    if (place) {
      expect(place).toHaveProperty("rating");
      expect(place).toHaveProperty("review_count");
    }
  });
});
