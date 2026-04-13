import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Info, CheckCircle, Clock, ExternalLink, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";

/* ── As 7 páginas editoriais com suporte CMS ─────────────────────────────── */
const EDITORIAL_PAGES = [
  {
    slug: "o-que-fazer-em-holambra",
    label: "O que Fazer em Holambra",
    url: "/o-que-fazer-em-holambra",
    priority: "0.95",
  },
  {
    slug: "roteiro-1-dia-em-holambra",
    label: "Roteiro de 1 Dia em Holambra",
    url: "/roteiro-1-dia-em-holambra",
    priority: "0.95",
  },
  {
    slug: "holambra-bate-e-volta",
    label: "Holambra Bate e Volta",
    url: "/holambra-bate-e-volta",
    priority: "0.95",
  },
  {
    slug: "melhores-restaurantes-de-holambra",
    label: "Melhores Restaurantes em Holambra",
    url: "/melhores-restaurantes-de-holambra",
    priority: "0.90",
  },
  {
    slug: "melhores-cafes-de-holambra",
    label: "Melhores Cafés em Holambra",
    url: "/melhores-cafes-de-holambra",
    priority: "0.90",
  },
  {
    slug: "bares-e-drinks-em-holambra",
    label: "Bares & Drinks em Holambra",
    url: "/bares-e-drinks-em-holambra",
    priority: "0.90",
  },
  {
    slug: "onde-tirar-fotos-em-holambra",
    label: "Onde Tirar Fotos em Holambra",
    url: "/onde-tirar-fotos-em-holambra",
    priority: "0.90",
  },
];

interface CMSPagesProps {
  onNavigate?: (tab: string) => void;
}

type FormData = {
  id?: number;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  coverImageUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  published: boolean;
};

function emptyForm(slug = "", title = ""): FormData {
  return { slug, title, subtitle: "", content: "", coverImageUrl: "", metaTitle: "", metaDescription: "", metaKeywords: "", published: false };
}

