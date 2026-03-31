import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mkdirSync = vi.fn();
const writeFileSync = vi.fn();
const existsSync = vi.fn(() => true);

vi.mock("fs", () => ({
  default: {
    mkdirSync,
    writeFileSync,
    existsSync,
  },
}));

async function loadStorageModule() {
  vi.resetModules();
  return import("./storage");
}

describe("storage environment behavior", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
    existsSync.mockReturnValue(true);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("allows local fallback outside production", async () => {
    delete process.env.NODE_ENV;
    delete process.env.BUILT_IN_FORGE_API_URL;
    delete process.env.BUILT_IN_FORGE_API_KEY;

    const storage = await loadStorageModule();
    const result = await storage.storagePut("uploads/test.png", Buffer.from("ok"), "image/png");

    expect(result.url).toBe("/api/uploads/test.png");
    expect(writeFileSync).toHaveBeenCalledTimes(1);
  });

  it("rejects local fallback in production when persistent storage is missing", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.BUILT_IN_FORGE_API_URL;
    delete process.env.BUILT_IN_FORGE_API_KEY;

    const storage = await loadStorageModule();

    await expect(
      storage.storagePut("uploads/test.png", Buffer.from("ok"), "image/png")
    ).rejects.toThrow("Persistent storage is required in production");
    expect(writeFileSync).not.toHaveBeenCalled();
  });
});
