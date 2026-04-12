import { getDb } from "./db";
import { eq } from "drizzle-orm";
import {
  siteContent,
  sitePages,
  categories,
  type InsertSiteContent,
  type InsertCategory,
  type InsertSitePage,
} from "../drizzle/schema";

const ADMIN_USER_ID = 1;

// ─── Site Content padrão ──────────────────────────────────────────────────────
const DEFAULT_CONTENT: InsertSiteContent[] = [
  { key: "hero_title",      section: "hero",    updatedBy: ADMIN_USER_ID, value: "Seu guia definitivo de Holambra" },
  { key: "hero_subtitle",   section: "hero",    updatedBy: ADMIN_USER_ID, value: "Restaurantes, eventos, experiências e mais em um só lugar" },
  { key: "hero_buttonText", section: "hero",    updatedBy: ADMIN_USER_ID, value: "Explorar Agora" },
  { key: "hero_buttonUrl",  section: "hero",    updatedBy: ADMIN_USER_ID, value: "/app" },
  { key: "hero_imageUrl",   section: "hero",    updatedBy: ADMIN_USER_ID, value: "/pontos-turisticos.jpg" },

  { key: "services_title",       section: "services", updatedBy: ADMIN_USER_ID, value: "Nossos Serviços" },
  { key: "services_description", section: "services", updatedBy: ADMIN_USER_ID, value: "Tudo que você precisa para explorar Holambra" },
  { key: "services_list",        section: "services", updatedBy: ADMIN_USER_ID, value: JSON.stringify([
    { name: "Descubra Holambra",    description: "Explore os melhores lugares, restaurantes e atrações turísticas da cidade das flores." },
    { name: "Gastronomia Premium",  description: "Acesse os melhores restaurantes, bares e cafeterias com avaliações e reservas." },
    { name: "Eventos & Experiências", description: "Fique atualizado sobre eventos, shows e experiências exclusivas em Holambra." },
    { name: "Transporte Premium",   description: "Motoristas verificados e parceiros confiáveis para sua mobilidade." },
  ]) },

  { key: "about_title", section: "about", updatedBy: ADMIN_USER_ID, value: "Sobre Holambra" },
  { key: "about_text",  section: "about", updatedBy: ADMIN_USER_ID, value: "Holambra é conhecida como a cidade das flores, um destino turístico vibrante no interior de São Paulo. Com uma rica história de imigração holandesa, a cidade oferece atrações culturais, gastronômicas e naturais que encantam visitantes de todo o mundo." },

  { key: "contact_email",   section: "contact", updatedBy: ADMIN_USER_ID, value: "contato@oranje.com.br" },
  { key: "contact_phone",   section: "contact", updatedBy: ADMIN_USER_ID, value: "(19) 3802-1000" },
  { key: "contact_address", section: "contact", updatedBy: ADMIN_USER_ID, value: "Holambra, São Paulo – Brasil" },
];

// ─── Categorias ───────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: InsertCategory[] = [
  { name: "Restaurantes",       slug: "restaurantes",     icon: "🍽️",  description: "Restaurantes, lanchonetes e culinária local", isActive: true },
  { name: "Bares & Cervejarias",slug: "bares",            icon: "🍺",  description: "Bares, cervejarias e pubs", isActive: true },
  { name: "Cafés & Confeitarias", slug: "cafes",          icon: "☕",  description: "Cafeterias, confeitarias e padarias", isActive: true },
  { name: "Docerias",           slug: "docerias",         icon: "🎂",  description: "Docerias, bombonerias e sorveterias", isActive: true },
  { name: "Pizzarias",          slug: "pizzarias",        icon: "🍕",  description: "Pizzarias e delivery de pizza", isActive: true },
  { name: "Hotéis & Pousadas",  slug: "hoteis",           icon: "🏨",  description: "Hotéis, pousadas e hospedagem", isActive: true },
  { name: "Parques & Atrações", slug: "parques",          icon: "🌳",  description: "Parques, jardins e atrações turísticas", isActive: true },
  { name: "Pontos Turísticos",  slug: "pontos-turisticos",icon: "🌸",  description: "Pontos de interesse e patrimônio histórico", isActive: true },
];