export default function CMSPages({ onNavigate }: CMSPagesProps = {}) {
  const [editing, setEditing] = useState<FormData | null>(null);
  const [htmlPreview, setHtmlPreview] = useState(false);

  const pagesQuery = trpc.cms.getPages.useQuery();
  const pages: any[] = pagesQuery.data ?? [];

  const savePageMutation = trpc.cms.savePage.useMutation({
    onSuccess: () => {
      toast.success(editing?.id ? "Página atualizada!" : "Página criada!");
      setEditing(null);
      pagesQuery.refetch();
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  /* Abre o editor para uma página editorial — pré-preenche com dados do banco se existir */
  function openEditorial(meta: typeof EDITORIAL_PAGES[0]) {
    const existing = pages.find((p) => p.slug === meta.slug);
    if (existing) {
      setEditing({
        id: existing.id,
        slug: existing.slug,
        title: existing.title ?? meta.label,
        subtitle: existing.subtitle ?? "",
        content: existing.content ?? "",
        coverImageUrl: existing.coverImageUrl ?? "",
        metaTitle: existing.metaTitle ?? "",
        metaDescription: existing.metaDescription ?? "",
        metaKeywords: existing.metaKeywords ?? "",
        published: existing.published ?? false,
      });
    } else {
      setEditing(emptyForm(meta.slug, meta.label));
    }
    setHtmlPreview(false);
  }

  /* Abre o editor para uma página existente qualquer */
  function openExisting(page: any) {
    setEditing({
      id: page.id,
      slug: page.slug,
      title: page.title ?? "",
      subtitle: page.subtitle ?? "",
      content: page.content ?? "",
      coverImageUrl: page.coverImageUrl ?? "",
      metaTitle: page.metaTitle ?? "",
      metaDescription: page.metaDescription ?? "",
      metaKeywords: page.metaKeywords ?? "",
      published: page.published ?? false,
    });
    setHtmlPreview(false);
  }

  function handleSave(publish?: boolean) {
    if (!editing) return;
    if (!editing.title || !editing.slug || !editing.content) {
      toast.error("Preencha título, slug e conteúdo");
      return;
    }
    const published = publish !== undefined ? publish : editing.published;
    savePageMutation.mutate({ ...editing, published });
  }

  const isNew = editing && !editing.id;
  /* Pages not in the editorial list (free pages) */
  const freePages = pages.filter((p) => !EDITORIAL_PAGES.find((e) => e.slug === p.slug));

  /* ── EDITOR ─────────────────────────────────────────────────────────────── */
  if (editing) {
    const editorialMeta = EDITORIAL_PAGES.find((e) => e.slug === editing.slug);
    return (
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <span className="text-gray-300">•</span>
          <h2 className="text-xl font-bold text-[#004D40]">
            {isNew ? "Nova Página" : (editing.title || editing.slug)}
          </h2>
          {!isNew && (
            <a
              href={`/${editing.slug}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-[#E65100]"
            >
              <ExternalLink size={13} /> Ver no site
            </a>
          )}
        </div>

        {/* Aviso sobre substituição */}
        {editorialMeta && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⚠️ Quando publicada, esta versão substitui completamente o conteúdo padrão (JSX) da página. Ao despublicar, o conteúdo padrão volta automaticamente.
          </div>
        )}

        <div className="space-y-5">
          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">URL da página (slug)</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
              <span className="px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-gray-400 text-sm select-none">
                oranjeapp.com.br/
              </span>
              <input
                value={editing.slug}
                onChange={(e) =>
                  !editing.id &&
                  setEditing((p) =>
                    p ? { ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") } : p
                  )
                }
                readOnly={!!editing.id}
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
                placeholder="minha-pagina"
              />
            </div>
            {editing.id && (
              <p className="text-xs text-gray-400 mt-1">Slug bloqueado após criação para preservar o SEO.</p>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Título da página</label>
            <Input
              value={editing.title}
              onChange={(e) => setEditing((p) => p ? { ...p, title: e.target.value } : p)}
              placeholder="Ex: O que Fazer em Holambra — Guia Completo"
            />
          </div>

          {/* Subtítulo */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Subtítulo (opcional)</label>
            <Input
              value={editing.subtitle}
              onChange={(e) => setEditing((p) => p ? { ...p, subtitle: e.target.value } : p)}
              placeholder="Ex: Parques de flores, gastronomia holandesa e muito mais"
            />
          </div>

          {/* Imagem de capa */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Imagem de capa</label>
            <ImageUpload
              value={editing.coverImageUrl}
              onUpload={(url) => setEditing((p) => p ? { ...p, coverImageUrl: url } : p)}
              label="Enviar imagem de capa"
              showUrlInput={true}
            />
          </div>

          {/* Conteúdo HTML */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Conteúdo (HTML)</label>
              <button
                onClick={() => setHtmlPreview((p) => !p)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                {htmlPreview ? <><EyeOff size={13} /> Editar HTML</> : <><Eye size={13} /> Preview</>}
              </button>
            </div>
            {htmlPreview ? (
              <div
                className="min-h-[300px] border border-gray-200 rounded-lg p-5 text-sm leading-relaxed text-gray-700 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: editing.content }}
              />
            ) : (
              <Textarea
                value={editing.content}
                onChange={(e) => setEditing((p) => p ? { ...p, content: e.target.value } : p)}
                placeholder={`<p>Texto em HTML...</p>\n<h2>Título de seção</h2>\n<p>Parágrafo...</p>\n<img src="URL" alt="..." style="width:100%;border-radius:12px;" />\n<a href="/app/lugar/ID">Link para lugar</a>`}
                className="min-h-[320px] font-mono text-sm"
              />
            )}
            <p className="text-xs text-gray-400 mt-1.5">
              Tags: <code className="bg-gray-100 px-1 rounded">&lt;p&gt;</code> <code className="bg-gray-100 px-1 rounded">&lt;h2&gt;</code> <code className="bg-gray-100 px-1 rounded">&lt;img&gt;</code> <code className="bg-gray-100 px-1 rounded">&lt;a&gt;</code> <code className="bg-gray-100 px-1 rounded">&lt;ul&gt;/&lt;li&gt;</code> <code className="bg-gray-100 px-1 rounded">&lt;strong&gt;</code>
            </p>
          </div>

          {/* SEO */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-4">
            <p className="text-sm font-semibold text-gray-700">SEO (opcional)</p>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Meta Título</label>
              <Input
                value={editing.metaTitle}
                onChange={(e) => setEditing((p) => p ? { ...p, metaTitle: e.target.value } : p)}
                placeholder={editing.title || "Usa o título da página por padrão"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Meta Descrição</label>
              <Textarea
                value={editing.metaDescription}
                onChange={(e) => setEditing((p) => p ? { ...p, metaDescription: e.target.value } : p)}
                placeholder="Até 160 caracteres. Aparece nos resultados do Google."
                className="min-h-[80px]"
              />
              <p className="text-xs text-gray-400 mt-1">{editing.metaDescription.length}/160</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Meta Keywords</label>
              <Input
                value={editing.metaKeywords}
                onChange={(e) => setEditing((p) => p ? { ...p, metaKeywords: e.target.value } : p)}
                placeholder="holambra, flores, turismo"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 flex-wrap pt-2">
            <Button
              onClick={() => handleSave(false)}
              disabled={savePageMutation.isPending}
              variant="outline"
            >
              {savePageMutation.isPending ? "Salvando..." : "Salvar rascunho"}
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={savePageMutation.isPending}
              className="bg-[#E65100] hover:bg-[#D84500]"
            >
              {savePageMutation.isPending ? "Publicando..." : "✓ Publicar no site"}
            </Button>
            {editing.id && editing.published && (
              <Button
                onClick={() => handleSave(false)}
                disabled={savePageMutation.isPending}
                variant="outline"
                className="text-red-700 border-red-200 hover:bg-red-50"
              >
                Despublicar
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── LISTA ───────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#004D40]">Páginas Editoriais</h2>
        <p className="text-gray-600 mt-1">
          Estas 7 páginas estão no sitemap com prioridade máxima. Quando publicadas aqui, substituem o conteúdo padrão do site. Enquanto não publicadas, o conteúdo padrão (JSX) é exibido — nada quebra.
        </p>
      </div>

      {/* As 7 páginas editoriais */}
      <Card className="border-orange-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#004D40] flex items-center gap-2">
            📄 7 Páginas com Suporte CMS
          </CardTitle>
          <CardDescription>
            Clique em "Editar" para criar ou modificar o conteúdo no CMS. URLs são fixas para preservar o SEO.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {EDITORIAL_PAGES.map((meta) => {
            const existing = pages.find((p) => p.slug === meta.slug);
            const published = existing?.published ?? false;
            const hasCMS = !!existing;
            return (
              <div
                key={meta.slug}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#004D40] truncate">{meta.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{meta.url}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {hasCMS ? (
                    published ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 rounded-full px-2.5 py-1">
                        <CheckCircle size={10} /> Publicada
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full px-2.5 py-1">
                        <Clock size={10} /> Rascunho
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-gray-400">JSX padrão</span>
                  )}
                  <a
                    href={meta.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-[#E65100]"
                    title="Ver no site"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <Button
                    size="sm"
                    onClick={() => openEditorial(meta)}
                    className={hasCMS ? "bg-[#004D40] hover:bg-[#003328]" : "bg-[#E65100] hover:bg-[#D84500]"}
                  >
                    {hasCMS ? <><Edit size={13} /> Editar</> : <><Plus size={13} /> Criar</>}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Outras páginas (fora da lista editorial) */}
      {freePages.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-[#004D40]">Outras Páginas no CMS</h3>
          <div className="space-y-2">
            {freePages.map((page: any) => (
              <Card key={page.id}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-[#004D40]">{page.title}</h4>
                      <p className="text-sm text-gray-500 font-mono">/{page.slug}</p>
                      <span
                        className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${
                          page.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {page.published ? "Publicada" : "Rascunho"}
                      </span>
                    </div>
                    <Button onClick={() => openExisting(page)} size="sm" variant="outline" className="flex items-center gap-1 shrink-0">
                      <Edit size={14} /> Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Nova página livre */}
      <div className="flex justify-end">
        <Button
          onClick={() => setEditing(emptyForm())}
          variant="outline"
          className="flex items-center gap-2 text-sm"
        >
          <Plus size={15} /> Nova página personalizada
        </Button>
      </div>

      {/* Referência de cobertura */}
      <Card className="border-blue-100 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-blue-800">
            <Info size={17} /> Separação Site × App — Regras de Indexação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            <div>
              <p className="font-semibold text-green-700 mb-2">✅ Indexável — Site (SEO)</p>
              <ul className="space-y-1 text-gray-700">
                <li><code className="text-xs bg-gray-100 px-1 rounded">/</code> — Home</li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/o-que-fazer-em-holambra</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/roteiro-1-dia-em-holambra</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/holambra-bate-e-volta</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/melhores-restaurantes-*</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/melhores-cafes-*</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/bares-e-drinks-*</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/onde-tirar-fotos-*</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/blog/:slug</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/lugar/:id</code> (lugares)</li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/receptivo/:slug</code></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-red-600 mb-2">🚫 Bloqueado (robots.txt)</p>
              <ul className="space-y-1 text-gray-700">
                <li><code className="text-xs bg-gray-100 px-1 rounded">/admin</code>, <code className="text-xs bg-gray-100 px-1 rounded">/adm</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/api/*</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/login</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/perfil</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/mapa</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/explorar</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/eventos</code> (lista)</li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/roteiros</code> (lista)</li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/favoritos</code></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/notificacoes</code></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-600 mb-2">⚙️ No sitemap (app)</p>
              <ul className="space-y-1 text-gray-700">
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/lugar/:id</code> — prioridade 0.7</li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/evento/:id</code> — prioridade 0.6</li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/roteiro/:id</code> — prioridade 0.6</li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">/app/receptivo/:slug</code> — prioridade 0.8</li>
              </ul>
              <p className="text-xs text-gray-400 mt-3">Estas são páginas de conteúdo com dados reais — faz sentido indexar.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
