import { useNavigate } from "react-router-dom";

export default function Terms() {
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
            Termos de Serviço
          </h1>

          <div className="space-y-8 text-lg" style={{ color: "#F5F5DC", lineHeight: "1.8" }}>
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                1. Aceitação dos Termos
              </h2>
              <p>
                Ao acessar e usar a plataforma Oranje, você aceita estar vinculado por estes Termos de Serviço. Se você
                não concorda com qualquer parte destes termos, você não pode usar nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                2. Uso da Plataforma
              </h2>
              <p>
                Você concorda em usar a plataforma Oranje apenas para fins legítimos e de acordo com todas as leis e
                regulamentações aplicáveis. Você não deve usar a plataforma de maneira que possa danificar, desabilitar
                ou prejudicar o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                3. Contas de Usuário
              </h2>
              <p>
                Se você criar uma conta em nossa plataforma, você é responsável por manter a confidencialidade de suas
                credenciais e por todas as atividades que ocorrem em sua conta. Você concorda em notificar-nos
                imediatamente sobre qualquer uso não autorizado de sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                4. Limitação de Responsabilidade
              </h2>
              <p>
                A plataforma Oranje é fornecida "como está" sem garantias de qualquer tipo. Não somos responsáveis por
                danos diretos, indiretos, incidentais ou consequentes resultantes do uso ou incapacidade de usar nosso
                serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                5. Modificações dos Termos
              </h2>
              <p>
                Reservamos o direito de modificar estes Termos de Serviço a qualquer momento. Mudanças significativas
                serão notificadas através da plataforma. Seu uso contínuo da plataforma após tais modificações
                constitui sua aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                6. Lei Aplicável
              </h2>
              <p>
                Estes Termos de Serviço são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais
                competentes de São Paulo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#E65100" }}>
                7. Contato
              </h2>
              <p>
                Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco em contato@oranje.app.
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
