import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Admin Audit Integration Tests", () => {
  it("should log create_place action", async () => {
    const userId = 1;
    const action = "create_place";
    const entityType = "place";
    const entityId = 123;

    await db.logAdminAction(userId, action, entityType, entityId);
    const logs = await db.getAdminLogs(50, 0);

    const createdLog = logs.find(
      (log: any) =>
        log.action === "create_place" &&
        log.entityType === "place" &&
        log.entityId === 123
    );

    expect(createdLog).toBeDefined();
    expect(createdLog?.userEmail).toBeDefined();
  });

  it("should log update_place action", async () => {
    const userId = 1;
    const action = "update_place";
    const entityType = "place";
    const entityId = 456;

    await db.logAdminAction(userId, action, entityType, entityId);
    const logs = await db.getAdminLogs(50, 0);

    const updatedLog = logs.find(
      (log: any) =>
        log.action === "update_place" &&
        log.entityType === "place" &&
        log.entityId === 456
    );

    expect(updatedLog).toBeDefined();
    expect(updatedLog?.userEmail).toBeDefined();
  });

  it("should log delete_place action", async () => {
    const userId = 1;
    const action = "delete_place";
    const entityType = "place";
    const entityId = 789;

    await db.logAdminAction(userId, action, entityType, entityId);
    const logs = await db.getAdminLogs(50, 0);

    const deletedLog = logs.find(
      (log: any) =>
        log.action === "delete_place" &&
        log.entityType === "place" &&
        log.entityId === 789
    );

    expect(deletedLog).toBeDefined();
    expect(deletedLog?.userEmail).toBeDefined();
  });

  it("should return logs ordered by createdAt DESC", async () => {
    const logs = await db.getAdminLogs(50, 0);

    if (logs.length > 1) {
      for (let i = 0; i < logs.length - 1; i++) {
        const current = new Date(logs[i].createdAt).getTime();
        const next = new Date(logs[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });

  it("should respect pagination limit", async () => {
    const logs = await db.getAdminLogs(10, 0);
    expect(logs.length).toBeLessThanOrEqual(10);
  });

  it("should include userEmail in response", async () => {
    const logs = await db.getAdminLogs(50, 0);

    if (logs.length > 0) {
      logs.forEach((log: any) => {
        expect(log).toHaveProperty("userEmail");
        expect(log).toHaveProperty("action");
        expect(log).toHaveProperty("entityType");
        expect(log).toHaveProperty("entityId");
        expect(log).toHaveProperty("createdAt");
      });
    }
  });
});
