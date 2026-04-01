import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ZodIssue {
  path?: (string | number)[];
  message?: string;
}

const FIELD_LABELS: Record<string, string> = {
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

function getFriendlyErrorMessage(error: { message: string }): string {
  const msg = error.message;

  // tRPC surfaces Zod validation errors as a JSON array in the message
  try {
    const parsed: unknown = JSON.parse(msg);
    if (Array.isArray(parsed)) {
      const issues = parsed as ZodIssue[];
      const formatted = issues
        .flatMap((issue) => {
          const field = String(issue.path?.[0] ?? "");
          const label = FIELD_LABELS[field] ?? field;
          const text = issue.message ?? "inválido";
          return label ? [`${label}: ${text}`] : [text];
        })
        .join("; ");
      return formatted
        ? `Dados inválidos — ${formatted}`
        : "Dados inválidos. Verifique os campos e tente novamente.";
    }
  } catch {
    /* message is not JSON — use as-is below */
  }

  if (msg.includes("Database not available") || msg.includes("ECONNREFUSED"))
    return "Banco de dados não disponível. Adicione DATABASE_URL (MySQL) nos Secrets.";
  if (msg.includes("UNAUTHORIZED") || msg.includes("FORBIDDEN"))
    return "Sem permissão para realizar esta ação. Faça login novamente.";
  if (msg.includes("INTERNAL_SERVER_ERROR"))
    return "Erro interno no servidor. Tente novamente mais tarde.";

  return msg || "Ocorreu um erro inesperado. Tente novamente.";
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
    instagram: "",
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
      toast.error(getFriendlyErrorMessage({ message: error.message }));
    },
  });

  const updateServicesMutation = trpc.content.updateServices.useMutation({
    onSuccess: () => {
      toast.success("Serviços atualizados com sucesso!");
      servicesQuery.refetch();
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage({ message: error.message }));
    },
  });

  const updateAboutMutation = trpc.content.updateAbout.useMutation({
    onSuccess: () => {
      toast.success("Seção 'Sobre' atualizada com sucesso!");
      aboutQuery.refetch();
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage({ message: error.message }));
    },
  });

  const updateContactMutation = trpc.content.updateContact.useMutation({
    onSuccess: () => {
      toast.success("Dados de contato atualizados com sucesso!");
      contactQuery.refetch();
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage({ message: error.message }));
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
        instagram: contactQuery.data.instagram || "",
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
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      URL da imagem <span className="text-[#E65100] font-semibold">(recomendado — persistente)</span>
                    </label>
                    <Input
                      value={hero.imageUrl}
                      onChange={(e) => setHero({ ...hero, imageUrl: e.target.value })}
                      placeholder="https://i.imgur.com/sua-imagem.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use uma URL que comece com <strong>https://</strong> (Imgur, Cloudinary, etc.). Caminhos locais como <code>/imagem.jpg</code> não funcionam — a URL deve ser de um servidor externo.
                    </p>
                    {hero.imageUrl && !/^https?:\/\//.test(hero.imageUrl) && (
                      <p className="text-xs text-red-500 mt-1 font-medium">
                        ⚠️ URL inválida — deve começar com https://. Limpe o campo ou cole uma URL externa.
                      </p>
                    )}
                  </div>
                  <div className="border-t pt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Upload de arquivo <span className="text-amber-600">(temporário — some a cada novo deploy)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500"
                    />
                    {uploading && <p className="text-sm text-gray-500">Enviando imagem...</p>}
                  </div>
                  {hero.imageUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Pré-visualização:</p>
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
              <div>
                <label className="block text-sm font-medium mb-2">Instagram <span className="text-gray-400 text-xs">(opcional)</span></label>
                <Input
                  value={contact.instagram}
                  onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
                  placeholder="https://instagram.com/oranjeholambra ou @handle"
                />
                <p className="text-xs text-gray-500 mt-1">Aceita URL completa ou apenas o @handle.</p>
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
