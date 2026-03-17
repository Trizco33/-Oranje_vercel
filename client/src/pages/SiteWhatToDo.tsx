import SiteContentPage from "./SiteContentPage";

export default function SiteWhatToDo() {
  const content = (
    <div className="space-y-6">
      <p>
        Holambra é uma cidade encantadora no interior de São Paulo, conhecida por suas flores, gastronomia e atrações culturais. Há muito o que fazer para todos os gostos e idades.
      </p>

      <h2 className="text-3xl font-bold text-[#004D40] mt-8">Atrações Principais</h2>
      <p>
        Descubra os principais pontos turísticos de Holambra, desde museus e galerias até parques e espaços verdes. A cidade oferece experiências únicas para famílias, casais e grupos de amigos.
      </p>

      <h3 className="text-2xl font-bold text-[#004D40] mt-6">Museus e Galerias</h3>
      <p>
        Holambra possui diversos museus e galerias de arte que refletem a riqueza cultural da região. Visite exposições de arte contemporânea, fotografia e história local.
      </p>

      <h3 className="text-2xl font-bold text-[#004D40] mt-6">Parques e Natureza</h3>
      <p>
        Aproveite os belos parques e áreas verdes para caminhadas, piqueniques e contato com a natureza. Holambra é cercada por paisagens naturais espetaculares.
      </p>

      <h3 className="text-2xl font-bold text-[#004D40] mt-6">Compras e Artesanato</h3>
      <p>
        Visite lojas de artesanato local, flores e produtos típicos. Holambra é famosa por suas flores e oferece uma experiência de compras única.
      </p>

      <h3 className="text-2xl font-bold text-[#004D40] mt-6">Gastronomia</h3>
      <p>
        Desfrute de restaurantes e cafés que servem culinária local e internacional. A cena gastronômica de Holambra é vibrante e oferece opções para todos os paladares.
      </p>

      <h2 className="text-3xl font-bold text-[#004D40] mt-8">Dicas para sua Visita</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>Visite na primavera para apreciar as flores em sua melhor forma</li>
        <li>Explore os bairros a pé para descobrir gemas escondidas</li>
        <li>Participe de eventos locais e festivais culturais</li>
        <li>Prove a gastronomia local em restaurantes autênticos</li>
        <li>Compre flores e artesanato diretamente dos produtores</li>
      </ul>

      <h2 className="text-3xl font-bold text-[#004D40] mt-8">Planejando sua Visita</h2>
      <p>
        Use o app Oranje para descobrir mais lugares, ler avaliações de outros visitantes e planejar seu roteiro perfeito. Temos informações completas sobre horários, endereços e como chegar em cada atração.
      </p>
    </div>
  );

  return (
    <SiteContentPage
      title="O que Fazer em Holambra"
      subtitle="Descubra as melhores atrações e experiências da cidade"
      content={content}
      cta={{ label: "Explorar no App", href: "/app" }}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "O que Fazer", href: "/o-que-fazer-em-holambra" },
      ]}
    />
  );
}
