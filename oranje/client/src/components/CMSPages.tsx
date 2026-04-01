import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";

export default function CMSPages() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    slug: "",
    title: "",
    subtitle: "",
    content: "",
    coverImageUrl: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    published: false,
  });

  // Queries
  const pagesQuery = trpc.cms.getPages.useQuery();

  // Mutations
  const savePageMutation = trpc.cms.savePage.useMutation({
    onSuccess: () => {
      toast.success(editingId ? "Página atualizada!" : "Página criada!");
      resetForm();
      pagesQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      id: undefined,
      slug: "",
      title: "",
      subtitle: "",
      content: "",
      coverImageUrl: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      published: false,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (page: any) => {
    setFormData({
      id: page.id,
      slug: page.slug,
      title: page.title,
      subtitle: page.subtitle || "",
      content: page.content,
      coverImageUrl: page.coverImageUrl || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      metaKeywords: page.metaKeywords || "",
      published: page.published,
    });
    setEditingId(page.id);
    setIsCreating(false);
  };

  const handleSave = () => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error("Preencha título, slug e conteúdo");
      return;
    }
    savePageMutation.mutate(formData);
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#004D40]">Gerenciar Páginas</h2>
          <p className="text-gray-600 mt-1">Crie, edite e publique páginas dinâmicas</p>
        </div>
        {!isCreating && !editingId && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-[#E65100] hover:bg-[#D84500] flex items-center gap-2"
          >
            <Plus size={18} />
            Nova Página
          </Button>
        )}
      </div>

      {isCreating || editingId ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Página" : "Criar Nova Página"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ex: sobre-nos"
                  disabled={!!editingId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título da página"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtítulo</label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Subtítulo (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Conteúdo</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Conteúdo da página"
                className="min-h-[200px]"
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
                  <label className="block text-sm font-medium mb-2">Meta Title</label>
                  <Input
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="Título para SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Meta Description</label>
                  <Textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Descrição para SEO"
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Meta Keywords</label>
                  <Input
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
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
                Publicar página
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={savePageMutation.isPending}
                className="bg-[#E65100] hover:bg-[#D84500]"
              >
                {savePageMutation.isPending ? "Salvando..." : "Salvar Página"}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Páginas Existentes</h3>
        {pagesQuery.isLoading ? (
          <p className="text-gray-600">Carregando...</p>
        ) : pagesQuery.data && pagesQuery.data.length > 0 ? (
          <div className="space-y-2">
            {pagesQuery.data.map((page: any) => (
              <Card key={page.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{page.title}</h4>
                      <p className="text-sm text-gray-600">/{page.slug}</p>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            page.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {page.published ? "Publicada" : "Rascunho"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(page)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Editar
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
              Nenhuma página criada ainda
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
