import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { siteContent, type InsertSiteContent } from "../drizzle/schema";

// Admin user ID (deve existir no banco)
const ADMIN_USER_ID = 1;

const DEFAULT_CONTENT: InsertSiteContent[] = [
  {
    key: "hero",
    section: "hero",
    updatedBy: ADMIN_USER_ID,
    value: JSON.stringify({
      title: "Seu guia definitivo de Holambra",
      subtitle: "Restaurantes, eventos, experiências e transporte premium em um só lugar",
      buttonText: "Explorar Agora",
      buttonUrl: "/app",
      imageUrl: "/pontos-turisticos.jpg",
    }),
  },
  {
    key: "services",
    section: "services",
    updatedBy: ADMIN_USER_ID,
    value: JSON.stringify({
      title: "Nossos Serviços",
      description: "Tudo que você precisa para explorar Holambra",
      items: [
        {
          title: "Descubra Holambra",
          description: "Explore os melhores lugares, restaurantes e atrações turísticas da cidade das flores.",
        },
        {
          title: "Gastronomia Premium",
          description: "Acesse os melhores restaurantes, bares e cafeterias com avaliações e reservas.",
        },
        {
          title: "Eventos & Experiências",
          description: "Fique atualizado sobre eventos, shows e experiências exclusivas em Holambra.",
        },
        {
          title: "Transporte Premium",
          description: "Motoristas verificados e parceiros confiáveis para sua mobilidade.",
        },
      ],
    }),
  },
  {
    key: "about",
    section: "about",
    updatedBy: ADMIN_USER_ID,
    value: JSON.stringify({
      title: "Sobre Holambra",
      text: "Holambra é conhecida como a cidade das flores, um destino turístico vibrante no interior de São Paulo. Com uma rica história de imigração holandesa, a cidade oferece atrações culturais, gastronômicas e naturais que encantam visitantes de todo o mundo.",
    }),
  },
  {
    key: "contact",
    section: "contact",
    updatedBy: ADMIN_USER_ID,
    value: JSON.stringify({
      email: "contato@oranje.com",
      phone: "(19) 3802-1000",
      address: "Holambra, São Paulo - Brasil",
    }),
  },
];

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
        console.log(`✅ Criado: ${content.key}`);
      }
    }

    console.log("🎉 Seed concluído!");
  } catch (error) {
    console.error("⚠️  Erro ao fazer seed (não crítico):", error);
  }
}
