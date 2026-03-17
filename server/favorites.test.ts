import { describe, it, expect } from "vitest";
import { addFavorite, removeFavorite, getUserFavorites } from "./db";

describe("Favorites System", () => {
  // Use unique IDs to avoid test pollution
  const timestamp = Date.now();
  const testUserId = 1000 + Math.floor(Math.random() * 1000);
  const testPlaceId = 10000 + Math.floor(Math.random() * 1000);

  it("should add a favorite", async () => {
    const placeId = testPlaceId + 1;
    await addFavorite(testUserId, placeId);
    const favorites = await getUserFavorites(testUserId);
    expect(favorites.some((f: any) => f.placeId === placeId)).toBe(true);
  });

  it("should get favorites by user id", async () => {
    const placeId = testPlaceId + 2;
    await addFavorite(testUserId, placeId);
    const favorites = await getUserFavorites(testUserId);
    expect(favorites.length).toBeGreaterThan(0);
  });

  it("should remove a favorite", async () => {
    const placeId = testPlaceId + 3;
    await addFavorite(testUserId, placeId);
    await removeFavorite(testUserId, placeId);
    const favorites = await getUserFavorites(testUserId);
    expect(favorites.some((f: any) => f.placeId === placeId)).toBe(false);
  });

  it("should isolate favorites between users", async () => {
    const user1 = 2000 + Math.floor(Math.random() * 1000);
    const user2 = 3000 + Math.floor(Math.random() * 1000);
    const place = 20000 + Math.floor(Math.random() * 1000);

    await addFavorite(user1, place);
    const user1Favs = await getUserFavorites(user1);
    const user2Favs = await getUserFavorites(user2);

    expect(user1Favs.some((f: any) => f.placeId === place)).toBe(true);
    expect(user2Favs.some((f: any) => f.placeId === place)).toBe(false);
  });
});