// ─── Páginas editoriais de categoria ─────────────────────────────────────────
// IMPORTANTE: As páginas melhores-restaurantes, melhores-cafes, bares-e-drinks e
// onde-tirar-fotos são GERENCIADAS PELO FALLBACK JSX em CMSCategoryPage.tsx.
// NÃO adicionar aqui — o seed recriaria o conteúdo CMS sobrescrevendo o fallback.
// Apenas páginas sem fallback JSX ficam nesta lista (ex: eventos-em-holambra).
const DEFAULT_PAGES: InsertSitePage[] = [
  {
    slug: "eventos-em-holambra",
    title: "Eventos em Holambra",
    subtitle: "Expoflora, Mês do Rei, Hortitec e o calendário que transforma a cidade ao longo do ano",
    metaTitle: "Eventos em Holambra — Guia Oranje",
    metaDescription: "Conheça os principais eventos de Holambra: Expoflora em setembro, Mês do Rei em fevereiro, Hortitec em junho e muito mais. Planeje sua visita com o Oranje.",
    published: true,
    publishedAt: new Date(),
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    content: `<p>Holambra é uma cidade que sabe fazer festa. Não no sentido barulhento do termo — mas no sentido de que os eventos aqui têm raiz cultural, história e uma comunidade local que abraça cada um deles de verdade. Ao longo do ano, a cidade se transforma em diferentes versões de si mesma dependendo do que está acontecendo.</p>
<p>Se você ainda não planejou uma visita em torno de algum evento, este é o motivo para fazer isso.</p>
<h2>Expoflora — o maior de todos</h2>
<p>A Expoflora acontece todo mês de setembro e é, sem exagero, um dos eventos mais impressionantes do interior paulista. Mais de 600 mil visitantes por edição. Flores que cobrem o chão, as paredes e o ar. Artesanato, gastronomia, música e cultura holandesa em tudo.</p>
<p>Se você nunca foi, coloque na agenda. Se já foi, sabe que é difícil ir só uma vez. A Expoflora fica tomada de vida e cor de um jeito que nenhuma foto consegue traduzir completamente.</p>
<h2>Mês do Rei — cultura holandesa em fevereiro</h2>
<p>O Mês do Rei é a celebração da identidade holandesa de Holambra. Com trajes típicos, música folclórica, desfiles e uma série de atividades culturais, o evento lembra as raízes dos imigrantes que fundaram a cidade. É menor que a Expoflora, mas tem um charme particular — mais íntimo, mais local, mais verdadeiro.</p>
<h2>Hortitec — para quem trabalha com o campo</h2>
<p>A Hortitec é uma feira técnica de horticultura que acontece em junho e reúne produtores, pesquisadores e profissionais do setor de flores e plantas de todo o Brasil. Para o visitante comum, é uma oportunidade única de ver de perto a cadeia produtiva que fez Holambra famosa — e entender por que a cidade funciona como funciona.</p>
<h2>Feiras, festas e o calendário que nunca para</h2>
<p>Além dos grandes eventos, Holambra mantém um calendário regular de feiras de flores, festivais gastronômicos e festas temáticas ao longo do ano. O centro da cidade costuma ter alguma programação especial em feriados e fins de semana prolongados.</p>
<p>O app Oranje tem o calendário completo de eventos atualizado — é a forma mais prática de saber o que está acontecendo antes de planejar sua visita ou, se você já estiver na cidade, descobrir o que não pode perder naquele fim de semana.</p>
<h2>Como se planejar</h2>
<p>Durante a Expoflora e o Mês do Rei, Holambra lota. Hotéis chegam a ficar sem vagas semanas antes — reserve com antecedência. Os restaurantes também ficam cheios, então planeje os horários com mais flexibilidade do que o habitual.</p>
<p>Fora das grandes datas, a cidade recebe bem e sem filas. É uma experiência completamente diferente — mais tranquila, mais autêntica, mais parecida com o dia a dia dos moradores.</p>`,
  },
];

// ─── Função principal de seed ─────────────────────────────────────────────────
export async function seedDatabase() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("⚠️  Banco de dados não disponível, pulando seed");
      return;
    }

    console.log("🌱 Verificando conteúdo padrão...");
    for (const content of DEFAULT_CONTENT) {
      const existing = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.key, content.key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(siteContent).values(content);
        console.log(`  ✅ ${content.key}`);
      }
    }

    console.log("🏷️  Verificando categorias...");
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, cat.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(categories).values(cat);
        console.log(`  ✅ Categoria: ${cat.name}`);
      }
    }

    console.log("📄 Verificando páginas editoriais...");
    for (const page of DEFAULT_PAGES) {
      const existing = await db
        .select()
        .from(sitePages)
        .where(eq(sitePages.slug, page.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(sitePages).values(page);
        console.log(`  ✅ Página: /${page.slug}`);
      }
    }

    console.log("🎉 Seed concluído!");
  } catch (error) {
    console.error("⚠️  Erro ao fazer seed (não crítico):", error);
  }
}
