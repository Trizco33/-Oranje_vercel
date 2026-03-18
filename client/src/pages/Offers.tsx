import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { useVouchersList, usePartnersList, useAdsList } from "@/hooks/useMockData";
import { ExternalLink, QrCode, Sparkles, Tag, Ticket } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DSBadge } from "@/components/ds";

export default function Offers() {
  const { data: vouchers } = useVouchersList();
  const { data: partners } = usePartnersList({ status: "active" });
  const { data: ads } = useAdsList({ placement: "offers_page" });
  const [openVoucher, setOpenVoucher] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Ofertas" />

      <div className="px-4 pt-4">
        {/* Ads Banner */}
        {ads && ads.length > 0 && (
          <div className="mb-5">
            {ads.slice(0, 1).map((ad: any) => (
              <a key={ad.id} href={ad.linkUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="block">
                <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(230,81,0,0.15), rgba(230,81,0,0.05))", border: "1px solid rgba(230,81,0,0.3)" }}>
                  <div className="absolute top-2 right-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(230,81,0,0.2)", color: "var(--ds-color-text-secondary)" }}>PATROCINADO</span>
                  </div>
                  <Sparkles size={28} style={{ color: "var(--ds-color-accent)" }} className="mb-2" />
                  <p className="text-base font-bold" style={{ color: "var(--ds-color-text-primary)" }}>{ad.title}</p>
                  {ad.description && <p className="text-xs mt-1" style={{ color: "var(--ds-color-text-secondary)" }}>{ad.description}</p>}
                  {ad.linkUrl && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs" style={{ color: "var(--ds-color-accent)" }}>Saiba mais</span>
                      <ExternalLink size={11} style={{ color: "var(--ds-color-accent)" }} />
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Vouchers */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Ticket size={18} style={{ color: "var(--ds-color-accent)" }} />
            <h2 className="text-base font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>Vouchers Exclusivos</h2>
          </div>

          {vouchers?.length === 0 ? (
            <div className="p-6 text-center rounded-2xl" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}>
              <p className="text-3xl mb-2">🎫️</p>
              <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>Nenhum voucher disponível no momento.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {vouchers?.map((v: any) => (
                <div key={v.id} className="p-4 pl-6 rounded-2xl" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)", borderLeft: "4px solid var(--ds-color-accent)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>{v.title}</p>
                      {v.description && <p className="text-xs mt-1" style={{ color: "var(--ds-color-text-secondary)" }}>{v.description}</p>}
                      {v.discount && <p className="text-xl font-bold mt-2" style={{ color: "var(--ds-color-accent)" }}>{v.discount}</p>}
                      {v.placeId && (
                        <Link to={`/app/lugar/${v.placeId}`}>
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--ds-color-accent)" }}>📍 Ver estabelecimento</p>
                        </Link>
                      )}
                    </div>
                    <button
                      onClick={() => setOpenVoucher(openVoucher === v.id ? null : v.id)}
                      className="px-3 py-2 rounded-xl text-xs flex items-center gap-1 flex-shrink-0 font-semibold"
                      style={{ background: "var(--ds-color-accent)", color: "#fff" }}
                    >
                      <QrCode size={13} />
                      {openVoucher === v.id ? "Fechar" : "Usar"}
                    </button>
                  </div>

                  {openVoucher === v.id && v.code && (
                    <div className="mt-3 p-4 rounded-xl text-center" style={{ background: "rgba(230,81,0,0.1)", border: "1px solid rgba(230,81,0,0.3)" }}>
                      <p className="text-xs mb-2" style={{ color: "var(--ds-color-text-secondary)" }}>Apresente este código ao estabelecimento</p>
                      <p className="text-2xl font-bold tracking-widest" style={{ color: "var(--ds-color-accent)" }}>{v.code}</p>
                      <p className="text-xs mt-2" style={{ color: "var(--ds-color-text-secondary)" }}>Válido apenas uma vez por visita</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Partners */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={18} style={{ color: "var(--ds-color-accent)" }} />
            <h2 className="text-base font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>Parceiros ORANJE</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
            Estabelecimentos verificados e recomendados pela curadoria ORANJE.
          </p>

          {partners?.length === 0 ? (
            <div className="p-6 text-center rounded-2xl" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}>
              <p className="text-3xl mb-2">🤝</p>
              <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>Nenhum parceiro ativo no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {partners?.map((partner: any) => {
                const planColors: Record<string, string> = {
                  Essencial: "#5B8DD9",
                  Destaque: "#E65100",
                  Premium: "#D95B8D",
                };
                const color = planColors[partner.plan] ?? "var(--ds-color-accent)";
                return (
                  <div key={partner.id} className="p-4 rounded-2xl" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                        <Tag size={16} style={{ color }} />
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}15`, color }}>{partner.plan}</span>
                    </div>
                    <p className="text-sm font-semibold line-clamp-2" style={{ color: "var(--ds-color-text-primary)" }}>{partner.name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Become Partner CTA */}
        <div className="rounded-2xl p-5 mb-6 text-center" style={{ background: "linear-gradient(135deg, rgba(230,81,0,0.12), rgba(230,81,0,0.04))", border: "1px solid rgba(230,81,0,0.25)" }}>
          <Sparkles size={28} style={{ color: "var(--ds-color-accent)" }} className="mx-auto mb-3" />
          <h3 className="text-base font-bold mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Seja um Parceiro ORANJE</h3>
          <p className="text-xs mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
            Aumente sua visibilidade em Holambra. Planos a partir de R$49/mês com destaque no app, vouchers exclusivos e selo de parceiro verificado.
          </p>
          <a
            href="https://wa.me/5519999999999?text=Quero%20ser%20parceiro%20ORANJE"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            style={{ background: "var(--ds-color-accent)", color: "#fff" }}
          >
            <Tag size={15} />
            Quero ser parceiro
          </a>
        </div>
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
