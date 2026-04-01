import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

function getFriendlyErrorMessage(error: { message: string; data?: any }): string {
  const zodErrors = error.data?.zodError?.fieldErrors as Record<string, string[]> | undefined;
  if (zodErrors) {
    const fieldLabels: Record<string, string> = {
      title: "Título",
      subtitle: "Subtítulo",
      buttonText: "Texto do Botão",
      buttonUrl: "URL do Botão",
      imageUrl: "URL da Imagem",
      email: "Email",
      phone: "Telefone",
      address: "Endereço",
      description: "Descrição",
      text: "Texto",
    };
    const messages = Object.entries(zodErrors)
      .flatMap(([field, errors]) =>
        (errors ?? []).map(e => `${fieldLabels[field] ?? field}: ${e}`)
      )
      .join("; ");
    if (messages) return `Dados inválidos — ${messages}`;
    return "Dados inválidos. Verifique os campos e tente novamente.";
  }
  if (error.message.includes("Database not available") || error.message.includes("database"))
    return "Banco de dados não disponível. Adicione DATABASE_URL (MySQL) nos Secrets.";
  if (error.message.includes("UNAUTHORIZED") || error.message.includes("unauthorized"))
    return "Sem permissão para realizar esta ação. Faça login novamente.";
  if (error.message.includes("INTERNAL_SERVER_ERROR"))
    return "Erro interno no servidor. Tente novamente mais tarde.";
  return error.message || "Ocorreu um erro inesperado. Tente novamente.";
}

