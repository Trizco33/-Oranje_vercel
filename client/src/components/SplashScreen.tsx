import { useEffect, useState } from "react";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        background: "#00251A",
      }}
    >
      <style>{`
        @keyframes splashFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .splash-logo {
          animation: splashFadeIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-logo { animation: none; opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="splash-logo" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src="/logo-white.png"
          alt="Oranje"
          style={{
            width: "clamp(180px, 45vw, 320px)",
            height: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          }}
        />
      </div>
    </div>
  );
}
