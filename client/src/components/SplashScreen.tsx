import { useEffect, useState } from "react";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Duração da splash: 1.8 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{
        background: "#0F1B14",
      }}
    >
      <style>{`
        @keyframes splashFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes splashPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }

        .splash-logo {
          animation: splashFadeIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-logo {
            animation: none;
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Logo Completa Centralizada */}
      <div className="splash-logo flex items-center justify-center">
        <img
          src="/brand/oranje-wordmark.png"
          alt="Oranje"
          style={{
            width: "clamp(200px, 55vw, 400px)",
            height: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          }}
        />
      </div>
    </div>
  );
}
