import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function LoginCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const verifyMagicLink = trpc.auth.verifyMagicLink.useMutation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      if (!token) {
        toast.error("Token inválido");
        navigate("/login");
        return;
      }

      try {
        await verifyMagicLink.mutateAsync({ token });
        toast.success("Login realizado com sucesso!");
        navigate("/");
      } catch (error) {
        toast.error("Erro ao fazer login");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate, verifyMagicLink]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Verificando...</CardTitle>
          <CardDescription>
            {isLoading ? "Processando seu login..." : "Redirecionando..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
