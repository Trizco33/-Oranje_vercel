import { useNavigate } from "react-router-dom";
import { ChevronRight, Building2, TrendingUp, Users } from "lucide-react";

export default function Partnerships() {
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
            Seja Parceiro Oranje
          </h1>
          <p className="text-xl mb-12" style={{ color: "#F5F5DC" }}>
            Expanda seu negócio e alcance mais clientes através da plataforma Oranje.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#E65100" }}>
                Por que ser parceiro?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Users,
                    title: "Mais Clientes",
                    desc: "Acesse uma base crescente de usuários em Holambra",
                  },
                  {
                    icon: TrendingUp,
                    title: "Crescimento",
                    desc: "Ferramentas para aumentar visibilidade e vendas",
                  },
                  {
                    icon: Building2,
                    title: "Suporte",
                    desc: "Equipe dedicada para apoiar seu negócio",
                  },
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
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#E65100" }}>
                Tipos de Parcerias
              </h2>
              <div className="space-y-4">
                {[
                  { title: "Restaurantes & Bares", desc: "Aumente suas reservas e visibilidade" },
                  { title: "Hotéis & Hospedagem", desc: "Conecte-se com turistas e viajantes" },
                  { title: "Motoristas", desc: "Ofereça transporte confiável" },
                  { title: "Eventos & Experiências", desc: "Promova suas atividades" },
                  { title: "Lojas & Serviços", desc: "Alcance clientes locais e turistas" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl flex items-start gap-3"
                    style={{
                      background: "rgba(230, 81, 0, 0.05)",
                      border: "1px solid rgba(230, 81, 0, 0.1)",
                    }}
                  >
                    <ChevronRight size={20} style={{ color: "#E65100", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <h4 className="font-semibold" style={{ color: "#FFFFFF" }}>
                        {item.title}
                      </h4>
                      <p style={{ color: "#C8C5C0" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#E65100" }}>
                Como Funciona
              </h2>
              <ol className="space-y-4">
                {[
                  "Envie uma solicitação de parceria",
                  "Nossa equipe entra em contato para avaliar",
                  "Definimos os termos da parceria",
                  "Seu negócio é listado em Oranje",
                  "Comece a receber clientes",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold"
                      style={{ background: "#E65100", color: "#FFFFFF" }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ color: "#F5F5DC" }}>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="bg-gradient-to-r from-orange-900 to-orange-800 p-8 rounded-2xl">
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
                Pronto para crescer?
              </h2>
              <p className="mb-6" style={{ color: "#F5F5DC" }}>
                Entre em contato conosco e descubra como Oranje pode impulsionar seu negócio.
              </p>
              <button
                onClick={() => navigate("/contato")}
                className="px-6 py-3 rounded-lg font-medium"
                style={{ background: "#FFFFFF", color: "#E65100" }}
              >
                Solicitar Parceria
              </button>
            </section>
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
