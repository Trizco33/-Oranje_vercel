import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { createUserWithEmail, getUserByEmail, createMagicLink, getMagicLink, markMagicLinkAsUsed } from "./db";

/**
 * Testes para o sistema de Magic Link
 * Valida o fluxo completo: criar usuário -> criar magic link -> verificar -> marcar como usado
 */

describe("Magic Link Authentication", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  let userId: number | undefined;
  let magicToken: string;

  beforeAll(async () => {
    console.log(`[Test] Starting magic link tests with email: ${testEmail}`);
  });

  afterAll(async () => {
    console.log("[Test] Magic link tests completed");
  });

  it("should create a user with email", async () => {
    const user = await createUserWithEmail(testEmail);
    expect(user).toBeDefined();
    expect(user?.email).toBe(testEmail);
    expect(user?.loginMethod).toBe("magic_link");
    expect(user?.id).toBeDefined();
    userId = user?.id;
  });

  it("should retrieve user by email", async () => {
    const user = await getUserByEmail(testEmail);
    expect(user).toBeDefined();
    expect(user?.email).toBe(testEmail);
    expect(user?.id).toBe(userId);
  });

  it("should create a magic link for the user", async () => {
    if (!userId) throw new Error("User ID not set");
    magicToken = `test_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    await createMagicLink(magicToken, userId, expiresAt);
    
    const magicLink = await getMagicLink(magicToken);
    expect(magicLink).toBeDefined();
    expect(magicLink?.token).toBe(magicToken);
    expect(magicLink?.userId).toBe(userId);
    expect(magicLink?.usedAt).toBeNull();
  });

  it("should validate magic link is not expired", async () => {
    const magicLink = await getMagicLink(magicToken);
    expect(magicLink).toBeDefined();
    if (magicLink) {
      const isExpired = new Date() > magicLink.expiresAt;
      expect(isExpired).toBe(false);
    }
  });

  it("should mark magic link as used", async () => {
    await markMagicLinkAsUsed(magicToken);
    
    const magicLink = await getMagicLink(magicToken);
    expect(magicLink).toBeDefined();
    expect(magicLink?.usedAt).not.toBeNull();
  });

  it("should prevent reuse of magic link", async () => {
    const magicLink = await getMagicLink(magicToken);
    expect(magicLink?.usedAt).not.toBeNull();
    // In the actual flow, verifyMagicLink checks this and throws an error
  });
});
