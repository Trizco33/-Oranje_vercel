import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MapPin, Users, MessageCircle, CheckCircle } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  whatsapp: string;
  serviceType: string;
  area?: string;
  capacity?: number;
  notes?: string;
  photoUrl?: string;
  isPartner: boolean;
  partnerUntil?: Date;
  isVerified: boolean;
  createdAt: Date;
}

export default function TransportPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    serviceType: "",
    area: "",
    capacity: "",
    notes: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");

  // Fetch public drivers list
  const { data: drivers = [], isLoading, error } = trpc.drivers.list.useQuery();

  // Create driver mutation
  const createMutation = trpc.drivers.createPublic.useMutation({
    onSuccess: () => {
      setFormData({ name: "", whatsapp: "", serviceType: "", area: "", capacity: "", notes: "" });
      setShowForm(false);
      setSubmitMessage("Cadastro realizado com sucesso! Após aprovação, seu perfil será exibido.");
      setTimeout(() => setSubmitMessage(""), 5000);
    },
    onError: (error) => {
      setSubmitMessage(`Erro: ${error.message}`);
    },
  });

  // Sort drivers: partners first (valid), then by createdAt desc
  const sortedDrivers = [...(drivers as Driver[])].sort((a, b) => {
    const now = new Date();
    const aIsValidPartner = a.isPartner && a.partnerUntil && new Date(a.partnerUntil) > now;
    const bIsValidPartner = b.isPartner && b.partnerUntil && new Date(b.partnerUntil) > now;

    if (aIsValidPartner && !bIsValidPartner) return -1;
    if (!aIsValidPartner && bIsValidPartner) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean WhatsApp number (keep only digits)
    const cleanWhatsapp = formData.whatsapp.replace(/\D/g, "");
    
    if (!formData.name || !cleanWhatsapp || !formData.serviceType) {
      setSubmitMessage("Por favor, preencha os campos obrigatórios.");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      whatsapp: cleanWhatsapp,
      serviceType: formData.serviceType,
      region: formData.area || "Holambra",
      vehicleModel: undefined,
      vehicleColor: undefined,
      plate: undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      photoUrl: undefined,
      notes: formData.notes || undefined,
    });
  };

  const cleanWhatsappNumber = (number: string): string => {
    return number.replace(/\D/g, "");
  };

  const getWhatsappUrl = (number: string): string => {
    const clean = cleanWhatsappNumber(number);
    return `https://wa.me/${clean}?text=Olá, vi seu perfil no ORANJE`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-oranje-navy to-background border-b border-border">
        <div className="container py-8">
          <h1 className="text-4xl font-bold text-oranje-gold mb-2">Transporte & Motoristas</h1>
          <p className="text-muted-foreground text-lg">
            Encontre motoristas parceiros ORANJE para suas necessidades de transporte
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Register Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "secondary" : "default"}
            className="w-full sm:w-auto"
          >
            {showForm ? "Cancelar" : "Cadastre-se como Motorista"}
          </Button>
        </div>

        {/* Registration Form */}
        {showForm && (
          <Card className="mb-8 border-oranje-gold/30">
            <CardHeader>
              <CardTitle>Cadastro de Motorista</CardTitle>
              <CardDescription>
                Preencha seus dados. Após aprovação, seu perfil será exibido na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">WhatsApp *</label>
                    <Input
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleFormChange}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Serviço *</label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      required
                    >
                      <option value="">Selecione um tipo</option>
                      <option value="Táxi">Táxi</option>
                      <option value="Motorista Particular">Motorista Particular</option>
                      <option value="Transporte Executivo">Transporte Executivo</option>
                      <option value="Van">Van</option>
                      <option value="Ônibus">Ônibus</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Área de Atuação</label>
                    <Input
                      name="area"
                      value={formData.area}
                      onChange={handleFormChange}
                      placeholder="Ex: Holambra e região"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Capacidade de Passageiros</label>
                  <Input
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    placeholder="Ex: 4"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Observações</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    placeholder="Informações adicionais sobre seus serviços..."
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-20"
                  />
                </div>

                {submitMessage && (
                  <div className={`p-3 rounded-md text-sm ${
                    submitMessage.includes("sucesso")
                      ? "bg-green-500/20 text-green-400 border border-green-500/50"
                      : "bg-red-500/20 text-red-400 border border-red-500/50"
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "Enviando..." : "Enviar Cadastro"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Drivers List */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Motoristas Disponíveis</h2>
            <p className="text-muted-foreground">
              {sortedDrivers.length} motorista{sortedDrivers.length !== 1 ? "s" : ""} aprovado{sortedDrivers.length !== 1 ? "s" : ""}
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Carregando motoristas...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
              <AlertCircle className="w-5 h-5" />
              Erro ao carregar motoristas
            </div>
          )}

          {!isLoading && !error && sortedDrivers.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">Nenhum motorista disponível no momento</p>
              </div>
            </div>
          )}

          {!isLoading && !error && sortedDrivers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDrivers.map((driver) => {
                const now = new Date();
                const isValidPartner = driver.isPartner && driver.partnerUntil && new Date(driver.partnerUntil) > now;

                return (
                  <Card key={driver.id} className={`overflow-hidden transition-all hover:shadow-lg ${
                    isValidPartner ? "border-oranje-gold/50 bg-gradient-to-br from-oranje-gold/5 to-transparent" : ""
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{driver.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">{driver.serviceType}</CardDescription>
                        </div>
                        {isValidPartner && (
                          <Badge className="bg-oranje-gold text-oranje-navy whitespace-nowrap">
                            Parceiro ORANJE
                          </Badge>
                        )}
                      </div>
                      {driver.isVerified && (
                        <div className="flex items-center gap-1 text-green-400 text-xs mt-2">
                          <CheckCircle className="w-4 h-4" />
                          Verificado
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {driver.area && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {driver.area}
                        </div>
                      )}

                      {driver.capacity && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          Até {driver.capacity} passageiro{driver.capacity !== 1 ? "s" : ""}
                        </div>
                      )}

                      {driver.notes && (
                        <p className="text-sm text-muted-foreground italic">{driver.notes}</p>
                      )}

                      <a
                        href={getWhatsappUrl(driver.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button variant="default" className="w-full gap-2 bg-green-600 hover:bg-green-700">
                          <MessageCircle className="w-4 h-4" />
                          Contatar via WhatsApp
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
