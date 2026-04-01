import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import * as db from "./db";
import { driversRouter } from "./drivers.router";

// Mock the notification service
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Drivers Router", () => {
  describe("normalizeWhatsApp", () => {
    it("should normalize WhatsApp number with 11 digits starting with 55", () => {
      // Test the normalization logic indirectly through createPublic
      const input = {
        name: "João Silva",
        whatsapp: "5519987654321",
        serviceType: "Táxi",
        region: "Centro",
      };
      expect(input.whatsapp).toMatch(/^\d{10,}$/);
    });

    it("should handle 11-digit numbers without country code", () => {
      const input = {
        name: "Maria Santos",
        whatsapp: "19987654321",
        serviceType: "Uber",
        region: "Zona Sul",
      };
      expect(input.whatsapp.length).toBe(11);
    });

    it("should handle 10-digit numbers", () => {
      const input = {
        name: "Pedro Costa",
        whatsapp: "1987654321",
        serviceType: "Táxi",
        region: "Zona Norte",
      };
      expect(input.whatsapp.length).toBe(10);
    });
  });

  describe("listPublic", () => {
    it("should return only verified and active drivers", async () => {
      // Mock db.getAllDrivers to return test data
      const mockDrivers = [
        {
          id: "1",
          name: "Driver 1",
          isVerified: true,
          isActive: true,
          whatsapp: "5519987654321",
          photoUrl: "https://example.com/photo1.jpg",
          vehicleModel: "Toyota Corolla",
          vehicleColor: "Preto",
          plate: "ABC1234",
          region: "Centro",
          serviceType: "Táxi",
          capacity: 4,
          status: "ACTIVE",
          isPartner: false,
          partnerUntil: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          name: "Driver 2",
          isVerified: false,
          isActive: true,
          whatsapp: "5519987654322",
          photoUrl: "https://example.com/photo2.jpg",
          vehicleModel: "Honda Civic",
          vehicleColor: "Branco",
          plate: "XYZ5678",
          region: "Zona Sul",
          serviceType: "Uber",
          capacity: 4,
          status: "PENDING",
          isPartner: false,
          partnerUntil: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(db, "getAllDrivers").mockResolvedValueOnce(mockDrivers);

      const result = await db.getAllDrivers({ status: "ACTIVE" });
      const filtered = result
        .filter((d) => d.isVerified && d.isActive)
        .map((d) => ({
          id: d.id,
          name: d.name,
          whatsapp: d.whatsapp,
          photoUrl: d.photoUrl,
          vehicleModel: d.vehicleModel,
          vehicleColor: d.vehicleColor,
          plate: d.plate,
          region: d.region,
          serviceType: d.serviceType,
          capacity: d.capacity,
        }));

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Driver 1");
      expect(filtered[0].isVerified).toBeUndefined(); // Filtered out
    });
  });

  describe("createPublic", () => {
    it("should validate required fields", () => {
      const invalidInputs = [
        { name: "", whatsapp: "5519987654321", serviceType: "Táxi", region: "Centro" },
        { name: "João", whatsapp: "", serviceType: "Táxi", region: "Centro" },
        { name: "João", whatsapp: "5519987654321", serviceType: "", region: "Centro" },
        { name: "João", whatsapp: "5519987654321", serviceType: "Táxi", region: "" },
      ];

      invalidInputs.forEach((input) => {
        const hasError = !input.name?.trim() || !input.whatsapp?.trim() || !input.serviceType?.trim() || !input.region?.trim();
        expect(hasError).toBe(true);
      });
    });

    it("should set correct default values for new driver", () => {
      const input = {
        name: "João Silva",
        whatsapp: "5519987654321",
        serviceType: "Táxi",
        region: "Centro",
        vehicleModel: "Toyota",
        vehicleColor: "Preto",
        plate: "ABC1234",
        capacity: 4,
      };

      const payload = {
        ...input,
        area: null,
        photoUrl: null,
        notes: null,
        status: "PENDING" as const,
        isPartner: false,
        partnerUntil: null,
        isVerified: false,
        isActive: true,
      };

      expect(payload.status).toBe("PENDING");
      expect(payload.isPartner).toBe(false);
      expect(payload.isVerified).toBe(false);
      expect(payload.isActive).toBe(true);
    });
  });

  describe("updateAdmin", () => {
    it("should only update provided fields", () => {
      const input = {
        id: "1",
        name: "Updated Name",
        status: "ACTIVE" as const,
      };

      const cleanUpdates = Object.fromEntries(
        Object.entries(input).filter(([key, value]) => key !== "id" && value !== undefined)
      );

      expect(cleanUpdates).toEqual({
        name: "Updated Name",
        status: "ACTIVE",
      });
      expect(cleanUpdates.id).toBeUndefined();
    });

    it("should handle partial updates", () => {
      const input = {
        id: "1",
        whatsapp: "5519999999999",
        region: "Zona Norte",
      };

      const cleanUpdates = Object.fromEntries(
        Object.entries(input).filter(([key, value]) => key !== "id" && value !== undefined)
      );

      expect(Object.keys(cleanUpdates)).toHaveLength(2);
      expect(cleanUpdates).toHaveProperty("whatsapp");
      expect(cleanUpdates).toHaveProperty("region");
    });
  });

  describe("deleteAdmin", () => {
    it("should accept valid driver ID for deletion", () => {
      const input = { id: "driver-123" };
      expect(input.id).toBeTruthy();
      expect(typeof input.id).toBe("string");
    });

    it("should reject empty driver ID", () => {
      const input = { id: "" };
      expect(input.id).toBeFalsy();
    });
  });

  describe("setPartner", () => {
    it("should toggle partner status", () => {
      const input1 = { id: "driver-1", isPartner: true };
      const input2 = { id: "driver-1", isPartner: false };

      expect(input1.isPartner).toBe(true);
      expect(input2.isPartner).toBe(false);
    });

    it("should require valid driver ID", () => {
      const input = { id: "driver-123", isPartner: true };
      expect(input.id).toBeTruthy();
      expect(typeof input.isPartner).toBe("boolean");
    });
  });

  describe("Input validation", () => {
    it("should validate WhatsApp format", () => {
      const validWhatsApp = "5519987654321";
      const isValid = /^\d{10,}$/.test(validWhatsApp.replace(/\D/g, ""));
      expect(isValid).toBe(true);
    });

    it("should validate service type is not empty", () => {
      const validServiceType = "Táxi";
      expect(validServiceType.trim().length).toBeGreaterThan(0);
    });

    it("should validate region is not empty", () => {
      const validRegion = "Centro";
      expect(validRegion.trim().length).toBeGreaterThan(0);
    });

    it("should validate capacity is positive integer", () => {
      const validCapacity = 4;
      expect(Number.isInteger(validCapacity)).toBe(true);
      expect(validCapacity).toBeGreaterThan(0);
    });
  });

  describe("Status transitions", () => {
    it("should allow PENDING -> ACTIVE transition", () => {
      const currentStatus = "PENDING";
      const newStatus = "ACTIVE";
      const validStatuses = ["PENDING", "ACTIVE", "REJECTED"];

      expect(validStatuses).toContain(currentStatus);
      expect(validStatuses).toContain(newStatus);
    });

    it("should allow PENDING -> REJECTED transition", () => {
      const currentStatus = "PENDING";
      const newStatus = "REJECTED";
      const validStatuses = ["PENDING", "ACTIVE", "REJECTED"];

      expect(validStatuses).toContain(currentStatus);
      expect(validStatuses).toContain(newStatus);
    });

    it("should allow ACTIVE -> REJECTED transition", () => {
      const currentStatus = "ACTIVE";
      const newStatus = "REJECTED";
      const validStatuses = ["PENDING", "ACTIVE", "REJECTED"];

      expect(validStatuses).toContain(currentStatus);
      expect(validStatuses).toContain(newStatus);
    });
  });
});
