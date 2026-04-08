import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const RETURN_KEY = "oranje_auth_return";

export default function LoginCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const called = useRef(false);

  const utils = trpc.useUtils();

  const mutation = trpc.auth.verifyMagicLink.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Login realizado com sucesso!");
      const returnUrl = sessionStorage.getItem(RETURN_KEY) || "/app";
      sessionStorage.removeItem(RETURN_KEY);
      navigate(returnUrl, { replace: true });
    },
    onError: (err) => {
      setError(err.message || "Link inválido ou expirado. Solicite um novo link.");
    },
  });

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setError("Token não encontrado. Solicite um novo link de acesso.");
      return;
    }

    mutation.mutate({ token });
  }, []);

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--ds-color-bg-primary, #00251A)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "var(--ds-color-text-primary, #E8E6E3)", fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Link inválido
          </h2>
          <p style={{ color: "var(--ds-color-text-secondary, #C8C5C0)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {error}
          </p>
          <button
            onClick={() => navigate("/app/login", { replace: true })}
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "0.75rem",
              background: "#E65100",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Solicitar novo link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ds-color-bg-primary, #00251A)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(230,81,0,0.2)",
            borderTopColor: "#E65100",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 1rem",
          }}
        />
        <h2 style={{ color: "var(--ds-color-text-primary, #E8E6E3)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Verificando...
        </h2>
        <p style={{ color: "var(--ds-color-text-secondary, #C8C5C0)", fontSize: "0.875rem" }}>
          Processando seu login...
        </p>
      </div>
    </div>
  );
}
