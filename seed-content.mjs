import mysql from "mysql2/promise";

const seedContent = async () => {
  console.log("🌱 Iniciando seed de conteúdo...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "oranje",
  });

  const defaultContent = [
    {
      key: "hero",
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
      value: JSON.stringify({
        title: "Sobre Holambra",
        text: "Holambra é conhecida como a cidade das flores, um destino turístico vibrante no interior de São Paulo. Com uma rica história de imigração holandesa, a cidade oferece atrações culturais, gastronômicas e naturais que encantam visitantes de todo o mundo.",
      }),
    },
    {
      key: "contact",
      value: JSON.stringify({
        email: "contato@oranje.com",
        phone: "(19) 3802-1000",
        address: "Holambra, São Paulo - Brasil",
      }),
    },
  ];

  try {
    for (const content of defaultContent) {
      // Verificar se já existe
      const [existing] = await connection.query(
        "SELECT * FROM siteContent WHERE `key` = ?",
        [content.key]
      );

      if (existing.length === 0) {
        await connection.query(
          "INSERT INTO siteContent (`key`, `value`) VALUES (?, ?)",
          [content.key, content.value]
        );
        console.log(`✅ Criado: ${content.key}`);
      } else {
        console.log(`⏭️  Já existe: ${content.key}`);
      }
    }

    console.log("🎉 Seed de conteúdo concluído!");
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
};

seedContent();
