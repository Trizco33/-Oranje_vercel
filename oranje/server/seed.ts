import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { siteContent, categories, type InsertSiteContent, type InsertCategory } from "../drizzle/schema";

const ADMIN_USER_ID = 1;

// ─── Site Content padrão ──────────────────────────────────────────────────────
// Usa chaves individuais (hero_title, contact_email, etc) para consistência
// com o content.router.ts que lê/grava no mesmo formato.
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

// ─── Categorias — slugs alinhados com CATEGORY_SLUGS do frontend ──────────────
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

    console.log("🎉 Seed concluído!");
  } catch (error) {
    console.error("⚠️  Erro ao fazer seed (não crítico):", error);
  }
}
