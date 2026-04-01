import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * Unified admin login page.
 * Works for both CMS (/admin) and App Admin (/app/adm).
 * Sets both cms_session and app_session_id cookies on the server side.
 *
 * Query params:
 *   ?next=/app/adm   → redirect after login
 */
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const utils = trpc.useUtils();

  const nextPath = searchParams.get("next") || "/admin";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiBase}/api/cms/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast.success("Login realizado com sucesso!");
        // Invalidate trpc auth cache so AdminGuard picks up the new session
        await utils.auth.me.invalidate();
        // Small delay to let cookie propagate
        setTimeout(() => {
          navigate(nextPath, { replace: true });
        }, 300);
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Email ou senha incorretos");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(0, 37, 26, 0.12)",
    background: "#FFFFFF",
    color: "#1A1A1A",
    fontSize: "0.9375rem",
    fontFamily: "'Montserrat', system-ui, sans-serif",
    transition: "border-color 200ms ease, box-shadow 200ms ease",
    minHeight: "48px",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #00251A 0%, #004D40 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0, 0, 0, 0.15)",
          padding: "40px 36px",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src="/logo.png"
            alt="Oranje"
            style={{ height: "48px", width: "auto", margin: "0 auto 16px" }}
          />
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#00251A",
              marginBottom: "4px",
            }}
          >
            Painel Administrativo
          </h1>
          <p style={{ color: "#718096", fontSize: "0.875rem" }}>
            Faça login para acessar o painel
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 600,
                marginBottom: "6px",
                color: "#4A5568",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@oranje.com"
              required
              disabled={isLoading}
              style={{ ...inputStyle, opacity: isLoading ? 0.6 : 1 }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#E65100";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(230, 81, 0, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 37, 26, 0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 600,
                marginBottom: "6px",
                color: "#4A5568",
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              style={{ ...inputStyle, opacity: isLoading ? 0.6 : 1 }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#E65100";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(230, 81, 0, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 37, 26, 0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              background: "#E65100",
              color: "#FFFFFF",
              fontSize: "1rem",
              fontWeight: 600,
              fontFamily: "'Montserrat', system-ui, sans-serif",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 200ms ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minHeight: "52px",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = "#FF6D00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#E65100";
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Conectando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "#718096",
            marginTop: "24px",
          }}
        >
          Acesso restrito a administradores
        </p>

        <div
          style={{
            textAlign: "center",
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(0, 37, 26, 0.08)",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "#00251A",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'Montserrat', system-ui, sans-serif",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            ← Voltar ao site
          </button>
        </div>
      </div>
    </div>
  );
}
