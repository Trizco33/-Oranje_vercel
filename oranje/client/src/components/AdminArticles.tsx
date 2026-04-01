import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { toast } from "sonner";

export function AdminArticles() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    category: "Geral",
    published: false,
  });

  // Queries
  const { data: publishedArticles = [], refetch: refetchPublished } =
    trpc.articles.listAdmin.useQuery({ published: true });
  const { data: draftArticles = [], refetch: refetchDrafts } =
    trpc.articles.listAdmin.useQuery({ published: false });
  const { data: editingArticle } = trpc.articles.byId.useQuery(
    { id: editingId! },
    { enabled: !!editingId }
  );

  // Mutations
  const createMutation = trpc.articles.create.useMutation();
  const updateMutation = trpc.articles.update.useMutation();
  const deleteMutation = trpc.articles.delete.useMutation();

  // Load article for editing
  if (editingArticle && editingId) {
    if (formData.title !== editingArticle.title) {
      setFormData({
        title: editingArticle.title,
        excerpt: editingArticle.excerpt || "",
        content: editingArticle.content,
        coverImageUrl: editingArticle.coverImageUrl || "",
        seoTitle: editingArticle.seoTitle || "",
        seoDescription: editingArticle.seoDescription || "",
        seoKeywords: editingArticle.seoKeywords || "",
        category: editingArticle.category || "Geral",
        published: editingArticle.published,
      });
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error("Título é obrigatório");
        return;
      }
      if (!formData.content.trim()) {
        toast.error("Conteúdo é obrigatório");
        return;
      }

      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Artigo atualizado com sucesso");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Artigo criado com sucesso");
      }

      setIsOpen(false);
      setEditingId(null);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        coverImageUrl: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        category: "Geral",
        published: false,
      });

      refetchPublished();
      refetchDrafts();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar artigo");
      console.error("Erro:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este artigo?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Artigo deletado com sucesso");
      refetchPublished();
      refetchDrafts();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar artigo");
    }
  };

  const ArticleCard = ({ article }: { article: any }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold truncate">{article.title}</h3>
              <Badge variant={article.published ? "default" : "secondary"}>
                {article.published ? "Publicado" : "Rascunho"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {article.excerpt || article.content.substring(0, 100)}
            </p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{article.category}</span>
              <span>•</span>
              <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingId(article.id);
                setIsOpen(true);
              }}
            >
              <Edit2 size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(article.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Artigos</h2>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: "",
              excerpt: "",
              content: "",
              coverImageUrl: "",
              seoTitle: "",
              seoDescription: "",
              seoKeywords: "",
              category: "Geral",
              published: false,
            });
            setIsOpen(true);
          }}
        >
          <Plus size={16} className="mr-2" />
          Novo Artigo
        </Button>
      </div>

      <Tabs defaultValue="published">
        <TabsList>
          <TabsTrigger value="published">
            Publicados ({publishedArticles.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Rascunhos ({draftArticles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="mt-4">
          {publishedArticles.length === 0 ? (
            <p className="text-muted-foreground">Nenhum artigo publicado</p>
          ) : (
            publishedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </TabsContent>

        <TabsContent value="drafts" className="mt-4">
          {draftArticles.length === 0 ? (
            <p className="text-muted-foreground">Nenhum rascunho</p>
          ) : (
            draftArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Artigo" : "Novo Artigo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Título do artigo"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Resumo</label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Resumo do artigo"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Conteúdo *</label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Conteúdo do artigo (markdown)"
                rows={8}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Imagem de Capa</label>
              <ImageUpload
                value={formData.coverImageUrl}
                onUpload={(url) => setFormData({ ...formData, coverImageUrl: url })}
                label="Enviar imagem de capa"
                showUrlInput={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Categoria"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData({ ...formData, published: e.target.checked })
                    }
                  />
                  <span className="text-sm font-medium">Publicar</span>
                </label>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">SEO</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">SEO Title</label>
                  <Input
                    value={formData.seoTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    placeholder="Título para SEO"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SEO Description</label>
                  <Input
                    value={formData.seoDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="Descrição para SEO"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SEO Keywords</label>
                  <Input
                    value={formData.seoKeywords}
                    onChange={(e) =>
                      setFormData({ ...formData, seoKeywords: e.target.value })
                    }
                    placeholder="Palavras-chave separadas por vírgula"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
