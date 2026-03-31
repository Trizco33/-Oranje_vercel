import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, MapPin, Users, Utensils, Calendar, Navigation, MessageCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function LandingNew() {
  const [scrolled, setScrolled] = useState(false);

  // Carregar conteúdo dinâmico do CMS
  const { data: heroData, isLoading: heroLoading } = trpc.content.getHero.useQuery();
  const { data: servicesData, isLoading: servicesLoading } = trpc.content.getServices.useQuery();
  const { data: aboutData, isLoading: aboutLoading } = trpc.content.getAbout.useQuery();
  const { data: contactData, isLoading: contactLoading } = trpc.content.getContact.useQuery();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dados padrão (fallback se CMS não tiver dados)
  const defaultHero = {
    title: "Seu guia definitivo de Holambra",
    subtitle: "Restaurantes, eventos, experiências e transporte premium em um só lugar",
    buttonText: "Explorar Agora",
    image: "/pontos-turisticos.jpg",
  };

  const defaultServices = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Descubra Holambra",
      description: "Explore os melhores lugares, restaurantes e atrações turísticas da cidade das flores.",
    },
    {
      icon: <Utensils className="w-8 h-8" />,
      title: "Gastronomia Premium",
      description: "Acesse os melhores restaurantes, bares e cafeterias com avaliações e reservas.",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Eventos & Experiências",
      description: "Fique atualizado sobre eventos, shows e experiências exclusivas em Holambra.",
    },
    {
      icon: <Navigation className="w-8 h-8" />,
      title: "Transporte Premium",
      description: "Motoristas verificados e parceiros confiáveis para sua mobilidade.",
    },
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Turista",
      text: "Oranje tornou minha visita a Holambra perfeita! Encontrei os melhores restaurantes e eventos.",
      avatar: "👩‍🦰",
    },
    {
      name: "João Santos",
      role: "Empresário",
      text: "Plataforma excelente para descobrir parceiros e oportunidades de negócio em Holambra.",
      avatar: "👨‍💼",
    },
    {
      name: "Ana Costa",
      role: "Residente",
      text: "Uso Oranje todos os dias para explorar novos lugares e eventos na cidade.",
      avatar: "👩‍🦱",
    },
  ];

  const faqItems = [
    {
      question: "Como funciona o Oranje?",
      answer: "Oranje é um guia completo de Holambra que conecta turistas e residentes com os melhores lugares, eventos, restaurantes e serviços de transporte.",
    },
    {
      question: "Como me tornar um parceiro?",
      answer: "Visite a página de Parcerias e preencha o formulário. Nossa equipe entrará em contato para discutir as melhores opções para seu negócio.",
    },
    {
      question: "Como contratar um motorista?",
      answer: "Acesse a seção de Motoristas no app, escolha um motorista verificado e confirme sua solicitação via WhatsApp.",
    },
    {
      question: "Oranje é gratuito?",
      answer: "Sim! Oranje é gratuito para usuários. Parceiros têm planos diferenciados de acordo com suas necessidades.",
    },
  ];

  // Usar dados do CMS ou fallback
  const hero = heroData || defaultHero;
  const services = servicesData?.items || defaultServices;
  const about = aboutData || { title: "Sobre Holambra", text: "Holambra é a cidade das flores, conhecida por sua beleza natural e atrações turísticas." };
  const contact = contactData || { email: "contato@oranje.com.br", phone: "(19) 3802-1000", address: "Holambra, SP" };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-[#004D40] via-[#00251A] to-[#004D40] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#E65100] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#E65100] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              {hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              {hero.subtitle}
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
              <Link to="/app">
                <Button size="lg" className="bg-[#E65100] hover:bg-[#D84500] text-white">
                  {hero.buttonText || "Explorar Agora"}
                </Button>
              </Link>
              <Link to="/sobre">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </div>

          {hero.image && (
            <div className="mt-16">
              <img 
                src={hero.image} 
                alt="Holambra" 
                className="w-full h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white" />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#004D40] mb-4">
              {servicesData?.title || "Nossos Serviços"}
            </h2>
            <p className="text-xl text-gray-600">
              {servicesData?.description || "Tudo que você precisa para explorar Holambra"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service: any, idx: number) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-[#E65100] mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#004D40] mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#004D40] mb-6">
                {about.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {about.text}
              </p>
              <Link to="/sobre">
                <Button className="bg-[#E65100] hover:bg-[#D84500]">
                  Conhecer Mais
                </Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-[#004D40] to-[#00251A] h-96 rounded-lg"></div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#004D40] text-center mb-16">
            O que nossos usuários dizem
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-md">
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{testimonial.avatar}</span>
                  <div>
                    <p className="font-semibold text-[#004D40]">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-[#004D40] text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Entre em Contato</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <p className="text-gray-200 mb-2">Email</p>
              <p className="text-xl font-semibold">{contact.email}</p>
            </div>
            <div>
              <p className="text-gray-200 mb-2">Telefone</p>
              <p className="text-xl font-semibold">{contact.phone}</p>
            </div>
            <div>
              <p className="text-gray-200 mb-2">Endereço</p>
              <p className="text-xl font-semibold">{contact.address}</p>
            </div>
          </div>

          <Link to="/contato">
            <Button size="lg" className="bg-[#E65100] hover:bg-[#D84500] text-white">
              Enviar Mensagem
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-[#004D40] text-center mb-16">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <details key={idx} className="bg-white p-6 rounded-lg shadow-md cursor-pointer">
                <summary className="font-semibold text-[#004D40] flex items-center justify-between">
                  {item.question}
                  <ChevronDown className="w-5 h-5" />
                </summary>
                <p className="text-gray-600 mt-4">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#004D40] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-300">
            © 2026 Oranje - Guia Cultural de Holambra. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
