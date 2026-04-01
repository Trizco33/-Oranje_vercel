import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Heart, Compass, Bus, X } from "lucide-react";
import { OranjeHeader } from "@/components/OranjeHeader";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route?: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Explorar Holambra",
    description: "Descubra os melhores lugares, restaurantes e atrações turísticas de Holambra. Navegue por categorias e encontre experiências únicas.",
    icon: <Compass size={48} />,
    color: "#E65100",
    route: "/app/explorar",
  },
  {
    id: 2,
    title: "Favoritos",
    description: "Salve seus lugares e eventos favoritos para acessar rapidamente. Crie sua lista personalizada de experiências que você quer vivenciar.",
    icon: <Heart size={48} />,
    color: "#FF8A65",
    route: "/app/favoritos",
  },
  {
    id: 3,
    title: "Transporte",
    description: "Encontre informações sobre transporte público, táxis e rotas para chegar aos principais pontos turísticos de Holambra.",
    icon: <Bus size={48} />,
    color: "#FF7043",
    route: "/app/transporte",
  },
  {
    id: 4,
    title: "Roteiros Curados",
    description: "Explore roteiros especialmente curados por especialistas locais. Experiências completas que combinam gastronomia, arte e natureza.",
    icon: <MapPin size={48} />,
    color: "#BF360C",
    route: "/app/roteiros",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkip, setShowSkip] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    navigate("/app");
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    navigate("/app");
  };

  const handleGoToFeature = (route?: string) => {
    if (route) {
      localStorage.setItem("onboarding_completed", "true");
      navigate(route);
    }
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col" style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Bem-vindo ao Oranje" showBack={false} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 mt-20">
        {/* Progress Bar */}
        <div className="w-full max-w-md mb-12">
          <div className="flex gap-2 mb-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className="flex-1 h-1 rounded-full transition-all"
                style={{
                  background: idx <= currentStep ? "var(--ds-color-accent)" : "rgba(230,81,0,0.2)",
                  animation: prefersReducedMotion ? "none" : `${idx === currentStep ? "progressPulse" : ""} 1s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-center opacity-60" style={{ color: "var(--ds-color-text-primary)" }}>
            Passo {currentStep + 1} de {steps.length}
          </p>
        </div>

        {/* Icon Container */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-all"
          style={{
            background: `${step.color}20`,
            border: `2px solid ${step.color}`,
            color: step.color,
            animation: prefersReducedMotion ? "none" : "iconBounce 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          {step.icon}
        </div>

        {/* Content */}
        <div className="text-center max-w-md mb-12">
          <h2
            className="text-3xl font-bold mb-4"
            style={{
              color: "var(--ds-color-text-primary)",
              animation: prefersReducedMotion ? "none" : "slideUp 500ms ease-out forwards",
            }}
          >
            {step.title}
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{
              color: "var(--ds-color-text-secondary)",
              animation: prefersReducedMotion ? "none" : "slideUp 500ms ease-out 100ms forwards",
              opacity: 0,
            }}
          >
            {step.description}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-md">
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: "var(--ds-color-accent)",
              color: "#fff",
              animation: prefersReducedMotion ? "none" : "slideUp 500ms ease-out 200ms forwards",
              opacity: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(230,81,0,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            {currentStep === steps.length - 1 ? "Começar" : "Próximo"}
            <ChevronRight size={18} />
          </button>

          {showSkip && (
            <button
              onClick={handleSkip}
              className="w-full py-3 rounded-xl font-semibold transition-all"
              style={{
                background: "rgba(230,81,0,0.1)",
                color: "var(--ds-color-accent)",
                border: "1px solid rgba(230,81,0,0.3)",
                animation: prefersReducedMotion ? "none" : "slideUp 500ms ease-out 300ms forwards",
                opacity: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(230,81,0,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(230,81,0,0.1)"; }}
            >
              Pular
            </button>
          )}

          {step.route && (
            <button
              onClick={() => handleGoToFeature(step.route)}
              className="w-full py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                color: step.color,
                animation: prefersReducedMotion ? "none" : "slideUp 500ms ease-out 400ms forwards",
                opacity: 0,
              }}
            >
              Explorar {step.title} agora →
            </button>
          )}
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={handleSkip}
        className="absolute top-24 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{ background: "rgba(230,81,0,0.1)", color: "var(--ds-color-accent)" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(230,81,0,0.2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(230,81,0,0.1)"; }}
      >
        <X size={20} />
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes iconBounce {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}