export default function CMSEditor() {
  const [activeTab, setActiveTab] = useState("hero");
  const [uploading, setUploading] = useState(false);

  const [hero, setHero] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonUrl: "",
    imageUrl: "",
  });

  const [services, setServices] = useState({
    title: "",
    description: "",
    items: [{ title: "", description: "" }],
  });

  const [about, setAbout] = useState({
    title: "",
    text: "",
  });

  const [contact, setContact] = useState({
    email: "",
    phone: "",
    address: "",
  });

  const heroQuery = trpc.content.getHero.useQuery();
  const servicesQuery = trpc.content.getServices.useQuery();
  const aboutQuery = trpc.content.getAbout.useQuery();
  const contactQuery = trpc.content.getContact.useQuery();

  const updateHeroMutation = trpc.content.updateHero.useMutation({
    onSuccess: () => {
      toast.success("Hero atualizado com sucesso!");
      heroQuery.refetch();
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error as any));
    },
  });

  const updateServicesMutation = trpc.content.updateServices.useMutation({
    onSuccess: () => {
      toast.success("Serviços atualizados com sucesso!");
      servicesQuery.refetch();
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error as any));
    },
  });

  const updateAboutMutation = trpc.content.updateAbout.useMutation({
    onSuccess: () => {
      toast.success("Seção 'Sobre' atualizada com sucesso!");
      aboutQuery.refetch();
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error as any));
    },
  });

  const updateContactMutation = trpc.content.updateContact.useMutation({
    onSuccess: () => {
      toast.success("Dados de contato atualizados com sucesso!");
      contactQuery.refetch();
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error as any));
    },
  });

  useEffect(() => {
    if (heroQuery.data) {
      setHero({
        title: heroQuery.data.title || "",
        subtitle: heroQuery.data.subtitle || "",
        buttonText: heroQuery.data.buttonText || "",
        buttonUrl: heroQuery.data.buttonUrl || "",
        imageUrl: heroQuery.data.imageUrl || "",
      });
    }
  }, [heroQuery.data]);

  useEffect(() => {
    if (servicesQuery.data) {
      setServices({
        title: servicesQuery.data.title || "",
        description: servicesQuery.data.description || "",
        items: servicesQuery.data.items || [{ title: "", description: "" }],
      });
    }
  }, [servicesQuery.data]);

  useEffect(() => {
    if (aboutQuery.data) {
      setAbout({
        title: aboutQuery.data.title || "",
        text: aboutQuery.data.text || "",
      });
    }
  }, [aboutQuery.data]);

  useEffect(() => {
    if (contactQuery.data) {
      setContact({
        email: contactQuery.data.email || "",
        phone: contactQuery.data.phone || "",
        address: contactQuery.data.address || "",
      });
    }
  }, [contactQuery.data]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        setHero((prev) => ({ ...prev, imageUrl: data.url }));
        toast.success("Imagem enviada com sucesso!");
      } else {
        toast.error("Falha no upload. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao enviar imagem. Verifique sua conexão e tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleServiceItemChange = (index: number, field: string, value: string) => {
    const newItems = [...services.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setServices((prev) => ({ ...prev, items: newItems }));
  };

  const addServiceItem = () => {
    setServices((prev) => ({
      ...prev,
      items: [...prev.items, { title: "", description: "" }],
    }));
  };

  const removeServiceItem = (index: number) => {
    setServices((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#004D40]">Editar Conteúdo</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="about">Sobre</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
        </TabsList>

        {/* Hero Tab */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Editar Hero</CardTitle>
              <CardDescription>
                Configure a seção principal da landing page. O subtítulo é opcional.
                URL do botão aceita rotas internas (ex: <code>/app</code>) ou links externos (ex: <code>https://...</code>).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título *</label>
                <Input
                  value={hero.title}
                  onChange={(e) => setHero({ ...hero, title: e.target.value })}
                  placeholder="Ex: Descubra Holambra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subtítulo <span className="text-gray-400 text-xs">(opcional)</span></label>
                <Textarea
                  value={hero.subtitle}
                  onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                  placeholder="Ex: O roteiro definitivo de uma cidade única"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Texto do Botão *</label>
                <Input
                  value={hero.buttonText}
                  onChange={(e) => setHero({ ...hero, buttonText: e.target.value })}
                  placeholder="Ex: Explorar Agora"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL do Botão *</label>
                <Input
                  value={hero.buttonUrl}
                  onChange={(e) => setHero({ ...hero, buttonUrl: e.target.value })}
                  placeholder="Ex: /app ou https://exemplo.com"
                />
                <p className="text-xs text-gray-500 mt-1">Aceita rotas internas (/app, /explorar) ou URLs absolutas.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Imagem do Hero</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500"
                  />
                  {uploading && <p className="text-sm text-gray-500">Enviando imagem...</p>}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ou cole uma URL de imagem:</label>
                    <Input
                      value={hero.imageUrl}
                      onChange={(e) => setHero({ ...hero, imageUrl: e.target.value })}
                      placeholder="/images/hero.jpg ou https://..."
                    />
                  </div>
                  {hero.imageUrl && (
                    <div className="mt-4">
                      <img src={hero.imageUrl} alt="Pré-visualização do conteúdo hero" className="w-full h-48 object-cover rounded" loading="lazy" />
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={() => updateHeroMutation.mutate(hero)}
                disabled={updateHeroMutation.isPending}
                className="bg-[#E65100] hover:bg-[#D84500]"
              >
                {updateHeroMutation.isPending ? "Salvando..." : "Salvar Hero"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Editar Serviços</CardTitle>
              <CardDescription>Configure a seção de serviços da landing page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={services.title}
                  onChange={(e) => setServices({ ...services, title: e.target.value })}
                  placeholder="Título da seção"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={services.description}
                  onChange={(e) => setServices({ ...services, description: e.target.value })}
                  placeholder="Descrição da seção"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Itens de Serviço</h3>
                {services.items.map((item, idx) => (
                  <div key={idx} className="border p-4 rounded space-y-2">
                    <Input
                      value={item.title}
                      onChange={(e) => handleServiceItemChange(idx, "title", e.target.value)}
                      placeholder="Título do serviço"
                    />
                    <Textarea
                      value={item.description}
                      onChange={(e) => handleServiceItemChange(idx, "description", e.target.value)}
                      placeholder="Descrição do serviço"
                    />
                    {services.items.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeServiceItem(idx)}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addServiceItem}>
                  + Adicionar Serviço
                </Button>
              </div>

              <Button
                onClick={() => updateServicesMutation.mutate({
                  title: services.title,
                  description: services.description,
                  services: services.items.map(item => ({ name: item.title, description: item.description })),
                })}
                disabled={updateServicesMutation.isPending}
                className="bg-[#E65100] hover:bg-[#D84500]"
              >
                {updateServicesMutation.isPending ? "Salvando..." : "Salvar Serviços"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>Editar Sobre</CardTitle>
              <CardDescription>Configure a seção "Sobre" da landing page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={about.title}
                  onChange={(e) => setAbout({ ...about, title: e.target.value })}
                  placeholder="Título da seção"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Texto</label>
                <Textarea
                  value={about.text}
                  onChange={(e) => setAbout({ ...about, text: e.target.value })}
                  placeholder="Texto da seção"
                  rows={6}
                />
              </div>
              <Button
                onClick={() => updateAboutMutation.mutate(about)}
                disabled={updateAboutMutation.isPending}
                className="bg-[#E65100] hover:bg-[#D84500]"
              >
                {updateAboutMutation.isPending ? "Salvando..." : "Salvar Sobre"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Editar Contato</CardTitle>
              <CardDescription>
                Esses dados aparecem no rodapé e na página de contato do site público.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="contato@oranje.com.br"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefone / WhatsApp</label>
                <Input
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  placeholder="(19) 3802-1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Endereço / Cidade</label>
                <Input
                  value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  placeholder="Holambra, SP"
                />
              </div>
              <Button
                onClick={() => updateContactMutation.mutate(contact)}
                disabled={updateContactMutation.isPending}
                className="bg-[#E65100] hover:bg-[#D84500]"
              >
                {updateContactMutation.isPending ? "Salvando..." : "Salvar Contato"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
