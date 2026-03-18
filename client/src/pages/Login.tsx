import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DSButton, DSInput } from "@/components/ds";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, insira seu email");
      return;
    }

    setIsLoading(true);
    // Mock magic link - simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast.success("Link enviado! Verifique seu email");
    setEmail("");
    setIsLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }} className="p-4">
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)" }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(230,81,0,0.15)" }}>
            <Mail size={28} style={{ color: "var(--ds-color-accent)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Bem-vindo</h1>
          <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>
            Insira seu email para receber um link de acesso
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Email</label>
            <DSInput
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <DSButton variant="primary" type="submit" disabled={isLoading} style={{ width: "100%" }}>
            {isLoading ? "Enviando..." : "Enviar Link de Acesso"}
          </DSButton>
        </form>
        <p className="text-xs text-center mt-4" style={{ color: "var(--ds-color-text-secondary)" }}>
          Você receberá um link por email para fazer login
        </p>
      </div>
    </div>
  );
}
