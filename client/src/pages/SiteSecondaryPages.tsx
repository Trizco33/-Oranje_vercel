import { useLocation, Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

const pages: Record<string, { title: string; subtitle: string; component: React.ReactNode }> = {
  roteiros: {
    title: "Roteiros em Holambra",
    subtitle: "Explore a cidade com roteiros planejados",
    component: (
      <div className="space-y-6">
        <p>
          Descubra roteiros cuidadosamente planejados para aproveitar o melhor de Holambra. Cada roteiro é desenvolvido para oferecer uma experiência única e memorável.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Roteiro Romântico", desc: "Perfeito para casais" },
            { title: "Roteiro Gastronômico", desc: "Para amantes de boa comida" },
            { title: "Roteiro Cultural", desc: "Explorar arte e história" },
            { title: "Roteiro Familiar", desc: "Diversão para toda a família" },
          ].map((r, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#004D40] mb-2">{r.title}</h3>
                <p className="text-gray-600 mb-4">{r.desc}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/app">Ver Detalhes</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ),
  },
  mapa: {
    title: "Mapa de Holambra",
    subtitle: "Explore a cidade de forma interativa",
    component: (
      <div className="space-y-6">
        <p>
          Nosso mapa interativo mostra todos os lugares, eventos e roteiros em Holambra. Você pode filtrar por categoria, ver avaliações e planejar sua visita.
        </p>
        <div className="bg-gradient-to-br from-[#004D40] to-[#00251A] h-96 rounded-lg flex items-center justify-center text-white">
          <div className="text-center">
            <p className="text-lg mb-4">Mapa Interativo</p>
            <Button asChild className="bg-[#E65100] hover:bg-[#D84500]">
              <Link to="/app">Abrir Mapa Completo</Link>
            </Button>
          </div>
        </div>
        <p>
          O mapa oferece funcionalidades como busca por localização, filtros por categoria, avaliações de usuários e informações de contato para cada lugar.
        </p>
      </div>
    ),
  },
  parceiros: {
    title: "Parceiros Oranje",
    subtitle: "Conheça os melhores negócios de Holambra",
    component: (
      <div className="space-y-6">
        <p>
          Somos parceiros com os melhores restaurantes, cafés, hotéis e atrações de Holambra. Cada parceiro foi selecionado por qualidade e excelência no atendimento.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Restaurantes", "Cafés", "Hotéis", "Atrações", "Lojas", "Serviços"].map((cat, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-[#004D40] mb-2">{cat}</h3>
                <p className="text-gray-600 text-sm">Veja todos os parceiros nesta categoria</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="bg-[#F5F5DC] p-8 rounded-lg border-2 border-[#E65100]">
          <h3 className="text-2xl font-bold text-[#004D40] mb-4">Seja um Parceiro</h3>
          <p className="text-gray-700 mb-6">
            Aumente a visibilidade do seu negócio e conecte-se com milhares de visitantes de Holambra.
          </p>
          <Button asChild size="lg" className="bg-[#E65100] hover:bg-[#D84500]">
            <Link to="/seja-um-parceiro">Quero ser Parceiro</Link>
          </Button>
        </div>
      </div>
    ),
  },
  "seja-um-parceiro": {
    title: "Seja um Parceiro Oranje",
    subtitle: "Cresça seu negócio com a gente",
    component: (
      <div className="space-y-6">
        <p>
          Oranje oferece uma plataforma completa para aumentar a visibilidade do seu negócio em Holambra. Conecte-se com milhares de visitantes e clientes potenciais.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Benefícios de ser Parceiro</h2>
        <ul className="space-y-3 list-disc list-inside">
          <li>Visibilidade em nosso app e site</li>
          <li>Acesso a ferramentas de marketing</li>
          <li>Analytics e insights sobre seus clientes</li>
          <li>Suporte dedicado</li>
          <li>Promoções e campanhas especiais</li>
          <li>Integração com sistema de avaliações</li>
        </ul>

        <h2 className="text-3xl font-bold text-[#004D40]">Como Funciona</h2>
        <div className="space-y-4">
          <div className="bg-[#F5F5DC] p-4 rounded-lg">
            <h3 className="font-bold text-[#004D40] mb-2">1. Cadastro</h3>
            <p>Preencha o formulário com informações do seu negócio</p>
          </div>
          <div className="bg-[#F5F5DC] p-4 rounded-lg">
            <h3 className="font-bold text-[#004D40] mb-2">2. Aprovação</h3>
            <p>Nossa equipe analisa e aprova seu cadastro</p>
          </div>
          <div className="bg-[#F5F5DC] p-4 rounded-lg">
            <h3 className="font-bold text-[#004D40] mb-2">3. Ativação</h3>
            <p>Seu negócio aparece no app e site</p>
          </div>
        </div>

        <div className="bg-[#004D40] text-white p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Entre em Contato</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={20} />
              <a href="mailto:parceiros@oranje.com.br" className="hover:text-[#E65100]">
                parceiros@oranje.com.br
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={20} />
              <a href="tel:+551940000000" className="hover:text-[#E65100]">
                (19) 4000-0000
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle size={20} />
              <a href="https://wa.me/5519999999999" className="hover:text-[#E65100]">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  sobre: {
    title: "Sobre Oranje",
    subtitle: "Conheça nossa história e missão",
    component: (
      <div className="space-y-6">
        <p>
          Oranje é um guia completo de Holambra, desenvolvido para ajudar visitantes e moradores a descobrir o melhor que a cidade tem a oferecer.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Nossa Missão</h2>
        <p>
          Conectar pessoas com as melhores experiências em Holambra, promovendo turismo sustentável e apoiando negócios locais.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Nossa Visão</h2>
        <p>
          Ser o guia definitivo de Holambra, oferecendo informações precisas, atualizadas e úteis para todos os visitantes.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Valores</h2>
        <ul className="space-y-3 list-disc list-inside">
          <li>Qualidade: Selecionamos apenas os melhores lugares</li>
          <li>Transparência: Avaliações honestas de usuários</li>
          <li>Inovação: Tecnologia a serviço do turismo</li>
          <li>Sustentabilidade: Apoio ao desenvolvimento local responsável</li>
        </ul>

        <h2 className="text-3xl font-bold text-[#004D40]">Equipe</h2>
        <p>
          Somos uma equipe apaixonada por Holambra, dedicada a criar a melhor experiência possível para nossos usuários.
        </p>
      </div>
    ),
  },
  contato: {
    title: "Entre em Contato",
    subtitle: "Estamos aqui para ajudar",
    component: (
      <div className="space-y-6">
        <p>
          Tem dúvidas, sugestões ou quer reportar um problema? Entre em contato conosco através dos canais abaixo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Mail className="w-8 h-8 text-[#E65100] mb-4" />
              <h3 className="font-bold text-[#004D40] mb-2">Email</h3>
              <a href="mailto:contato@oranje.com.br" className="text-[#E65100] hover:underline">
                contato@oranje.com.br
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Phone className="w-8 h-8 text-[#E65100] mb-4" />
              <h3 className="font-bold text-[#004D40] mb-2">Telefone</h3>
              <a href="tel:+551940000000" className="text-[#E65100] hover:underline">
                (19) 4000-0000
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <MapPin className="w-8 h-8 text-[#E65100] mb-4" />
              <h3 className="font-bold text-[#004D40] mb-2">Localização</h3>
              <p className="text-gray-600">Holambra, SP</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <MessageCircle className="w-8 h-8 text-[#E65100] mb-4" />
              <h3 className="font-bold text-[#004D40] mb-2">WhatsApp</h3>
              <a href="https://wa.me/5519999999999" className="text-[#E65100] hover:underline">
                (19) 99999-9999
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="bg-[#F5F5DC] p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-[#004D40] mb-4">Formulário de Contato</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input type="text" className="w-full border rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" className="w-full border rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mensagem</label>
              <textarea className="w-full border rounded-lg px-4 py-2 min-h-32"></textarea>
            </div>
            <Button className="bg-[#E65100] hover:bg-[#D84500] text-white w-full">
              Enviar Mensagem
            </Button>
          </form>
        </div>
      </div>
    ),
  },
  privacidade: {
    title: "Política de Privacidade",
    subtitle: "Como protegemos seus dados",
    component: (
      <div className="space-y-6 text-gray-700">
        <p>
          A privacidade dos nossos usuários é importante para nós. Esta política explica como coletamos, usamos e protegemos seus dados.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Coleta de Dados</h2>
        <p>
          Coletamos informações que você nos fornece voluntariamente, como nome, email e preferências. Também coletamos dados de uso do app para melhorar nossos serviços.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Uso de Dados</h2>
        <p>
          Usamos seus dados para fornecer serviços, enviar notificações, melhorar o app e cumprir obrigações legais.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Proteção de Dados</h2>
        <p>
          Implementamos medidas de segurança para proteger seus dados contra acesso não autorizado. Seus dados são armazenados em servidores seguros.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Seus Direitos</h2>
        <p>
          Você tem o direito de acessar, corrigir ou deletar seus dados. Entre em contato conosco para exercer esses direitos.
        </p>

        <p className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    ),
  },
  termos: {
    title: "Termos de Serviço",
    subtitle: "Condições de uso do Oranje",
    component: (
      <div className="space-y-6 text-gray-700">
        <p>
          Ao usar o Oranje, você concorda com estes termos de serviço. Se não concordar, não use nosso app ou site.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Uso Aceitável</h2>
        <p>
          Você concorda em usar o Oranje apenas para fins legítimos e não deve:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Violar leis ou regulamentos</li>
          <li>Infringir direitos de terceiros</li>
          <li>Enviar conteúdo ofensivo ou prejudicial</li>
          <li>Tentar acessar sistemas sem autorização</li>
        </ul>

        <h2 className="text-3xl font-bold text-[#004D40]">Limitação de Responsabilidade</h2>
        <p>
          O Oranje é fornecido "como está". Não garantimos que o app funcionará sem interrupções ou erros.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Modificações</h2>
        <p>
          Podemos modificar estes termos a qualquer momento. Continuando a usar o app, você aceita as modificações.
        </p>

        <h2 className="text-3xl font-bold text-[#004D40]">Contato</h2>
        <p>
          Para dúvidas sobre estes termos, entre em contato conosco em contato@oranje.com.br
        </p>

        <p className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    ),
  },
};

export default function SiteSecondaryPages() {
  const location = useLocation();
  // Extract page key from pathname, e.g. "/roteiros" -> "roteiros", "/seja-um-parceiro" -> "seja-um-parceiro"
  const pageKey = location.pathname.replace(/^\//, "");
  const pageData = pages[pageKey || ""];

  if (!pageData) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#004D40]">Página não encontrada</h1>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#004D40] to-[#00251A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 font-montserrat">{pageData.title}</h1>
          <p className="text-xl text-gray-200">{pageData.subtitle}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {pageData.component}
        </div>
      </section>
    </SiteLayout>
  );
}
