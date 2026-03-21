import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { Loader2, LogOut } from "lucide-react";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading, error } = trpc.auth.me.useQuery(undefined, {
    retry: 1,
    throwOnError: false,
  });

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #00251A 0%, #004D40 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={48} style={{ color: "#E65100", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#C8C5C0" }}>Verificando autenticação…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const returnPath = encodeURIComponent(location.pathname);
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #00251A 0%, #004D40 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        padding: "24px",
      }}>
        <div style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0, 0, 0, 0.15)",
          padding: "40px 36px",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "3rem", marginBottom: "16px" }}>🔐</p>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#00251A", marginBottom: "8px" }}>
            Acesso restrito
          </h2>
          <p style={{ color: "#718096", fontSize: "0.875rem", marginBottom: "24px" }}>
            Você precisa estar autenticado para acessar esta área.
          </p>
          <button
            onClick={() => navigate(`/login?next=${returnPath}`)}
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
              cursor: "pointer",
              minHeight: "48px",
            }}
          >
            Fazer Login
          </button>
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
              marginTop: "16px",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            ← Voltar ao site
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    const logout = trpc.auth.logout.useMutation();

    const handleLogout = async () => {
      try {
        await logout.mutateAsync();
        navigate("/");
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        navigate("/");
      }
    };

    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #00251A 0%, #004D40 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        padding: "24px",
      }}>
        <div style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0, 0, 0, 0.15)",
          padding: "40px 36px",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "3rem", marginBottom: "16px" }}>⛔</p>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#00251A", marginBottom: "8px" }}>
            Acesso negado
          </h2>
          <p style={{ color: "#718096", fontSize: "0.875rem", marginBottom: "24px" }}>
            Seu usuário não tem permissão para acessar o painel.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                background: "#E65100",
                color: "#FFFFFF",
                fontSize: "0.9375rem",
                fontWeight: 600,
                fontFamily: "'Montserrat', system-ui, sans-serif",
                border: "none",
                cursor: "pointer",
              }}
            >
              Voltar para Home
            </button>
            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                background: "transparent",
                color: "#E65100",
                fontSize: "0.9375rem",
                fontWeight: 600,
                fontFamily: "'Montserrat', system-ui, sans-serif",
                border: "1px solid #E65100",
                cursor: logout.isPending ? "not-allowed" : "pointer",
                opacity: logout.isPending ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <LogOut size={16} />
              {logout.isPending ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
