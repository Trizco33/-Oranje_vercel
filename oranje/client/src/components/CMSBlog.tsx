import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Plus, Download, RotateCcw, History, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";

export default function CMSBlog() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const [backupArticleId, setBackupArticleId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    category: "Geral",
    published: false,
  });

  // Queries — use listCms which accepts both JWT and CMS session cookie auth
  const articlesQuery = trpc.articles.listCms.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  });

  // Backups query — only active when viewing backups
  const backupsQuery = trpc.articles.listBackups.useQuery(
    backupArticleId ? { articleId: backupArticleId } : undefined,
    { enabled: showBackups }
  );

  // Mutations
  const createMutation = trpc.articles.create.useMutation({
    onSuccess: () => {
      toast.success("Artigo criado com backup automático!");
      resetForm();
      articlesQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const updateMutation = trpc.articles.update.useMutation({
    onSuccess: () => {
      toast.success("Artigo atualizado com backup automático!");
      resetForm();
      articlesQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const deleteMutation = trpc.articles.delete.useMutation({
    onSuccess: () => {
      toast.success("Artigo deletado!");
      articlesQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const restoreMutation = trpc.articles.restoreFromBackup.useMutation({
    onSuccess: () => {
      toast.success("Artigo restaurado do backup!");
      articlesQuery.refetch();
      backupsQuery.refetch();
      setShowBackups(false);
    },
    onError: (error) => {
      toast.error("Erro ao restaurar: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      id: undefined,
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImageUrl: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      category: "Geral",
      published: false,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleEdit = (article: any) => {
    setFormData({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      content: article.content,
      coverImageUrl: article.coverImageUrl || "",
      seoTitle: article.seoTitle || "",
      seoDescription: article.seoDescription || "",
      seoKeywords: article.seoKeywords || "",
      category: article.category || "Geral",
      published: article.published,
    });
    setEditingId(article.id);
    setIsCreating(false);
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      toast.error("Preencha título e conteúdo");
      return;
    }

    const slug = formData.slug || generateSlug(formData.title);

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        title: formData.title,
        slug,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImageUrl: formData.coverImageUrl,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoKeywords: formData.seoKeywords,
        category: formData.category,
        published: formData.published,
      });
    } else {
      createMutation.mutate({
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImageUrl: formData.coverImageUrl,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoKeywords: formData.seoKeywords,
        category: formData.category,
        published: formData.published,
      });
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este artigo?")) {
      deleteMutation.mutate({ id });
    }
  };

  const utils = trpc.useUtils();

  // ─── Export handlers ──────────────────────────────────────────────────────
  const handleExportJson = async () => {
    try {
      const result = await utils.articles.exportJson.fetch();
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `artigos-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exportados ${result.count} artigos em JSON`);
    } catch (error: any) {
      toast.error("Erro ao exportar JSON: " + (error.message || "Erro desconhecido"));
    }
  };

  const handleExportCsv = async () => {
    try {
      const result = await utils.articles.exportCsv.fetch();
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `artigos-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exportados ${result.count} artigos em CSV`);
    } catch (error: any) {
      toast.error("Erro ao exportar CSV: " + (error.message || "Erro desconhecido"));
    }
  };

  // ─── Backup/Restore handlers ──────────────────────────────────────────────
  const handleShowBackups = (articleId?: number) => {
    setBackupArticleId(articleId || null);
    setShowBackups(true);
    backupsQuery.refetch();
  };

  const handleRestore = (backupId: number) => {
    if (confirm("Restaurar este backup? O artigo atual será salvo como backup antes da restauração.")) {
      restoreMutation.mutate({ backupId });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#004D40]">Gerenciar Blog</h2>
          <p className="text-gray-600 mt-1">Crie, edite e publique artigos do blog</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isCreating && !editingId && (
            <>
              <Button
                onClick={() => handleShowBackups()}
                variant="outline"
                className="flex items-center gap-1 text-sm"
                title="Ver backups"
              >
                <History size={16} />
                Backups
              </Button>
              <Button
                onClick={handleExportJson}
                variant="outline"
                className="flex items-center gap-1 text-sm"
              >
                <Download size={16} />
                JSON
              </Button>
              <Button
                onClick={handleExportCsv}
                variant="outline"
                className="flex items-center gap-1 text-sm"
              >
                <Download size={16} />
                CSV
              </Button>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-[#E65100] hover:bg-[#D84500] flex items-center gap-2"
              >
                <Plus size={18} />
                Novo Artigo
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Backups Panel */}
      {showBackups && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {backupArticleId
                ? `Backups do Artigo #${backupArticleId}`
                : "Todos os Backups"}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowBackups(false)}>
              Fechar
            </Button>
          </CardHeader>
          <CardContent>
            {backupsQuery.isLoading ? (
              <p className="text-gray-600">Carregando backups...</p>
            ) : backupsQuery.isError ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={16} />
                <span>Erro ao carregar backups</span>
                <Button variant="outline" size="sm" onClick={() => backupsQuery.refetch()}>
                  <RefreshCw size={14} className="mr-1" />
                  Tentar novamente
                </Button>
              </div>
            ) : backupsQuery.data && backupsQuery.data.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {backupsQuery.data.map((backup: any) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{backup.title}</p>
                      <div className="flex gap-2 text-xs text-gray-500 mt-1">
                        <span>Artigo #{backup.originalArticleId}</span>
                        <span>•</span>
                        <span className="capitalize">{backup.backupReason}</span>
                        <span>•</span>
                        <span>{formatDate(backup.backupDate)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRestore(backup.id)}
                      size="sm"
                      variant="outline"
                      disabled={restoreMutation.isPending}
                      className="flex items-center gap-1 ml-2 shrink-0"
                    >
                      <RotateCcw size={14} />
                      Restaurar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum backup encontrado</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {isCreating || editingId ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Artigo" : "Criar Novo Artigo"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título do artigo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder={generateSlug(formData.title) || "auto-gerado"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Turismo, Cultura, Eventos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Resumo (Excerpt)</label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Resumo do artigo para listagem"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Conteúdo</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Conteúdo completo do artigo"
                className="min-h-[250px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Imagem de Capa</label>
              <ImageUpload
                value={formData.coverImageUrl}
                onUpload={(url) => setFormData({ ...formData, coverImageUrl: url })}
                label="Enviar imagem de capa"
                showUrlInput={true}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SEO Title</label>
                  <Input
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="Título para SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SEO Description</label>
                  <Textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Descrição para SEO"
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SEO Keywords</label>
                  <Input
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    placeholder="palavra1, palavra2, palavra3"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="published" className="text-sm font-medium">
                Publicar artigo
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#E65100] hover:bg-[#D84500]"
              >
                {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar Artigo"}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Articles List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Artigos Existentes</h3>
        {articlesQuery.isLoading ? (
          <p className="text-gray-600">Carregando...</p>
        ) : articlesQuery.isError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertTriangle size={32} className="text-amber-500" />
                <p className="text-red-600 font-medium">Erro ao carregar artigos</p>
                <p className="text-sm text-gray-500">
                  {articlesQuery.error?.message || "Verifique sua autenticação e tente novamente."}
                </p>
                <Button
                  onClick={() => articlesQuery.refetch()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : articlesQuery.data && articlesQuery.data.length > 0 ? (
          <div className="space-y-2">
            {articlesQuery.data.map((article: any) => (
              <Card key={article.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{article.title}</h4>
                      <p className="text-sm text-gray-600">/{article.slug}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {article.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            article.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {article.published ? "Publicado" : "Rascunho"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Button
                        onClick={() => handleShowBackups(article.id)}
                        size="sm"
                        variant="ghost"
                        className="flex items-center gap-1"
                        title="Ver backups deste artigo"
                      >
                        <History size={16} />
                      </Button>
                      <Button
                        onClick={() => handleEdit(article)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(article.id)}
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Deletar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-gray-600">
              Nenhum artigo criado ainda
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
