import { useNavigate } from "react-router-dom";
import { Mail, MessageCircle, MapPin, Star, TrendingUp, Eye, Heart } from "lucide-react";

const WHATSAPP = "5519992483372";
const EMAIL = "oranjeapp.oficial@gmail.com";
const WA_LINK = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Tenho interesse em ser parceiro Oranje.")}`;

export default function Partnerships() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#FAFAF8", minHeight: "100vh", fontFamily: "Montserrat, sans-serif" }}>

      {/* ── Header ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(0,37,26,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(230,81,0,0.15)",
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, fontWeight: 800, color: "#E65100", fontFamily: "Montserrat, sans-serif" }}>
            Oranje
          </button>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
            background: "#E65100", color: "#fff", borderRadius: 10,
            padding: "8px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}>
            Falar no WhatsApp
          </a>
        </div>
      </header>

      <div style={{ paddingTop: 60 }}>

        {/* ── Hero ── */}
        <section style={{
          background: "linear-gradient(160deg, #00251A 0%, #004D40 100%)",
          padding: "72px 24px 64px",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{
              display: "inline-block", background: "rgba(230,81,0,0.15)",
              border: "1px solid rgba(230,81,0,0.35)", borderRadius: 30,
              padding: "6px 18px", fontSize: 12, fontWeight: 700,
              color: "#E65100", letterSpacing: "0.08em", textTransform: "uppercase",
              marginBottom: 28,
            }}>
              Parceiro Oranje
            </div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 20 }}>
              Seu negócio na palma<br />de quem visita Holambra
            </h1>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px" }}>
              Oranje é o guia que os visitantes abrem quando chegam em Holambra.
              Estar aqui significa ser a primeira escolha — antes mesmo de o turista sair do carro.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", gap: 9,
                background: "#25D366", color: "#fff", borderRadius: 12,
                padding: "14px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(37,211,102,0.35)",
              }}>
                <MessageCircle size={18} />
                Quero ser parceiro
              </a>
              <a href={`mailto:${EMAIL}`} style={{
                display: "flex", alignItems: "center", gap: 9,
                background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 12,
                padding: "14px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)",
              }}>
                <Mail size={18} />
                Enviar e-mail
              </a>
            </div>
          </div>
        </section>

        {/* ── Por que Oranje ── */}
        <section style={{ padding: "64px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#E65100", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Por que funciona</p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: "#00251A", lineHeight: 1.2, marginBottom: 48, maxWidth: 560 }}>
              O visitante chega em Holambra sem saber por onde começar. Oranje resolve isso.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
              {[
                {
                  icon: MapPin,
                  title: "Presença local de verdade",
                  desc: "Seu estabelecimento aparece no mapa interativo, nas listas de exploração e nos roteiros curados — exatamente quando o turista está decidindo o próximo passo.",
                },
                {
                  icon: Eye,
                  title: "Visibilidade ativa, não passiva",
                  desc: "Ao contrário de um cadastro que ninguém vê, seu perfil aparece em buscas por categoria, nos destaques editoriais e nos passeios com motorista.",
                },
                {
                  icon: Star,
                  title: "Avaliações que constroem reputação",
                  desc: "Clientes deixam reviews diretamente no app. Seu negócio acumula uma reputação real que atrai mais visitantes ao longo do tempo.",
                },
                {
                  icon: TrendingUp,
                  title: "Crescimento junto com Holambra",
                  desc: "Oranje cresce com o turismo da cidade. Entrar agora, nos primeiros parceiros, significa estar bem posicionado quando a base de usuários escalar.",
                },
              ].map((item) => (
                <div key={item.title} style={{
                  padding: "28px 24px", borderRadius: 16,
                  border: "1.5px solid rgba(0,37,26,0.08)",
                  background: "#FAFAF8",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "rgba(230,81,0,0.1)", display: "flex",
                    alignItems: "center", justifyContent: "center", marginBottom: 16,
                  }}>
                    <item.icon size={22} color="#E65100" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#00251A", marginBottom: 10 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "rgba(0,37,26,0.65)", lineHeight: 1.65, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quem pode ser parceiro ── */}
        <section style={{ padding: "64px 24px", background: "#FAFAF8" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#E65100", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Quem pode participar</p>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, color: "#00251A", marginBottom: 32 }}>
              Qualquer negócio que queira mais turistas como clientes
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {[
                "Restaurantes e bares",
                "Cafés e padarias",
                "Hotéis e pousadas",
                "Lojas de flores e artesanato",
                "Atrações e experiências",
                "Agências de turismo",
                "Motoristas e transporte",
                "Eventos e festivais",
              ].map((tipo) => (
                <div key={tipo} style={{
                  padding: "10px 18px", borderRadius: 30, fontSize: 14, fontWeight: 600,
                  background: "#fff", color: "#00251A",
                  border: "1.5px solid rgba(0,37,26,0.12)",
                }}>
                  {tipo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Como funciona ── */}
        <section style={{ padding: "64px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#E65100", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Processo simples</p>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, color: "#00251A", marginBottom: 40 }}>
              Do contato à presença no app em poucos dias
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  n: "01",
                  title: "Você nos contata",
                  desc: "Manda uma mensagem pelo WhatsApp ou e-mail. Sem formulários complicados, sem burocracia.",
                },
                {
                  n: "02",
                  title: "Conversa rápida",
                  desc: "A equipe Oranje entra em contato para entender seu negócio e alinhar como a parceria funciona na prática.",
                },
                {
                  n: "03",
                  title: "Perfil criado e revisado com você",
                  desc: "Montamos o perfil do seu estabelecimento com fotos, descrição e informações. Você aprova antes de publicar.",
                },
                {
                  n: "04",
                  title: "No ar — e recebendo turistas",
                  desc: "Seu negócio aparece no app para todos os visitantes de Holambra que usam o Oranje.",
                },
              ].map((step, i, arr) => (
                <div key={step.n} style={{ display: "flex", gap: 20, paddingBottom: i < arr.length - 1 ? 32 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: "#E65100", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800,
                    }}>
                      {step.n}
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: "rgba(230,81,0,0.2)", marginTop: 8 }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 10 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#00251A", marginBottom: 6 }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "rgba(0,37,26,0.65)", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA final com contato ── */}
        <section style={{
          padding: "64px 24px",
          background: "linear-gradient(160deg, #00251A 0%, #004D40 100%)",
        }}>
          <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <Heart size={32} color="#E65100" style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>
              Vamos colocar seu negócio no radar dos turistas?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 40 }}>
              Manda uma mensagem — respondemos no mesmo dia.
              Sem enrolação, sem contrato longo, sem surpresas.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#25D366", color: "#fff", borderRadius: 14,
                padding: "16px 36px", fontSize: 16, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 6px 24px rgba(37,211,102,0.4)",
                width: "100%", maxWidth: 360, justifyContent: "center",
              }}>
                <MessageCircle size={20} />
                WhatsApp: (19) 99248-3372
              </a>
              <a href={`mailto:${EMAIL}`} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 14,
                padding: "16px 36px", fontSize: 15, fontWeight: 600, textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                width: "100%", maxWidth: 360, justifyContent: "center",
              }}>
                <Mail size={20} />
                {EMAIL}
              </a>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          background: "#001A12", padding: "24px",
          borderTop: "1px solid rgba(230,81,0,0.1)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>
            © {new Date().getFullYear()} Oranje · Holambra, SP
          </p>
        </footer>

      </div>
    </div>
  );
}
