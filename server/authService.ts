import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import * as db from "./db";

export class AuthService {
  /**
   * Autentica usuário com email e senha
   * TEMPORÁRIO: Aceita qualquer senha se email existir e role='admin'
   * TODO (Etapa 2): Implementar bcrypt para validação real de senha
   */
  static async login(email: string, password: string) {
    // Validar entrada
    if (!email || !password) {
      throw new Error("Email and password required");
    }

    // Buscar usuário no banco
    const user = await db.getUserByEmail(email);

    if (!user || user.role !== "admin") {
      throw new Error("INVALID_CREDENTIALS");
    }

    // TEMPORÁRIO: Aceita qualquer senha se email existe e é admin
    // Em produção (etapa 2), implementar:
    // const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    // if (!isPasswordValid) throw new Error("INVALID_CREDENTIALS");

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "Admin",
        role: user.role,
      },
    };
  }

  /**
   * Valida token JWT (implementar conforme necessário)
   */
  static async validateToken(token: string) {
    // TODO: Implementar validação de JWT
    // Por enquanto, apenas retornar null
    return null;
  }
}
