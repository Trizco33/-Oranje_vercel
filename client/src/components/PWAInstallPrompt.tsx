import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar se PWA já está instalado
    const checkIfInstalled = () => {
      // Método 1: window.matchMedia (mais confiável)
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
        return;
      }
      // Método 2: navigator.standalone (iOS)
      if ((navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Detectar iOS
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Capturar beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Verificar novamente se o app está instalado quando o event chega
      const isCurrentlyInstalled = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      // Só mostrar prompt se o app não estiver instalado
      if (!isCurrentlyInstalled) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

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
    setDismissed(true);
  };

  // Se o app já está instalado, não mostrar nada
  // Verificar novamente no render para garantir que não mostra em standalone mode
  const isCurrentlyInstalled = 
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true;
  
  if (isInstalled || isCurrentlyInstalled) {
    return null;
  }

  // iOS: mostrar instruções
  if (isIOS && showPrompt && !dismissed) {
    return (
      <div className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-lg z-40 animate-fade-up">
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

  // Android/Desktop: mostrar botão de instalação (apenas se não estiver instalado)
  if (showPrompt && deferredPrompt && !dismissed && !isInstalled) {
    return (
      <div className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 shadow-lg z-40 animate-fade-up">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Download size={18} className="text-white flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-white">Instalar Oranje</p>
              <p className="text-xs text-white/90">Acesso rápido na sua tela inicial</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-orange-600 hover:bg-orange-50 font-semibold rounded text-sm transition-colors"
            >
              Instalar
            </button>
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
