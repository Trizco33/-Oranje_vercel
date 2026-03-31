import * as db from "./db";

export class AuthService {
  /**
   * Autentica usuário admin com email e senha usando hash armazenado.
   */
  static async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error("Email and password required");
    }

    const user = await db.getUserByEmail(email);
    if (!user || user.role !== "admin") {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await db.verifyAdminPassword(user.id, password);
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

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
