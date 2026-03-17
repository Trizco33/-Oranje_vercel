import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="oranje-app min-h-screen" style={{ background: "#00251A" }}>
      {/* HEADER */}
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
            onClick={() => navigate("/")}
            className="text-2xl font-bold"
            style={{ color: "#E65100", background: "none", border: "none", cursor: "pointer" }}
          >
            Oranje
          </button>
          <button
            onClick={() => navigate("/app")}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "#E65100", color: "#FFFFFF" }}
          >
            Abrir App
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 mt-8" style={{ color: "#FFFFFF" }}>
            Sobre Oranje
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#E65100" }}>
                Nossa Missão
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "#F5F5DC" }}>
                Oranje existe para transformar a forma como as pessoas descobrem, exploram e vivem Holambra. Somos mais
                que um guia turístico — somos o seu companheiro de viagem, conectando você aos melhores lugares, eventos,
                experiências e serviços que a cidade das flores tem a oferecer.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#E65100" }}>
                Quem Somos
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "#F5F5DC" }}>
                Oranje é uma plataforma inovadora desenvolvida para servir turistas, moradores e parceiros de negócios
                em Holambra. Nosso time é apaixonado por tecnologia, turismo e pela cidade. Acreditamos que informação
                de qualidade, acessível e bem organizada, pode transformar experiências.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#E65100" }}>
                O Que Oferecemos
              </h2>
              <ul className="space-y-4">
                {[
                  "Guia completo de restaurantes, bares e cafés",
                  "Calendário de eventos e experiências",
                  "Informações sobre pontos turísticos",
                  "Sistema de transporte confiável com motoristas parceiros",
                  "Ofertas e promoções exclusivas",
                  "Conteúdo editorial sobre Holambra",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ChevronRight size={20} style={{ color: "#E65100", flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ color: "#F5F5DC" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#E65100" }}>
                Nossos Valores
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Qualidade", desc: "Informações precisas e atualizadas" },
                  { title: "Confiança", desc: "Parceiros verificados e seguros" },
                  { title: "Inovação", desc: "Tecnologia ao serviço da experiência" },
                ].map((value, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl"
                    style={{
                      background: "rgba(230, 81, 0, 0.1)",
                      border: "1px solid rgba(230, 81, 0, 0.2)",
                    }}
                  >
                    <h3 className="font-semibold text-lg mb-2" style={{ color: "#E65100" }}>
                      {value.title}
                    </h3>
                    <p style={{ color: "#C8C5C0" }}>{value.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: "rgba(230, 81, 0, 0.1)" }}>
            <p style={{ color: "#C8C5C0" }}>
              Tem dúvidas? <a href="/contato" style={{ color: "#E65100" }}>Entre em contato conosco</a>.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer
        className="py-12 px-4 border-t mt-12"
        style={{
          background: "#004D40",
          borderColor: "rgba(230, 81, 0, 0.1)",
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: "#9B9795" }}>© 2026 Oranje. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
