import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./authService";

vi.mock("./db", () => ({
  getUserByEmail: vi.fn(),
  verifyAdminPassword: vi.fn(),
}));

import * as db from "./db";

describe("AuthService.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when admin user does not exist", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);

    await expect(AuthService.login("admin@oranje.com", "secret123")).rejects.toThrow(
      "INVALID_CREDENTIALS"
    );
    expect(db.verifyAdminPassword).not.toHaveBeenCalled();
  });

  it("rejects when password is invalid", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue({
      id: 7,
      openId: "admin-owner",
      email: "admin@oranje.com",
      name: "Admin",
      loginMethod: "password",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    vi.mocked(db.verifyAdminPassword).mockResolvedValue(false);

    await expect(AuthService.login("admin@oranje.com", "wrong-pass")).rejects.toThrow(
      "INVALID_CREDENTIALS"
    );
  });

  it("returns admin user when password is valid", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue({
      id: 7,
      openId: "admin-owner",
      email: "admin@oranje.com",
      name: "Admin",
      loginMethod: "password",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    vi.mocked(db.verifyAdminPassword).mockResolvedValue(true);

    const result = await AuthService.login("admin@oranje.com", "correct-pass");

    expect(result).toEqual({
      success: true,
      user: {
        id: 7,
        email: "admin@oranje.com",
        name: "Admin",
        role: "admin",
      },
    });
  });
});
