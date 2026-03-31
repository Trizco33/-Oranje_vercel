import { useNavigate } from "react-router-dom";

export default function Privacy() {
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
            Política de Privacidade
          </h1>

          <div className="space-y-8 text-lg" style={{ color: "#F5F5DC", lineHeight: "1.8" }}>
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                1. Introdução
              </h2>
              <p>
                A Oranje ("nós", "nosso" ou "nos") opera a plataforma Oranje. Esta página informa você sobre nossas
                políticas regarding a coleta, uso e divulgação de dados pessoais quando você usa nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                2. Coleta de Dados
              </h2>
              <p>
                Coletamos dados pessoais que você nos fornece voluntariamente, como nome, email e informações de
                localização. Também coletamos dados automaticamente sobre seu uso da plataforma através de cookies e
                tecnologias similares.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                3. Uso de Dados
              </h2>
              <p>
                Usamos seus dados para fornecer, manter e melhorar nossos serviços, comunicar com você, processar
                transações e cumprir obrigações legais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                4. Segurança
              </h2>
              <p>
                Implementamos medidas de segurança apropriadas para proteger seus dados pessoais. No entanto, nenhum
                método de transmissão pela Internet é 100% seguro.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                5. Seus Direitos
              </h2>
              <p>
                Você tem o direito de acessar, corrigir ou deletar seus dados pessoais. Para exercer esses direitos,
                entre em contato conosco através de contato@oranje.com.br.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                6. Contato
              </h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em
                contato@oranje.com.br.
              </p>
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
