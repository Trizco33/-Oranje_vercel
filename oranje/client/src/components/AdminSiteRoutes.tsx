import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle, Plus, Pencil, Trash2, Star, Eye, EyeOff } from "lucide-react";

// Manages which roteiros appear in the SiteHome showcase block (site_route_features table)

type RouteItem = {
  id: number;
  title: string;
  theme: string | null;
  duration: string | null;
  isPublic: boolean;
};

type SiteFeature = {
  id: number;
  routeId: number;
  label: string | null;
  subtitle: string | null;
  ctaText: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  route: RouteItem | null;
};

type FormState = {
  id?: number;
  routeId: string;
  label: string;
  subtitle: string;
  ctaText: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm = (): FormState => ({
  routeId: "",
  label: "",
  subtitle: "",
  ctaText: "",
  imageUrl: "",
  isFeatured: false,
  isActive: true,
  sortOrder: "0",
});

export function AdminSiteRoutes() {
  const utils = trpc.useUtils();

  const { data: allFeaturesRaw = [], isLoading } = trpc.routes.allSiteFeatures.useQuery();
  const { data: adminRoutesRaw = [] } = trpc.admin_cms.routes.list.useQuery();

  const saveFeature = trpc.routes.saveSiteFeature.useMutation({
    onSuccess: () => { utils.routes.allSiteFeatures.invalidate(); utils.routes.siteFeatures.invalidate(); },
  });
  const deleteFeature = trpc.routes.deleteSiteFeature.useMutation({
    onSuccess: () => { utils.routes.allSiteFeatures.invalidate(); utils.routes.siteFeatures.invalidate(); },
  });

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState("");

  const features = allFeaturesRaw as unknown as SiteFeature[];
  const adminRoutes = adminRoutesRaw as RouteItem[];

  function openCreate() {
    setForm(emptyForm());
    setError("");
    setFormOpen(true);
  }

  function openEdit(f: SiteFeature) {
    setForm({
      id: f.id,
      routeId: String(f.routeId),
      label: f.label || "",
      subtitle: f.subtitle || "",
      ctaText: f.ctaText || "",
      imageUrl: f.imageUrl || "",
      isFeatured: f.isFeatured,
      isActive: f.isActive,
      sortOrder: String(f.sortOrder),
    });
    setError("");
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.routeId) { setError("Selecione um roteiro."); return; }
    const routeIdNum = parseInt(form.routeId, 10);
    if (isNaN(routeIdNum)) { setError("Roteiro inválido."); return; }

    const route = adminRoutes.find((r) => r.id === routeIdNum);
    if (!route) { setError("Roteiro não encontrado."); return; }
    if (!route.isPublic) { setError("Este roteiro não está público — ative-o primeiro."); return; }

    await saveFeature.mutateAsync({
      ...(form.id ? { id: form.id } : {}),
      routeId: routeIdNum,
      label: form.label || undefined,
      subtitle: form.subtitle || undefined,
      ctaText: form.ctaText || undefined,
      imageUrl: form.imageUrl || undefined,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
    });
    setFormOpen(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Remover este passeio do bloco do site?")) return;
    await deleteFeature.mutateAsync({ id });
  }

  const hasFeatured = features.some((f) => f.isFeatured && f.isActive);

  return (
    <div style={{ padding: "24px 0", maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#00251A", margin: 0 }}>
            Passeios no Site
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.55)", margin: "4px 0 0" }}>
            Controle quais roteiros aparecem na seção "Escolha Seu Passeio" da home.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#E65100", color: "#fff",
            border: "none", borderRadius: 9, padding: "9px 18px",
            fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer",
          }}
        >
          <Plus size={15} /> Adicionar passeio
        </button>
      </div>

      {/* Info tip */}
      <div style={{
        background: "rgba(0,37,26,0.04)", borderRadius: 10, padding: "12px 16px",
        display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20,
        border: "1px solid rgba(0,37,26,0.08)",
      }}>
        <Star size={15} style={{ color: "#E65100", marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.6)", margin: 0, lineHeight: 1.55 }}>
          <strong>Destaque:</strong> apenas 1 passeio pode ser "featured" (hero). Os demais aparecem em grid secundário.
          Roteiros inativos ou sem isPublic=true ficam ocultos no site automaticamente.
        </p>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ color: "rgba(0,37,26,0.4)", fontSize: "0.9rem" }}>Carregando…</div>
      ) : features.length === 0 ? (
        <div style={{
          border: "2px dashed rgba(0,37,26,0.12)", borderRadius: 12, padding: "36px 24px",
          textAlign: "center", color: "rgba(0,37,26,0.4)", fontSize: "0.9rem",
        }}>
          Nenhum passeio configurado ainda. Clique em "Adicionar passeio".
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {features.map((f) => {
            const broken = !f.route;
            const inactive = f.route && !f.route.isPublic;
            return (
              <div key={f.id} style={{
                background: "#fff",
                border: broken || inactive ? "1.5px solid rgba(230,81,0,0.4)" : "1.5px solid rgba(0,37,26,0.1)",
                borderRadius: 12,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: f.isActive ? 1 : 0.6,
              }}>
                {/* Sort */}
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(0,37,26,0.35)", minWidth: 22, textAlign: "center" }}>
                  {f.sortOrder}
                </span>

                {/* Featured star */}
                <div style={{ flexShrink: 0, width: 24 }}>
                  {f.isFeatured && <Star size={16} fill="#E65100" color="#E65100" />}
                </div>

                {/* Route info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#00251A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.label || (f.route?.title ?? `Roteiro #${f.routeId}`)}
                    </span>
                    {broken && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FFF3E0", color: "#E65100", fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                        <AlertTriangle size={11} /> ROTEIRO NÃO ENCONTRADO
                      </span>
                    )}
                    {inactive && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FFF3E0", color: "#E65100", fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                        <AlertTriangle size={11} /> ROTEIRO NÃO PÚBLICO
                      </span>
                    )}
                    {!broken && !inactive && f.isActive && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(0,120,60,0.1)", color: "#00703C", fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                        <CheckCircle size={11} /> ATIVO
                      </span>
                    )}
                    {!f.isActive && (
                      <span style={{ background: "rgba(0,0,0,0.07)", color: "rgba(0,37,26,0.5)", fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                        INATIVO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(0,37,26,0.45)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {f.route?.theme && <span>🏷 {f.route.theme}</span>}
                    {f.route?.duration && <span>🕐 {f.route.duration}</span>}
                    {f.subtitle && <span style={{ fontStyle: "italic" }}>"{f.subtitle.slice(0, 50)}{f.subtitle.length > 50 ? "…" : ""}"</span>}
                    {f.ctaText && <span>CTA: "{f.ctaText}"</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(f)}
                    style={{ background: "rgba(0,37,26,0.06)", border: "none", borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "#00251A" }}
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    style={{ background: "rgba(230,81,0,0.07)", border: "none", borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "#E65100" }}
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal form */}
      {formOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,37,26,0.55)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "28px 32px",
            width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,37,26,0.25)",
          }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#00251A", margin: "0 0 20px" }}>
              {form.id ? "Editar Passeio" : "Adicionar Passeio ao Site"}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Route selector */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#00251A", marginBottom: 6 }}>
                  Roteiro <span style={{ color: "#E65100" }}>*</span>
                </label>
                <select
                  value={form.routeId}
                  onChange={(e) => setForm((f) => ({ ...f, routeId: e.target.value }))}
                  required
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 9,
                    border: "1.5px solid rgba(0,37,26,0.15)", fontSize: "0.9rem", color: "#00251A",
                    background: "#fff", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                  }}
                >
                  <option value="">Selecione um roteiro…</option>
                  {adminRoutes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} {!r.isPublic ? "(não público)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Label */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#00251A", marginBottom: 6 }}>
                  Título personalizado <span style={{ color: "rgba(0,37,26,0.35)", fontWeight: 400 }}>(opcional — usa título do roteiro se vazio)</span>
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="ex: Holambra para Família"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(0,37,26,0.15)", fontSize: "0.9rem", color: "#00251A", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#00251A", marginBottom: 6 }}>
                  Subtítulo <span style={{ color: "rgba(0,37,26,0.35)", fontWeight: 400 }}>(aparece no card do site)</span>
                </label>
                <textarea
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="ex: Flores, tulipas e clima holandês perfeitos para levar as crianças"
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(0,37,26,0.15)", fontSize: "0.9rem", color: "#00251A", fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              {/* CTA */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#00251A", marginBottom: 6 }}>
                  Texto do botão <span style={{ color: "rgba(0,37,26,0.35)", fontWeight: 400 }}>(padrão: "Fazer este passeio" / "Explorar passeio")</span>
                </label>
                <input
                  type="text"
                  value={form.ctaText}
                  onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
                  placeholder="ex: Iniciar este roteiro"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(0,37,26,0.15)", fontSize: "0.9rem", color: "#00251A", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#00251A", marginBottom: 6 }}>
                  URL da imagem de capa <span style={{ color: "rgba(0,37,26,0.35)", fontWeight: 400 }}>(aparece no card — não use links do Unsplash)</span>
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://exemplo.com/foto-do-passeio.jpg"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(0,37,26,0.15)", fontSize: "0.9rem", color: "#00251A", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
                {form.imageUrl && (
                  <div style={{ marginTop: 8, borderRadius: 8, overflow: "hidden", height: 80 }}>
                    <img src={form.imageUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>

              {/* Sort order */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#00251A", marginBottom: 6 }}>
                  Ordem (menor = primeiro)
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  min={0}
                  style={{ width: 100, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(0,37,26,0.15)", fontSize: "0.9rem", color: "#00251A", fontFamily: "inherit", outline: "none" }}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, color: "#00251A" }}>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: "#E65100" }}
                  />
                  <Star size={14} fill={form.isFeatured ? "#E65100" : "none"} color="#E65100" />
                  Destaque (hero card)
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, color: "#00251A" }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: "#E65100" }}
                  />
                  {form.isActive ? <Eye size={14} color="#00703C" /> : <EyeOff size={14} color="rgba(0,37,26,0.4)" />}
                  Visível no site
                </label>
              </div>

              {/* Warning: already has featured */}
              {form.isFeatured && hasFeatured && !form.id && (
                <div style={{ background: "#FFF3E0", borderRadius: 9, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <AlertTriangle size={14} style={{ color: "#E65100", marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: "0.8125rem", color: "#C43B00", margin: 0 }}>
                    Já existe um passeio em destaque. Se salvar, este substituirá o destaque anterior (o servidor usa o primeiro com isFeatured=true).
                  </p>
                </div>
              )}

              {error && (
                <div style={{ background: "#FFF3E0", borderRadius: 9, padding: "10px 14px", color: "#C43B00", fontSize: "0.8125rem" }}>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(0,37,26,0.15)", background: "transparent", fontSize: "0.875rem", fontWeight: 600, color: "#00251A", cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saveFeature.isPending}
                  style={{ padding: "10px 24px", borderRadius: 9, border: "none", background: "#E65100", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", opacity: saveFeature.isPending ? 0.7 : 1 }}
                >
                  {saveFeature.isPending ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
