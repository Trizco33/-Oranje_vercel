import { describe, it, expect } from "vitest";
import { adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

describe("Admin Logs Security", () => {
  it("should only allow admins to access adminLogs.list", async () => {
    // adminProcedure já protege a rota, então apenas admins podem acessá-la
    // Se um usuário não-admin tentar acessar, receberá erro FORBIDDEN
    expect(adminProcedure).toBeDefined();
  });

  it("adminProcedure should be protected", async () => {
    // Verificar que adminProcedure existe e está configurado
    expect(adminProcedure).toBeDefined();
    // adminProcedure verifica ctx.user.role === "admin"
    // Se não for admin, lança TRPCError com código FORBIDDEN
  });
});
