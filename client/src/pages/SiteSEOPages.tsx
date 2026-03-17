import { useLocation } from "react-router-dom";
import SiteContentPage from "./SiteContentPage";

const pageContent: Record<string, { title: string; subtitle: string; content: string }> = {
  "melhores-cafes-de-holambra": {
    title: "Melhores Cafés de Holambra",
    subtitle: "Descubra os cafés mais aconchegantes e saborosos da cidade",
    content: `
      Holambra possui uma cena de cafés vibrante e acolhedora. Desde cafeterias especializadas em café de terceira onda até aconchegantes bistrôs, há opções para todos os gostos.

      ## Cafés Especializados
      Conheça cafeterias que tostam seus próprios grãos e oferecem bebidas artesanais de alta qualidade. Muitos desses estabelecimentos também servem pães, bolos e lanches caseiros.

      ## Ambiente Aconchegante
      Perfeitos para trabalhar, estudar ou simplesmente relaxar. Os cafés de Holambra oferecem Wi-Fi, tomadas e uma atmosfera tranquila.

      ## Gastronomia Local
      Além do café, desfrute de acompanhamentos locais e receitas tradicionais que refletem a cultura da região.

      ## Dicas
      - Visite no final da manhã para evitar filas
      - Peça recomendações do barista
      - Experimente bebidas sazonais
      - Aproveite para conhecer outros visitantes

      Use o app Oranje para ver avaliações, horários e localização de cada café.
    `,
  },
  "melhores-restaurantes-de-holambra": {
    title: "Melhores Restaurantes de Holambra",
    subtitle: "Gastronomia de qualidade para todos os paladares",
    content: `
      Holambra oferece uma variedade impressionante de restaurantes, desde culinária tradicional brasileira até pratos internacionais sofisticados.

      ## Culinária Brasileira
      Experimente pratos autênticos que celebram a gastronomia local e regional. Muitos restaurantes utilizam ingredientes frescos de produtores locais.

      ## Culinária Internacional
      Desfrute de pratos europeus, asiáticos e de outras regiões do mundo, preparados por chefs experientes.

      ## Restaurantes Familiares
      Ambientes acolhedores perfeitos para refeições em família, com cardápios variados e preços acessíveis.

      ## Restaurantes Sofisticados
      Para ocasiões especiais, Holambra oferece restaurantes de alta gastronomia com experiências memoráveis.

      ## Dicas
      - Faça reservas em restaurantes populares
      - Experimente pratos do chef
      - Visite durante a alta temporada para melhor variedade
      - Aproveite promoções e menus especiais

      Confira avaliações e reserve sua mesa no app Oranje.
    `,
  },
  "bares-e-drinks-em-holambra": {
    title: "Bares & Drinks em Holambra",
    subtitle: "Vida noturna vibrante e drinks criativos",
    content: `
      Holambra tem uma cena de bares e drinks em crescimento, com estabelecimentos que oferecem desde cervejas artesanais até coquetéis sofisticados.

      ## Bares Tradicionais
      Locais aconchegantes para tomar uma cerveja gelada e conversar com amigos. Muitos oferecem petiscos e música ao vivo.

      ## Bares de Drinks
      Bartenders experientes criam coquetéis criativos e memoráveis. Ambientes elegantes e sofisticados para noites especiais.

      ## Cervejas Artesanais
      Descubra cervejas locais e regionais, com variedade de estilos e sabores.

      ## Eventos e Promoções
      Muitos bares oferecem noites temáticas, happy hours e eventos especiais. Acompanhe as redes sociais para não perder nada.

      ## Dicas
      - Chegue cedo para pegar bom lugar
      - Experimente drinks da casa
      - Aproveite happy hours
      - Participe de eventos especiais

      Descubra novos bares no app Oranje e leia avaliações de outros visitantes.
    `,
  },
  "roteiro-1-dia-em-holambra": {
    title: "Roteiro de 1 Dia em Holambra",
    subtitle: "Aproveite o melhor da cidade em um dia",
    content: `
      Se você tem apenas um dia em Holambra, este roteiro ajudará você a aproveitar ao máximo sua visita.

      ## Manhã (8h - 12h)
      Comece com um café da manhã em um dos cafés especializados da cidade. Depois, visite o centro histórico e explore as galerias de arte.

      ## Almoço (12h - 14h)
      Desfrute de um almoço em um restaurante local. Aproveite para provar pratos típicos da região.

      ## Tarde (14h - 18h)
      Visite parques e áreas verdes. Explore lojas de artesanato e flores. Tire fotos em pontos turísticos.

      ## Noite (18h - 22h)
      Aproveite o pôr do sol em um mirante. Jante em um restaurante sofisticado ou mais casual, conforme sua preferência.

      ## Dicas Importantes
      - Use o app Oranje para planejar sua rota
      - Leve água e protetor solar
      - Use sapatos confortáveis
      - Reserve restaurantes com antecedência
      - Deixe tempo para explorar e se perder um pouco

      Este é apenas um exemplo. Customize seu roteiro de acordo com seus interesses!
    `,
  },
  "onde-tirar-fotos-em-holambra": {
    title: "Onde Tirar Fotos em Holambra",
    subtitle: "Os melhores pontos para capturar momentos incríveis",
    content: `
      Holambra é uma cidade fotogênica com diversos pontos perfeitos para fotos memoráveis.

      ## Pontos Turísticos Clássicos
      Explore os principais pontos turísticos da cidade, cada um oferecendo perspectivas únicas e cenários bonitos.

      ## Natureza e Paisagens
      Capture a beleza natural de Holambra com seus parques, flores e paisagens rurais.

      ## Arquitetura e Arte
      Fotografe a arquitetura interessante da cidade, murais de arte e instalações culturais.

      ## Flores e Jardins
      Holambra é famosa por suas flores. Visite durante a primavera para capturar cores vibrantes.

      ## Dicas de Fotografia
      - Visite ao amanhecer ou pôr do sol para melhor iluminação
      - Explore ângulos diferentes
      - Respeite a privacidade das pessoas
      - Compartilhe suas fotos com #Oranje
      - Use o app para encontrar mais pontos

      Compartilhe suas melhores fotos e inspire outros viajantes!
    `,
  },
  "eventos-em-holambra": {
    title: "Eventos em Holambra",
    subtitle: "Calendário de eventos e atividades culturais",
    content: `
      Holambra oferece uma variedade de eventos ao longo do ano, desde festivais culturais até shows e exposições.

      ## Festivais Sazonais
      Participe de festivais que celebram as flores, a gastronomia e a cultura local. Muitos ocorrem durante a primavera.

      ## Eventos Culturais
      Exposições de arte, apresentações de teatro e shows de música ao vivo acontecem regularmente.

      ## Feiras e Mercados
      Visite feiras de artesanato, mercados de flores e eventos de gastronomia.

      ## Eventos Corporativos
      Holambra também oferece espaços para conferências, workshops e eventos corporativos.

      ## Como Ficar Atualizado
      - Acompanhe o app Oranje para calendário de eventos
      - Siga as redes sociais locais
      - Inscreva-se em newsletters
      - Pergunte em hotéis e pontos de informação

      Não perca nenhum evento importante! Confira o calendário completo no app.
    `,
  },
};

export default function SiteSEOPages() {
  const location = useLocation();
  const page = location.pathname.replace(/^\//, "");
  const pageData = pageContent[page || ""];

  if (!pageData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#004D40]">Página não encontrada</h1>
          <p className="text-gray-600">A página que você procura não existe.</p>
        </div>
      </div>
    );
  }

  return (
    <SiteContentPage
      title={pageData.title}
      subtitle={pageData.subtitle}
      content={
        <div
          dangerouslySetInnerHTML={{
            __html: pageData.content
              .split("\n")
              .map((line) => {
                if (line.startsWith("## ")) {
                  return `<h2 class="text-2xl font-bold text-[#004D40] mt-6 mb-3">${line.substring(3)}</h2>`;
                }
                if (line.startsWith("### ")) {
                  return `<h3 class="text-xl font-bold text-[#004D40] mt-4 mb-2">${line.substring(4)}</h3>`;
                }
                if (line.trim() === "") {
                  return "<br />";
                }
                return `<p class="mb-3">${line}</p>`;
              })
              .join(""),
          }}
        />
      }
      cta={{ label: "Explorar no App", href: "/app" }}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: pageData.title, href: location.pathname },
      ]}
    />
  );
}
