import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { reviews, places } from "../drizzle/schema";

describe("Reviews Router", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      console.warn("Database not available for tests");
    }
  });

  it("should validate review schema", async () => {
    // Test that reviews table exists and has correct structure
    expect(reviews).toBeDefined();
    // Verify the table has the expected columns
    const columns = Object.keys(reviews);
    expect(columns).toContain("placeId");
    expect(columns).toContain("userId");
    expect(columns).toContain("rating");
    expect(columns).toContain("comment");
    expect(columns).toContain("status");
  });

  it("should have helpful count field", async () => {
    // Verify reviews schema includes helpfulCount
    const columns = Object.keys(reviews);
    expect(columns).toContain("helpfulCount");
  });

  it("should have status field for moderation", async () => {
    // Verify reviews schema includes status for moderation
    const columns = Object.keys(reviews);
    expect(columns).toContain("status");
  });

  it("should have isVerified field", async () => {
    // Verify reviews schema includes isVerified
    const columns = Object.keys(reviews);
    expect(columns).toContain("isVerified");
  });

  it("should have timestamps", async () => {
    // Verify reviews schema includes timestamps
    const columns = Object.keys(reviews);
    expect(columns).toContain("createdAt");
    expect(columns).toContain("updatedAt");
  });
});
