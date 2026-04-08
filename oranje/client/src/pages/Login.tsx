import { useState } from "react";
import { DSButton, DSInput } from "@/components/ds";
import { toast } from "sonner";
import { Mail, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = trpc.auth.requestMagicLink.useMutation({
    onSuccess: () => {
      setSent(true);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao enviar o link. Tente novamente.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, insira seu email");
      return;
    }
    mutation.mutate({ email, origin: window.location.origin });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }} className="p-4">
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)" }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(230,81,0,0.15)" }}>
            {sent ? (
              <CheckCircle size={28} style={{ color: "var(--ds-color-accent)" }} />
            ) : (
              <Mail size={28} style={{ color: "var(--ds-color-accent)" }} />
            )}
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--ds-color-text-primary)" }}>
            {sent ? "Link enviado!" : "Bem-vindo"}
          </h1>
          <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>
            {sent
              ? `Verifique sua caixa de entrada em ${email}`
              : "Insira seu email para receber um link de acesso"}
          </p>
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Email</label>
              <DSInput
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={mutation.isPending}
              />
            </div>
            <DSButton variant="primary" type="submit" disabled={mutation.isPending} style={{ width: "100%" }}>
              {mutation.isPending ? "Enviando..." : "Enviar Link de Acesso"}
            </DSButton>
          </form>
        )}

        {sent && (
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="w-full text-sm text-center mt-4"
            style={{ color: "var(--ds-color-text-secondary)", background: "none", border: "none", cursor: "pointer" }}
          >
            Usar outro email
          </button>
        )}

        {!sent && (
          <p className="text-xs text-center mt-4" style={{ color: "var(--ds-color-text-secondary)" }}>
            Você receberá um link por email para fazer login
          </p>
        )}
      </div>
    </div>
  );
}
