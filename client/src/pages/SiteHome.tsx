import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Star,
  ArrowRight,
  Download,
  CheckCircle,
} from "lucide-react";

export default function SiteHome() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const { data: hero } = trpc.content.getHero.useQuery();
  const { data: articles = [] } = trpc.articles.listPublished.useQuery({ limit: 3 });
  const { data: places = [] } = trpc.places.list.useQuery({ limit: 6 });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallPrompt(null);
      }
    }
  };

  return (
    <SiteLayout>
      {/* 1) HERO */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop')`,
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#00251A] opacity-60" />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="mb-6 inline-block px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur">
            <p className="text-sm font-montserrat">Curadoria local • Parceiros verificados</p>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold font-montserrat mb-4">Oranje</h1>
          <p className="text-2xl md:text-3xl font-light mb-8">Seu guia definitivo de Holambra</p>
          <p className="text-lg text-gray-200 mb-12 max-w-2xl mx-auto">
            Roteiros, lugares, eventos e serviços locais — tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#E65100] hover:bg-[#D84500] text-white font-montserrat font-bold"
            >
              <Link to="/app">Abrir o App</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 font-montserrat font-bold"
            >
              <a href="#roteiros">Ver Roteiros</a>
            </Button>
          </div>
        </div>
      </section>

      {/* 2) CATEGORIAS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold font-montserrat text-[#004D40] mb-4 text-center">
            Explore por Categoria
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Encontre exatamente o que você procura
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Restaurantes",
                desc: "Pratos locais e internacionais",
                icon: "🍽️",
                link: "/melhores-restaurantes-de-holambra",
              },
              {
                title: "Cafés",
                desc: "Cafeterias aconchegantes",
                icon: "☕",
                link: "/melhores-cafes-de-holambra",
              },
              {
                title: "Bares & Drinks",
                desc: "Vida noturna e drinks",
                icon: "🍸",
                link: "/bares-e-drinks-em-holambra",
              },
              {
                title: "Pontos Turísticos",
                desc: "Atrações imperdíveis",
                icon: "📸",
                link: "/onde-tirar-fotos-em-holambra",
              },
              {
                title: "Eventos",
                desc: "Agenda de atividades",
                icon: "🎉",
                link: "/eventos-em-holambra",
              },
              {
                title: "Roteiros",
                desc: "Passeios planejados",
                icon: "🗺️",
                link: "/roteiros",
              },
            ].map((cat) => (
              <Link key={cat.title} to={cat.link}>
                <Card className="overflow-hidden hover:shadow-xl transition cursor-pointer h-full">
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-4">{cat.icon}</div>
                    <h3 className="text-xl font-bold text-[#004D40] mb-2 font-montserrat">
                      {cat.title}
                    </h3>
                    <p className="text-gray-600 mb-6">{cat.desc}</p>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-[#E65100] text-[#E65100] hover:bg-[#E65100] hover:text-white"
                    >
                      <span>Ver</span>
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3) DESTAQUES DA SEMANA */}
      <section className="py-20 bg-[#F5F5DC]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold font-montserrat text-[#004D40] mb-4 text-center">
            Destaques da Semana
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Lugares mais visitados e bem avaliados
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.slice(0, 3).map((place: any) => (
              <Link key={place.id} to={`/app/lugar/${place.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition cursor-pointer">
                  {place.photos?.[0]?.url && (
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url('${place.photos[0].url}')` }}
                    />
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-[#004D40] mb-2">{place.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{place.category}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="fill-[#E65100] text-[#E65100]" />
                        <span className="text-sm font-bold">{place.rating || "4.5"}</span>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="bg-[#E65100] hover:bg-[#D84500]"
                      >
                        <span>Ver no app</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4) ROTEIROS PRONTOS */}
      <section id="roteiros" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold font-montserrat text-[#004D40] mb-4 text-center">
            Roteiros Prontos
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Passeios planejados para aproveitar Holambra
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Roteiro de 1 Dia",
                desc: "Visite os principais pontos turísticos de Holambra em um dia completo.",
                duration: "8 horas",
                link: "/roteiro-1-dia-em-holambra",
              },
              {
                title: "Roteiro Romântico",
                desc: "Experiências especiais para casais em Holambra.",
                duration: "4 horas",
                link: "/roteiros",
              },
              {
                title: "Dia Chuvoso",
                desc: "Atividades cobertas e indoor para dias nublados.",
                duration: "6 horas",
                link: "/roteiros",
              },
            ].map((roteiro) => (
              <Link key={roteiro.title} to={roteiro.link}>
                <Card className="overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-[#004D40] mb-3 font-montserrat">
                      {roteiro.title}
                    </h3>
                    <p className="text-gray-600 mb-4 flex-1">{roteiro.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#E65100]">⏱️ {roteiro.duration}</span>
                      <Button
                        asChild
                        size="sm"
                        className="bg-[#E65100] hover:bg-[#D84500]"
                      >
                        <span>Abrir</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5) MAPA RÁPIDO */}
      <section className="py-20 bg-[#004D40] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold font-montserrat mb-4">Navegue com Facilidade</h2>
              <p className="text-lg text-gray-200 mb-8">
                Abra o mapa interativo e encontre o melhor caminho para qualquer lugar em Holambra.
                Veja rotas, distâncias e tempo de deslocamento em tempo real.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#E65100] hover:bg-[#D84500] text-white font-montserrat font-bold"
              >
                <Link to="/mapa">Abrir Mapa</Link>
              </Button>
            </div>
            <div className="bg-white/10 rounded-lg h-80 flex items-center justify-center border-2 border-white/20">
              <div className="text-center">
                <MapPin size={64} className="mx-auto mb-4 text-[#E65100]" />
                <p className="text-lg">Mapa Interativo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6) EVENTOS & AGENDA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold font-montserrat text-[#004D40] mb-4 text-center">
            Eventos & Agenda
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Não perca o que está acontecendo em Holambra
          </p>

          <div className="space-y-4 mb-8">
            {articles.slice(0, 3).map((article: any) => (
              <Link key={article.id} to={`/blog/${article.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#004D40] mb-2">{article.title}</h3>
                      <p className="text-sm text-gray-600">
                        {article.publishedAt &&
                          new Date(article.publishedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <ArrowRight className="text-[#E65100]" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-[#E65100] hover:bg-[#D84500] text-white font-montserrat font-bold"
            >
              <Link to="/eventos-em-holambra">Ver Agenda Completa</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 7) CREDIBILIDADE */}
      <section className="py-20 bg-[#F5F5DC]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold font-montserrat text-[#004D40] mb-12 text-center">
            Para Quem é o Oranje
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "✈️",
                title: "Turistas de Fim de Semana",
                desc: "Viajantes que querem aproveitar Holambra ao máximo em poucos dias.",
              },
              {
                icon: "💑",
                title: "Casais e Famílias",
                desc: "Experiências especiais para momentos inesquecíveis com quem você ama.",
              },
              {
                icon: "🌟",
                title: "Experiências Locais Seguras",
                desc: "Quem busca autenticidade com confiança em parceiros verificados.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-[#004D40] mb-3 font-montserrat">
                  {item.title}
                </h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8) PARCEIROS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold font-montserrat text-[#004D40] mb-4 text-center">
            Seja um Parceiro Oranje
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Crescer seu negócio com a plataforma de curadoria local
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: "👁️", title: "Visibilidade", desc: "Alcance turistas e locais" },
              { icon: "⭐", title: "Destaque", desc: "Apareça em roteiros curados" },
              { icon: "🎁", title: "Vouchers", desc: "Ofertas exclusivas" },
              { icon: "✓", title: "Verificado", desc: "Selo de confiança" },
            ].map((vantagem) => (
              <Card key={vantagem.title} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{vantagem.icon}</div>
                  <h3 className="font-bold text-[#004D40] mb-2">{vantagem.title}</h3>
                  <p className="text-sm text-gray-600">{vantagem.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-[#E65100] hover:bg-[#D84500] text-white font-montserrat font-bold"
            >
              <Link to="/seja-um-parceiro">Quero ser Parceiro</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 9) INSTALAR O APP (PWA) */}
      <section className="py-20 bg-[#004D40] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold font-montserrat mb-6">Instale o Oranje</h2>
          <p className="text-xl text-gray-200 mb-12">
            Use Oranje como um app nativo no seu celular — sem ocupar espaço e sempre atualizado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { num: "1", title: "Abra o Oranje", desc: "Acesse a plataforma" },
              { num: "2", title: "Toque em Instalar", desc: "Procure o botão de instalação" },
              { num: "3", title: "Use como App", desc: "Acesse direto da tela inicial" },
            ].map((step) => (
              <div key={step.num} className="bg-white/10 rounded-lg p-6 border border-white/20">
                <div className="text-4xl font-bold font-montserrat mb-3">{step.num}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-300">{step.desc}</p>
              </div>
            ))}
          </div>

          {installPrompt ? (
            <Button
              onClick={handleInstall}
              size="lg"
              className="bg-[#E65100] hover:bg-[#D84500] text-white font-montserrat font-bold"
            >
              <Download className="mr-2" size={20} />
              Instalar Agora
            </Button>
          ) : (
            <div className="bg-white/10 rounded-lg p-6 border border-white/20">
              <p className="text-gray-300 mb-4">
                📱 <strong>iPhone:</strong> Toque em Compartilhar → Adicionar à Tela de Início
              </p>
              <p className="text-gray-300">
                🤖 <strong>Android:</strong> Toque no menu (⋮) → Instalar app
              </p>
            </div>
          )}
        </div>
      </section>


    </SiteLayout>
  );
}
