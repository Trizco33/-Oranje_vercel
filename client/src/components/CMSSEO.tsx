import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const PAGES = [
  { id: "home", label: "Home" },
  { id: "blog", label: "Blog" },
  { id: "parceiros", label: "Parceiros" },
  { id: "sobre", label: "Sobre" },
  { id: "contato", label: "Contato" },
];

export default function CMSSEO() {
  const [selectedPage, setSelectedPage] = useState("home");
  const [formData, setFormData] = useState({
    page: "home",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "",
    ogTitle: "",
    ogDescription: "",
    canonical: "",
    index: true,
  });

  // Queries
  const seoQuery = trpc.cms.getSeo.useQuery({ page: selectedPage });

  // Mutations
  const updateSeoMutation = trpc.cms.updateSeo.useMutation({
    onSuccess: () => {
      toast.success("SEO atualizado!");
      seoQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  // Load data from query
  useEffect(() => {
    if (seoQuery.data) {
      setFormData({
        page: selectedPage,
        metaTitle: seoQuery.data.metaTitle || "",
        metaDescription: seoQuery.data.metaDescription || "",
        metaKeywords: seoQuery.data.metaKeywords || "",
        ogImage: seoQuery.data.ogImage || "",
        ogTitle: seoQuery.data.ogTitle || "",
        ogDescription: seoQuery.data.ogDescription || "",
        canonical: seoQuery.data.canonical || "",
        index: seoQuery.data.index !== false,
      });
    }
  }, [seoQuery.data, selectedPage]);

  const handleSave = () => {
    if (!formData.metaTitle || !formData.metaDescription) {
      toast.error("Preencha pelo menos Meta Title e Meta Description");
      return;
    }
    updateSeoMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#004D40]">Configurações SEO</h2>
        <p className="text-gray-600 mt-1">Configure meta tags, OpenGraph e indexação por página</p>
      </div>

      <Tabs value={selectedPage} onValueChange={setSelectedPage}>
        <TabsList className="grid w-full grid-cols-5">
          {PAGES.map((page) => (
            <TabsTrigger key={page.id} value={page.id}>
              {page.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PAGES.map((page) => (
          <TabsContent key={page.id} value={page.id}>
            <Card>
              <CardHeader>
                <CardTitle>SEO - {page.label}</CardTitle>
                <CardDescription>Configure meta tags e OpenGraph para esta página</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meta Tags */}
                <div>
                  <h3 className="font-semibold mb-4">Meta Tags</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Meta Title</label>
                      <Input
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="Título para SEO (50-60 caracteres)"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.metaTitle.length}/60 caracteres
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Meta Description</label>
                      <Textarea
                        value={formData.metaDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, metaDescription: e.target.value })
                        }
                        placeholder="Descrição para SEO (150-160 caracteres)"
                        maxLength={160}
                        className="min-h-[80px]"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.metaDescription.length}/160 caracteres
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Meta Keywords</label>
                      <Input
                        value={formData.metaKeywords}
                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                        placeholder="palavra1, palavra2, palavra3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Canonical URL</label>
                      <Input
                        value={formData.canonical}
                        onChange={(e) => setFormData({ ...formData, canonical: e.target.value })}
                        placeholder="https://exemplo.com/pagina"
                      />
                    </div>
                  </div>
                </div>

                {/* OpenGraph */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">OpenGraph (Redes Sociais)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">OG Title</label>
                      <Input
                        value={formData.ogTitle}
                        onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                        placeholder="Título para compartilhamento"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">OG Description</label>
                      <Textarea
                        value={formData.ogDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, ogDescription: e.target.value })
                        }
                        placeholder="Descrição para compartilhamento"
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">OG Image (URL)</label>
                      <Input
                        value={formData.ogImage}
                        onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                      {formData.ogImage && (
                        <div className="mt-4">
                          <img
                            src={formData.ogImage}
                            alt="OG Preview"
                            className="w-full h-40 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Indexação */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Indexação</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="index"
                      checked={formData.index}
                      onChange={(e) => setFormData({ ...formData, index: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="index" className="text-sm font-medium">
                      Permitir indexação por mecanismos de busca
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Se desabilitado, adicionará meta tag robots: noindex
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={updateSeoMutation.isPending}
                    className="bg-[#E65100] hover:bg-[#D84500]"
                  >
                    {updateSeoMutation.isPending ? "Salvando..." : "Salvar SEO"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
