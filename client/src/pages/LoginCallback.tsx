import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LoginCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Mock verification - briefly show loading then redirect
    const timer = setTimeout(() => {
      toast.success("Login realizado com sucesso!");
      navigate("/");
    }, 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

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
