import { describe, expect, it, vi } from "vitest";
import { articlesRouter } from "./articles.router";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => [],
        }),
      }),
    }),
  })),
}));

function makeCtx(user: TrpcContext["user"], cookieHeader?: string): TrpcContext {
  return {
    user,
    req: {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("cmsProcedure security", () => {
  it("allows CMS access for authenticated admin context", async () => {
    const caller = articlesRouter.createCaller(
      makeCtx({
        id: 1,
        openId: "admin-owner",
        email: "admin@oranjeapp.com.br",
        name: "Admin",
        loginMethod: "password",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      })
    );

    await expect(caller.listCms()).resolves.toEqual([]);
  });

  it("rejects legacy cms_session cookie without authenticated admin user", async () => {
    const legacyCookie = `cms_session=${encodeURIComponent(
      JSON.stringify({
        success: true,
        user: { id: 1, role: "admin" },
      })
    )}`;

    const caller = articlesRouter.createCaller(makeCtx(null, legacyCookie));
    await expect(caller.listCms()).rejects.toThrow();
  });
});
