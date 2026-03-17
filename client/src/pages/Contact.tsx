import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend endpoint
    toast.success("Mensagem enviada! Entraremos em contato em breve.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 mt-8" style={{ color: "#FFFFFF" }}>
            Entre em Contato
          </h1>
          <p className="text-lg mb-12" style={{ color: "#F5F5DC" }}>
            Tem dúvidas ou sugestões? Estamos aqui para ouvir.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-2xl" style={{ background: "rgba(230, 81, 0, 0.1)", border: "1px solid rgba(230, 81, 0, 0.2)" }}>
              <Mail size={32} style={{ color: "#E65100", marginBottom: "12px" }} />
              <h3 className="font-semibold text-lg mb-2" style={{ color: "#FFFFFF" }}>
                Email
              </h3>
              <a href="mailto:contato@oranje.app" style={{ color: "#E65100" }}>
                contato@oranje.app
              </a>
            </div>
            <div className="p-6 rounded-2xl" style={{ background: "rgba(230, 81, 0, 0.1)", border: "1px solid rgba(230, 81, 0, 0.2)" }}>
              <MessageSquare size={32} style={{ color: "#E65100", marginBottom: "12px" }} />
              <h3 className="font-semibold text-lg mb-2" style={{ color: "#FFFFFF" }}>
                Redes Sociais
              </h3>
              <a href="#" style={{ color: "#E65100" }}>
                @oranjeholambra
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#FFFFFF" }}>
                Nome
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg"
                style={{
                  background: "rgba(230, 81, 0, 0.1)",
                  border: "1px solid rgba(230, 81, 0, 0.2)",
                  color: "#FFFFFF",
                }}
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#FFFFFF" }}>
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg"
                style={{
                  background: "rgba(230, 81, 0, 0.1)",
                  border: "1px solid rgba(230, 81, 0, 0.2)",
                  color: "#FFFFFF",
                }}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#FFFFFF" }}>
                Assunto
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-lg"
                style={{
                  background: "rgba(230, 81, 0, 0.1)",
                  border: "1px solid rgba(230, 81, 0, 0.2)",
                  color: "#FFFFFF",
                }}
                placeholder="Assunto da mensagem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#FFFFFF" }}>
                Mensagem
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 rounded-lg"
                style={{
                  background: "rgba(230, 81, 0, 0.1)",
                  border: "1px solid rgba(230, 81, 0, 0.2)",
                  color: "#FFFFFF",
                }}
                placeholder="Sua mensagem..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg font-medium"
              style={{ background: "#E65100", color: "#FFFFFF" }}
            >
              Enviar Mensagem
            </button>
          </form>
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
