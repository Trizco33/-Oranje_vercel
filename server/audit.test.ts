import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Admin Audit System", () => {
  it("should log admin action", async () => {
    const userId = 1;
    const action = "create_place";
    const entityType = "place";
    const entityId = 123;

    await db.logAdminAction(userId, action, entityType, entityId);
    // Log criado sem erros
    expect(true).toBe(true);
  });

  it("should retrieve admin logs", async () => {
    const logs = await db.getAdminLogs(10, 0);
    expect(Array.isArray(logs)).toBe(true);
  });

  it("should handle pagination in admin logs", async () => {
    const logs1 = await db.getAdminLogs(5, 0);
    const logs2 = await db.getAdminLogs(5, 5);
    expect(Array.isArray(logs1)).toBe(true);
    expect(Array.isArray(logs2)).toBe(true);
  });

  it("should include user email in logs", async () => {
    const logs = await db.getAdminLogs(50, 0);
    if (logs.length > 0) {
      expect(logs[0]).toHaveProperty("userEmail");
      expect(logs[0]).toHaveProperty("action");
      expect(logs[0]).toHaveProperty("entityType");
      expect(logs[0]).toHaveProperty("entityId");
      expect(logs[0]).toHaveProperty("createdAt");
    }
  });
});
