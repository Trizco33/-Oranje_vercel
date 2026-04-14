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
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroMediaType, setHeroMediaType] = useState<"image" | "video">("image");
  const [savingVideo, setSavingVideo] = useState(false);

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

  const DEFAULT_NAV = [
    { label: "Início", href: "/", visible: true, order: 0 },
    { label: "O que fazer", href: "/o-que-fazer-em-holambra", visible: true, order: 1 },
    { label: "Roteiros", href: "/roteiros", visible: true, order: 2 },
    { label: "Mapa", href: "/mapa", visible: true, order: 3 },
    { label: "Blog", href: "/blog", visible: true, order: 4 },
    { label: "Parceiros", href: "/parceiros", visible: true, order: 5 },
    { label: "Contato", href: "/contato", visible: true, order: 6 },
  ];
  const [navItems, setNavItems] = useState(DEFAULT_NAV);

  const [appHeroImage, setAppHeroImage] = useState("");
  const [appHeroUploading, setAppHeroUploading] = useState(false);
  const [appHeroVideoUrl, setAppHeroVideoUrl] = useState("");
  const [appHeroMediaType, setAppHeroMediaType] = useState<"image" | "video">("image");

  const heroQuery = trpc.content.getHero.useQuery();
  const appHeroQuery = trpc.content.getAppHero.useQuery();
  const servicesQuery = trpc.content.getServices.useQuery();
  const aboutQuery = trpc.content.getAbout.useQuery();
  const contactQuery = trpc.content.getContact.useQuery();
  const navQuery = trpc.content.getNavItems.useQuery();

  const updateHeroMutation = trpc.content.updateHero.useMutation({
    onSuccess: () => {
      toast.success("Hero salvo com sucesso!");
      setUploading(false);
      heroQuery.refetch();
    },
    onError: (error) => {
      setUploading(false);
      toast.error("Erro ao salvar: " + getFriendlyErrorMessage({ message: error.message }));
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

  const updateNavMutation = trpc.content.updateNavItems.useMutation({
    onSuccess: () => {
      toast.success("Menu atualizado com sucesso!");
      navQuery.refetch();
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage({ message: error.message }));
    },
  });

  const updateHeroMediaMutation = trpc.content.updateHeroMedia.useMutation({
    onSuccess: () => {
      heroQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro ao salvar mídia: " + getFriendlyErrorMessage({ message: error.message }));
    },
  });

  const updateAppHeroMutation = trpc.content.updateAppHero.useMutation({
    onSuccess: (_data, variables) => {
      toast.success(variables.imageUrl ? "Imagem do App salva!" : "Foto do App removida.");
      setAppHeroUploading(false);
      appHeroQuery.refetch();
    },
    onError: (error) => {
      setAppHeroUploading(false);
      toast.error("Erro ao salvar: " + getFriendlyErrorMessage({ message: error.message }));
    },
  });

  useEffect(() => {
    if (heroQuery.data) {
      const rawUrl = heroQuery.data.imageUrl || "";
      const isValidUrl = rawUrl.startsWith("https://") || rawUrl.startsWith("data:image/");
      setHero({
        title: heroQuery.data.title || "",
        subtitle: heroQuery.data.subtitle || "",
        buttonText: heroQuery.data.buttonText || "",
        buttonUrl: heroQuery.data.buttonUrl || "",
        imageUrl: isValidUrl ? rawUrl : "",
      });
      setHeroVideoUrl((heroQuery.data as any).videoUrl || "");
      setHeroMediaType(((heroQuery.data as any).mediaType as "image" | "video") || "image");
    }
  }, [heroQuery.data]);

  useEffect(() => {
    if (appHeroQuery.data) {
      const url = appHeroQuery.data.imageUrl || "";
      const isValid = url.startsWith("https://") || url.startsWith("data:image/") || url.startsWith("/");
      setAppHeroImage(isValid ? url : "");
      setAppHeroVideoUrl((appHeroQuery.data as any).videoUrl || "");
      setAppHeroMediaType(((appHeroQuery.data as any).mediaType as "image" | "video") || "image");
    }
  }, [appHeroQuery.data]);

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

  useEffect(() => {
    if (navQuery.data && Array.isArray(navQuery.data) && navQuery.data.length > 0) {
      setNavItems(navQuery.data as typeof DEFAULT_NAV);
    }
  }, [navQuery.data]);

  const compressImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX_W = 1200, MAX_H = 675;
        let w = img.width, h = img.height;
        if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
        if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const MAX_CHARS = 60000;
        let q = 0.75;
        let dataUrl = canvas.toDataURL("image/jpeg", q);
        while (dataUrl.length > MAX_CHARS && q > 0.3) {
          q = Math.round((q - 0.07) * 100) / 100;
          dataUrl = canvas.toDataURL("image/jpeg", q);
        }
        if (dataUrl.length > MAX_CHARS) {
          canvas.width = Math.round(w * 0.7);
          canvas.height = Math.round(h * 0.7);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        }
        resolve(dataUrl);
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Falha ao carregar imagem")); };
      img.src = objectUrl;
    });
  };

  const saveImageViaRest = async (field: "hero" | "app_hero", imageUrl: string, onSuccess: () => void) => {
    const apiBase = (import.meta.env.VITE_API_URL as string) || "";
    const stored = localStorage.getItem("cms_token") || "";
    try {
      const res = await fetch(`${apiBase}/api/cms/save-hero`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(stored ? { "x-cms-token": stored } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ imageUrl, field }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        onSuccess();
      } else {
        toast.error("Erro ao salvar: " + (data.error || "Tente fazer logout e login novamente."));
      }
    } catch {
      toast.error("Erro de conexão. Verifique a internet e tente novamente.");
    }
  };

  const saveHeroMeta = async (field: "hero_video" | "hero_media_type", value: string, onSuccess?: () => void) => {
    const apiBase = (import.meta.env.VITE_API_URL as string) || "";
    const stored = localStorage.getItem("cms_token") || "";
    try {
      const res = await fetch(`${apiBase}/api/cms/save-hero`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(stored ? { "x-cms-token": stored } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ field, value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        onSuccess?.();
      } else {
        toast.error("Erro ao salvar: " + (data.error || "Tente fazer logout e login novamente."));
      }
    } catch {
      toast.error("Erro de conexão. Verifique a internet e tente novamente.");
    }
  };

  const handleAppHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAppHeroUploading(true);
    e.target.value = "";
    try {
      const dataUrl = await compressImageToBase64(file);
      setAppHeroImage(dataUrl);
      setAppHeroMediaType("image");
      updateAppHeroMutation.mutate({
        imageUrl: dataUrl,
        videoUrl: appHeroVideoUrl,
        mediaType: "image",
      });
    } catch {
      toast.error("Erro ao processar imagem. Tente outro arquivo.");
      setAppHeroUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    e.target.value = "";
    try {
      const dataUrl = await compressImageToBase64(file);
      setHero(prev => ({ ...prev, imageUrl: dataUrl }));
      await saveImageViaRest("hero", dataUrl, () => {
        toast.success("Imagem salva com sucesso!");
        heroQuery.refetch();
      });
    } catch {
      toast.error("Erro ao processar imagem. Tente outro arquivo.");
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="about">Sobre</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="nav">Menu</TabsTrigger>
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
                  <div className="bg-amber-50 border border-amber-200 rounded p-3">
                    <p className="text-xs font-semibold text-amber-800 mb-2">📸 Trocar imagem de fundo</p>
                    <p className="text-xs text-amber-700 mb-2">
                      Selecione uma foto — ela é comprimida e <strong>salva automaticamente</strong> no banco.
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#E65100] file:text-white hover:file:bg-[#D84500] cursor-pointer"
                    />
                    {uploading && (
                      <p className="text-sm text-[#E65100] font-medium mt-2">⏳ Processando e salvando imagem...</p>
                    )}
                  </div>
                  {hero.imageUrl.startsWith("data:") && (
                    <div className="mt-2">
                      <p className="text-xs text-green-700 font-medium mb-1">✅ Imagem personalizada ativa:</p>
                      <img src={hero.imageUrl} alt="Imagem atual do hero" className="w-full h-48 object-cover rounded" />
                      <button
                        type="button"
                        onClick={async () => {
                          setHero(prev => ({ ...prev, imageUrl: "" }));
                          setUploading(true);
                          await saveImageViaRest("hero", "", () => {
                            toast.success("Foto removida.");
                            heroQuery.refetch();
                          });
                          setUploading(false);
                        }}
                        disabled={uploading}
                        className="text-xs text-red-500 mt-1 hover:underline disabled:opacity-50"
                      >
                        Remover foto (volta ao moinho padrão)
                      </button>
                    </div>
                  )}
                  {!hero.imageUrl && (
                    <p className="text-xs text-gray-500">Sem imagem personalizada — mostrando imagem padrão do moinho.</p>
                  )}
                  <div className="border-t pt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Ou cole uma URL externa (https://)
                    </label>
                    <Input
                      value={hero.imageUrl.startsWith("data:") ? "" : hero.imageUrl}
                      onChange={(e) => setHero({ ...hero, imageUrl: e.target.value })}
                      placeholder="https://i.imgur.com/sua-imagem.jpg"
                    />
                    {hero.imageUrl && !hero.imageUrl.startsWith("data:") && !/^https?:\/\//.test(hero.imageUrl) && (
                      <p className="text-xs text-red-500 mt-1 font-medium">
                        URL inválida — deve começar com https://
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* ── Vídeo Hero ── */}
              <div>
                <label className="block text-sm font-medium mb-2">Vídeo do Hero <span className="text-gray-400 text-xs">(opcional)</span></label>
                <div className="space-y-3">
                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <p className="text-xs font-semibold text-purple-800 mb-1">🎬 URL do vídeo (MP4)</p>
                    <p className="text-xs text-purple-700 mb-2">
                      Cole a URL pública de um vídeo <code>.mp4</code>. Exemplo: <code>/hero-video.mp4</code> para o vídeo enviado, ou uma URL externa <code>https://...</code>.
                    </p>
                    <Input
                      value={heroVideoUrl}
                      onChange={(e) => setHeroVideoUrl(e.target.value)}
                      placeholder="https://... ou /hero-video.mp4"
                      className="mb-2"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={updateHeroMediaMutation.isPending}
                        onClick={() => {
                          updateHeroMediaMutation.mutate(
                            { videoUrl: heroVideoUrl, mediaType: heroMediaType },
                            { onSuccess: () => toast.success("URL do vídeo salva!") }
                          );
                        }}
                        className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 disabled:opacity-50"
                      >
                        {updateHeroMediaMutation.isPending ? "Salvando..." : "Salvar URL do vídeo"}
                      </button>
                      {heroVideoUrl && (
                        <button
                          type="button"
                          disabled={updateHeroMediaMutation.isPending}
                          onClick={() => {
                            setHeroVideoUrl("");
                            setHeroMediaType("image");
                            updateHeroMediaMutation.mutate(
                              { videoUrl: "", mediaType: "image" },
                              { onSuccess: () => toast.success("Vídeo removido.") }
                            );
                          }}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50"
                        >
                          Remover vídeo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tipo de mídia ativo */}
                  <div className="bg-gray-50 border rounded p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Mídia ativa na hero</p>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="heroMediaType"
                          value="image"
                          checked={heroMediaType === "image"}
                          onChange={() => {
                            setHeroMediaType("image");
                            updateHeroMediaMutation.mutate(
                              { videoUrl: heroVideoUrl, mediaType: "image" },
                              { onSuccess: () => toast.success("Hero usando imagem.") }
                            );
                          }}
                        />
                        <span className="text-sm">🖼 Imagem</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="heroMediaType"
                          value="video"
                          checked={heroMediaType === "video"}
                          disabled={!heroVideoUrl}
                          onChange={() => {
                            if (!heroVideoUrl) return;
                            setHeroMediaType("video");
                            updateHeroMediaMutation.mutate(
                              { videoUrl: heroVideoUrl, mediaType: "video" },
                              { onSuccess: () => toast.success("Hero usando vídeo.") }
                            );
                          }}
                        />
                        <span className={`text-sm ${!heroVideoUrl ? "text-gray-400" : ""}`}>🎬 Vídeo</span>
                      </label>
                    </div>
                    {!heroVideoUrl && heroMediaType === "image" && (
                      <p className="text-xs text-gray-500 mt-1">Salve uma URL de vídeo acima para ativar o modo vídeo.</p>
                    )}
                    {heroMediaType === "video" && heroVideoUrl && (
                      <p className="text-xs text-green-700 mt-1 font-medium">✅ Vídeo ativo — imagem usada como fallback se o vídeo falhar.</p>
                    )}
                  </div>
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

          {/* App Hero Image + Video */}
          <Card className="mt-4 border-blue-100">
            <CardHeader>
              <CardTitle className="text-base">Hero do App <span className="text-xs font-normal text-gray-500">(/app)</span></CardTitle>
              <CardDescription>
                Controla a mídia de fundo do hero na tela inicial do app. Suporta imagem ou vídeo — independente do hero do site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">

              {/* Imagem */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs font-semibold text-blue-800 mb-2">📱 Imagem do App Hero</p>
                <p className="text-xs text-blue-700 mb-2">Selecione uma foto — ela será comprimida e salva automaticamente.</p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAppHeroImageUpload}
                  disabled={appHeroUploading}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#E65100] file:text-white hover:file:bg-[#D84500] cursor-pointer"
                />
                {appHeroUploading && (
                  <p className="text-sm text-[#E65100] font-medium mt-2">⏳ Processando e salvando imagem...</p>
                )}
              </div>
              {appHeroImage && (
                <div>
                  {appHeroImage.startsWith("data:") && (
                    <>
                      <p className="text-xs text-green-700 font-medium mb-1">✅ Imagem personalizada:</p>
                      <img src={appHeroImage} alt="Hero do App atual" className="w-full h-36 object-cover rounded" />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAppHeroImage("");
                      setAppHeroMediaType("image");
                      setAppHeroUploading(true);
                      updateAppHeroMutation.mutate({ imageUrl: "", videoUrl: appHeroVideoUrl, mediaType: "image" });
                    }}
                    disabled={appHeroUploading}
                    className="text-xs text-red-500 mt-1 hover:underline disabled:opacity-50"
                  >
                    Remover imagem
                  </button>
                </div>
              )}
              {!appHeroImage && (
                <p className="text-xs text-gray-500">Sem imagem personalizada — usará o gradiente animado como fallback.</p>
              )}
              <div className="border-t pt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Ou cole uma URL externa (https://)</label>
                <Input
                  value={appHeroImage.startsWith("data:") ? "" : appHeroImage}
                  onChange={(e) => setAppHeroImage(e.target.value)}
                  placeholder="https://i.imgur.com/sua-imagem.jpg"
                />
                {appHeroImage && !appHeroImage.startsWith("data:") && !/^https?:\/\//.test(appHeroImage) && (
                  <p className="text-xs text-red-500 mt-1 font-medium">URL inválida — deve começar com https://</p>
                )}
                {appHeroImage && !appHeroImage.startsWith("data:") && /^https?:\/\//.test(appHeroImage) && (
                  <Button
                    className="mt-2 bg-[#E65100] hover:bg-[#D84500]"
                    onClick={() => updateAppHeroMutation.mutate({ imageUrl: appHeroImage, videoUrl: appHeroVideoUrl, mediaType: "image" })}
                    disabled={updateAppHeroMutation.isPending}
                  >
                    {updateAppHeroMutation.isPending ? "Salvando..." : "Salvar URL"}
                  </Button>
                )}
              </div>

              {/* Vídeo */}
              <div className="border-t pt-3">
                <label className="block text-sm font-medium mb-2">Vídeo do App Hero <span className="text-gray-400 text-xs">(opcional)</span></label>
                <div className="bg-purple-50 border border-purple-200 rounded p-3 space-y-2">
                  <p className="text-xs font-semibold text-purple-800">🎬 URL do vídeo (MP4)</p>
                  <p className="text-xs text-purple-700">
                    Cole a URL do vídeo <code>.mp4</code>. Use <code>/hero-motion.mp4</code> para o vídeo enviado, ou uma URL externa <code>https://...</code>.
                  </p>
                  <Input
                    value={appHeroVideoUrl}
                    onChange={(e) => setAppHeroVideoUrl(e.target.value)}
                    placeholder="/hero-motion.mp4 ou https://..."
                  />
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={updateAppHeroMutation.isPending}
                      onClick={() =>
                        updateAppHeroMutation.mutate(
                          { imageUrl: appHeroImage.startsWith("data:") ? appHeroImage : appHeroImage, videoUrl: appHeroVideoUrl, mediaType: appHeroMediaType },
                          { onSuccess: () => toast.success("URL do vídeo do app salva!") }
                        )
                      }
                      className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                      {updateAppHeroMutation.isPending ? "Salvando..." : "Salvar URL do vídeo"}
                    </button>
                    {appHeroVideoUrl && (
                      <button
                        type="button"
                        disabled={updateAppHeroMutation.isPending}
                        onClick={() => {
                          setAppHeroVideoUrl("");
                          setAppHeroMediaType("image");
                          updateAppHeroMutation.mutate(
                            { imageUrl: appHeroImage.startsWith("data:") ? appHeroImage : appHeroImage, videoUrl: "", mediaType: "image" },
                            { onSuccess: () => toast.success("Vídeo do app removido.") }
                          );
                        }}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        Remover vídeo
                      </button>
                    )}
                  </div>
                </div>

                {/* Seletor de mídia ativa */}
                <div className="bg-gray-50 border rounded p-3 mt-2">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Mídia ativa no App Hero</p>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="appHeroMediaType"
                        value="image"
                        checked={appHeroMediaType === "image"}
                        onChange={() => {
                          setAppHeroMediaType("image");
                          updateAppHeroMutation.mutate(
                            { imageUrl: appHeroImage.startsWith("data:") ? appHeroImage : appHeroImage, videoUrl: appHeroVideoUrl, mediaType: "image" },
                            { onSuccess: () => toast.success("App Hero usando imagem.") }
                          );
                        }}
                      />
                      <span className="text-sm">🖼 Imagem</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="appHeroMediaType"
                        value="video"
                        checked={appHeroMediaType === "video"}
                        disabled={!appHeroVideoUrl}
                        onChange={() => {
                          if (!appHeroVideoUrl) return;
                          setAppHeroMediaType("video");
                          updateAppHeroMutation.mutate(
                            { imageUrl: appHeroImage.startsWith("data:") ? appHeroImage : appHeroImage, videoUrl: appHeroVideoUrl, mediaType: "video" },
                            { onSuccess: () => toast.success("App Hero usando vídeo.") }
                          );
                        }}
                      />
                      <span className={`text-sm ${!appHeroVideoUrl ? "text-gray-400" : ""}`}>🎬 Vídeo</span>
                    </label>
                  </div>
                  {!appHeroVideoUrl && (
                    <p className="text-xs text-gray-500 mt-1">Salve uma URL de vídeo acima para ativar o modo vídeo.</p>
                  )}
                  {appHeroMediaType === "video" && appHeroVideoUrl && (
                    <p className="text-xs text-green-700 mt-1 font-medium">✅ Vídeo ativo — fallback: imagem → gradiente animado.</p>
                  )}
                  {appHeroMediaType === "image" && appHeroVideoUrl && (
                    <p className="text-xs text-blue-700 mt-1">Vídeo salvo mas inativo. Mude para 🎬 Vídeo para ativar.</p>
                  )}
                </div>
              </div>

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

        {/* Nav Tab */}
        <TabsContent value="nav">
          <Card>
            <CardHeader>
              <CardTitle>Menu de Navegação</CardTitle>
              <CardDescription>
                Configure os itens do menu hambúrguer e da barra de navegação do site. Reordene, oculte ou adicione links.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {navItems.sort((a, b) => a.order - b.order).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50"
                >
                  {/* Visible toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = navItems.map((n, i) =>
                        i === index ? { ...n, visible: !n.visible } : n
                      );
                      setNavItems(updated);
                    }}
                    className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors ${
                      item.visible
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-gray-200 text-gray-400 border-gray-300"
                    }`}
                    title={item.visible ? "Visível — clique para ocultar" : "Oculto — clique para mostrar"}
                  >
                    {item.visible ? "✓" : "—"}
                  </button>

                  {/* Label */}
                  <Input
                    value={item.label}
                    onChange={(e) => {
                      const updated = navItems.map((n, i) =>
                        i === index ? { ...n, label: e.target.value } : n
                      );
                      setNavItems(updated);
                    }}
                    placeholder="Nome do item"
                    className="flex-1 min-w-0"
                  />

                  {/* Href */}
                  <Input
                    value={item.href}
                    onChange={(e) => {
                      const updated = navItems.map((n, i) =>
                        i === index ? { ...n, href: e.target.value } : n
                      );
                      setNavItems(updated);
                    }}
                    placeholder="/caminho"
                    className="flex-1 min-w-0"
                  />

                  {/* Move up/down */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (index === 0) return;
                        const updated = [...navItems];
                        [updated[index - 1].order, updated[index].order] = [updated[index].order, updated[index - 1].order];
                        setNavItems([...updated].sort((a, b) => a.order - b.order));
                      }}
                      disabled={index === 0}
                      className="w-7 h-5 text-xs border rounded hover:bg-gray-100 disabled:opacity-30"
                    >↑</button>
                    <button
                      type="button"
                      onClick={() => {
                        const sorted = [...navItems].sort((a, b) => a.order - b.order);
                        if (index === sorted.length - 1) return;
                        [sorted[index + 1].order, sorted[index].order] = [sorted[index].order, sorted[index + 1].order];
                        setNavItems([...sorted]);
                      }}
                      disabled={index === navItems.length - 1}
                      className="w-7 h-5 text-xs border rounded hover:bg-gray-100 disabled:opacity-30"
                    >↓</button>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => setNavItems(navItems.filter((_, i) => i !== index))}
                    className="flex-shrink-0 w-8 h-8 text-red-400 hover:text-red-600 rounded hover:bg-red-50 flex items-center justify-center text-lg"
                    title="Remover item"
                  >×</button>
                </div>
              ))}

              {/* Add new item */}
              <button
                type="button"
                onClick={() =>
                  setNavItems([
                    ...navItems,
                    { label: "Novo item", href: "/", visible: true, order: navItems.length },
                  ])
                }
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Adicionar item ao menu
              </button>

              <div className="pt-2">
                <Button
                  onClick={() =>
                    updateNavMutation.mutate(
                      navItems.map((n, i) => ({ ...n, order: i, icon: "Compass" }))
                    )
                  }
                  disabled={updateNavMutation.isPending}
                  className="bg-[#E65100] hover:bg-[#D84500]"
                >
                  {updateNavMutation.isPending ? "Salvando..." : "Salvar Menu"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
