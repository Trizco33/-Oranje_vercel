import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { Loader2, LogOut } from "lucide-react";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  if (isLoading) {
    return (
      <div className="oranje-app min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#D4A574" }} />
          <p style={{ color: "#C8C5C0" }}>Carregando…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="oranje-app min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-4xl mb-4">🔐</p>
          <p className="text-lg font-medium mb-2" style={{ color: "#E8E6E3" }}>Acesso restrito</p>
          <p className="text-sm mb-6" style={{ color: "#C8C5C0" }}>Você precisa estar autenticado para acessar esta área.</p>
          <button
            onClick={() => navigate("/login")}
            className="btn-gold px-6 py-3 rounded-xl text-sm font-medium"
          >
            Fazer Login
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
      <div className="oranje-app min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-4xl mb-4">⛔</p>
          <p className="text-lg font-medium mb-2" style={{ color: "#E8E6E3" }}>Acesso restrito</p>
          <p className="text-sm mb-8" style={{ color: "#C8C5C0" }}>Seu usuário não tem permissão para acessar o painel.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="btn-gold px-6 py-3 rounded-xl text-sm font-medium"
            >
              Voltar para Home
            </button>
            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-current"
              style={{ color: "#D88A3D", opacity: logout.isPending ? 0.5 : 1 }}
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
