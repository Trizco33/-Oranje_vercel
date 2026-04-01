import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import { normalizeWhatsApp } from "./drivers.router";

describe("Drivers E2E Tests", () => {
  let testDriverId: string;

  it("1. Should create driver with PENDING status and no photo", async () => {
    const payload = {
      name: "João Silva",
      whatsapp: "11987654321",
      serviceType: "Motorista Particular",
      region: "Holambra",
      vehicleModel: undefined,
      vehicleColor: undefined,
      plate: undefined,
      capacity: 4,
      photoUrl: undefined,
      notes: "Teste E2E",
      status: "PENDING" as const,
      isPartner: false,
      partnerUntil: null,
      isVerified: false,
      isActive: true,
    };

    const result = await db.createDriver(payload as any);
    testDriverId = result.id;

    expect(result).toBeDefined();
    expect(result.status).toBe("PENDING");
    expect(result.isVerified).toBe(false);
    expect(result.isActive).toBe(true);
    expect(result.photoUrl).toBeNull();
    expect(result.plate).toBeNull();
    console.log("✅ Teste 1 PASSOU: Motorista criado com status PENDING");
  });

  it("2. Should NOT appear in public list when PENDING", async () => {
    const publicDrivers = await db.getPublicDrivers();
    const foundDriver = publicDrivers.find((d: any) => d.id === testDriverId);
    
    expect(foundDriver).toBeUndefined();
    console.log("✅ Teste 2 PASSOU: Motorista PENDING não aparece na listagem pública");
  });

  it("3. Should appear in admin list as PENDING", async () => {
    const allDrivers = await db.getAllDrivers();
    const foundDriver = allDrivers.find((d: any) => d.id === testDriverId);
    
    expect(foundDriver).toBeDefined();
    expect(foundDriver?.status).toBe("PENDING");
    console.log("✅ Teste 3 PASSOU: Motorista aparece no admin como PENDING");
  });

  it("4. Should approve driver and make it active", async () => {
    await db.updateDriver(testDriverId, {
      status: "ACTIVE",
      isVerified: true,
      isActive: true,
    });

    const updated = await db.getDriverById(testDriverId);
    expect(updated?.status).toBe("ACTIVE");
    expect(updated?.isVerified).toBe(true);
    console.log("✅ Teste 4 PASSOU: Motorista aprovado com status ACTIVE");
  });

  it("5. Should appear in public list after approval", async () => {
    const publicDrivers = await db.getPublicDrivers();
    const foundDriver = publicDrivers.find((d: any) => d.id === testDriverId);
    
    expect(foundDriver).toBeDefined();
    expect(foundDriver?.name).toBe("João Silva");
    expect(foundDriver?.whatsapp).toBe("11987654321");
    console.log("✅ Teste 5 PASSOU: Motorista aprovado aparece na listagem pública");
  });

  it("6. Should have correct public fields only", async () => {
    const publicDrivers = await db.getPublicDrivers();
    const foundDriver = publicDrivers.find((d: any) => d.id === testDriverId);
    
    expect(foundDriver).toHaveProperty("id");
    expect(foundDriver).toHaveProperty("name");
    expect(foundDriver).toHaveProperty("whatsapp");
    expect(foundDriver).toHaveProperty("region");
    expect(foundDriver).toHaveProperty("serviceType");
    expect(foundDriver).toHaveProperty("capacity");
    console.log("✅ Teste 6 PASSOU: Motorista público tem todos os campos corretos");
  });

  it("7. Should not expose admin fields in public list", async () => {
    const publicDrivers = await db.getPublicDrivers();
    const foundDriver = publicDrivers.find((d: any) => d.id === testDriverId);
    
    expect(foundDriver).not.toHaveProperty("status");
    expect(foundDriver).not.toHaveProperty("isVerified");
    expect(foundDriver).not.toHaveProperty("isActive");
    expect(foundDriver).not.toHaveProperty("isPartner");
    console.log("✅ Teste 7 PASSOU: Campos admin não expostos na listagem pública");
  });

  afterAll(async () => {
    // Cleanup: delete test driver
    if (testDriverId) {
      await db.deleteDriver(testDriverId);
      console.log("🧹 Motorista de teste deletado");
    }
  });
});
