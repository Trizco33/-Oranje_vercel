import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText, Eye, EyeOff, Upload, Image as ImageIcon,
  ArrowLeft, Globe, CheckCircle, Clock, Plus, Trash2,
} from "lucide-react";

/* ── Tipos ──────────────────────────────────────────────────────────────── */
interface PageForm {
  id?: number;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  coverImageUrl: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
}

function emptyForm(): PageForm {
  return { slug: "", title: "", subtitle: "", content: "", coverImageUrl: "", metaTitle: "", metaDescription: "", published: false };
}

/* ── Compressão de imagem ────────────────────────────────────────────────── */
function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_W = 1200, MAX_H = 800;
      let w = img.width, h = img.height;
      if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
      if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      let q = 0.8, dataUrl = canvas.toDataURL("image/jpeg", q);
      while (dataUrl.length > 80000 && q > 0.3) {
        q = Math.round((q - 0.07) * 100) / 100;
        dataUrl = canvas.toDataURL("image/jpeg", q);
      }
      resolve(dataUrl);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Erro ao carregar imagem")); };
    img.src = objectUrl;
  });
}

/* ── Componente principal ────────────────────────────────────────────────── */
export function AdminEditorialPages() {
  const [editing, setEditing] = useState<PageForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [insertingImg, setInsertingImg] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const insertInputRef = useRef<HTMLInputElement>(null);

  const { data: pages = [], refetch } = trpc.cms.getPages.useQuery();
  const saveMutation = trpc.cms.savePage.useMutation({
    onSuccess: () => { toast.success("Página salva!"); setSaving(false); setEditing(null); refetch(); },
    onError: (e) => { toast.error(e.message); setSaving(false); },
  });
  const uploadMutation = trpc.upload.uploadImage.useMutation({
    onError: (e) => { toast.error("Erro no upload: " + e.message); setUploading(false); setInsertingImg(false); },
  });

  /* Upload de capa */
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    e.target.value = "";
    try {
      const base64 = await compressImageToBase64(file);
      const result = await uploadMutation.mutateAsync({ file: base64.split(",")[1], fileName: file.name, mimeType: "image/jpeg" });
      setEditing(p => p ? { ...p, coverImageUrl: result.url ?? "" } : p);
      toast.success("Capa enviada!");
    } catch { /* handled */ } finally { setUploading(false); }
  }

  /* Inserir imagem no corpo na posição do cursor */
  async function handleInsertImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setInsertingImg(true);
    e.target.value = "";
    try {
      const base64 = await compressImageToBase64(file);
      const result = await uploadMutation.mutateAsync({ file: base64.split(",")[1], fileName: file.name, mimeType: "image/jpeg" });
      const tag = `\n<img src="${result.url}" alt="" style="width:100%;border-radius:12px;margin:16px 0;max-height:400px;object-fit:cover;" loading="lazy" />\n`;
      const ta = contentRef.current;
      if (ta) {
        const start = ta.selectionStart ?? ta.value.length;
        const newVal = ta.value.slice(0, start) + tag + ta.value.slice(start);
        setEditing(p => p ? { ...p, content: newVal } : p);
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + tag.length, start + tag.length); }, 50);
      } else {
        setEditing(p => p ? { ...p, content: (p.content || "") + tag } : p);
      }
      toast.success("Imagem inserida!");
    } catch { /* handled */ } finally { setInsertingImg(false); }
  }

  function handleSave(publish: boolean) {
    if (!editing) return;
    if (!editing.slug.trim()) { toast.error("O slug (URL) é obrigatório."); return; }
    if (!editing.title.trim()) { toast.error("O título é obrigatório."); return; }
    if (!editing.content.trim()) { toast.error("O conteúdo não pode estar vazio."); return; }
    setSaving(true);
    saveMutation.mutate({ ...editing, published: publish });
  }

  /* ── Lista de páginas existentes ─────────────────────────────────────── */
  if (!editing) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#00251A", margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
              Páginas Editoriais
            </h2>
            <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
              Gerencie as páginas existentes no CMS. Quando publicadas, substituem o conteúdo padrão do site.
            </p>
          </div>
          <button
            onClick={() => setEditing(emptyForm())}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#00251A", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Montserrat', sans-serif", flexShrink: 0 }}
          >
            <Plus size={15} /> Nova Página
          </button>
        </div>

        {pages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "#f8f8f8", borderRadius: 12, color: "#888" }}>
            <FileText size={32} style={{ color: "#ccc", marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 15 }}>Nenhuma página criada ainda.</p>
            <p style={{ margin: "4px 0 0", fontSize: 13 }}>Clique em "Nova Página" para criar a primeira.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(pages as any[]).map((page) => (
              <div
                key={page.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px", background: "#fff",
                  border: "1px solid", borderColor: page.published ? "rgba(0,37,26,0.2)" : "rgba(0,0,0,0.08)",
                  borderRadius: 12, gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                  <FileText size={16} style={{ color: "#E65100", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#00251A", fontSize: 14, fontFamily: "'Montserrat', sans-serif" }}>
                      {page.title || page.slug}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>/{page.slug}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {page.published ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#2e7d32", background: "#e8f5e9", borderRadius: 20, padding: "3px 10px" }}>
                      <CheckCircle size={11} /> Publicada
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#e65100", background: "#fff3e0", borderRadius: 20, padding: "3px 10px" }}>
                      <Clock size={11} /> Rascunho
                    </span>
                  )}
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", color: "#888", fontSize: 12 }}
                    title="Ver no site"
                  >
                    <Globe size={14} />
                  </a>
                  <button
                    onClick={() => setEditing({
                      id: page.id,
                      slug: page.slug,
                      title: page.title ?? "",
                      subtitle: page.subtitle ?? "",
                      content: page.content ?? "",
                      coverImageUrl: page.coverImageUrl ?? "",
                      metaTitle: page.metaTitle ?? "",
                      metaDescription: page.metaDescription ?? "",
                      published: page.published ?? false,
                    })}
                    style={{ background: "#00251A", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Editor ──────────────────────────────────────────────────────────── */
  const isNew = !editing.id;

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setEditing(null)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#666", fontSize: 14 }}
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <span style={{ color: "#ccc" }}>•</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#00251A", margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
          {isNew ? "Nova Página" : editing.title || editing.slug}
        </h2>
        {!isNew && (
          <a href={`/${editing.slug}`} target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#888", textDecoration: "none", marginLeft: "auto" }}>
            <Globe size={13} /> Ver no site
          </a>
        )}
      </div>

      {/* Aviso */}
      <div style={{ background: "#fff8f0", border: "1px solid rgba(230,81,0,0.2)", borderRadius: 10, padding: "11px 16px", marginBottom: 24, fontSize: 13, color: "#a05000" }}>
        ⚠️ Quando publicada, esta versão do CMS substitui o conteúdo padrão da página. Ao despublicar, o conteúdo padrão volta automaticamente.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Slug */}
        <div>
          <label style={labelStyle}>URL da página (slug)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
            <span style={{ padding: "10px 10px 10px 14px", color: "#999", fontSize: 14, background: "#f5f5f5", borderRight: "1px solid #ddd", userSelect: "none" }}>
              oranjeapp.com.br/
            </span>
            <input
              value={editing.slug}
              onChange={e => setEditing(p => p ? { ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") } : p)}
              style={{ flex: 1, padding: "10px 14px", border: "none", outline: "none", fontSize: 14, color: "#222", background: "transparent" }}
              placeholder="minha-pagina"
              readOnly={!isNew}
            />
          </div>
          {!isNew && <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>O slug não pode ser alterado após a criação para preservar o SEO.</div>}
        </div>

        {/* Título */}
        <div>
          <label style={labelStyle}>Título da página</label>
          <input value={editing.title} onChange={e => setEditing(p => p ? { ...p, title: e.target.value } : p)} style={inputStyle} placeholder="Ex: O que Fazer em Holambra — Guia Completo" />
        </div>

        {/* Subtítulo */}
        <div>
          <label style={labelStyle}>Subtítulo (opcional)</label>
          <input value={editing.subtitle} onChange={e => setEditing(p => p ? { ...p, subtitle: e.target.value } : p)} style={inputStyle} placeholder="Ex: Parques de flores, gastronomia holandesa e muito mais" />
        </div>

        {/* Imagem de capa */}
        <div>
          <label style={labelStyle}>Imagem de capa</label>
          {editing.coverImageUrl && (
            <div style={{ marginBottom: 10, position: "relative" }}>
              <img src={editing.coverImageUrl} alt="Capa"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, display: "block" }} />
              <button onClick={() => setEditing(p => p ? { ...p, coverImageUrl: "" } : p)}
                style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                Remover
              </button>
            </div>
          )}
          <input type="text" value={editing.coverImageUrl} onChange={e => setEditing(p => p ? { ...p, coverImageUrl: e.target.value } : p)}
            style={{ ...inputStyle, marginBottom: 8 }} placeholder="Cole uma URL de imagem, ou use o botão abaixo" />
          <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
          <button onClick={() => coverInputRef.current?.click()} disabled={uploading} style={btnSecondaryStyle}>
            <Upload size={14} /> {uploading ? "Enviando..." : "Enviar imagem de capa"}
          </button>
        </div>

        {/* Conteúdo HTML */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Conteúdo (HTML)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input ref={insertInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleInsertImage} />
              <button onClick={() => insertInputRef.current?.click()} disabled={insertingImg} style={btnSecondaryStyle}>
                <ImageIcon size={13} /> {insertingImg ? "Enviando..." : "Inserir imagem"}
              </button>
              <button onClick={() => setPreview(p => !p)} style={btnSecondaryStyle}>
                {preview ? <><EyeOff size={13} /> Editar</> : <><Eye size={13} /> Preview</>}
              </button>
            </div>
          </div>

          {preview ? (
            <div style={{ minHeight: 400, padding: "20px 24px", background: "#fafaf8", border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 15, lineHeight: 1.7, color: "#333" }}
              dangerouslySetInnerHTML={{ __html: editing.content }} />
          ) : (
            <textarea ref={contentRef} value={editing.content}
              onChange={e => setEditing(p => p ? { ...p, content: e.target.value } : p)}
              rows={22}
              style={{ width: "100%", padding: "14px 16px", background: "#1e1e1e", color: "#d4d4d4", border: "1px solid #333", borderRadius: 10, fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 13, lineHeight: 1.6, resize: "vertical", boxSizing: "border-box" }}
              placeholder={`<p>Texto da página em HTML...</p>\n<h2>Título de seção</h2>\n<p>Parágrafo...</p>\n<img src="URL" alt="..." style="width:100%;border-radius:12px;margin:16px 0;" />\n<a href="/app/lugar/ID">Link para um lugar</a>`}
            />
          )}
          <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
            Tags suportadas: <code style={{ background: "#f0f0f0", padding: "1px 5px", borderRadius: 4 }}>&lt;p&gt;</code> <code style={{ background: "#f0f0f0", padding: "1px 5px", borderRadius: 4 }}>&lt;h2&gt;</code> <code style={{ background: "#f0f0f0", padding: "1px 5px", borderRadius: 4 }}>&lt;img&gt;</code> <code style={{ background: "#f0f0f0", padding: "1px 5px", borderRadius: 4 }}>&lt;a&gt;</code> <code style={{ background: "#f0f0f0", padding: "1px 5px", borderRadius: 4 }}>&lt;ul&gt;/&lt;li&gt;</code> <code style={{ background: "#f0f0f0", padding: "1px 5px", borderRadius: 4 }}>&lt;strong&gt;</code>
          </div>
        </div>

        {/* SEO */}
        <div style={{ background: "#f8f8f8", borderRadius: 10, padding: 16 }}>
          <div style={{ fontWeight: 600, color: "#00251A", fontSize: 13, marginBottom: 14, fontFamily: "'Montserrat', sans-serif" }}>SEO (opcional)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Meta título</label>
              <input value={editing.metaTitle} onChange={e => setEditing(p => p ? { ...p, metaTitle: e.target.value } : p)} style={inputStyle} placeholder={editing.title || "Usa o título da página por padrão"} />
            </div>
            <div>
              <label style={labelStyle}>Meta descrição</label>
              <textarea value={editing.metaDescription} onChange={e => setEditing(p => p ? { ...p, metaDescription: e.target.value } : p)} rows={2}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} placeholder="Até 160 caracteres. Aparece nos resultados do Google." />
              <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>{editing.metaDescription.length}/160 caracteres</div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 4 }}>
          <button onClick={() => handleSave(false)} disabled={saving}
            style={{ ...btnSecondaryStyle, padding: "10px 20px", fontSize: 14 }}>
            {saving ? "Salvando..." : "Salvar rascunho"}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            style={{ background: "#E65100", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Montserrat', sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Publicando..." : "✓ Publicar no site"}
          </button>
          {editing.id && editing.published && (
            <button onClick={() => { setSaving(true); saveMutation.mutate({ ...editing, published: false }); }} disabled={saving}
              style={{ ...btnSecondaryStyle, color: "#c62828", borderColor: "#c62828", padding: "10px 18px", fontSize: 14 }}>
              Despublicar
            </button>
          )}
          {editing.id && (
            confirmDelete === editing.id ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                <span style={{ fontSize: 13, color: "#c62828" }}>Confirmar exclusão?</span>
                <button onClick={() => setConfirmDelete(null)} style={{ ...btnSecondaryStyle, padding: "8px 14px" }}>Não</button>
                <button
                  onClick={async () => {
                    try {
                      await saveMutation.mutateAsync({ ...editing, content: "", published: false });
                      setEditing(null);
                      setConfirmDelete(null);
                      toast.success("Página removida.");
                    } catch (e: any) { toast.error(e.message); }
                  }}
                  style={{ background: "#c62828", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Sim, excluir
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(editing.id!)} style={{ ...btnSecondaryStyle, color: "#c62828", marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Trash2 size={13} /> Excluir
              </button>
            )
          )}
        </div>

      </div>
    </div>
  );
}

/* ── Estilos reutilizáveis ───────────────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6, fontFamily: "'Montserrat', sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8,
  fontSize: 14, color: "#222", background: "#fff", boxSizing: "border-box", fontFamily: "inherit", outline: "none",
};

const btnSecondaryStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "#444",
  border: "1px solid #ddd", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 500,
  cursor: "pointer", fontFamily: "'Montserrat', sans-serif",
};
