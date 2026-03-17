import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronRight, MapPin, Calendar, Users, Car } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  useEffect(() => {
    // Check if PWA is installed
    const checkPWA = async () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsPWAInstalled(true);
        setShowFloatingButton(false);
      }
    };
    checkPWA();
  }, []);

  const handleOpenApp = () => {
    navigate("/app");
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="oranje-app min-h-screen" style={{ background: "#00251A" }}>
      {/* HEADER COM NAVEGAÇÃO */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(0, 37, 26, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(230, 81, 0, 0.1)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex-shrink-0"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <div className="text-2xl font-bold" style={{ color: "#E65100" }}>
              Oranje
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#inicio" className="text-sm" style={{ color: "#F5F5DC" }}>
              Início
            </a>
            <Link to="/guia" className="text-sm" style={{ color: "#F5F5DC" }}>
              Guia
            </Link>
            <a href="#parcerias" className="text-sm" style={{ color: "#F5F5DC" }}>
              Parcerias
            </a>
            <Link to="/sobre" className="text-sm" style={{ color: "#F5F5DC" }}>
              Sobre
            </Link>
            <Link to="/contato" className="text-sm" style={{ color: "#F5F5DC" }}>
              Contato
            </Link>
            <button
              onClick={handleOpenApp}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: "#E65100", color: "#FFFFFF" }}
            >
              Abrir App
            </button>
          </nav>

          <button
            onClick={handleOpenApp}
            className="md:hidden px-3 py-2 rounded-lg"
            style={{ background: "#E65100", color: "#FFFFFF" }}
          >
            App
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        className="relative w-full pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #004D40 0%, #00251A 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1488747807830-63789f68bb65?w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 0,
          }}
        />

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(0,37,26,0.7) 0%, rgba(0,77,64,0.8) 100%)",
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: "#FFFFFF" }}
          >
            Oranje — Seu guia definitivo de Holambra
          </h1>
          <p
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: "#F5F5DC" }}
          >
            Restaurantes, eventos, experiências e transporte premium em um só lugar.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={handleOpenApp}
              className="px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
              style={{ background: "#E65100", color: "#FFFFFF" }}
            >
              Abrir App
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => navigate("/parcerias")}
              className="px-8 py-3 rounded-lg font-medium"
              style={{
                background: "transparent",
                border: "2px solid #E65100",
                color: "#E65100",
              }}
            >
              Quero ser parceiro
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO: O QUE FAZER EM HOLAMBRA */}
      <section className="py-16 md:py-24 px-4" style={{ background: "#00251A" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "#E65100" }}>
            O que fazer em Holambra
          </h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: "#F5F5DC" }}>
            Holambra é muito mais que a capital das flores. A cidade oferece experiências únicas que combinam
            natureza, cultura e gastronomia. Visite os principais pontos turísticos, desfrute de eventos sazonais,
            conheça os produtores locais e viva momentos inesquecíveis. Com Oranje, você descobre o melhor que
            Holambra tem a oferecer, desde as famosas exposições de flores até os restaurantes que celebram a
            culinária regional.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: MapPin, title: "Pontos Turísticos", desc: "Conheça os lugares mais visitados" },
              { icon: Calendar, title: "Eventos", desc: "Festivais e exposições durante o ano" },
              { icon: Users, title: "Experiências", desc: "Atividades e tours guiados" },
              { icon: Car, title: "Transporte", desc: "Motoristas confiáveis e parceiros" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl"
                style={{
                  background: "rgba(230, 81, 0, 0.1)",
                  border: "1px solid rgba(230, 81, 0, 0.2)",
                }}
              >
                <item.icon size={32} style={{ color: "#E65100", marginBottom: "12px" }} />
                <h3 className="font-semibold text-lg mb-2" style={{ color: "#FFFFFF" }}>
                  {item.title}
                </h3>
                <p style={{ color: "#C8C5C0" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO: ONDE COMER */}
      <section className="py-16 md:py-24 px-4" style={{ background: "#004D40" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "#E65100" }}>
            Onde comer em Holambra
          </h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: "#F5F5DC" }}>
            A gastronomia de Holambra reflete sua riqueza cultural e proximidade com a natureza. Restaurantes
            renomados oferecem desde pratos da culinária tradicional até criações inovadoras. Muitos estabelecimentos
            utilizam ingredientes locais, celebrando o melhor da região. Com Oranje, você encontra os melhores
            restaurantes, bares e cafés, com informações completas, avaliações e a possibilidade de reservar seu lugar.
          </p>
        </div>
      </section>

      {/* SEÇÃO: EVENTOS E EXPERIÊNCIAS */}
      <section className="py-16 md:py-24 px-4" style={{ background: "#00251A" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "#E65100" }}>
            Eventos e experiências em Holambra
          </h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: "#F5F5DC" }}>
            Holambra é conhecida por seus eventos sazonais que atraem visitantes de todo o Brasil. A Expoflora, maior
            exposição de flores do Brasil, transforma a cidade em um espetáculo de cores e aromas. Além disso, há
            festivais culturais, shows, workshops e experiências imersivas que celebram a flora, a arte e a comunidade
            local. Fique atualizado com os principais eventos através de Oranje e não perca nenhuma oportunidade.
          </p>
        </div>
      </section>

      {/* SEÇÃO: TRANSPORTE */}
      <section className="py-16 md:py-24 px-4" style={{ background: "#004D40" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "#E65100" }}>
            Transporte e motoristas parceiros
          </h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: "#F5F5DC" }}>
            Locomoção confiável é essencial para aproveitar ao máximo sua visita a Holambra. Oranje conecta você com
            motoristas verificados e parceiros de transporte que conhecem a cidade. Todos os nossos parceiros são
            cuidadosamente selecionados para garantir segurança, conforto e pontualidade. Reserve seu transporte com
            facilidade e viaje com tranquilidade.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        className="py-16 md:py-24 px-4 text-center"
        style={{ background: "#00251A" }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "#FFFFFF" }}>
            Comece sua jornada em Holambra
          </h2>
          <p className="text-lg mb-8" style={{ color: "#F5F5DC" }}>
            Baixe Oranje agora e descubra tudo que a cidade das flores tem a oferecer.
          </p>
          <button
            onClick={handleOpenApp}
            className="px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2"
            style={{ background: "#E65100", color: "#FFFFFF" }}
          >
            Abrir App
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-12 px-4 border-t"
        style={{
          background: "#004D40",
          borderColor: "rgba(230, 81, 0, 0.1)",
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-xl font-bold mb-4" style={{ color: "#E65100" }}>
              Oranje
            </div>
            <p style={{ color: "#C8C5C0" }}>Seu guia definitivo de Holambra</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: "#FFFFFF" }}>
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/guia" style={{ color: "#C8C5C0" }}>
                  Guia
                </Link>
              </li>
              <li>
                <Link to="/sobre" style={{ color: "#C8C5C0" }}>
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/parcerias" style={{ color: "#C8C5C0" }}>
                  Parcerias
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: "#FFFFFF" }}>
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacidade" style={{ color: "#C8C5C0" }}>
                  Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos" style={{ color: "#C8C5C0" }}>
                  Termos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: "#FFFFFF" }}>
              Contato
            </h4>
            <Link to="/contato" style={{ color: "#C8C5C0" }}>
              Fale conosco
            </Link>
          </div>
        </div>
        <div
          className="text-center text-sm pt-8 border-t"
          style={{
            color: "#9B9795",
            borderColor: "rgba(230, 81, 0, 0.1)",
          }}
        >
          © 2026 Oranje. Todos os direitos reservados.
        </div>
      </footer>

      {/* FLOATING APP BUTTON */}
      {showFloatingButton && (
        <button
          onClick={handleOpenApp}
          className="fixed bottom-6 right-6 z-40 px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
          style={{
            background: "#E65100",
            color: "#FFFFFF",
            animation: prefersReducedMotion ? "none" : "pulse 2s infinite",
            animationDelay: "20s",
          }}
        >
          Abrir App
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
