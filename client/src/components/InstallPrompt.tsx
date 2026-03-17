import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Apenas registrar SW se estiver em /app
    if (window.location.pathname.startsWith("/app")) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/app/sw.js", { scope: "/app/" }).catch(() => {
          // SW registration failed;
        });
      }
    }

    // Capturar beforeinstallprompt apenas em /app
    const handleBeforeInstallPrompt = (e: Event) => {
      if (!window.location.pathname.startsWith("/app")) {
        return;
      }
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Mostrar prompt apenas em /app
  if (!window.location.pathname.startsWith("/app")) {
    return null;
  }

  // iOS: mostrar instruções
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-0 right-0 mx-4 mb-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-lg z-40 animate-fade-up">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="font-semibold text-sm">Instalar Oranje</p>
            <p className="text-xs mt-1 opacity-90">
              Toque em <span className="font-bold">Compartilhar</span> e selecione <span className="font-bold">Adicionar à Tela de Início</span>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-orange-700 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Android/Desktop: mostrar botão de instalação
  if (showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-0 right-0 mx-4 mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 shadow-lg z-40 animate-fade-up">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Download size={18} className="text-white flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-white">Instalar Oranje</p>
              <p className="text-xs text-white/90">Acesso rápido na sua tela inicial</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
            >
              Instalar
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-orange-700 rounded transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
